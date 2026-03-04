import json
import httpx
from config import settings

PASSPORT_PROMPT = """Extract the following fields from this passport OCR text into a JSON object:
- full_name (string)
- surname (string)
- given_names (string)
- nationality (string)
- date_of_birth (string, format: YYYY-MM-DD)
- sex (string: M or F)
- passport_number (string)
- date_of_issue (string, format: YYYY-MM-DD)
- date_of_expiry (string, format: YYYY-MM-DD)
- place_of_birth (string)
- issuing_authority (string)

Return ONLY valid JSON, no explanations."""

I20_PROMPT = """Extract the following fields from this I-20 (Certificate of Eligibility) OCR text into a JSON object:
- student_name (string)
- sevis_id (string, the SEVIS number e.g. N0012345678)
- school_name (string, the designated school official's institution)
- program_name (string, e.g. "Master of Science in Computer Science")
- degree_level (string, e.g. "Bachelor's", "Master's", "Doctorate")
- major (string)
- program_start_date (string, format: YYYY-MM-DD)
- program_end_date (string, format: YYYY-MM-DD)
- english_proficiency_required (string, Yes or No)
- annual_estimated_cost (string, total cost including tuition, living expenses)
- funding_source (string, e.g. "Personal", "Scholarship", "Assistantship")
- school_address (string)

Return ONLY valid JSON, no explanations."""

VISA_PHOTO_PROMPT = """This is OCR text from a visa/passport photo. Extract any visible information into a JSON object:
- photo_format (string, e.g. "JPEG", "PNG", or "Unknown")
- dimensions (string, e.g. "2x2 inches" or "51x51 mm", if detectable)
- background_color (string, e.g. "white", if detectable)
- notes (string, any other relevant observations)

If no meaningful text is found, return: {"photo_format": "image", "notes": "Visa photo uploaded successfully"}

Return ONLY valid JSON, no explanations."""

OFFER_LETTER_PROMPT = """Extract the following fields from this offer/admission letter OCR text into a JSON object:
- student_name (string)
- institution_name (string, the university or college name)
- program_name (string, e.g. "Master of Science in Data Science")
- degree_level (string, e.g. "Bachelor's", "Master's", "Doctorate")
- major (string)
- department (string)
- admission_type (string, e.g. "Full-time", "Part-time")
- program_start_date (string, format: YYYY-MM-DD)
- financial_aid (string, any scholarship or assistantship mentioned)
- admission_decision (string, e.g. "Admitted", "Conditional", "Waitlisted")
- institution_address (string)

Return ONLY valid JSON, no explanations."""

RESUME_PROMPT = """Extract the following fields from this resume/CV OCR text into a JSON object:
- full_name (string)
- email (string)
- phone (string)
- address (string, current address if available)
- current_employer (string, most recent employer)
- current_job_title (string, most recent job title)
- years_of_experience (string, approximate total years)
- work_history (array of objects with: employer, title, start_date, end_date, location)
- education (array of objects with: institution, degree, major, graduation_year)
- skills (array of strings)

Return ONLY valid JSON, no explanations."""

BANK_STATEMENT_PROMPT = """Extract the following fields from this bank statement OCR text into a JSON object:
- account_holder_name (string)
- bank_name (string)
- account_number (string, last 4 digits only)
- statement_period_start (string, format: YYYY-MM-DD)
- statement_period_end (string, format: YYYY-MM-DD)
- opening_balance (number)
- closing_balance (number)
- currency (string)
- average_balance (number, if calculable)

Return ONLY valid JSON, no explanations."""

PREVIOUS_VISA_PROMPT = """Extract the following fields from this previous visa/passport page OCR text into a JSON object:
- visa_number (string)
- visa_type (string, e.g. "F1", "B1/B2", "H1B")
- visa_class (string)
- issue_date (string, format: YYYY-MM-DD)
- expiry_date (string, format: YYYY-MM-DD)
- issuing_post (string, the consulate or embassy)
- issuing_country (string)
- holder_name (string)
- passport_number (string, associated passport number)
- status (string, e.g. "Expired", "Cancelled", "Valid")
- entries (string, e.g. "Single", "Multiple")

Return ONLY valid JSON, no explanations."""


PROMPTS = {
    "passport": PASSPORT_PROMPT,
    "i20": I20_PROMPT,
    "visa_photo": VISA_PHOTO_PROMPT,
    "offer_letter": OFFER_LETTER_PROMPT,
    "resume": RESUME_PROMPT,
    "bank_statement": BANK_STATEMENT_PROMPT,
    "previous_visa": PREVIOUS_VISA_PROMPT,
}


async def extract_fields(ocr_text: str, doc_type: str) -> dict:
    """Use Mistral LLM to extract structured fields from OCR text."""
    if not settings.MISTRAL_API_KEY:
        raise RuntimeError("MISTRAL_API_KEY is not set. Cannot run extraction.")

    prompt = PROMPTS.get(doc_type)
    if not prompt:
        raise ValueError(f"Unknown document type: {doc_type}")

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-large-latest",
                "messages": [
                    {"role": "system", "content": "You are a document data extraction assistant. Return only valid JSON."},
                    {"role": "user", "content": f"{prompt}\n\n--- OCR TEXT ---\n{ocr_text}"},
                ],
                "temperature": 0.0,
                "response_format": {"type": "json_object"},
            },
        )

    if response.status_code != 200:
        raise RuntimeError(f"Mistral LLM API error: {response.status_code} — {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"]

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"raw_response": content, "parse_error": True}
