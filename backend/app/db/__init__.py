import chromadb
from app.core.config import CHROMA_PATH

client = chromadb.PersistentClient(path=CHROMA_PATH)