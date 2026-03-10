from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


class CategoryInfo(BaseModel):
    slug: str
    label: str
    total_chunks: int = 0
    total_documents: int = 0
    last_upload: Optional[str] = None


class UploadResponse(BaseModel):
    processed: int
    chunks_created: int
    document_type: str


class DocumentTypeInfo(BaseModel):
    slug: str
    label: str
    has_training_data: bool = False
    total_chunks: int = 0


class GenerateRequest(BaseModel):
    document_type: str
    form_data: Dict[str, Any]


class HealthResponse(BaseModel):
    status: str
    service: str
