import fitz
import io
import os

def generate_precise_pdf(form_data: dict) -> io.BytesIO:
    # Path to base PDF
    base_pdf_path = os.path.join(os.path.dirname(__file__), '..', '..', 'DS160exampleForm.pdf')
    doc = fitz.open(base_pdf_path)

    # Extract raw coords
    raw_coords = []
    for i, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for l in b["lines"]:
                    for s in l["spans"]:
                        text = s["text"].strip()
                        if text:
                            x0, y0, x1, y1 = s["bbox"]
                            raw_coords.append({
                                "text": text.upper(),
                                "page": i,
                                "x0": x0,
                                "y0": y0,
                                "x1": x1,
                                "y1": y1
                            })

    mapping_rules = {
        "given_name": "GIVEN NAME \u2013",
        "surname": "SURNAME \u2013",
        "marital_status": "MARITAL STATUS \u2013",
        "date_of_birth": "DATE OF BIRTH \u2013",
        "place_of_birth": "PLACE OF BIRTH \u2013",
        "nationality": "NATIONALITY \u2013",
        "address_with_pincode": "STAY ADDRESS WITH PINCODE",
        "mobile_no": "MOBILE NO \u2013 91 \u2013",
        "home_phone": "HOME (LANDLINE NO) \u2013 91 \u2013",
        "work_phone": "WORK PHONE NO \u2013 91 \u2013",
        "email_address": "EMAIL ADDRESS \u2013",
        "passport_no": "PASSPORT NO \u2013",
        "passport_place_of_issue": "PASSPORT PLACE OF ISSUE \u2013",
        "passport_date_of_issue": "PASSPORT DATE OF ISSUE",
        "passport_date_of_expiry": "PASSPORT DATE OF EXPIRY",
        "date_of_travel": "DATE OF TRAVEL",
        "return_date": "RETURN DATE",
        "stay_address_in_usa": "STAY ADDRESS IN USA",
        "person_paying_for_trip": "PERSON/ENTITY PAYING",
        "payer_name": "NAME OF PERSON/ENTITY",
        "payer_contact_no": "CONTACT NO \u2013 91 \u2013",
        "payer_email": "EMAIL ADDRESS",
        "payer_address": "ADDRESS \u2013",
        "companion_name": "NAME OF PERSON",
        "companion_relation": "RELATION WITH YOU \u2013",
        "companion_has_us_visa": "DO THEY HAVE A VALID US VISA",
        "have_you_been_in_us": "HAVE YOU EVER BEEN IN THE US",
        "last_travel_date": "DATE OF TRAVEL \u2013",
        "last_return_date": "DATE OF RETURN \u2013",
        "have_you_been_issued_us_visa": "HAVE YOU EVER BEEN ISSUED",
        "previous_visa_date_of_issue": "DATE OF ISSUE",
        "previous_visa_number": "VISA NO",
        "visa_refused_or_denied": "HAVE YOU EVER BEEN REFUSED",
        "visa_refused_explanation": "EXPLAIN \u2013",
        "contact_person_name": "CONTACT PERSON NAME",
        "organization_name": "ORGANIZATION NAME",
        "relation_with_you": "RELATION WITH YOU \u2013",
        "stay_address_in_us": "STAY ADDRESS IN US",
        "contact_no": "CONTACT NO \u2013",
        "father_surname": "FATHERS SURNAME \u2013",
        "father_given_name": "FATHERS GIVEN NAME \u2013",
        "father_date_of_birth": "FATHERS DATE OF BIRTH",
        "is_father_in_us": "IS YOUR FATHER IN THE US",
        "mother_surname": "MOTHERS SURNAME",
        "mother_given_name": "MOTHERSA GIVEN NAME",
        "mother_date_of_birth": "MOTHERS DATE OF BIRTH",
        "is_mother_in_us": "IS YOUR MOTHER IN THE US",
        "spouse_surname": "SPOUSE SURNAME \u2013",
        "spouse_given_name": "SPOUSE GIVEN NAME \u2013",
        "spouse_date_of_birth": "SPOUSE DATE OF BIRTH",
        "spouse_nationality": "SPOUSE NATIONALITY",
        "spouse_city_of_birth": "SPOUSE CITY OF BIRTH",
        "spouse_address": "SPOUSE ADDRESS",
        "number_of_former_spouses": "NO. OF FORMER SOUSES",
        "former_spouse_surname": "FORMER SPOUSE SURNAME -",
        "former_spouse_given_name": "FORMER SPOUSE GIVEN NAME",
        "former_spouse_dob": "DATE OF BIRTH \u2013",
        "former_spouse_nationality": "NATIONALITY \u2013",
        "former_spouse_place_of_birth": "PLACE OF BIRTH \u2013",
        "date_of_marriage": "DATE OF MARRIAGE \u2013",
        "date_marriage_ended": "DATE OF MARRIAGE ENDED \u2013",
        "how_marriage_ended": "HOW THE MARRIAGE ENDED",
        "country_marriage_terminated": "COUNTRY/REGION MARRIAGE WAS TERMINATED",
        "current_occupation": "PRESENT OCCUPATION",
        "organization_school_name": "ORGANIZATION/SCHOOL NAME \u2013",
        "designation": "DESIGNATION \u2013",
        "work_address_with_pincode": "ADDRESS WITH PINCODE \u2013",
        "work_phone_no": "PHONE NO \u2013",
        "monthly_salary": "MONTHLY SALARY",
        "duties_description": "BRIEFLY DESCRIBE YOUR DUTIES",
        "prev_employer_name": "ORGANIZATION NAME \u2013",
        "prev_employer_designation": "DESIGNATION \u2013",
        "prev_employer_address": "ADDRESS \u2013",
        "prev_employer_contact_no": "CONTACT NO \u2013",
        "prev_supervisor_name": "SUPERVISOR NAME \u2013",
        "prev_duties_description": "BRIEFLY DESCRIBE YOUR DUTIES \u2013",
        "prev_job_start_date": "DATE OF JOB JOINED",
        "prev_job_end_date": "DATE OF JOB END",
        "school_name": "NAME OF INSTITUTE \u2013",
        "school_address": "ADDRESS WITH PINCODE \u2013",
        "course_of_study": "COURSE OF STUDY \u2013",
        "attendance_from": "DATE OF ATTENDANCE FROM",
        "attendance_to": "DATE OF ATTENDANCE TO",
        "has_traveled_internationally_last_5_years": "HAVE YOU EVER TRAVELED TO ANY COUNTRIES",
        "countries_visited_last_5_years": "COUNTRY NAME -",
        "number_of_languages_spoken": "HOW MANY LANGUAGES YOU CAN SPEAK",
        "languages_spoken": "PROVIDE NAME \u2013",
        "interview_language": "INTERVIEW LANGUAGE -",
        "belong_to_professional_organization": "HAVE YOU BELONGED TO, CONTRIBUTED TO",
        "professional_organizations": "NAME OF ORGANIZATION \u2013",
        "has_specialized_skills": "DO YOU HAVE ANY SPECIALIZED SKILLS OR TRAINING",
        "specialized_skills": "NAME \u2013",
        "has_served_in_military": "HAVE YOU EVER SERVED IN THE MILITARY",
        "military_country": "NAME OF COUNTRY/REGION \u2013",
        "military_branch": "BRANCH OF SERVICE \u2013",
        "military_rank": "RANK/POSITION \u2013",
        "military_specialty": "MILITARY SPECLALITY \u2013",
        "military_date_from": "DATE OF SERVICE FROM",
        "military_date_to": "DATE OF SERVICE TO",
        "paramilitary_involvement": "PARAMILITARY UNIT",
        "communicable_disease": "COMMUNICABLE DISEASE",
        "mental_physical_disorder": "MENTAL OR PHYSICAL DISORDER",
        "drug_abuser": "DRUG ABUSER OR ADDICT",
        "arrested_or_convicted": "ARRESTED OR CONVICTED",
        "controlled_substances_violation": "CONTROLLED SUBSTANCES",
        "prostitution": "PROSTITUTION OR UNLAWFUL",
        "money_laundering": "MONEY LAUNDERING",
        "espionage_sabotage": "ESPIONAGE, SABOTAGE",
        "terrorist_activities": "ENGAGE IN TERRORIST ACTIVITIES",
        "terrorist_financial_support": "FINANCIAL ASSISTANCE",
        "terrorist_organization_member": "MEMBER OR REPRESENTATIVE OF TERRORIST ORGANIZATION",
        "genocide": "PARTICIPATED ON GENOCIDE",
        "torture": "PARTICIPATED IN TORTURE",
        "extrajudicial_killings": "EXTRAJUDICIAL KILLINGS",
        "religious_freedom_violations": "RELIGIOUS FREEDOM",
        "visa_fraud": "VISA, ENTRY INTO THE UNITED STATES",
        "child_custody_violation": "WITHHELD CUSTODY OF A US CITIZEN CHILD",
        "voted_unlawfully": "HAVE YOU VOTED IN THE UNITED STATES",
        "renounced_citizenship_for_tax": "RENOUNCED UNITED STATES CITIZENSHIP",
        "application_location": "LOCATION WHERE YOU WILL BE SUBMITTING",
        "current_location": "CURRENT LOCATIONS -"
    }

    # A simple tracker to not re-use the exact same bbox object
    used_coords = set()
    unmapped_fields = []

    for section, fields in form_data.items():
        if not isinstance(fields, dict): continue
        for field_key, value in fields.items():
            if value in [None, ""]: continue
            
            match_str = mapping_rules.get(field_key, field_key.replace("_", " ").upper())
            
            best_match = None
            for c in raw_coords:
                if match_str in c["text"] and (c["page"], c["y1"]) not in used_coords:
                    best_match = c
                    break
            
            if best_match:
                used_coords.add((best_match["page"], best_match["y1"]))
                val_str = "Yes" if value is True else "No" if value is False else str(value)
                
                p = doc[best_match["page"]]
                
                # Smart alignment: column at X=280 for short labels, strict inline for long ones
                if best_match["x1"] < 280:
                    # Column start at 280, up to margin 570. Height=25 to allow minimal wrapping if needed
                    rect = fitz.Rect(280, best_match["y0"] - 2, 570, best_match["y0"] + 25)
                else:
                    # Right after label
                    rect = fitz.Rect(best_match["x1"] + 5, best_match["y0"] - 2, 570, best_match["y0"] + 25)

                try:
                    p.insert_textbox(
                        rect,
                        val_str,
                        fontsize=10,
                        fontname="helv",
                        color=(0, 0, 0.6)
                    )
                except Exception as e:
                    # Fallback if rect is somehow inverted or too small
                    p.insert_text(
                        fitz.Point(best_match["x1"] + 5, best_match["y1"]),
                        val_str,
                        fontsize=10,
                        fontname="helv",
                        color=(0, 0, 0.6)
                    )
            else:
                unmapped_fields.append((field_key.replace("_", " ").title(), str(value)))

    # Append unmapped fields to a new page at the end
    if unmapped_fields:
        page = doc.new_page()
        y_offset = 50
        page.insert_text(fitz.Point(50, y_offset), "Additional Application Data", fontsize=16, fontname="helv", color=(0, 0.3, 0.7))
        y_offset += 30

        for label, val in unmapped_fields:
            if y_offset > page.rect.height - 50:
                page = doc.new_page()
                y_offset = 50
            
            # Format: "Label: Value"
            text_line = f"{label}: {val}"
            try:
                # Wrap long text in a textbox
                rect = fitz.Rect(50, y_offset, page.rect.width - 50, y_offset + 30)
                page.insert_textbox(rect, text_line, fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
            except Exception:
                page.insert_text(fitz.Point(50, y_offset + 10), text_line, fontsize=11, fontname="helv", color=(0.2, 0.2, 0.2))
            
            y_offset += 25

    buffer = io.BytesIO()
    doc.save(buffer)
    doc.close()
    buffer.seek(0)
    return buffer
