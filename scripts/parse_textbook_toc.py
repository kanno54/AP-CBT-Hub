import os
import sys
import json
import re
from typing import List, Dict, Any

# Ensure UTF-8 output encoding for Windows terminal
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.getcwd(), 'data')
PDF_PATH = os.path.join(DATA_DIR, 'impress-book.pdf')
SYLLABUS_KB_PATH = os.path.join(DATA_DIR, 'syllabus_knowledge_base.json')
OUTPUT_JSON_PATH = os.path.join(DATA_DIR, 'textbook_toc.json')


def load_syllabus_kb() -> List[Dict[str, Any]]:
    if os.path.exists(SYLLABUS_KB_PATH):
        with open(SYLLABUS_KB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


# Mapping rules for syllabus category codes
def map_syllabus_category(chap_num: int, sec_num: str, title: str) -> str:
    title_lower = title.lower()

    if chap_num == 1:
        if '1-1' in sec_num:
            return 'TECH_THEORY_ALGO'
        elif '1-2' in sec_num:
            return 'TECH_ALG_TREE'
        else:
            return 'TECH_THEORY_ALGO'
    elif chap_num == 2:
        if '2-1' in sec_num:
            return 'TECH_ARCH'
        elif '2-2' in sec_num:
            return 'TECH_ARCH_BCP'
        elif '2-3' in sec_num:
            return 'TECH_SOFTWARE'
        elif '2-4' in sec_num:
            return 'TECH_ARCH'
        else:
            return 'TECH_ARCH'
    elif chap_num == 3:
        if '3-1' in sec_num:
            return 'TECH_UI'
        elif '3-2' in sec_num:
            return 'TECH_MEDIA'
        elif '3-3' in sec_num:
            return 'TECH_DB_NORM'
        elif '3-4' in sec_num:
            return 'TECH_NET_IP'
        elif '3-5' in sec_num:
            if '暗号' in title_lower or '認証' in title_lower:
                return 'TECH_SEC_CRYPTO'
            return 'TECH_SEC_THREAT'
        else:
            return 'TECH_SEC'
    elif chap_num == 4:
        if '4-1' in sec_num:
            return 'TECH_DEV_SYS'
        elif '4-2' in sec_num:
            return 'TECH_DEV_MGMT'
        else:
            return 'TECH_DEV'
    elif chap_num == 5:
        return 'MGMT_PM_EVM'
    elif chap_num == 6:
        if '6-1' in sec_num:
            return 'MGMT_SM_SERVICE'
        elif '6-2' in sec_num:
            return 'MGMT_SM_AUDIT'
        else:
            return 'MGMT_SM'
    elif chap_num == 7:
        return 'STRAT_ST'
    elif chap_num == 8:
        if '8-1' in sec_num:
            return 'STRAT_ST_DX'
        elif '8-2' in sec_num:
            return 'STRAT_MOT'
        elif '8-3' in sec_num:
            return 'STRAT_BIZ'
        else:
            return 'STRAT_ST'
    elif chap_num == 9:
        if '9-1' in sec_num:
            return 'STRAT_CORP'
        elif '9-2' in sec_num:
            return 'STRAT_LEGAL'
        else:
            return 'STRAT_LEGAL'

    return 'TECH_GENERAL'


def extract_keywords_from_text(
    section_text: str,
    sec_title: str,
    sub_titles: List[str],
    kb_concepts: List[str]
) -> List[str]:
    keywords = []

    # Priority 1: Subheadings / Sub-section titles
    for st in sub_titles:
        clean_st = re.sub(r'^\d+-\d+-\d+\s*', '', st).strip()
        if clean_st and clean_st not in keywords:
            keywords.append(clean_st)

    # Key terms dictionary candidates
    known_terms = [
        "2進数", "補数", "浮動小数点", "離散数学", "応用数学", "論理演算", "ベン図", "確率", "統計", "ハッシュ",
        "キュー", "スタック", "二分木", "平衡二分探索木", "AVL木", "計算量", "O(log N)", "O(1)", "O(N)",
        "CPU", "クロック周波数", "キャッシュメモリ", "パイプライン", "主記憶", "RAID", "デュプレックス",
        "RTO", "RPO", "ホットスタンドバイ", "OS", "仮想記憶", "ページング", "ファイルシステム",
        "UI", "UX", "Webアクセシビリティ", "マルチメディア", "JPEG", "MPEG", "データベース",
        "第1正規形", "第2正規形", "第3正規形", "関数従属", "SQL", "ACID特性", "トランザクション",
        "排他ロック", "デッドロック", "IPアドレス", "IPv6", "サブネットマスク", "TCP/IP", "DNS",
        "DHCP", "VPN", "公開鍵暗号", "RSA", "共通鍵暗号", "AES", "デジタル署名", "PKI",
        "CSRF", "SQLインジェクション", "XSS", "WAF", "ゼロトラスト", "EVM", "SPI", "CPI", "WBS",
        "アローダイアグラム", "クリティカルパス", "ITIL", "SLA", "インシデント管理", "問題管理",
        "システム監査", "内部統制", "DXガイドライン", "デジタイゼーション", "SWOT分析", "PPM",
        "BSC", "著作権法", "不正アクセス禁止法", "GDPR", "労働基準法"
    ]

    for term in known_terms:
        if term in section_text and term not in keywords:
            keywords.append(term)

    # Check KB concepts
    for concept in kb_concepts:
        if concept in section_text and concept not in keywords:
            keywords.append(concept)

    # Limit to top 8 distinct keywords per section
    return keywords[:8]


def parse_pdf_toc() -> Dict[str, Any]:
    print(f"Opening PDF document: {PDF_PATH}...")
    
    # Try importing PyMuPDF or pypdf
    toc_items = []
    doc = None
    
    try:
        import pymupdf
        doc = pymupdf.open(PDF_PATH)
        toc_items = doc.get_toc()
        print(f"PyMuPDF extracted {len(toc_items)} outline bookmarks.")
    except Exception as e:
        print(f"PyMuPDF error: {e}. Trying pypdf...")
        import pypdf
        reader = pypdf.PdfReader(PDF_PATH)
        if reader.outline:
            def extract_pypdf_outline(outline_list, level=1):
                res = []
                for item in outline_list:
                    if isinstance(item, list):
                        res.extend(extract_pypdf_outline(item, level + 1))
                    elif hasattr(item, 'title'):
                        page_num = reader.get_destination_page_number(item) + 1
                        res.append([level, item.title, page_num])
                return res
            toc_items = extract_pypdf_outline(reader.outline)

    syllabus_kb = load_syllabus_kb()
    kb_concepts_flat = []
    for unit in syllabus_kb:
        concepts = unit.get('concepts', '').split('、')
        kb_concepts_flat.extend([c.strip() for c in concepts if c.strip()])

    chapters = []
    current_chapter = None
    current_section = None

    # Process TOC items
    # Filter for standard chapters 1 through 9
    for item in toc_items:
        level, title, page = item
        title = title.strip()

        # Check for Chapter (Level 1, e.g. 第1章 基礎理論)
        chap_match = re.match(r'^第(\d+)章\s*(.+)', title)
        if level == 1 and chap_match:
            chap_num = int(chap_match.group(1))
            chap_title = chap_match.group(2).strip()

            if current_chapter:
                chapters.append(current_chapter)

            current_chapter = {
                "chapterNum": chap_num,
                "title": chap_title,
                "startPage": page,
                "sections": []
            }
            current_section = None
            continue

        # Check for Section (Level 2, e.g. 1-1 基礎理論)
        sec_match = re.match(r'^(\d+-\d+)\s*(.+)', title)
        if level == 2 and sec_match and current_chapter:
            sec_num = sec_match.group(1).strip()
            sec_title = sec_match.group(2).strip()

            category_code = map_syllabus_category(current_chapter["chapterNum"], sec_num, sec_title)

            current_section = {
                "sectionNum": sec_num,
                "title": sec_title,
                "page": page,
                "syllabusCategoryCode": category_code,
                "keywords": [],
                "_sub_titles": []
            }
            current_chapter["sections"].append(current_section)
            continue

        # Check for Subsection (Level 3, e.g. 1-1-1 離散数学)
        subsec_match = re.match(r'^(\d+-\d+-\d+)\s*(.+)', title)
        if level == 3 and subsec_match and current_section:
            current_section["_sub_titles"].append(title)

    if current_chapter:
        chapters.append(current_chapter)

    # Now extract text content for each section to refine keywords
    print("Extracting keywords from section text content...")
    for c_idx, chap in enumerate(chapters):
        sections = chap["sections"]
        for s_idx, sec in enumerate(sections):
            start_p = sec["page"]
            # End page is start of next section or end of chapter
            if s_idx + 1 < len(sections):
                end_p = sections[s_idx + 1]["page"]
            elif c_idx + 1 < len(chapters):
                end_p = chapters[c_idx + 1]["startPage"]
            else:
                end_p = start_p + 15

            # Extract text from doc
            sec_text = ""
            if doc:
                for p_num in range(max(0, start_p - 1), min(len(doc), end_p)):
                    sec_text += doc[p_num].get_text() + "\n"

            sub_titles = sec.pop("_sub_titles", [])
            sec["keywords"] = extract_keywords_from_text(
                sec_text,
                sec["title"],
                sub_titles,
                kb_concepts_flat
            )

    result = {
        "bookTitle": "徹底攻略 応用情報技術者教科書",
        "chapters": chapters
    }

    return result


def main():
    print("Starting Impress Textbook PDF TOC Parsing & Syllabus Mapping...")
    data = parse_pdf_toc()

    print(f"Parsed {len(data['chapters'])} chapters.")
    for chap in data['chapters']:
        print(f"Chapter {chap['chapterNum']}: {chap['title']} (Start Page: {chap['startPage']}, Sections: {len(chap['sections'])})")

    print(f"Writing structured JSON to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Successfully generated data/textbook_toc.json!")


if __name__ == '__main__':
    main()
