from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class GradeLevel(str, Enum):
    GRADE_7 = "7"
    GRADE_8 = "8"
    GRADE_9 = "9"
    GRADE_10 = "10"

class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"

class AnimationStatus(str, Enum):
    pending = "pending"
    rendered = "rendered"
    failed = "failed"


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=100)
    password_hash: str = Field(max_length=255)
    lrn: Optional[str] = Field(default=None, max_length=12, unique=True)
    grade_level: GradeLevel
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    conversations: List["Conversation"] = Relationship(back_populates="user")


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE")
    title: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user: Optional[User] = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", ondelete="CASCADE")
    role: MessageRole
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
    animation: Optional["Animation"] = Relationship(back_populates="message")


class Animation(SQLModel, table=True):
    __tablename__ = "animations"
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: int = Field(foreign_key="messages.id", unique=True, ondelete="CASCADE")
    topic: str = Field(max_length=100)
    cloudinary_public_id: Optional[str] = Field(default=None, max_length=255)
    video_url: Optional[str] = Field(default=None, max_length=255)
    status: AnimationStatus = Field(default=AnimationStatus.pending)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message: Optional[Message] = Relationship(back_populates="animation")