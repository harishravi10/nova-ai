import os
from pydantic_settings import BaseSettings
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "NOVA AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "https://*.netlify.app",
        "*"
    ]
    
    # Supabase Configuration
    _raw_supabase_url: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_URL: str = _raw_supabase_url.replace("/rest/v1/", "").replace("/rest/v1", "").rstrip("/")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # AI Provider API Keys
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    
    # Model Configurations
    DEFAULT_MODEL: str = "nova-ai"
    MODELS_CONFIG: dict = {
        "nova-ai": {
            "name": "NOVA AI",
            "badge": "Default",
            "description": "Smart, balanced & versatile for all everyday coding & reasoning tasks",
            "gemini_model": "gemini-1.5-flash",
            "openai_model": "gpt-4o-mini"
        },
        "nova-ai-fast": {
            "name": "NOVA AI Fast",
            "badge": "Lightning",
            "description": "Ultra low latency for rapid summaries, quick fixes & speed queries",
            "gemini_model": "gemini-1.5-flash-8b",
            "openai_model": "gpt-3.5-turbo"
        },
        "nova-ai-reasoning": {
            "name": "NOVA AI Reasoning",
            "badge": "Deep Think",
            "description": "Deep multi-step reasoning, mathematical proofs & complex system design",
            "gemini_model": "gemini-1.5-pro",
            "openai_model": "gpt-4o"
        }
    }

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

settings = Settings()
