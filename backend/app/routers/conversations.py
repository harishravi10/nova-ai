from fastapi import APIRouter, Depends, HTTPException, Query, Response
from typing import List, Optional
from app.auth import get_current_user
from app.services.supabase_service import supabase_service
from app.models.schemas import (
    ConversationResponse,
    ConversationDetailResponse,
    ConversationCreate,
    ConversationUpdate
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.get("", response_model=List[ConversationResponse])
async def list_conversations(
    search: Optional[str] = Query(None, description="Search term for conversation titles"),
    current_user: dict = Depends(get_current_user)
):
    return await supabase_service.list_conversations(current_user["id"], search=search)

@router.post("", response_model=ConversationDetailResponse)
async def create_conversation(
    conv_data: ConversationCreate,
    current_user: dict = Depends(get_current_user)
):
    new_conv = await supabase_service.create_conversation(
        user_id=current_user["id"],
        title=conv_data.title or "New Conversation",
        model=conv_data.model or "nova-ai",
        system_prompt=conv_data.system_prompt,
        temperature=conv_data.temperature or 0.70
    )
    return new_conv

@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    conv = await supabase_service.get_conversation(current_user["id"], conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    updates: ConversationUpdate,
    current_user: dict = Depends(get_current_user)
):
    data = updates.model_dump(exclude_unset=True)
    updated = await supabase_service.update_conversation(current_user["id"], conversation_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return updated

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = await supabase_service.delete_conversation(current_user["id"], conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success", "message": "Conversation deleted"}

@router.get("/{conversation_id}/export")
async def export_conversation(
    conversation_id: str,
    format: str = Query("markdown", pattern="^(markdown|json)$"),
    current_user: dict = Depends(get_current_user)
):
    conv = await supabase_service.get_conversation(current_user["id"], conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = conv.get("messages", [])
    title = conv.get("title", "Conversation")

    if format == "markdown":
        md = f"# {title}\n"
        md += f"*Model: {conv.get('model', 'NOVA AI')} | Date: {conv.get('created_at', '')}*\n\n---\n\n"
        for m in messages:
            sender = "👤 **User**" if m["role"] == "user" else "✨ **NOVA AI**"
            md += f"{sender}:\n\n{m['content']}\n\n---\n\n"
        
        return Response(
            content=md,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{title.replace(" ", "_")}.md"'}
        )
    else:
        return conv
