import fitz
import json

doc = fitz.open('../DS160exampleForm.pdf')

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
                            "text": text,
                            "page": i,
                            "x0": x0,
                            "y0": y0,
                            "x1": x1,
                            "y1": y1
                        })

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
    "companion_name": "NAME OF PERSON \u2013", # ensure we catch the dash
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
    "spouse_surname": "SPOUSE SURNAME",
    "spouse_given_name": "SPOUSE GIVEN NAME",
    "spouse_date_of_birth": "SPOUSE DATE OF BIRTH",
    "spouse_nationality": "SPOUSE NATIONALITY",
    "spouse_city_of_birth": "SPOUSE CITY OF BIRTH",
    "spouse_address": "SPOUSE ADDRESS",
    "current_occupation": "PRESENT OCCUPATION",
    "organization_school_name": "PRESENT EMPLOYER OR SCHOOL NAME",
    "monthly_salary": "MONTHLY SALARY",
    "duties_description": "BRIEFLY DESCRIBE YOUR DUTIES",
}

with open('../frontend/public/autofill_answers.json', 'r') as f:
    schema = json.load(f)

for section, fields in schema.items():
    if not isinstance(fields, dict): continue
    for field_key, value in fields.items():
        match_str = mapping_rules.get(field_key, field_key.replace("_", " ").upper())
        
        best_match = None
        for c in raw_coords:
            # We want to match exactly if possible, or startswith, to avoid "SPOUSE" matching "FORMER SPOUSE"
            # It's better to check if match_str is in c["text"].upper()
            if match_str in c["text"].upper():
                best_match = c
                break
        
        if best_match:
            val_str = "Yes" if value is True else "No" if value is False else str(value or "N/A")
            
            p = doc[best_match["page"]]
            
            # Place it right after the bounding box of the matched text
            # Add a 10px padding to the right
            x_pos = best_match["x1"] + 10
            y_pos = best_match["y1"] - 2 # baseline adjustment

            # Special case for addresses, they should probably go on the next line if they are long
            # Or just wrap
            if "ADDRESS" in best_match["text"]:
                x_pos = 100 # Indent it a bit on the next line
                y_pos = best_match["y1"] + 15

            p.insert_text(
                fitz.Point(x_pos, y_pos),
                val_str,
                fontsize=11,
                fontname="helv",
                color=(0, 0, 0.8)
            )
        else:
            print(f"Could not find match for {field_key} ({match_str})")

doc.save("test_filled_precise.pdf")
print("Saved test_filled_precise.pdf")
