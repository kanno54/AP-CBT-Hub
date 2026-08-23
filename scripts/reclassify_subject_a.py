import os
import sys
import json
import asyncio
from typing import Dict, Any, List

# Force UTF-8 stdout encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.getcwd(), 'data')
SYLLABUS_KB_PATH = os.path.join(DATA_DIR, 'syllabus_knowledge_base.json')

def load_json(path: str) -> Any:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# Step B: IPA Official Question Number Range Default Expectations
def get_expected_range_domain(q_num: int) -> Dict[str, str]:
    if 1 <= q_num <= 10:
        return {"category": "TECHNOLOGY", "l2Code": "TECH_ALG", "l3Code": "TECH_ALG_TREE", "domainName": "基礎理論・アルゴリズム"}
    elif 11 <= q_num <= 25:
        return {"category": "TECHNOLOGY", "l2Code": "TECH_ARCH", "l3Code": "TECH_ARCH_BCP", "domainName": "システム構成要素・ハードウェア"}
    elif 26 <= q_num <= 35:
        return {"category": "TECHNOLOGY", "l2Code": "TECH_DB", "l3Code": "TECH_DB_NORM", "domainName": "データベース・データ構造化"}
    elif 36 <= q_num <= 45:
        return {"category": "TECHNOLOGY", "l2Code": "TECH_NET", "l3Code": "TECH_NET_IP", "domainName": "ネットワーク・通信体系"}
    elif 46 <= q_num <= 50:
        return {"category": "TECHNOLOGY", "l2Code": "TECH_SEC", "l3Code": "TECH_SEC_THREAT", "domainName": "情報セキュリティ・防御策"}
    elif 51 <= q_num <= 55:
        return {"category": "MANAGEMENT", "l2Code": "MGMT_PM", "l3Code": "MGMT_PM_EVM", "domainName": "開発技術・プロジェクトマネジメント"}
    elif 56 <= q_num <= 60:
        return {"category": "MANAGEMENT", "l2Code": "MGMT_PM", "l3Code": "MGMT_PM_EVM", "domainName": "プロジェクトマネジメント・EVM"}
    elif 61 <= q_num <= 65:
        return {"category": "MANAGEMENT", "l2Code": "MGMT_SM", "l3Code": "MGMT_PM_EVM", "domainName": "サービスマネジメント・システム監査"}
    elif 66 <= q_num <= 75:
        return {"category": "STRATEGY", "l2Code": "STRAT_ST", "l3Code": "STRAT_ST_DX", "domainName": "経営戦略・システム戦略・DX"}
    else: # 76-80
        return {"category": "STRATEGY", "l2Code": "STRAT_ST", "l3Code": "STRAT_ST_DX", "domainName": "企業活動・法務"}

# Step A: Semantic Context Matching with Syllabus KB
def perform_semantic_match(full_text: str, kb_units: List[Dict[str, Any]]) -> Dict[str, Any]:
    text_lower = full_text.lower()
    best_unit = None
    max_score = 0

    for unit in kb_units:
        score = 0
        keywords = (unit.get('concepts', '') + ' ' + unit.get('objectives', '')).lower().split()
        for kw in keywords:
            if len(kw) > 1 and kw in text_lower:
                score += 1

        # Specific keyword boosts
        code = unit.get('code', '')
        if code == 'TECH_SEC_CRYPTO' and ('暗号' in text_lower or '鍵' in text_lower or '署名' in text_lower or 'rsa' in text_lower or 'aes' in text_lower):
            score += 6
        elif code == 'TECH_SEC_THREAT' and ('csrf' in text_lower or 'sqli' in text_lower or 'xss' in text_lower or 'ゼロトラスト' in text_lower or 'waf' in text_lower):
            score += 6
        elif code == 'TECH_DB_NORM' and ('正規形' in text_lower or '正規化' in text_lower or 'デッドロック' in text_lower or 'having' in text_lower or '語' in text_lower):
            score += 6
        elif code == 'TECH_ALG_TREE' and ('二分' in text_lower or '計算量' in text_lower or 'スタック' in text_lower or 'キュー' in text_lower or 'ハッシュ' in text_lower):
            score += 6
        elif code == 'TECH_ARCH_BCP' and ('rto' in text_lower or 'rpo' in text_lower or 'raid' in text_lower or 'ライトバック' in text_lower or '稼働率' in text_lower):
            score += 6
        elif code == 'MGMT_PM_EVM' and ('evm' in text_lower or 'spi' in text_lower or 'cv' in text_lower or 'インシデント' in text_lower):
            score += 6
        elif code == 'STRAT_ST_DX' and ('dx' in text_lower or '変革' in text_lower or 'デジタイゼーション' in text_lower or 'swot' in text_lower or '法務' in text_lower):
            score += 6

        if score > max_score:
            max_score = score
            best_unit = unit

    return {"unit": best_unit, "score": max_score}

async def reclassify_subject_a():
    print("=========================================================")
    print("【科目A過去問 カテゴリ分類・シラバス紐付け 一括再検証】")
    print("=========================================================")

    kb_units = load_json(SYLLABUS_KB_PATH)
    print(f"Loaded {len(kb_units)} Syllabus Knowledge Units from {SYLLABUS_KB_PATH}")

    # Use Node / tsx or direct python database script using Prisma Client via Node runner or direct import
    # We can write a python script that interfaces with Prisma schema or executes seed/update via python process
    # Let's inspect if tsx or node script is preferred for Prisma DB updates on Windows
    print("\nPreparing Prisma Database Classification Re-alignment...")

if __name__ == "__main__":
    asyncio.run(reclassify_subject_a())
