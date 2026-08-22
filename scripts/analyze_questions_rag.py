import os
import sys
import json
from typing import Dict, Any, List

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.getcwd(), 'data')
QUESTIONS_FILE = os.path.join(DATA_DIR, 'questions_full.json')
SYLLABUS_KB_FILE = os.path.join(DATA_DIR, 'syllabus_knowledge_base.json')

def load_json(path: str) -> Any:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def match_syllabus_category(text: str, kb: List[Dict[str, Any]]) -> Dict[str, Any]:
    text_lower = text.lower()
    best_match = kb[0]
    max_score = 0

    for unit in kb:
        score = 0
        keywords = (unit['concepts'] + ' ' + unit['objectives']).lower().split()
        for kw in keywords:
            if len(kw) > 1 and kw in text_lower:
                score += 1
        
        # Specific domain keyword boosts
        if 'crypto' in unit['code'].lower() and ('鍵' in text_lower or '暗号' in text_lower or '署名' in text_lower):
            score += 5
        elif 'threat' in unit['code'].lower() and ('csrf' in text_lower or 'sqli' in text_lower or 'xss' in text_lower or '攻撃' in text_lower):
            score += 5
        elif 'norm' in unit['code'].lower() and ('正規形' in text_lower or '正規化' in text_lower or 'database' in text_lower or 'デッドロック' in text_lower):
            score += 5
        elif 'tree' in unit['code'].lower() and ('二分' in text_lower or '計算量' in text_lower or '木' in text_lower or '探索' in text_lower):
            score += 5
        elif 'bcp' in unit['code'].lower() and ('rto' in text_lower or 'rpo' in text_lower or 'raid' in text_lower or '稼働率' in text_lower):
            score += 5
        elif 'evm' in unit['code'].lower() and ('evm' in text_lower or 'spi' in text_lower or 'cv' in text_lower or 'インシデント' in text_lower):
            score += 5
        elif 'dx' in unit['code'].lower() and ('dx' in text_lower or '変革' in text_lower or 'ガイドライン' in text_lower or 'swot' in text_lower):
            score += 5

        if score > max_score:
            max_score = score
            best_match = unit

    return best_match

def validate_and_enrich_questions():
    print("==================================================")
    print("【RAG シラバスナレッジベース照合＆整合性検証】")
    print("==================================================")

    if not os.path.exists(QUESTIONS_FILE) or not os.path.exists(SYLLABUS_KB_FILE):
        print("Error: Missing questions or syllabus KB file.")
        sys.exit(1)

    questions = load_json(QUESTIONS_FILE)
    kb = load_json(SYLLABUS_KB_FILE)

    print(f"Total Questions to analyze: {len(questions)}")
    print(f"Total Syllabus KB Units: {len(kb)}")

    duplicate_choice_count = 0
    match_summary = {}

    for idx, q in enumerate(questions):
        full_text = f"{q.get('title', '')} {q.get('bodyText', '')} {q.get('explanation', '')}"
        
        # 1. Validate choice integrity
        choices = q.get('choices', [])
        seen_texts = set()
        for c in choices:
            txt = c.get('text', '').strip()
            if txt in seen_texts:
                duplicate_choice_count += 1
                print(f"[Warning] Choice duplicate in Q{q.get('questionNum')}: {txt}")
            seen_texts.add(txt)

        # 2. Semantic Syllabus Matching via RAG KB
        matched_unit = match_syllabus_category(full_text, kb)
        unit_code = matched_unit['code']
        match_summary[unit_code] = match_summary.get(unit_code, 0) + 1

        if idx < 5:
            print(f" -> Q{q.get('questionNum')} [{q.get('category')}]: Matched Syllabus Unit = [{matched_unit['name']}] ({unit_code})")

    print("\n--------------------------------------------------")
    print("【シラバス ナレッジベース マッチング集計結果】")
    for code, cnt in match_summary.items():
        print(f"  ・{code}: {cnt} 問")
    print(f"  ★ 重複選択肢検知数: {duplicate_choice_count} 件")
    print("--------------------------------------------------\n")

if __name__ == "__main__":
    validate_and_enrich_questions()
