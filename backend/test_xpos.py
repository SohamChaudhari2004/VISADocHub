import fitz

doc = fitz.open('../DS160exampleForm.pdf')

print("Page 0 Labels:")
for b in doc[0].get_text('dict')['blocks']:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                text = s['text']
                if '–' in text or '-' in text:
                    print(f"X ends at: {s['bbox'][2]:.2f} -> {text}")

print("\nPage 1 Labels:")
for b in doc[1].get_text('dict')['blocks']:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                text = s['text']
                if '–' in text or '-' in text:
                    print(f"X ends at: {s['bbox'][2]:.2f} -> {text}")
