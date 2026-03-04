import fitz
import json

doc = fitz.open('../DS160exampleForm.pdf')

results = []
for i, page in enumerate(doc):
    blocks = page.get_text("dict")["blocks"]
    width = page.rect.width
    height = page.rect.height
    for b in blocks:
        if "lines" in b:
            for l in b["lines"]:
                for s in l["spans"]:
                    text = s["text"].strip()
                    if text:
                        x0, y0, x1, y1 = s["bbox"]
                        # Convert to pdf-lib bottom-left coordinate system
                        pdf_lib_y = height - y0
                        results.append({
                            "text": text,
                            "page": i,
                            "x": round(x0, 2),
                            "y": round(pdf_lib_y, 2)
                        })

with open("coords.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("Coordinates extracted to coords.json")
