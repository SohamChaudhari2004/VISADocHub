from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, Document, OcrText, ExtractedField
from auth import get_current_user
from services.ocr_service import run_ocr
from services.extraction_service import extract_fields

router = APIRouter(prefix="/api/documents", tags=["Processing"])


@router.post("/{doc_id}/process")
async def process_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.status not in ("uploaded", "failed"):
        raise HTTPException(status_code=400, detail=f"Document is already {doc.status}")

    try:
        # Step 1: Update status
        doc.status = "processing"
        db.commit()

        # Step 2: Run OCR
        raw_text = await run_ocr(doc.upload_path)

        # Save OCR text
        existing_ocr = db.query(OcrText).filter(OcrText.document_id == doc.id).first()
        if existing_ocr:
            existing_ocr.raw_text = raw_text
        else:
            ocr_record = OcrText(document_id=doc.id, raw_text=raw_text)
            db.add(ocr_record)
        db.commit()

        # Step 3: Extract structured fields
        fields = await extract_fields(raw_text, doc.doc_type)

        # Save extracted fields
        existing_ef = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).first()
        if existing_ef:
            existing_ef.fields_json = fields
        else:
            ef = ExtractedField(document_id=doc.id, fields_json=fields)
            db.add(ef)

        doc.status = "extracted"
        db.commit()

        return {"detail": "Processing complete", "fields": fields}

    except Exception as e:
        doc.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/{doc_id}/extracted")
def get_extracted_fields(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    ef = db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).first()
    if not ef:
        raise HTTPException(status_code=404, detail="No extracted fields found. Process the document first.")

    return {"document_id": doc.id, "doc_type": doc.doc_type, "fields": ef.fields_json}
