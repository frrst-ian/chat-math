from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    video_url: str | None = None
    conversation_id: str | None = None
