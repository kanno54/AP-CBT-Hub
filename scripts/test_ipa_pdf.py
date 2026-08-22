import urllib.request
import ssl
import re

ctx = ssl._create_unverified_context()
url = "https://www.ipa.go.jp/shiken/mondai-kaiotu/2024r06.html"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, context=ctx)
    html = res.read().decode('utf-8', errors='ignore')
    pdfs = re.findall(r'href=["\']?([^"\'>]+\.pdf)', html)
    ap_pdfs = [p for p in pdfs if 'ap' in p.lower()]
    print(f"Status 200! Total PDFs: {len(pdfs)}, AP PDFs: {len(ap_pdfs)}")
    for p in ap_pdfs:
        print("  AP PDF Link:", p)
except Exception as e:
    print(f"Error: {e}")
