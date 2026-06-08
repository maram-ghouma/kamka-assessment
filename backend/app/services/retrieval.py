from langchain_community.vectorstores import Chroma
from app.core.embeddings import embeddings
from app.core.config import CHROMA_PATH


def retrieve_chunks(query: str, document_ids: list[str], k: int = 4) -> list[dict]:
    vectorstore = Chroma(
        collection_name="documents",
        embedding_function=embeddings,
        persist_directory=CHROMA_PATH
    )

    filter_condition = {"document_id": {"$in": document_ids}} if document_ids else None

    results = vectorstore.similarity_search(
        query=query,
        k=k,
        filter=filter_condition
    )

    return [
        {
            "excerpt": doc.page_content,
            "document_id": doc.metadata.get("document_id"),
            "filename": doc.metadata.get("filename"),
            "chunk_index": doc.metadata.get("chunk_index")
        }
        for doc in results
    ]