import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="owner")
    verification_results = relationship("VerificationResult", back_populates="user")
    ds160_forms = relationship("DS160Form", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # application_id removed
    doc_type = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    upload_path = Column(String, nullable=False)
    status = Column(String, default="uploaded")  # uploaded, processing, extracted, verified, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    ocr_text = relationship("OcrText", back_populates="document", uselist=False)
    extracted_fields = relationship("ExtractedField", back_populates="document", uselist=False)


class OcrText(Base):
    __tablename__ = "ocr_text"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    raw_text = Column(Text, nullable=False)

    document = relationship("Document", back_populates="ocr_text")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, unique=True)
    fields_json = Column(JSON, nullable=False)

    document = relationship("Document", back_populates="extracted_fields")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mismatches_json = Column(JSON, nullable=False, default=list)
    risk_score = Column(Float, default=0.0)
    verified_profile_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="verification_results")


class DS160Form(Base):
    __tablename__ = "ds160_generated_forms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    form_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ds160_forms")

