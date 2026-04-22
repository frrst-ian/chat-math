from pydantic import BaseModel
from db.models import AnimationStatus

class ChatRequest(BaseModel):
    message: str
    user_id: int
    conversation_id: int | None = None

class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    animation_id: int | None = None

class AnimationStatusResponse(BaseModel):
    status: AnimationStatus
    video_url: str | None = None