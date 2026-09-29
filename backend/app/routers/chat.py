import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.auth import get_current_user
from app.config import settings
from app.services.ai_service import ai_service
from app.services.supabase_service import supabase_service
from app.models.schemas import ChatStreamRequest, RegenerateRequest

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/models")
async def get_models():
    return [
        {
            "id": k,
            "name": v["name"],
            "badge": v["badge"],
            "description": v["description"]
        }
        for k, v in settings.MODELS_CONFIG.items()
    ]

@router.post("/stream")
async def chat_stream(
    payload: ChatStreamRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    conv_id = payload.conversation_id

    if not conv_id:
        new_conv = await supabase_service.create_conversation(
            user_id=user_id,
            title="New Conversation",
            model=payload.model or "nova-ai",
            system_prompt=payload.system_prompt,
            temperature=payload.temperature or 0.70
        )
        conv_id = new_conv["id"]

    attachments_dict = [att.model_dump() for att in (payload.attachments or [])]
    user_msg = await supabase_service.add_message(
        conversation_id=conv_id,
        user_id=user_id,
        role="user",
        content=payload.content,
        model=payload.model,
        tokens_used=len(payload.content) // 4,
        attachments=attachments_dict,
        status="sent"
    )

    history = await supabase_service.get_messages(conv_id)

    async def sse_generator():
        init_event = {
            "type": "init",
            "conversation_id": conv_id,
            "user_message": user_msg
        }
        yield f"data: {json.dumps(init_event)}\n\n"

        full_ai_content = []
        try:
            async for chunk_line in ai_service.stream_chat_completion(
                messages=history,
                model=payload.model or "nova-ai",
                system_prompt=payload.system_prompt,
                temperature=payload.temperature or 0.70,
                attachments=attachments_dict
            ):
                if chunk_line.startswith("data: "):
                    data_str = chunk_line[6:].strip()
                    try:
                        parsed = json.loads(data_str)
                        c_text = parsed.get("chunk", "")
                        if c_text:
                            full_ai_content.append(c_text)
                    except Exception:
                        pass
                yield chunk_line

            combined_response = "".join(full_ai_content)
            tokens_est = (len(payload.content) + len(combined_response)) // 4
            ai_msg = await supabase_service.add_message(
                conversation_id=conv_id,
                user_id=user_id,
                role="assistant",
                content=combined_response,
                model=payload.model or "nova-ai",
                tokens_used=tokens_est,
                status="sent"
            )

            await supabase_service.record_token_usage(
                user_id=user_id,
                model=payload.model or "nova-ai",
                prompt_tokens=len(payload.content) // 4,
                completion_tokens=len(combined_response) // 4
            )

            final_event = {
                "type": "complete",
                "message_id": ai_msg["id"],
                "tokens_used": tokens_est
            }
            yield f"data: {json.dumps(final_event)}\n\n"

        except Exception as e:
            err_event = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(err_event)}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("/regenerate")
async def regenerate_message(
    payload: RegenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    conv = await supabase_service.get_conversation(user_id, payload.conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = conv.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="No messages to regenerate")

    target_idx = -1
    for i, m in enumerate(messages):
        if m["id"] == payload.message_id:
            target_idx = i
            break

    if target_idx == -1:
        target_idx = len(messages) - 1

    if messages[target_idx]["role"] == "assistant":
        truncated_history = messages[:target_idx]
    else:
        truncated_history = messages[:target_idx + 1]

    await supabase_service.delete_messages_after(payload.conversation_id, truncated_history[-1]["id"])

    async def sse_generator():
        init_event = {
            "type": "init",
            "conversation_id": payload.conversation_id,
            "regenerated": True
        }
        yield f"data: {json.dumps(init_event)}\n\n"

        full_ai_content = []
        try:
            async for chunk_line in ai_service.stream_chat_completion(
                messages=truncated_history,
                model=payload.model or conv.get("model", "nova-ai"),
                system_prompt=conv.get("system_prompt"),
                temperature=payload.temperature or conv.get("temperature", 0.70)
            ):
                if chunk_line.startswith("data: "):
                    data_str = chunk_line[6:].strip()
                    try:
                        parsed = json.loads(data_str)
                        c_text = parsed.get("chunk", "")
                        if c_text:
                            full_ai_content.append(c_text)
                    except Exception:
                        pass
                yield chunk_line

            combined_response = "".join(full_ai_content)
            ai_msg = await supabase_service.add_message(
                conversation_id=payload.conversation_id,
                user_id=user_id,
                role="assistant",
                content=combined_response,
                model=payload.model or conv.get("model", "nova-ai"),
                tokens_used=len(combined_response) // 4,
                status="regenerated"
            )

            final_event = {
                "type": "complete",
                "message_id": ai_msg["id"]
            }
            yield f"data: {json.dumps(final_event)}\n\n"
        except Exception as e:
            err_event = {"type": "error", "error": str(e)}
            yield f"data: {json.dumps(err_event)}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
