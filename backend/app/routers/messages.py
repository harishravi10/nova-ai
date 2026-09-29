from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user
from app.services.supabase_service import supabase_service
from app.models.schemas import MessageUpdate, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])

@router.patch("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    update_data: MessageUpdate,
    current_user: dict = Depends(get_current_user)
):
    msg = await supabase_service.update_message(message_id, current_user["id"], update_data.content)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg
