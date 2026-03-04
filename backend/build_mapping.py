import json

def generate_mapping():
    with open('coords.json', 'r', encoding='utf-8') as f:
        coords = json.load(f)

    # Simplified heuristic matching
    mapping_rules = {
        "given_name": "GIVEN NAME",
        "surname": "SURNAME",
        "marital_status": "MARITAL STATUS",
        "date_of_birth": "DATE OF BIRTH",
        "place_of_birth": "PLACE OF BIRTH",
        "nationality": "NATIONALITY",
        "address_with_pincode": "STAY ADDRESS",
        "mobile_no": "MOBILE NO",
        "home_phone": "HOME (LANDLINE NO)",
        "work_phone": "WORK PHONE NO",
        "email_address": "EMAIL ADDRESS",
        "passport_no": "PASSPORT NO",
        "passport_place_of_issue": "PASSPORT PLACE OF ISSUE",
        "passport_date_of_issue": "PASSPORT DATE OF ISSUE",
        "passport_date_of_expiry": "PASSPORT DATE OF EXPIRY",
        "date_of_travel": "DATE OF TRAVEL",
        "return_date": "RETURN DATE",
        "stay_address_in_usa": "STAY ADDRESS IN USA",
        "payer_name": "NAME OF PERSON/ENTITY",
        "payer_contact_no": "CONTACT NO",
        "companion_name": "NAME OF PERSON -",
        "companion_relation": "RELATION WITH YOU",
        "have_you_been_in_us": "HAVE YOU EVER BEEN IN THE US",
        "have_you_been_issued_us_visa": "HAVE YOU EVER BEEN ISSUED",
        "visa_refused_or_denied": "HAVE YOU EVER BEEN REFUSED",
        "contact_person_name": "CONTACT PERSON NAME IN THE US",
        "organization_name": "ORGANIZATION NAME",
        "father_surname": "FATHERS SURNAME",
        "father_given_name": "FATHERS GIVEN NAME",
        "is_father_in_us": "IS YOUR FATHER IN THE US",
        "mother_surname": "MOTHERS SURNAME",
        "current_occupation": "PRESENT OCCUPATION",
        "organization_school_name": "PRESENT EMPLOYER OR SCHOOL NAME",
        "monthly_salary": "MONTHLY SALARY",
        "duties_description": "BRIEFLY DESCRIBE YOUR DUTIES",
    }

    final_mapping = {}

    # Read the mock autofill schema
    with open('../frontend/public/autofill_answers.json', 'r') as f:
        schema = json.load(f)

    for section, fields in schema.items():
        if not isinstance(fields, dict): continue
        for field_key in fields.keys():
            # Find matching coord
            match_str = mapping_rules.get(field_key, field_key.replace("_", " ").upper())
            
            best_match = None
            for c in coords:
                if match_str in c["text"].upper():
                    best_match = c
                    break
            
            if best_match:
                # Calculate a robust X offset. Usually label ends and we want to print value after.
                # Since we don't have label width easily, we can just hardcode X=300 for single column form.
                # Actually, most labels are at x=72. 
                # Let's set X = 250 for most.
                val_x = 300
                if "ADDRESS" in best_match["text"]:
                    val_x = 72
                    best_match["y"] -= 15 # newline
                
                final_mapping[field_key] = {
                    "page": best_match["page"],
                    "x": val_x,
                    "y": best_match["y"] - 1 # slight adjustment for baseline
                }

    # Save to frontend public so step-export can use it
    with open('../frontend/public/pdf_mapping.json', 'w') as f:
        json.dump(final_mapping, f, indent=2)
    print("Mapping saved to frontend/public/pdf_mapping.json")

generate_mapping()
