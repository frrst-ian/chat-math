from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from db.session import get_db
from db.models import Conversation, Message, Animation, MessageRole, AnimationStatus
from services.llm import get_llm_response
from services.manim_runner import run_manim_script
from models.schemas import ChatRequest, ChatResponse, AnimationStatusResponse

router = APIRouter()

def _render_and_save(animation_id: int, script: str, db: Session):
    animation = db.get(Animation, animation_id)
    if not animation:
        return
    try:
        video_path = run_manim_script(script)
        animation.status = AnimationStatus.rendered if video_path else AnimationStatus.failed
        animation.video_url = video_path
    except Exception:
        animation.status = AnimationStatus.failed
    db.add(animation)
    db.commit()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Get or create conversation
    if request.conversation_id:
        conversation = db.get(Conversation, request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(user_id=request.user_id, title=request.message[:60])
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Load history from DB
    history = db.exec(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    ).all()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=request.message
    )
    db.add(user_msg)
    db.commit()

    # Get LLM response
    llm_result = get_llm_response(
        message=request.message,
        history=[{"role": m.role, "text": m.content} for m in history]
    )

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=llm_result["reply"]
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    # Queue animation if script exists
    animation_id = None
    if llm_result["manim_script"]:
        animation = Animation(
            message_id=assistant_msg.id,
            topic=request.message[:100],
            status=AnimationStatus.pending
        )
        db.add(animation)
        db.commit()
        db.refresh(animation)
        animation_id = animation.id
        background_tasks.add_task(_render_and_save, animation.id, llm_result["manim_script"], db)

    return ChatResponse(
        reply=llm_result["reply"],
        conversation_id=conversation.id,
        animation_id=animation_id
    )

@router.get("/animation/{animation_id}", response_model=AnimationStatusResponse)
def get_animation_status(animation_id: int, db: Session = Depends(get_db)):
    animation = db.get(Animation, animation_id)
    if not animation:
        raise HTTPException(status_code=404, detail="Animation not found")
    return AnimationStatusResponse(status=animation.status, video_url=animation.video_url)