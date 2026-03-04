import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from models import User, Document, ExtractedField, OcrText
from schemas import DocumentOut, DocumentDetail, UpdateFieldRequest
from auth import get_current_user
from config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents"])

VISA_REQUIREMENTS = {
    "F-1": {
        "name": "F-1 Student Visa",
        "description": "For academic students entering the US.",
        "documents": [
            {"type": "passport", "label": "Passport", "required": True},
            {"type": "visa_photo", "label": "Visa Photo", "required": True},
            {"type": "i20", "label": "I-20 Form", "required": True},
            {"type": "offer_letter", "label": "Admission Letter", "required": True},
            {"type": "bank_statement", "label": "Financial Proof", "required": True},
            {"type": "resume", "label": "Resume / CV", "required": False},
        ]
    },
    "H-1B": {
        "name": "H-1B Work Visa",
        "description": "For temporary workers in specialty occupations.",
        "documents": [
            {"type": "passport", "label": "Passport", "required": True},
            {"type": "visa_photo", "label": "Visa Photo", "required": True},
            {"type": "i797", "label": "I-797 Approval Notice", "required": True},
            {"type": "offer_letter", "label": "Offer Letter", "required": True},
            {"type": "resume", "label": "Resume / CV", "required": True},
            {"type": "experience_letter", "label": "Experience Letters", "required": False},
        ]
    },
    "B-1/B-2": {
        "name": "B-1/B-2 Tourist/Business Visa",
        "description": "For temporary business/tourism.",
        "documents": [
            {"type": "passport", "label": "Passport", "required": True},
            {"type": "visa_photo", "label": "Visa Photo", "required": True},
            {"type": "invitation_letter", "label": "Invitation Letter", "required": False},
            {"type": "bank_statement", "label": "Bank Statement", "required": True},
            {"type": "previous_visa", "label": "Previous Visa", "required": False},
        ]
    },
    "J-1": {
        "name": "J-1 Exchange Visitor",
        "description": "For exchange visitors.",
        "documents": [
            {"type": "passport", "label": "Passport", "required": True},
            {"type": "visa_photo", "label": "Visa Photo", "required": True},
            {"type": "ds2019", "label": "DS-2019 Form", "required": True},
            {"type": "offer_letter", "label": "Offer/Invitation Letter", "required": True},
            {"type": "bank_statement", "label": "Funding Proof", "required": True},
        ]
    }
}

@router.get("/requirements")
def get_visa_requirements():
    return VISA_REQUIREMENTS


@router.post("/upload", response_model=List[DocumentOut])
async def upload_documents(
    files: List[UploadFile] = File(...),
    doc_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    valid_types = (
        "passport", "i20", "visa_photo", "offer_letter", "resume", "bank_statement", 
        "previous_visa", "i797", "experience_letter", "invitation_letter", "ds2019"
    )
    if doc_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid document type. Must be one of: {', '.join(valid_types)}")

    created = []
    for file in files:
        ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(settings.UPLOAD_DIR, unique_name)

        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        doc = Document(
            user_id=current_user.id,
            doc_type=doc_type,
            filename=file.filename,
            upload_path=save_path,
            status="uploaded",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        created.append(doc)

    return created


@router.get("/", response_model=List[DocumentOut])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentDetail)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    result = DocumentDetail(
        id=doc.id,
        doc_type=doc.doc_type,
        filename=doc.filename,
        status=doc.status,
        created_at=doc.created_at,
    )

    if doc.extracted_fields:
        result.extracted_fields = doc.extracted_fields.fields_json
    if doc.ocr_text:
        result.ocr_text = doc.ocr_text.raw_text

    return result


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Clean up file
    if os.path.exists(doc.upload_path):
        os.remove(doc.upload_path)

    # Clean up related records
    db.query(OcrText).filter(OcrText.document_id == doc.id).delete()
    db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()
    db.delete(doc)
    db.commit()
    return {"detail": "Document deleted"}


@router.put("/{doc_id}/fields")
def update_extracted_fields(
    doc_id: int,
    req: UpdateFieldRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    ef = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).first()
    if not ef:
        ef = ExtractedField(document_id=doc.id, fields_json=req.fields)
        db.add(ef)
    else:
        ef.fields_json = {**ef.fields_json, **req.fields}
    db.commit()
    return {"detail": "Fields updated"}
