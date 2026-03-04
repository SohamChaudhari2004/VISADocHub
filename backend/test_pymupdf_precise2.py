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
    "have_you_been_in_us": "HAVE YOU EVER BEEN IN THE US",
    "last_travel_date": "DATE OF TRAVEL",
    "last_return_date": "DATE OF RETURN",
    "have_you_been_issued_us_visa": "HAVE YOU EVER BEEN ISSUED",
    "previous_visa_date_of_issue": "DATE OF ISSUE",
    "previous_visa_number": "VISA NO",
    "visa_refused_or_denied": "HAVE YOU EVER BEEN REFUSED",
    "visa_refused_explanation": "EXPLAIN \u2013",
    "contact_person_name": "CONTACT PERSON NAME",
    "organization_name": "ORGANIZATION NAME",
    "stay_address_in_us": "STAY ADDRESS IN US",
    "contact_no": "CONTACT NO",
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
    "current_occupation": "PRESENT OCCUPATION",
    "organization_school_name": "EMPLOYER OR SCHOOL NAME",
    "designation": "DESIGNATION / COURSE",
    "work_address_with_pincode": "STAY ADDRESS WITH PINCODE",
    "work_phone_no": "WORK PHONE NO",
    "monthly_salary": "MONTHLY SALARY",
    "duties_description": "DESCRIBE YOUR DUTIES",
    "school_name": "EMPLOYER OR SCHOOL NAME",
    "course_of_study": "DESIGNATION / COURSE",
    "attendance_from": "DATE OF ATTENDANCE FROM",
    "attendance_to": "DATE OF ATTENDANCE TO"
}

used_coords = set()

with open('../frontend/public/autofill_answers.json', 'r') as f:
    form_data = json.load(f)

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
            
            # Smart alignment
            # If label ends before x=280 and it's not a long sentence, align to a clean col at 280
            if best_match["x1"] < 280:
                rect = fitz.Rect(280, best_match["y0"] - 2, 580, best_match["y0"] + 30)
            else:
                rect = fitz.Rect(best_match["x1"] + 5, best_match["y0"] - 2, 580, best_match["y0"] + 30)

            # Insert textbox which auto-wraps Address and fixes overlaps!
            p.insert_textbox(
                rect,
                val_str,
                fontsize=11,
                fontname="helv",
                color=(0, 0, 0.6)
            )
        else:
            print(f"Could not find match for {field_key} ({match_str})")

doc.save("test_filled_precise2.pdf")
print("Saved test_filled_precise2.pdf")
