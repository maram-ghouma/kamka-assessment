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
    Use this when the user explicitly asks for a summary."""
    response = llm.invoke(f"Summarize the following text concisely:\n\n{text}")
    return response.content


def run_agent(question: str, document_ids: list[str], session_id: str = "default") -> dict:
    retrieval_tool = make_retrieval_tool(document_ids)
    tools = [retrieval_tool, summarize_text]
    tools_map = {t.name: t for t in tools}

    llm_with_tools = llm.bind_tools(tools)

    history = get_history(session_id)

    system = SystemMessage(content="""You are a helpful assistant that answers questions grounded in uploaded documents.

You have two tools:
1. retrieve_from_documents — use when the question is about the uploaded documents
2. summarize_text — use when the user explicitly asks for a summary

Smart routing rules:
- Greetings, thanks, simple math → answer directly WITHOUT calling any tool
- ANY question that could relate to the uploaded documents → ALWAYS call retrieve_from_documents first, even if you think you know the answer
- Summary requests → call retrieve_from_documents then summarize_text

IMPORTANT: When documents are uploaded, always prefer information from the documents over your own knowledge. Never answer a substantive question from memory alone if documents are available.

If the answer is not found in the documents say: "I could not find an answer in the provided documents."
Always cite the source document when using retrieval. Never make up information.""")

    messages = [system] + history + [HumanMessage(content=question)]

    response = None
    used_retrieval = False

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

            messages.append(ToolMessage(
                content=str(tool_result),
                tool_call_id=tool_call["id"]
            ))

    final_answer = response.content if response else "I could not generate an answer."

    updated_history = [m for m in messages if not isinstance(m, SystemMessage)]
    save_history(session_id, updated_history)

    sources = []
    if used_retrieval:
        raw_chunks = retrieve_chunks(question, document_ids, k=6)
        seen_docs = set()
        for chunk in raw_chunks:
            fname = chunk["filename"]
            if fname not in seen_docs and any(
                word in final_answer.lower()
                for word in chunk["excerpt"].lower().split()[:8]
            ):
                sources.append({
                    "filename": fname,
                    "excerpt": chunk["excerpt"].strip()
                })
                seen_docs.add(fname)

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