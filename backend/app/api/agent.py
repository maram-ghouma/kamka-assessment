from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.agent import run_agent
import uuid

router = APIRouter(prefix="/agent", tags=["agent"])


class QueryRequest(BaseModel):
    question: str
    document_ids: list[str] = []
    session_id: str = ""


@router.post("/query")
async def query_agent(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Generate a session_id if not provided
    session_id = request.session_id or str(uuid.uuid4())

    try:
        result = run_agent(request.question, request.document_ids, session_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    from app.services.agent import conversation_store
    conversation_store.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}