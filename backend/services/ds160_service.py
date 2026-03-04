"""Map a verified profile to the official DS-160 visa application schema."""


def _empty_ds160_schema() -> dict:
    """Return the full DS-160 schema with all fields empty, matching the official form."""
    return {
        "personal_details": {
            "given_name": "",
            "surname": "",
            "marital_status": "",
            "date_of_birth": "",
            "place_of_birth": "",
            "nationality": "",
            "address_with_pincode": "",
            "mobile_no": "",
            "home_phone": "",
            "work_phone": "",
            "email_address": "",
        },
        "passport_details": {
            "passport_no": "",
            "passport_place_of_issue": "",
            "passport_date_of_issue": "",
            "passport_date_of_expiry": "",
        },
        "travel_information": {
            "date_of_travel": "",
            "return_date": "",
            "stay_address_in_usa": "",
            "person_paying_for_trip": "",
            "payer_name": "",
            "payer_contact_no": "",
            "payer_email": "",
            "payer_address": "",
            "companion_name": "",
            "companion_relation": "",
        },
        "previous_us_travel": {
            "have_you_been_in_us": "",
            "last_travel_date": "",
            "last_return_date": "",
            "have_you_been_issued_us_visa": "",
            "previous_visa_date_of_issue": "",
            "previous_visa_number": "",
            "visa_refused_or_denied": "",
            "visa_refused_explanation": "",
        },
        "us_contact": {
            "contact_person_name": "",
            "organization_name": "",
            "relation_with_you": "",
            "stay_address_in_us": "",
            "contact_no": "",
            "email_address": "",
        },
        "family_details": {
            "father_surname": "",
            "father_given_name": "",
            "father_date_of_birth": "",
            "is_father_in_us": "",
            "mother_surname": "",
            "mother_given_name": "",
            "mother_date_of_birth": "",
            "is_mother_in_us": "",
            "spouse_surname": "",
            "spouse_given_name": "",
            "spouse_date_of_birth": "",
            "spouse_nationality": "",
            "spouse_city_of_birth": "",
            "spouse_address": "",
        },
        "work_education": {
            "current_occupation": "",
            "organization_school_name": "",
            "designation": "",
            "work_address_with_pincode": "",
            "work_phone_no": "",
            "monthly_salary": "",
            "duties_description": "",
            "prev_employer_name": "",
            "prev_employer_designation": "",
            "prev_employer_address": "",
            "prev_employer_contact_no": "",
            "prev_supervisor_name": "",
            "prev_duties_description": "",
            "prev_job_start_date": "",
            "prev_job_end_date": "",
            "school_name": "",
            "school_address": "",
            "course_of_study": "",
            "attendance_from": "",
            "attendance_to": "",
        },
        "security_questions": {
            "paramilitary_involvement": "",
            "communicable_disease": "",
            "mental_physical_disorder": "",
            "drug_abuser": "",
            "arrested_or_convicted": "",
            "controlled_substances_violation": "",
            "prostitution": "",
            "money_laundering": "",
            "espionage_sabotage": "",
            "terrorist_activities": "",
            "terrorist_financial_support": "",
            "terrorist_organization_member": "",
            "genocide": "",
            "torture": "",
            "extrajudicial_killings": "",
            "religious_freedom_violations": "",
            "visa_fraud": "",
            "child_custody_violation": "",
            "voted_unlawfully": "",
            "renounced_citizenship_for_tax": "",
        },
        "additional": {
            "interview_language": "",
            "professional_organizations": "",
            "specialized_skills": "",
            "countries_visited_last_5_years": "",
            "languages_spoken": "",
            "application_location": "",
        },
    }


def generate_ds160(verified_profile: dict) -> dict:
    """
    Transform a verified profile dict into editable DS-160 sections
    matching the official form structure.
    """
    ds160 = _empty_ds160_schema()

    # ── Personal Details ──────────────────────────────
    p = ds160["personal_details"]
    p["given_name"] = verified_profile.get("given_names", "")
    p["surname"] = verified_profile.get("surname", "")
    p["date_of_birth"] = verified_profile.get("date_of_birth", "")
    p["place_of_birth"] = verified_profile.get("place_of_birth", "")
    p["nationality"] = verified_profile.get("nationality", "")
    p["email_address"] = verified_profile.get("email", "")
    p["mobile_no"] = verified_profile.get("phone", "")
    p["address_with_pincode"] = verified_profile.get("address", "")

    # ── Passport ──────────────────────────────────────
    pp = ds160["passport_details"]
    pp["passport_no"] = verified_profile.get("passport_number", "")
    pp["passport_date_of_issue"] = verified_profile.get("passport_issue_date", "")
    pp["passport_date_of_expiry"] = verified_profile.get("passport_expiry_date", "")

    # ── Travel (from previous visa if available) ──────
    t = ds160["previous_us_travel"]
    pv_type = verified_profile.get("previous_visa_type", "")
    t["have_you_been_issued_us_visa"] = "Yes" if pv_type else ""
    t["previous_visa_date_of_issue"] = verified_profile.get("previous_visa_issue_date", "")
    t["previous_visa_number"] = verified_profile.get("previous_visa_number", "")

    # ── Work / Education ──────────────────────────────
    we = ds160["work_education"]
    we["organization_school_name"] = verified_profile.get("institution_name", "")
    we["course_of_study"] = verified_profile.get("major", "") or verified_profile.get("program_name", "")
    we["designation"] = verified_profile.get("degree_level", "") or verified_profile.get("degree", "")
    we["attendance_from"] = verified_profile.get("program_start_date", "") or verified_profile.get("enrollment_date", "")
    we["attendance_to"] = verified_profile.get("program_end_date", "") or verified_profile.get("graduation_date", "")
    we["school_name"] = verified_profile.get("institution_name", "")

    # Previous employment from resume
    we["prev_employer_name"] = verified_profile.get("current_employer", "")
    we["prev_employer_designation"] = verified_profile.get("current_job_title", "")

    # ── Compute completeness ──────────────────────────
    total_fields = 0
    filled_fields = 0
    for section_key, section in ds160.items():
        if isinstance(section, dict):
            for v in section.values():
                total_fields += 1
                if v:
                    filled_fields += 1

    completeness = (filled_fields / total_fields * 100) if total_fields > 0 else 0

    ds160["_meta"] = {
        "completeness": round(completeness, 1),
        "total_fields": total_fields,
        "filled_fields": filled_fields,
    }

    return ds160
