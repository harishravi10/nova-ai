import os
import uuid
import json
import httpx
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from app.config import settings

class SupabaseService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.anon_key = settings.SUPABASE_ANON_KEY
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.is_connected = bool(self.supabase_url and (self.anon_key or self.service_key))

        self._conversations_db: Dict[str, Dict[str, Any]] = {}
        self._messages_db: Dict[str, List[Dict[str, Any]]] = {}
        self._attachments_db: Dict[str, List[Dict[str, Any]]] = {}
        self._settings_db: Dict[str, Dict[str, Any]] = {}
        self._token_stats_db: Dict[str, List[Dict[str, Any]]] = {}

        self._seed_sample_data()

    def _seed_sample_data(self):
        user_id = "guest-nova-user"
        now = datetime.utcnow()
        
        c1_id = "c1-tcp-protocols"
        self._conversations_db[c1_id] = {
            "id": c1_id,
            "user_id": user_id,
            "title": "How does TCP work?",
            "model": "nova-ai",
            "system_prompt": None,
            "temperature": 0.7,
            "is_pinned": True,
            "is_archived": False,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
        }
        self._messages_db[c1_id] = [
            {
                "id": "m1-tcp-q",
                "conversation_id": c1_id,
                "user_id": user_id,
                "role": "user",
                "content": "Can you explain how TCP works, its 3-way handshake, and difference with UDP?",
                "model": "nova-ai",
                "tokens_used": 18,
                "status": "sent",
                "attachments": [],
                "created_at": (now - timedelta(minutes=15)).isoformat(),
                "updated_at": (now - timedelta(minutes=15)).isoformat()
            },
            {
                "id": "m1-tcp-a",
                "conversation_id": c1_id,
                "user_id": user_id,
                "role": "assistant",
                "content": (
                    "### Understanding the Transmission Control Protocol (TCP)\n\n"
                    "**TCP** is a connection-oriented, reliable transport protocol with guaranteed in-order packet delivery.\n\n"
                    "#### The 3-Way Handshake\n"
                    "1. **SYN**: Client sends `SYN (seq = x)`.\n"
                    "2. **SYN-ACK**: Server responds `SYN-ACK (seq = y, ack = x + 1)`.\n"
                    "3. **ACK**: Client acknowledges `ACK (ack = y + 1)`."
                ),
                "model": "nova-ai",
                "tokens_used": 120,
                "status": "sent",
                "attachments": [],
                "created_at": (now - timedelta(minutes=14)).isoformat(),
                "updated_at": (now - timedelta(minutes=14)).isoformat()
            }
        ]

        self._token_stats_db[user_id] = [
            {"date": (date.today() - timedelta(days=6)).isoformat(), "model": "nova-ai", "prompt_tokens": 1200, "completion_tokens": 3400, "total_tokens": 4600, "messages_count": 8},
            {"date": (date.today() - timedelta(days=5)).isoformat(), "model": "nova-ai", "prompt_tokens": 850, "completion_tokens": 2100, "total_tokens": 2950, "messages_count": 5},
            {"date": (date.today() - timedelta(days=4)).isoformat(), "model": "nova-ai-fast", "prompt_tokens": 1500, "completion_tokens": 4200, "total_tokens": 5700, "messages_count": 12},
            {"date": (date.today() - timedelta(days=3)).isoformat(), "model": "nova-ai", "prompt_tokens": 920, "completion_tokens": 2800, "total_tokens": 3720, "messages_count": 6},
            {"date": (date.today() - timedelta(days=2)).isoformat(), "model": "nova-ai-reasoning", "prompt_tokens": 2400, "completion_tokens": 6800, "total_tokens": 9200, "messages_count": 14},
            {"date": (date.today() - timedelta(days=1)).isoformat(), "model": "nova-ai", "prompt_tokens": 1800, "completion_tokens": 5100, "total_tokens": 6900, "messages_count": 11},
            {"date": date.today().isoformat(), "model": "nova-ai", "prompt_tokens": 650, "completion_tokens": 1950, "total_tokens": 2600, "messages_count": 4},
        ]

    async def list_conversations(self, user_id: str, search: Optional[str] = None) -> List[Dict[str, Any]]:
        results = [c for c in self._conversations_db.values() if c["user_id"] == user_id or user_id == "guest-nova-user"]
        if search:
            q = search.lower()
            results = [c for c in results if q in c["title"].lower()]
        results.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return results

    async def get_conversation(self, user_id: str, conversation_id: str) -> Optional[Dict[str, Any]]:
        conv = self._conversations_db.get(conversation_id)
        if conv:
            conv_copy = dict(conv)
            conv_copy["messages"] = self._messages_db.get(conversation_id, [])
            return conv_copy
        return None

    async def create_conversation(
        self,
        user_id: str,
        title: str = "New Conversation",
        model: str = "nova-ai",
        system_prompt: Optional[str] = None,
        temperature: float = 0.70
    ) -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        new_conv = {
            "id": cid,
            "user_id": user_id,
            "title": title or "New Conversation",
            "model": model,
            "system_prompt": system_prompt,
            "temperature": temperature,
            "is_pinned": False,
            "is_archived": False,
            "created_at": now,
            "updated_at": now,
            "messages": []
        }
        self._conversations_db[cid] = new_conv
        self._messages_db[cid] = []
        return new_conv

    async def update_conversation(self, user_id: str, conversation_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        updates["updated_at"] = datetime.utcnow().isoformat()
        if conversation_id in self._conversations_db:
            self._conversations_db[conversation_id].update(updates)
            return self._conversations_db[conversation_id]
        return None

    async def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        if conversation_id in self._conversations_db:
            del self._conversations_db[conversation_id]
            if conversation_id in self._messages_db:
                del self._messages_db[conversation_id]
            return True
        return False

    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        return self._messages_db.get(conversation_id, [])

    async def add_message(
        self,
        conversation_id: str,
        user_id: str,
        role: str,
        content: str,
        model: Optional[str] = None,
        tokens_used: int = 0,
        attachments: Optional[List[Dict[str, Any]]] = None,
        status: str = "sent"
    ) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        new_msg = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "model": model,
            "tokens_used": tokens_used,
            "status": status,
            "attachments": attachments or [],
            "created_at": now,
            "updated_at": now
        }

        if conversation_id in self._conversations_db:
            self._conversations_db[conversation_id]["updated_at"] = now
            if self._conversations_db[conversation_id].get("title") in ("New Conversation", "New Chat") and role == "user":
                short_title = content.strip().split("\n")[0][:36]
                if len(content.strip().split("\n")[0]) > 36:
                    short_title += "..."
                self._conversations_db[conversation_id]["title"] = short_title

        if conversation_id not in self._messages_db:
            self._messages_db[conversation_id] = []
        self._messages_db[conversation_id].append(new_msg)
        return new_msg

    async def update_message(self, message_id: str, user_id: str, content: str) -> Optional[Dict[str, Any]]:
        now = datetime.utcnow().isoformat()
        for cid, msgs in self._messages_db.items():
            for m in msgs:
                if m["id"] == message_id:
                    m["content"] = content
                    m["updated_at"] = now
                    return m
        return None

    async def delete_messages_after(self, conversation_id: str, message_id: str) -> bool:
        msgs = self._messages_db.get(conversation_id, [])
        idx = -1
        for i, m in enumerate(msgs):
            if m["id"] == message_id:
                idx = i
                break
        if idx != -1:
            self._messages_db[conversation_id] = msgs[:idx + 1]
            return True
        return False

    async def upload_attachment(self, user_id: str, file_name: str, file_bytes: bytes, file_type: str) -> Dict[str, Any]:
        storage_path = f"{user_id}/{uuid.uuid4()}-{file_name}"
        public_url = f"/api/attachments/preview/{file_name}"

        extracted_text = ""
        try:
            if "text" in file_type or "json" in file_type or "csv" in file_type or "javascript" in file_type or "python" in file_type:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")[:4000]
            elif "pdf" in file_type:
                extracted_text = f"[PDF Document: {file_name}, Size: {len(file_bytes)} bytes]"
            else:
                extracted_text = f"Binary attachment ({file_name}, {file_type})"
        except Exception:
            extracted_text = f"Attached file: {file_name}"

        return {
            "file_name": file_name,
            "file_type": file_type,
            "file_size": len(file_bytes),
            "storage_path": storage_path,
            "public_url": public_url,
            "extracted_text": extracted_text
        }

    async def get_user_settings(self, user_id: str) -> Dict[str, Any]:
        if user_id in self._settings_db:
            return self._settings_db[user_id]
        default = {
            "default_model": "nova-ai",
            "theme": "dark",
            "temperature": 0.70,
            "system_prompt": "You are NOVA AI, a brilliant, articulate, and helpful AI assistant.",
            "stream_response": True,
            "send_on_enter": True
        }
        self._settings_db[user_id] = default
        return default

    async def update_user_settings(self, user_id: str, new_settings: Dict[str, Any]) -> Dict[str, Any]:
        current = await self.get_user_settings(user_id)
        current.update(new_settings)
        self._settings_db[user_id] = current
        return current

    async def get_token_usage_stats(self, user_id: str) -> List[Dict[str, Any]]:
        return self._token_stats_db.get(user_id, self._token_stats_db.get("guest-nova-user", []))

    async def record_token_usage(self, user_id: str, model: str, prompt_tokens: int, completion_tokens: int):
        today = date.today().isoformat()
        stats = self._token_stats_db.setdefault(user_id, [])
        for item in stats:
            if item.get("date") == today and item.get("model") == model:
                item["prompt_tokens"] += prompt_tokens
                item["completion_tokens"] += completion_tokens
                item["total_tokens"] += (prompt_tokens + completion_tokens)
                item["messages_count"] += 1
                return
        stats.append({
            "date": today,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "messages_count": 1
        })

supabase_service = SupabaseService()
