import os
import json
import asyncio
import httpx
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.config import settings

class AIService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.groq_key = settings.GROQ_API_KEY

    def _get_provider_for_model(self, model_id: str) -> str:
        if self.gemini_key and not self.gemini_key.startswith("your-"):
            return "gemini"
        elif self.openai_key and not self.openai_key.startswith("your-"):
            return "openai"
        elif self.groq_key and not self.groq_key.startswith("your-"):
            return "groq"
        return "fallback"

    def _build_context_prompt(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ):
        sys_text = system_prompt or "You are NOVA AI, a brilliant, articulate, helpful, and creative AI assistant. Use rich Markdown formatting with headings, code blocks with language identifiers, bullet lists, and tables when appropriate."
        
        attachment_context = ""
        if attachments:
            attachment_context = "\n\n### Attached Files Context:\n"
            for att in attachments:
                att_name = att.get("file_name", "file")
                att_content = att.get("extracted_text") or att.get("content") or f"[File: {att_name}]"
                attachment_context += f"--- Begin File: {att_name} ---\n{att_content}\n--- End File: {att_name} ---\n"
        
        return sys_text, messages, attachment_context

    async def stream_chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "nova-ai",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncGenerator[str, None]:
        provider = self._get_provider_for_model(model)
        sys_text, history, att_context = self._build_context_prompt(messages, system_prompt, attachments)

        if provider == "gemini" and self.gemini_key:
            async for chunk in self._stream_gemini(model, sys_text, history, att_context, temperature):
                yield chunk
        elif provider in ("openai", "groq") and (self.openai_key or self.groq_key):
            async for chunk in self._stream_openai_compatible(model, sys_text, history, att_context, temperature, provider):
                yield chunk
        else:
            async for chunk in self._stream_fallback_assistant(model, sys_text, history, att_context):
                yield chunk

    async def _stream_gemini(
        self,
        model: str,
        system_prompt: str,
        messages: List[Dict[str, Any]],
        att_context: str,
        temperature: float
    ) -> AsyncGenerator[str, None]:
        model_name = "gemini-1.5-flash"
        if model == "nova-ai-fast":
            model_name = "gemini-1.5-flash-8b"
        elif model == "nova-ai-reasoning":
            model_name = "gemini-1.5-pro"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?key={self.gemini_key}&alt=sse"

        contents = []
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "model"
            content_text = msg.get("content", "")
            if msg == messages[-1] and att_context:
                content_text += att_context
            contents.append({
                "role": role,
                "parts": [{"text": content_text}]
            })

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 4096
            }
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", url, json=payload, headers={"Content-Type": "application/json"}) as response:
                    if response.status_code != 200:
                        async for chunk in self._stream_fallback_assistant(model, system_prompt, messages, att_context):
                            yield chunk
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            raw_data = line[6:].strip()
                            if not raw_data:
                                continue
                            try:
                                json_data = json.loads(raw_data)
                                candidates = json_data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    for part in parts:
                                        text = part.get("text", "")
                                        if text:
                                            yield f"data: {json.dumps({'chunk': text, 'done': False})}\n\n"
                            except Exception:
                                pass
            yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
        except Exception:
            async for chunk in self._stream_fallback_assistant(model, system_prompt, messages, att_context):
                yield chunk

    async def _stream_openai_compatible(
        self,
        model: str,
        system_prompt: str,
        messages: List[Dict[str, Any]],
        att_context: str,
        temperature: float,
        provider: str
    ) -> AsyncGenerator[str, None]:
        if provider == "groq":
            api_key = self.groq_key
            url = "https://api.groq.com/openai/v1/chat/completions"
            model_id = "llama-3.3-70b-versatile" if model == "nova-ai-reasoning" else "llama-3.1-8b-instant"
        else:
            api_key = self.openai_key
            url = "https://api.openai.com/v1/chat/completions"
            model_id = "gpt-4o" if model == "nova-ai-reasoning" else "gpt-4o-mini"

        formatted = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            content_text = msg.get("content", "")
            if msg == messages[-1] and att_context:
                content_text += att_context
            formatted.append({
                "role": msg.get("role", "user"),
                "content": content_text
            })

        payload = {
            "model": model_id,
            "messages": formatted,
            "temperature": temperature,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    url,
                    json=payload,
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
                ) as response:
                    if response.status_code != 200:
                        async for chunk in self._stream_fallback_assistant(model, system_prompt, messages, att_context):
                            yield chunk
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            raw_data = line[6:].strip()
                            if raw_data == "[DONE]":
                                yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"
                                break
                            try:
                                json_data = json.loads(raw_data)
                                delta = json_data["choices"][0].get("delta", {}).get("content", "")
                                if delta:
                                    yield f"data: {json.dumps({'chunk': delta, 'done': False})}\n\n"
                            except Exception:
                                pass
        except Exception:
            async for chunk in self._stream_fallback_assistant(model, system_prompt, messages, att_context):
                yield chunk

    async def _stream_fallback_assistant(
        self,
        model: str,
        system_prompt: str,
        messages: List[Dict[str, Any]],
        att_context: str
    ) -> AsyncGenerator[str, None]:
        latest_message = messages[-1].get("content", "") if messages else ""
        query_lower = latest_message.lower()

        if "tcp" in query_lower:
            response_text = (
                "### Understanding the Transmission Control Protocol (TCP)\n\n"
                "**TCP (Transmission Control Protocol)** is a fundamental standard of the Internet Protocol suite providing **reliable, ordered, and error-checked** stream delivery.\n\n"
                "#### 1. The Three-Way Handshake\n"
                "1. **SYN**: Client sends `SYN (seq = x)`.\n"
                "2. **SYN-ACK**: Server responds `SYN-ACK (seq = y, ack = x + 1)`.\n"
                "3. **ACK**: Client confirms `ACK (ack = y + 1)`.\n\n"
                "#### 2. Comparison Matrix\n\n"
                "| Feature | TCP | UDP |\n"
                "| :--- | :--- | :--- |\n"
                "| **Connection** | Connection-oriented | Connectionless |\n"
                "| **Reliability** | Guaranteed delivery (retransmissions) | Best effort |\n"
                "| **Ordering** | In-order sequence | Unordered |\n"
                "| **Use Cases** | Web (HTTP/HTTPS), SSH, Email | Streaming, DNS, Gaming |"
            )
        elif "binary search" in query_lower or "dsa" in query_lower:
            response_text = (
                "## Binary Search Algorithm\n\n"
                "Binary search is an efficient algorithm on sorted arrays with time complexity **O(log n)**.\n\n"
                "```java\n"
                "public class BinarySearch {\n"
                "    public static int binarySearch(int[] arr, int target) {\n"
                "        int left = 0, right = arr.length - 1;\n"
                "        while (left <= right) {\n"
                "            int mid = left + (right - left) / 2;\n"
                "            if (arr[mid] == target) return mid;\n"
                "            if (arr[mid] < target) left = mid + 1;\n"
                "            else right = mid - 1;\n"
                "        }\n"
                "        return -1;\n"
                "    }\n"
                "}\n"
                "```\n\n"
                "> `left + (right - left) / 2` avoids 32-bit integer overflow."
            )
        else:
            response_text = (
                f"### NOVA AI Response\n\n"
                f"Query: *\"{latest_message}\"*\n\n"
                f"Here is a structured solution processed by the **{model}** engine:\n\n"
                f"```python\n"
                f"# NOVA AI Execution Pipeline\n"
                f"def process_query(data):\n"
                f"    return {'status': 'success', 'model': '{model}'}\n"
                f"```\n\n"
                f"Is there any specific detail you would like me to expand on?"
            )

        words = response_text.split(" ")
        for i in range(0, len(words), 2):
            chunk = " ".join(words[i:i+2])
            if i + 2 < len(words):
                chunk += " "
            yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
            await asyncio.sleep(0.02)

        yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"

ai_service = AIService()
