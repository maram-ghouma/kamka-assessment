import fitz  # pymupdf
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from app.core.embeddings import embeddings
from app.core.config import CHROMA_PATH
import uuid


def parse_file(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    elif filename.endswith(".txt"):
        return file_bytes.decode("utf-8")
    else:
        raise ValueError(f"Unsupported file type: {filename}")


def ingest_document(file_bytes: bytes, filename: str) -> dict:
    document_id = str(uuid.uuid4())

    raw_text = parse_file(file_bytes, filename)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = splitter.split_text(raw_text)

    metadatas = [
        {
            "document_id": document_id,
            "filename": filename,
            "chunk_index": i
        }
        for i, _ in enumerate(chunks)
    ]

    vectorstore = Chroma(
        collection_name="documents",
        embedding_function=embeddings,
        persist_directory=CHROMA_PATH
    )

    vectorstore.add_texts(texts=chunks, metadatas=metadatas)

    return {
        "document_id": document_id,
        "filename": filename,
        "chunk_count": len(chunks)
    }