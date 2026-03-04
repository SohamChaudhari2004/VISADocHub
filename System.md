
# VisaDoc: Automated DS-160 Data Extraction & Verification

VisaDoc is a streamlined platform designed to automate the extraction of information from travel and academic documents, verify data consistency, and generate pre-filled data for DS-160 visa applications.

## 🚀 Features

- **Document Processing**: Upload and process Passports, Transcripts, and Bank Statements.
- **OCR & Extraction**: High-accuracy extraction using Mistral OCR and LLM APIs into structured JSON.
- **Consistency Engine**: Automated cross-referencing of Name, DOB, and Passport numbers across all documents with fuzzy matching and risk scoring.
- **DS-160 Mapping**: Intelligent mapping of extracted data to the official DS-160 schema.
- **Interactive Dashboard**: Edit extracted fields, view mismatch warnings, and preview generated forms.
- **Export**: Download DS-160 autofill-ready JSON and summary reports.

## 🛠 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Lucide React
- **Backend**: FastAPI (Python 3.10+)
- **Database**: SQLite (local file `visadoc.db`) with SQLAlchemy ORM — no external database or connection string required.
- **OCR/AI**: Mistral OCR API & Mistral LLM API
- **Authentication**: Email/password-based auth with bcrypt-hashed passwords stored in the SQLite `users` table. Sessions managed via JWT tokens.

## 🏗 Architecture

### 1. Frontend (Next.js)
- **Dashboard**: Overview of document status and verification scores.
- **Upload Center**: Multi-file upload for PDF/Images.
- **Verification UI**: Side-by-side comparison of extracted data vs. original documents.
- **DS-160 Preview**: A specialized form view showing mapped fields ready for application.

### 2. Backend (FastAPI)
- **OCR Pipeline**: Handles file ingestion and interfaces with Mistral OCR.
- **Extraction Layer**: Prompts LLM to return structured data (Passport No, Nationality, Scores, etc.).
- **Verification Engine**: Logic for field validation, expiry checks, and format verification.
- **Mapping Engine**: Transforms verified student profiles into `ds160_schema.json` format.
- **Auth Module**: Handles user registration (email + password), login, and JWT token issuance/validation. Passwords are hashed with bcrypt before storage.

### 3. Database Schema (SQLite)
- `users`: `id`, `email` (unique), `password_hash` (bcrypt), `created_at`. Used for email/password authentication.
- `documents`: Metadata for uploaded files.
- `ocr_text`: Raw text output from OCR.
- `extracted_fields`: Structured JSON data per document.
- `verification_results`: Logs of mismatches and risk scores.
- `ds160_generated_forms`: Final mapped data for export.

## 📋 MVP Deliverables

- [ ] **Document Upload**: Support for Passport, Transcript, and Bank Statement.
- [ ] **Structured Extraction**: Automated field population from uploads.
- [ ] **Mismatch Flagging**: UI indicators for inconsistent data (e.g., Name spelling variations).
- [ ] **Verified Profile**: A single "Source of Truth" profile generated from multiple docs.
- [ ] **DS-160 JSON**: Exportable JSON file compatible with autofill scripts/tools.
- [ ] **UI Preview**: Visual representation of the DS-160 form fields.

## 🛠 Setup (Quick Start)

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   The SQLite database (`visadoc.db`) is created automatically on first run — no setup needed.

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Environment Variables**:
   Create a `.env` file with:
   - `MISTRAL_API_KEY` — for OCR and LLM extraction
   - `JWT_SECRET` — secret key for signing auth tokens
