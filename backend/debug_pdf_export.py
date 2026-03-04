import json
import traceback
from services.pdf_export_service import generate_precise_pdf

try:
    with open('../frontend/public/autofill_answers.json', 'r') as f:
        form_data = json.load(f)
    print("Generating PDF...")
    generate_precise_pdf(form_data)
    print("Success")
except Exception as e:
    print("Error occurred:")
    traceback.print_exc()
