from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.auth import get_current_user
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/attachments", tags=["attachments"])

@router.post("/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        content_bytes = await file.read()
        file_name = file.filename or "attachment.txt"
        file_type = file.content_type or "application/octet-stream"

        result = await supabase_service.upload_attachment(
            user_id=current_user["id"],
            file_name=file_name,
            file_bytes=content_bytes,
            file_type=file_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
