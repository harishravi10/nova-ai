from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class MessageStatus(str, Enum):
    SENDING = "sending"
    SENT = "sent"
    ERROR = "error"
    REGENERATED = "regenerated"

class AttachmentBase(BaseModel):
    file_name: str
    file_type: str
    file_size: int
    storage_path: Optional[str] = None
    public_url: Optional[str] = None
    extracted_text: Optional[str] = None

class AttachmentCreate(AttachmentBase):
    pass

class AttachmentResponse(AttachmentBase):
    id: str
    conversation_id: Optional[str] = None
    message_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    role: MessageRole
    content: str
    model: Optional[str] = None

class MessageCreate(BaseModel):
    content: str
    model: Optional[str] = "nova-ai"
    parent_message_id: Optional[str] = None
    attachments: Optional[List[AttachmentBase]] = []

class MessageUpdate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: MessageRole
    content: str
    model: Optional[str] = None
    tokens_used: int = 0
    status: MessageStatus = MessageStatus.SENT
    parent_message_id: Optional[str] = None
    attachments: Optional[List[AttachmentResponse]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str = "New Conversation"
    model: str = "nova-ai"
    system_prompt: Optional[str] = None
    temperature: float = 0.70

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = "nova-ai"
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.70
    initial_message: Optional[str] = None
    attachments: Optional[List[AttachmentBase]] = []

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None

class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    is_pinned: bool = False
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    messages_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationDetailResponse(ConversationResponse):
    messages: List[MessageResponse] = []

class ChatStreamRequest(BaseModel):
    conversation_id: Optional[str] = None
    content: str
    model: Optional[str] = "nova-ai"
    system_prompt: Optional[str] = None
    temperature: Optional[float] = 0.7
    attachments: Optional[List[AttachmentBase]] = []
    stream: bool = True

class RegenerateRequest(BaseModel):
    conversation_id: str
    message_id: str
    model: Optional[str] = None
    temperature: Optional[float] = None

class UserSettingsSchema(BaseModel):
    default_model: str = "nova-ai"
    theme: str = "dark"
    temperature: float = 0.7
    system_prompt: str = "You are NOVA AI, a brilliant, articulate, and helpful AI assistant."
    stream_response: bool = True
    send_on_enter: bool = True

class UsageStatSchema(BaseModel):
    date: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    messages_count: int

class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
