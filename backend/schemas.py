from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr



# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class RegisterRequest(UserCreate):
    pass


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(UserBase):
    id: int
    created_at: datetime
    # documents: List[DocumentOut] = []  # Avoid circular dependency if possible or use ForwardRef

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Document Schemas ---

class DocumentBase(BaseModel):
    doc_type: str
    filename: str


class DocumentOut(DocumentBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentDetail(DocumentOut):
    ocr_text: Optional[str] = None
    extracted_fields: Optional[Dict[str, Any]] = None


class UpdateFieldRequest(BaseModel):
    fields: Dict[str, Any]


# --- Verification Schemas ---

class VerificationMismatch(BaseModel):
    field: str
    values: List[Dict[str, str]]  # doc_type, value
    severity: str  # low, medium, high
    message: str


class VerificationResultOut(BaseModel):
    id: int
    risk_score: float
    mismatches: List[VerificationMismatch]
    verified_profile: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- DS-160 Schemas ---

class DS160SaveRequest(BaseModel):
    form_data: Dict[str, Any]
