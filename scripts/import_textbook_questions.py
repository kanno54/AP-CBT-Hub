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
TOC_PATH = os.path.join(DATA_DIR, 'textbook_toc.json')
OUTPUT_JSON_PATH = os.path.join(DATA_DIR, 'textbook_questions.json')


def clean_unicode(text: str) -> str:
    """Clean zero-width joiners, invisible unicode spaces, and normalize newlines"""
    if not text:
        return ""
    text = re.sub(r'[\u200b\u200c\u200d\ufeff\u200e\u200f]', '', text)
    return text


def parse_year_season(exam_str: str) -> tuple[int, str]:
    """Parse year and season from exam string like (令和5年春 応用情報技術者試験 午前 問5)"""
    year = 2025
    season = "SPRING"

    if '平成31年' in exam_str or '令和1年' in exam_str or '2019' in exam_str:
        year = 2019
    elif '令和2年' in exam_str or '2020' in exam_str:
        year = 2020
    elif '令和3年' in exam_str or '2021' in exam_str:
        year = 2021
    elif '令和4年' in exam_str or '2022' in exam_str:
        year = 2022
    elif '令和5年' in exam_str or '2023' in exam_str:
        year = 2023
    elif '令和6年' in exam_str or '2024' in exam_str:
        year = 2024
    elif '令和7年' in exam_str or '2025' in exam_str:
        year = 2025

    if '秋' in exam_str:
        season = "AUTUMN"
    elif '春' in exam_str:
        season = "SPRING"

    return year, season


def extract_choices(qb_text: str) -> List[Dict[str, Any]]:
    """Extract choices ア, イ, ウ, エ strictly from question block text"""
    choices = []
    text = clean_unicode(qb_text)

    # Strategy A: Match blocks split by choice symbol markers
    # Pattern for choice markers at line start or whitespace
    parts = re.split(r'(?:^|\n)\s*([ア-エ])[\s　]+', text)
    
    if len(parts) >= 9:
        # Expected pattern: preamble, 'ア', body_A, 'イ', body_B, 'ウ', body_C, 'エ', body_D
        found_map = {}
        for i in range(1, len(parts) - 1, 2):
            sym = parts[i].strip()
            val = parts[i + 1].strip()
            # Truncate at next question or header if present
            val = re.split(r'\n\s*問\d+|\n\s*CHECK▶', val)[0].strip()
            val = re.sub(r'\s+', ' ', val)
            if sym in ['ア', 'イ', 'ウ', 'エ'] and sym not in found_map:
                found_map[sym] = val

        if len(found_map) == 4:
            for s in ['ア', 'イ', 'ウ', 'エ']:
                choices.append({
                    "symbol": s,
                    "text": found_map[s],
                    "isCorrect": False
                })

    if len(choices) == 4:
        return choices

    # Strategy B: Line-by-line fallback
    lines = text.split('\n')
    found_map = {}
    curr_sym = None
    curr_buf = []

    for line in lines:
        m = re.match(r'^\s*([ア-エ])[\s　]+(.+)', line)
        if m:
            if curr_sym:
                found_map[curr_sym] = re.sub(r'\s+', ' ', ' '.join(curr_buf)).strip()
            curr_sym = m.group(1)
            curr_buf = [m.group(2)]
        elif curr_sym:
            if re.match(r'^\s*問\d+', line) or 'CHECK▶' in line:
                break
            curr_buf.append(line.strip())

    if curr_sym and curr_sym not in found_map:
        found_map[curr_sym] = re.sub(r'\s+', ' ', ' '.join(curr_buf)).strip()

    if len(found_map) == 4:
        for s in ['ア', 'イ', 'ウ', 'エ']:
            choices.append({
                "symbol": s,
                "text": found_map[s],
                "isCorrect": False
            })

    return choices


def map_qnum_to_syllabus_code(q_num: int) -> str:
    """Map Question number 1-80 to standard IPA syllabus category code"""
    if 1 <= q_num <= 10:
        return "TECH_THEORY_ALGO"
    elif 11 <= q_num <= 25:
        return "TECH_ARCH"
    elif 26 <= q_num <= 35:
        return "TECH_DB_NORM"
    elif 36 <= q_num <= 45:
        return "TECH_NET_IP"
    elif 46 <= q_num <= 50:
        return "TECH_SEC_THREAT"
    elif 51 <= q_num <= 60:
        return "MGMT_PM_EVM"
    elif 61 <= q_num <= 65:
        return "MGMT_SM_SERVICE"
    elif 66 <= q_num <= 75:
        return "STRAT_ST_DX"
    else:  # 76-80
        return "STRAT_LEGAL"


def extract_all_textbook_questions() -> List[Dict[str, Any]]:
    print(f"Loading PDF document from {PDF_PATH}...")
    import pymupdf
    doc = pymupdf.open(PDF_PATH)

    with open(TOC_PATH, 'r', encoding='utf-8') as f:
        toc_data = json.load(f)

    chapters_info = toc_data.get("chapters", [])
    extracted_questions = []
    global_q_id = 1

    # Part 1: Process Chapters 1 to 9 Exercise Sections
    for c_idx, chap in enumerate(chapters_info):
        chap_num = chap["chapterNum"]
        chap_title = chap["title"]
        start_page = chap["startPage"]
        
        if c_idx + 1 < len(chapters_info):
            end_page = chapters_info[c_idx + 1]["startPage"]
        else:
            end_page = 680

        exercise_start_page = start_page
        for sec in chap.get("sections", []):
            if "演習問題" in sec.get("title", ""):
                exercise_start_page = sec.get("page", start_page)
                break

        print(f"\n--- Extracting Chapter {chap_num}: {chap_title} (Pages {exercise_start_page}-{end_page}) ---")

        ex_text_pages = [clean_unicode(doc[p].get_text()) for p in range(exercise_start_page - 1, min(len(doc), end_page))]
        full_ex_text = '\n'.join(ex_text_pages)

        split_match = re.search(r'(?:演習問題の解答|解答と解説|\n《解答》)', full_ex_text)
        if split_match:
            q_part = full_ex_text[:split_match.start()]
            a_part = full_ex_text[split_match.start():]
        else:
            q_part = full_ex_text
            a_part = full_ex_text

        q_blocks = re.split(r'\n(?=問\d+[\s\n])', q_part)
        a_blocks = re.split(r'\n(?=問\d+[\s\n])', a_part)

        answers_dict = {}
        for ab in a_blocks:
            q_num_match = re.search(r'問(\d+)', ab[:20])
            if not q_num_match:
                continue
            q_n = int(q_num_match.group(1))

            ans_match = re.search(r'《解答》\s*([ア-エ])', ab)
            correct_sym = ans_match.group(1) if ans_match else None

            source_match = re.search(r'（(平成|令和)[^）]+）', ab)
            source_str = source_match.group(0) if source_match else f"第{chap_num}章 章末演習 問{q_n}"

            answers_dict[q_n] = {
                "correctSymbol": correct_sym,
                "sourceExam": source_str,
                "explanation": ab.strip()
            }

        for qb in q_blocks:
            q_num_match = re.search(r'^問(\d+)', qb.strip())
            if not q_num_match:
                continue

            q_n = int(q_num_match.group(1))
            ans_info = answers_dict.get(q_n)
            if not ans_info or not ans_info["correctSymbol"]:
                continue

            lines = [l.strip() for l in qb.strip().split('\n') if l.strip()]
            title = f"第{chap_num}章 演習問{q_n}"
            if len(lines) > 1 and 'CHECK▶' not in lines[1]:
                title = lines[1]
            elif len(lines) > 2:
                title = lines[2]

            choices = extract_choices(qb)
            if len(choices) != 4:
                print(f"Skipping Ch{chap_num} 問{q_n}: Choices count is {len(choices)} (expected 4)")
                continue

            correct_sym = ans_info["correctSymbol"]
            for c in choices:
                if c["symbol"] == correct_sym:
                    c["isCorrect"] = True

            # Extract body text
            first_choice_idx = len(qb)
            for c in choices:
                pos = qb.find(f"{c['symbol']} ")
                if pos != -1 and pos < first_choice_idx:
                    first_choice_idx = pos

            body_text = qb[:first_choice_idx].strip()
            body_text = re.sub(r'^問\d+\s*', '', body_text)
            body_text = re.sub(r'CHECK▶\s*□□□', '', body_text).strip()

            year, season = parse_year_season(ans_info["sourceExam"])
            category_code = chap.get("sections", [{}])[0].get("syllabusCategoryCode", "TECH_GENERAL")

            extracted_questions.append({
                "id": f"tb-ch{chap_num}-q{q_n}",
                "year": year,
                "season": season,
                "examType": "SUBJECT_A",
                "questionNum": global_q_id,
                "chapterNum": chap_num,
                "chapterTitle": chap_title,
                "sectionNum": f"{chap_num}-3",
                "sectionTitle": "演習問題",
                "page": exercise_start_page,
                "category": "TECHNOLOGY" if chap_num <= 4 else ("MANAGEMENT" if chap_num <= 6 else "STRATEGY"),
                "syllabusCategoryCode": category_code,
                "title": title,
                "bodyText": body_text,
                "choices": choices,
                "explanation": f"【正解】{correct_sym}\n\n" + ans_info["explanation"],
                "sourceExam": ans_info["sourceExam"]
            })
            global_q_id += 1

    # Part 2: Process Appendix Past Exam (令和7年度春期 応用情報技術者試験 午前 80問)
    print("\n--- Extracting Appendix Past Exam Questions (令和7年度春期 午前80問) ---")
    app_q_pages = [clean_unicode(doc[p].get_text()) for p in range(681, 708)]
    app_a_pages = [clean_unicode(doc[p].get_text()) for p in range(708, 739)]

    app_q_text = '\n'.join(app_q_pages)
    app_a_text = '\n'.join(app_a_pages)

    app_q_blocks = re.split(r'\n(?=問\d+[\s\n])', app_q_text)
    app_a_blocks = re.split(r'\n(?=問\d+[\s\n])', app_a_text)

    app_answers_dict = {}
    for ab in app_a_blocks:
        q_match = re.search(r'問(\d+)', ab[:20])
        if not q_match:
            continue
        q_n = int(q_match.group(1))

        ans_match = re.search(r'《解答》\s*([ア-エ])', ab)
        correct_sym = ans_match.group(1) if ans_match else None

        app_answers_dict[q_n] = {
            "correctSymbol": correct_sym,
            "sourceExam": f"令和7年春 応用情報技術者試験 午前 問{q_n}",
            "explanation": ab.strip()
        }

    for qb in app_q_blocks:
        q_match = re.search(r'^問(\d+)', qb.strip())
        if not q_match:
            continue

        q_n = int(q_match.group(1))
        ans_info = app_answers_dict.get(q_n)
        if not ans_info or not ans_info["correctSymbol"]:
            continue

        lines = [l.strip() for l in qb.strip().split('\n') if l.strip()]
        title = f"令和7年春 午前 問{q_n}"
        if len(lines) > 1 and not lines[1].startswith('問'):
            title = lines[1]

        choices = extract_choices(qb)
        if len(choices) != 4:
            print(f"Skipping Appendix 問{q_n}: Choices count is {len(choices)} (expected 4)")
            continue

        correct_sym = ans_info["correctSymbol"]
        for c in choices:
            if c["symbol"] == correct_sym:
                c["isCorrect"] = True

        first_choice_idx = len(qb)
        for c in choices:
            pos = qb.find(f"{c['symbol']} ")
            if pos != -1 and pos < first_choice_idx:
                first_choice_idx = pos

        body_text = qb[:first_choice_idx].strip()
        body_text = re.sub(r'^問\d+\s*', '', body_text).strip()

        category_code = map_qnum_to_syllabus_code(q_n)
        category_group = "TECHNOLOGY" if q_n <= 50 else ("MANAGEMENT" if q_n <= 65 else "STRATEGY")

        extracted_questions.append({
            "id": f"tb-app2025s-q{q_n}",
            "year": 2025,
            "season": "SPRING",
            "examType": "SUBJECT_A",
            "questionNum": global_q_id,
            "chapterNum": 10,
            "chapterTitle": "付録 令和7年度春期過去問題",
            "sectionNum": "付録",
            "sectionTitle": "午前問題",
            "page": 682,
            "category": category_group,
            "syllabusCategoryCode": category_code,
            "title": title,
            "bodyText": body_text,
            "choices": choices,
            "explanation": f"【正解】{correct_sym}\n\n" + ans_info["explanation"],
            "sourceExam": ans_info["sourceExam"]
        })
        global_q_id += 1

    print(f"\nTotal strictly validated textbook questions extracted: {len(extracted_questions)}")
    return extracted_questions


def main():
    print("Starting Impress Textbook Question Extraction Pipeline...")
    questions = extract_all_textbook_questions()

    print(f"\nWriting {len(questions)} verified questions to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Textbook Question Extraction Completed Successfully!")


if __name__ == '__main__':
    main()
