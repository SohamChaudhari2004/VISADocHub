from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from fastapi.responses import StreamingResponse

from database import get_db
from models import User, Document, VerificationResult, DS160Form, ExtractedField, OcrText
from schemas import DS160SaveRequest
from services.pdf_export_service import generate_precise_pdf

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    """Fetch all users (Open API for Admin panel)."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.get("/documents")
def get_all_documents(db: Session = Depends(get_db)):
    """Fetch all documents with their extracted fields (Open API for Admin panel)."""
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    res = []
    for d in documents:
        ef = db.query(ExtractedField).filter(ExtractedField.document_id == d.id).first()
        res.append({
            "id": d.id,
            "user_id": d.user_id,
            "doc_type": d.doc_type,
            "filename": d.filename,
            "upload_path": d.upload_path,
            "status": d.status,
            "created_at": d.created_at,
            "fields": ef.fields_json if ef else None
        })
    return res

@router.get("/verifications")
def get_all_verifications(db: Session = Depends(get_db)):
    """Fetch all verification results (Open API for Admin panel)."""
    verifications = db.query(VerificationResult).order_by(VerificationResult.created_at.desc()).all()
    return [
        {
            "id": v.id,
            "user_id": v.user_id,
            "risk_score": v.risk_score,
            "mismatches": v.mismatches_json,
            "created_at": v.created_at
        }
        for v in verifications
    ]

@router.get("/ds160")
def get_all_ds160_forms(db: Session = Depends(get_db)):
    """Fetch all DS-160 forms (Open API for Admin panel)."""
    forms = db.query(DS160Form).order_by(DS160Form.created_at.desc()).all()
    return [
        {
            "id": f.id,
            "user_id": f.user_id,
            "form_json": f.form_json,
            "created_at": f.created_at
        }
        for f in forms
    ]

@router.post("/ds160/export-pdf")
def admin_export_ds160_pdf(
    req: DS160SaveRequest,
    db: Session = Depends(get_db),
):
    """Generate a PDF for a DS-160 form (Open API for Admin panel)."""
    try:
        buffer = generate_precise_pdf(req.form_data)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=DS160_Completed.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

