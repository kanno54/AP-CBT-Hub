import urllib.request
import ssl
import pdfplumber
import os
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl._create_unverified_context()

qs_url = "https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_ap_am_qs.pdf"
ans_url = "https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_ap_am_ans.pdf"

os.makedirs('tmp_pdf', exist_ok=True)
qs_path = 'tmp_pdf/2024r06h_ap_am_qs.pdf'
ans_path = 'tmp_pdf/2024r06h_ap_am_ans.pdf'

if not os.path.exists(qs_path):
    print("Downloading 2024 Spring AM Questions PDF...")
    req = urllib.request.Request(qs_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as res, open(qs_path, 'wb') as f:
        f.write(res.read())

if not os.path.exists(ans_path):
    print("Downloading 2024 Spring AM Answer Key PDF...")
    req = urllib.request.Request(ans_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as res, open(ans_path, 'wb') as f:
        f.write(res.read())

# Inspect text from pages 2 to 5 in Questions PDF
with pdfplumber.open(qs_path) as pdf:
    print(f"Total pages in QS PDF: {len(pdf.pages)}")
    for i in range(1, 6):
        text = pdf.pages[i].extract_text()
        print(f"--- PAGE {i+1} ---")
        print(text[:500] if text else "EMPTY PAGE")

# Inspect Answer Key text
with pdfplumber.open(ans_path) as pdf:
    print(f"Total pages in ANS PDF: {len(pdf.pages)}")
    for page in pdf.pages:
        print("--- ANS PAGE ---")
        print(page.extract_text())
