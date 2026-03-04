from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Document, ExtractedField, VerificationResult
from auth import get_current_user
from services.verification_service import run_verification

router = APIRouter(prefix="/api/verify", tags=["Verification"])


@router.post("/")
def verify_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get all extracted documents for this user
    docs = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.status.in_(["extracted", "verified"]),
    ).all()

    if not docs:
        raise HTTPException(status_code=400, detail="No extracted documents to verify. Upload and process documents first.")

    doc_data = []
    for doc in docs:
        ef = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).first()
        if ef:
            doc_data.append({
                "doc_id": doc.id,
                "doc_type": doc.doc_type,
                "fields": ef.fields_json,
            })

    if not doc_data:
        raise HTTPException(status_code=400, detail="No extracted fields found.")

    result = run_verification(doc_data)

    # Save verification result
    vr = VerificationResult(
        user_id=current_user.id,
        mismatches_json=result["mismatches"],
        risk_score=result["risk_score"],
        verified_profile_json=result["verified_profile"],
    )
    db.add(vr)

    # Update document statuses
    for doc in docs:
        doc.status = "verified"
    db.commit()
    db.refresh(vr)

    return {
        "id": vr.id,
        "risk_score": vr.risk_score,
        "mismatches": vr.mismatches_json,
        "verified_profile": vr.verified_profile_json,
        "created_at": vr.created_at,
    }


@router.get("/results")
def get_verification_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vr = db.query(VerificationResult).filter(
        VerificationResult.user_id == current_user.id
    ).order_by(VerificationResult.created_at.desc()).first()

    if not vr:
        return {"id": None, "risk_score": 0, "mismatches": [], "verified_profile": None}

    return {
        "id": vr.id,
        "risk_score": vr.risk_score,
        "mismatches": vr.mismatches_json,
        "verified_profile": vr.verified_profile_json,
        "created_at": vr.created_at,
    }
