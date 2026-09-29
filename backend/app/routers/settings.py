from fastapi import APIRouter, Depends
from typing import List
from app.auth import get_current_user
from app.services.supabase_service import supabase_service
from app.models.schemas import UserSettingsSchema, UsageStatSchema

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=UserSettingsSchema)
async def get_settings(current_user: dict = Depends(get_current_user)):
    return await supabase_service.get_user_settings(current_user["id"])

@router.put("", response_model=UserSettingsSchema)
async def update_settings(
    settings_data: UserSettingsSchema,
    current_user: dict = Depends(get_current_user)
):
    return await supabase_service.update_user_settings(current_user["id"], settings_data.model_dump())

@router.get("/analytics", response_model=List[UsageStatSchema])
async def get_analytics(current_user: dict = Depends(get_current_user)):
    return await supabase_service.get_token_usage_stats(current_user["id"])
