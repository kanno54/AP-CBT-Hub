import pymupdf

doc = pymupdf.open('tmp_pdf/2024r06h_ap_am_qs.pdf')
print(f"Doc pages: {len(doc)}")
for i in range(min(5, len(doc))):
    page = doc[i]
    images = page.get_images()
    text = page.get_text()
    print(f"Page {i+1}: text len = {len(text)}, images count = {len(images)}")
    if images:
        print(f"  Images details: {images[:3]}")
