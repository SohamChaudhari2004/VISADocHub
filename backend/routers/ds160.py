import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from database import get_db
from models import User, VerificationResult, DS160Form
from schemas import DS160SaveRequest
from auth import get_current_user
from services.ds160_service import generate_ds160
from services.pdf_export_service import generate_precise_pdf

router = APIRouter(prefix="/api/ds160", tags=["DS-160"])


@router.post("/generate")
def generate_ds160_form(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get latest verification result
    vr = db.query(VerificationResult).filter(
        VerificationResult.user_id == current_user.id
    ).order_by(VerificationResult.created_at.desc()).first()

    if not vr or not vr.verified_profile_json:
        raise HTTPException(
            status_code=400,
            detail="No verified profile found. Run verification first.",
        )

    ds160_data = generate_ds160(vr.verified_profile_json)

    # Save the generated form
    form = DS160Form(
        user_id=current_user.id,
        form_json=ds160_data,
    )
    db.add(form)
    db.commit()
    db.refresh(form)

    return {
        "id": form.id,
        "form": ds160_data,
        "created_at": form.created_at,
    }


@router.put("/{form_id}")
def update_ds160_form(
    form_id: int,
    req: DS160SaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    form = db.query(DS160Form).filter(
        DS160Form.id == form_id,
        DS160Form.user_id == current_user.id,
    ).first()

    if not form:
        raise HTTPException(status_code=404, detail="DS-160 form not found")

    form.form_json = req.form_data
    db.commit()
    db.refresh(form)

    return {"id": form.id, "form": form.form_json, "detail": "Form saved"}


@router.get("/preview")
def preview_ds160(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    form = db.query(DS160Form).filter(
        DS160Form.user_id == current_user.id
    ).order_by(DS160Form.created_at.desc()).first()

    if not form:
        # Try generating from latest verification
        vr = db.query(VerificationResult).filter(
            VerificationResult.user_id == current_user.id
        ).order_by(VerificationResult.created_at.desc()).first()

        if vr and vr.verified_profile_json:
            ds160_data = generate_ds160(vr.verified_profile_json)
            return {"id": None, "form": ds160_data, "generated": False}

        return {"id": None, "form": None, "generated": False}

    return {"id": form.id, "form": form.form_json, "generated": True}


@router.get("/export")
def export_ds160(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    form = db.query(DS160Form).filter(
        DS160Form.user_id == current_user.id
    ).order_by(DS160Form.created_at.desc()).first()

    if not form:
        raise HTTPException(status_code=404, detail="No DS-160 form generated yet.")

    json_str = json.dumps(form.form_json, indent=2)
    buffer = io.BytesIO(json_str.encode("utf-8"))

    return StreamingResponse(
        buffer,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=ds160_form.json"},
    )

@router.post("/export-pdf")
def export_ds160_pdf(
    req: DS160SaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        buffer = generate_precise_pdf(req.form_data)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=DS160_Completed.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
