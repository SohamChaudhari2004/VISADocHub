from typing import List, Optional
from fuzzywuzzy import fuzz


def _get_name_fields(fields: dict, doc_type: str) -> Optional[str]:
    """Extract the primary name field depending on document type."""
    if doc_type == "passport":
        return fields.get("full_name") or f"{fields.get('given_names', '')} {fields.get('surname', '')}".strip()
    elif doc_type == "i20":
        return fields.get("student_name")
    elif doc_type == "offer_letter":
        return fields.get("student_name")
    elif doc_type == "resume":
        return fields.get("full_name")
    elif doc_type == "transcript":
        return fields.get("student_name")
    elif doc_type == "bank_statement":
        return fields.get("account_holder_name")
    elif doc_type == "previous_visa":
        return fields.get("holder_name")
    return None


def _get_dob(fields: dict) -> Optional[str]:
    return fields.get("date_of_birth")


def _get_passport_number(fields: dict) -> Optional[str]:
    return fields.get("passport_number")


def _get_sevis_id(fields: dict) -> Optional[str]:
    return fields.get("sevis_id")


def _get_institution(fields: dict, doc_type: str) -> Optional[str]:
    if doc_type == "i20":
        return fields.get("school_name")
    elif doc_type == "offer_letter":
        return fields.get("institution_name")
    elif doc_type == "transcript":
        return fields.get("institution_name")
    return None


def run_verification(documents: list[dict]) -> dict:
    """
    Cross-reference extracted fields across documents.

    Args:
        documents: list of dicts with keys: doc_id, doc_type, fields

    Returns:
        dict with: mismatches (list), risk_score (float 0-100), verified_profile (dict)
    """
    if not documents:
        return {"mismatches": [], "risk_score": 0, "verified_profile": {}}

    mismatches = []
    names = []
    dobs = []
    passport_numbers = []
    sevis_ids = []
    institutions = []

    for doc in documents:
        fields = doc["fields"]
        doc_type = doc["doc_type"]
        doc_id = doc["doc_id"]

        name = _get_name_fields(fields, doc_type)
        if name:
            names.append({"doc_id": doc_id, "doc_type": doc_type, "value": name})

        dob = _get_dob(fields)
        if dob:
            dobs.append({"doc_id": doc_id, "doc_type": doc_type, "value": dob})

        pn = _get_passport_number(fields)
        if pn:
            passport_numbers.append({"doc_id": doc_id, "doc_type": doc_type, "value": pn})

        sid = _get_sevis_id(fields)
        if sid:
            sevis_ids.append({"doc_id": doc_id, "doc_type": doc_type, "value": sid})

        inst = _get_institution(fields, doc_type)
        if inst:
            institutions.append({"doc_id": doc_id, "doc_type": doc_type, "value": inst})

    risk_score = 0.0

    # ── Name consistency check ────────────────────────
    if len(names) >= 2:
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                ratio = fuzz.token_sort_ratio(
                    names[i]["value"].lower(),
                    names[j]["value"].lower(),
                )
                if ratio < 95:
                    severity = "high" if ratio < 70 else "medium" if ratio < 85 else "low"
                    score_add = 30 if ratio < 70 else 15 if ratio < 85 else 5
                    risk_score += score_add
                    mismatches.append({
                        "field": "name",
                        "values": [
                            {"doc_id": names[i]["doc_id"], "doc_type": names[i]["doc_type"], "value": names[i]["value"]},
                            {"doc_id": names[j]["doc_id"], "doc_type": names[j]["doc_type"], "value": names[j]["value"]},
                        ],
                        "similarity": ratio,
                        "severity": severity,
                        "message": f"Name mismatch ({ratio}% similarity) between {names[i]['doc_type']} and {names[j]['doc_type']}",
                    })

    # ── DOB consistency check ─────────────────────────
    if len(dobs) >= 2:
        unique_dobs = set(d["value"] for d in dobs)
        if len(unique_dobs) > 1:
            risk_score += 40
            mismatches.append({
                "field": "date_of_birth",
                "values": [{"doc_id": d["doc_id"], "doc_type": d["doc_type"], "value": d["value"]} for d in dobs],
                "severity": "high",
                "message": "Date of birth differs across documents",
            })

    # ── Passport number consistency check ─────────────
    if len(passport_numbers) >= 2:
        unique_pn = set(p["value"] for p in passport_numbers)
        if len(unique_pn) > 1:
            risk_score += 30
            mismatches.append({
                "field": "passport_number",
                "values": [{"doc_id": p["doc_id"], "doc_type": p["doc_type"], "value": p["value"]} for p in passport_numbers],
                "severity": "high",
                "message": "Passport number differs across documents",
            })

    # ── SEVIS ID consistency check ────────────────────
    if len(sevis_ids) >= 2:
        unique_sevis = set(s["value"] for s in sevis_ids)
        if len(unique_sevis) > 1:
            risk_score += 25
            mismatches.append({
                "field": "sevis_id",
                "values": [{"doc_id": s["doc_id"], "doc_type": s["doc_type"], "value": s["value"]} for s in sevis_ids],
                "severity": "high",
                "message": "SEVIS ID differs across documents",
            })

    # ── Institution name consistency check ────────────
    if len(institutions) >= 2:
        for i in range(len(institutions)):
            for j in range(i + 1, len(institutions)):
                ratio = fuzz.token_sort_ratio(
                    institutions[i]["value"].lower(),
                    institutions[j]["value"].lower(),
                )
                if ratio < 85:
                    severity = "medium" if ratio < 70 else "low"
                    score_add = 15 if ratio < 70 else 5
                    risk_score += score_add
                    mismatches.append({
                        "field": "institution_name",
                        "values": [
                            {"doc_id": institutions[i]["doc_id"], "doc_type": institutions[i]["doc_type"], "value": institutions[i]["value"]},
                            {"doc_id": institutions[j]["doc_id"], "doc_type": institutions[j]["doc_type"], "value": institutions[j]["value"]},
                        ],
                        "similarity": ratio,
                        "severity": severity,
                        "message": f"Institution name mismatch ({ratio}% similarity) between {institutions[i]['doc_type']} and {institutions[j]['doc_type']}",
                    })

    risk_score = min(risk_score, 100.0)

    # ── Build verified profile (source-of-truth) ─────
    verified_profile = _build_verified_profile(documents)

    return {
        "mismatches": mismatches,
        "risk_score": risk_score,
        "verified_profile": verified_profile,
    }


def _build_verified_profile(documents: list[dict]) -> dict:
    """Build a consolidated 'source of truth' profile, preferring passport data."""
    profile = {}

    # Priority: passport > i20 > offer_letter > transcript > resume > bank_statement > previous_visa
    priority = {
        "passport": 7,
        "i20": 6,
        "offer_letter": 5,
        "transcript": 4,
        "resume": 3,
        "bank_statement": 2,
        "previous_visa": 1,
    }
    sorted_docs = sorted(documents, key=lambda d: priority.get(d["doc_type"], 0), reverse=True)

    for doc in sorted_docs:
        fields = doc["fields"]
        doc_type = doc["doc_type"]

        if doc_type == "passport":
            profile.setdefault("full_name", fields.get("full_name"))
            profile.setdefault("surname", fields.get("surname"))
            profile.setdefault("given_names", fields.get("given_names"))
            profile.setdefault("nationality", fields.get("nationality"))
            profile.setdefault("date_of_birth", fields.get("date_of_birth"))
            profile.setdefault("sex", fields.get("sex"))
            profile.setdefault("passport_number", fields.get("passport_number"))
            profile.setdefault("passport_issue_date", fields.get("date_of_issue"))
            profile.setdefault("passport_expiry_date", fields.get("date_of_expiry"))
            profile.setdefault("place_of_birth", fields.get("place_of_birth"))

        elif doc_type == "i20":
            profile.setdefault("sevis_id", fields.get("sevis_id"))
            profile.setdefault("institution_name", fields.get("school_name"))
            profile.setdefault("program_name", fields.get("program_name"))
            profile.setdefault("degree_level", fields.get("degree_level"))
            profile.setdefault("major", fields.get("major"))
            profile.setdefault("program_start_date", fields.get("program_start_date"))
            profile.setdefault("program_end_date", fields.get("program_end_date"))
            profile.setdefault("funding_source", fields.get("funding_source"))
            profile.setdefault("annual_estimated_cost", fields.get("annual_estimated_cost"))

        elif doc_type == "offer_letter":
            profile.setdefault("institution_name", fields.get("institution_name"))
            profile.setdefault("program_name", fields.get("program_name"))
            profile.setdefault("degree_level", fields.get("degree_level"))
            profile.setdefault("major", fields.get("major"))
            profile.setdefault("department", fields.get("department"))
            profile.setdefault("program_start_date", fields.get("program_start_date"))
            profile.setdefault("financial_aid", fields.get("financial_aid"))

        elif doc_type == "transcript":
            profile.setdefault("institution_name", fields.get("institution_name"))
            profile.setdefault("degree", fields.get("degree"))
            profile.setdefault("major", fields.get("major"))
            profile.setdefault("gpa", fields.get("gpa"))
            profile.setdefault("enrollment_date", fields.get("enrollment_date"))
            profile.setdefault("graduation_date", fields.get("graduation_date"))

        elif doc_type == "resume":
            profile.setdefault("email", fields.get("email"))
            profile.setdefault("phone", fields.get("phone"))
            profile.setdefault("address", fields.get("address"))
            profile.setdefault("current_employer", fields.get("current_employer"))
            profile.setdefault("current_job_title", fields.get("current_job_title"))
            profile.setdefault("years_of_experience", fields.get("years_of_experience"))
            profile.setdefault("work_history", fields.get("work_history"))

        elif doc_type == "bank_statement":
            profile.setdefault("bank_name", fields.get("bank_name"))
            profile.setdefault("account_number_last4", fields.get("account_number"))
            profile.setdefault("closing_balance", fields.get("closing_balance"))
            profile.setdefault("currency", fields.get("currency"))

        elif doc_type == "previous_visa":
            profile.setdefault("previous_visa_type", fields.get("visa_type"))
            profile.setdefault("previous_visa_number", fields.get("visa_number"))
            profile.setdefault("previous_visa_issue_date", fields.get("issue_date"))
            profile.setdefault("previous_visa_expiry_date", fields.get("expiry_date"))
            profile.setdefault("previous_visa_issuing_post", fields.get("issuing_post"))

    # Remove None values
    profile = {k: v for k, v in profile.items() if v is not None}

    return profile
