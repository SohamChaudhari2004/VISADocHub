import sys
import subprocess

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

reader = pypdf.PdfReader('../DS160exampleForm.pdf')
fields = reader.get_fields()

if fields:
    for k, v in fields.items():
        print(f"Field: {k} -> Type: {v.get('/FT')} -> AltName: {v.get('/TU')}")
else:
    print("No fields found.")
