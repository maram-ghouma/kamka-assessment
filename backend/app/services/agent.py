from langchain_groq import ChatGroq
from langchain.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage
from app.services.retrieval import retrieve_chunks
from app.core.config import GROQ_API_KEY, LLM_MODEL

llm = ChatGroq(api_key=GROQ_API_KEY, model=LLM_MODEL)

conversation_store: dict[str, list] = {}


def get_history(session_id: str) -> list:
    return conversation_store.get(session_id, [])


def save_history(session_id: str, messages: list):
    conversation_store[session_id] = messages


def merge_chunks(chunks: list[dict]) -> list[dict]:
    """Merge adjacent chunks from the same document into one excerpt."""
    if not chunks:
        return []

    # Sort by document and chunk index
    sorted_chunks = sorted(chunks, key=lambda c: (c["document_id"], c["chunk_index"]))

    merged = []
    current = sorted_chunks[0].copy()

    for next_chunk in sorted_chunks[1:]:
        same_doc = next_chunk["document_id"] == current["document_id"]
        adjacent = next_chunk["chunk_index"] == current["chunk_index"] + 1

        if same_doc and adjacent:
            # Merge: append text, update chunk_index to the latest
            current["excerpt"] = current["excerpt"].rstrip() + " " + next_chunk["excerpt"].lstrip()
            current["chunk_index"] = next_chunk["chunk_index"]
        else:
            merged.append(current)
            current = next_chunk.copy()

    merged.append(current)

    # Clean up: only return filename and excerpt
    return [
        {
            "filename": c["filename"],
            "excerpt": c["excerpt"].strip()
        }
        for c in merged
    ]


def make_retrieval_tool(document_ids: list[str]):
    @tool
    def retrieve_from_documents(query: str) -> str:
        """Search the uploaded documents for information relevant to the query.
        Use this when the question is about the content of the uploaded documents."""
        chunks = retrieve_chunks(query, document_ids)
        if not chunks:
            return "No relevant content found in the documents."
        return "\n\n".join(
            f"[Source: {c['filename']}, chunk {c['chunk_index']}]\n{c['excerpt']}"
            for c in chunks
        )
    return retrieve_from_documents


@tool
def summarize_text(text: str) -> str:
    """Summarize a given block of text into a concise paragraph.
    Use this when the user asks for a summary of something."""
    response = llm.invoke(f"Summarize the following text concisely:\n\n{text}")
    return response.content


@tool
def answer_directly(answer: str) -> str:
    """Use this when the question does not require searching the documents at all —
    for example greetings, simple math, general knowledge questions, or follow-up
    questions that can be answered from the conversation history alone."""
    return answer


def run_agent(question: str, document_ids: list[str], session_id: str = "default") -> dict:
    retrieval_tool = make_retrieval_tool(document_ids)
    tools = [retrieval_tool, summarize_text, answer_directly]
    tools_map = {t.name: t for t in tools}

    llm_with_tools = llm.bind_tools(tools)

    history = get_history(session_id)

    system = SystemMessage(content="""You are a helpful assistant that answers questions grounded in uploaded documents.

You have three tools available:
1. retrieve_from_documents — use this when the question is about the uploaded documents
2. summarize_text — use this when the user asks for a summary
3. answer_directly — use this for greetings, simple math, general knowledge, or anything answerable from conversation history

Smart routing rules:
- Greetings, thanks, simple questions → answer_directly
- Questions about document content → retrieve_from_documents
- Summary requests → retrieve_from_documents then summarize_text

If the answer is not found in the documents say: "I could not find an answer in the provided documents."
Always cite the source document when using retrieval. Never make up information.""")

    messages = [system] + history + [HumanMessage(content=question)]

    response = None
    used_retrieval = False
    direct_answer = None

    for _ in range(5):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            break

        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            tool_result = tools_map[tool_name].invoke(tool_args)

            if tool_name == "retrieve_from_documents":
                used_retrieval = True
            if tool_name == "answer_directly":
                direct_answer = str(tool_result)

            messages.append(ToolMessage(
                content=str(tool_result),
                tool_call_id=tool_call["id"]
            ))

    # If answer_directly was used, return that immediately
    if direct_answer is not None:
        final_answer = direct_answer
    else:
        final_answer = response.content if response else "I could not generate an answer."

    updated_history = [m for m in messages if not isinstance(m, SystemMessage)]
    save_history(session_id, updated_history)

    # Extract only the chunks that were actually cited in the answer
    sources = []
    if used_retrieval:
        raw_chunks = retrieve_chunks(question, document_ids, k=6)
        seen_docs = set()
        for chunk in raw_chunks:
            fname = chunk["filename"]
            # Only include a chunk if its content is referenced in the answer
            if fname not in seen_docs and any(
                word in final_answer.lower()
                for word in chunk["excerpt"].lower().split()[:8]
            ):
                sources.append({
                    "filename": fname,
                    "excerpt": chunk["excerpt"].strip()
                })
                seen_docs.add(fname)

        # Fallback: if nothing matched, return best chunk per unique document
        if not sources:
            seen_docs = set()
            for chunk in raw_chunks:
                fname = chunk["filename"]
                if fname not in seen_docs:
                    sources.append({
                        "filename": fname,
                        "excerpt": chunk["excerpt"].strip()
                    })
                    seen_docs.add(fname)

    return {
        "answer": final_answer,
        "sources": sources,
        "session_id": session_id
    }