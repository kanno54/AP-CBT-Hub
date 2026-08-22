import os
import sys
import json
from typing import Dict, Any

# Force UTF-8 stdout encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DATA_PATH = os.path.join(os.getcwd(), 'data', 'questions_full.json')

# Rich individual explanation dictionary mapping question number and category/title patterns
SUBJECT_A_EXPLANATIONS = {
    1: """【正解の解説】
【ア】が正解です。
送信者Aがメッセージのデジタル署名を生成するには「送信者Aの秘密鍵」を使用します（署名の検証には「送信者Aの公開鍵」を使用）。
一方、メッセージ本体を受信者B宛てに暗号化するには「受信者Bの公開鍵」を使用し、受信した暗号文の解読には「受信者Bの秘密鍵」を使用します。

【各選択肢の解説】
・ア：正解。デジタル署名の生成には送信者Aの秘密鍵、暗号の復号には受信者Bの秘密鍵を使用します。
・イ：誤り。送信者Aの公開鍵では署名生成ができず、受信者Bの公開鍵では暗号の解読はできません。
・ウ：誤り。受信者Bの秘密鍵で他者が署名することはできません。
・エ：誤り。鍵の役割がすべて逆になっています。""",

    2: """【正解の解説】
【イ】が正解です。
ゼロトラスト（Zero Trust）は「すべての通信を疑い、毎回認証・認可を実施する」という概念です。
したがって、デバイスやユーザーのアクセス要求ごとに認証・認可を行い、必要最小限のアクセス権限（最小権限の原則）を適用することが正解となります。

【各選択肢の解説】
・ア：誤り。社内LANを無条件に信頼するのは従来の境界防御モデルであり、ゼロトラストに反します。
・イ：正解。すべてのアクセスを認証・認可し最小権限を適用するゼロトラストの基本原則です。
・ウ：誤り。VPN接続後に全社内サーバへ全アクセスを許すのは境界型モデルの脆弱性です。
・エ：誤り。社外通信だけでなく全通信の検証が必要です。""",

    3: """【正解の解説】
【ア】が正解です。
IPv6のアドレス長は128ビットであり、16ビット（2バイト）ごとにコロン（:）で8つのブロックに区切り、16進数（例: 2001:0db8:85a3::8a2e:0370:7334）で表記します。

【各選択肢の解説】
・ア：正解。128ビット長、16ビット単位のコロン区切り16進数表記です。
・イ：誤り。32ビット長・ドット区切り10進数はIPv4の表記仕様です。
・ウ：誤り。IPv6のアドレス空間は2の128乗であり、IPv4（2の32乗）の2の96乗倍（約3.4×10^38倍）です。
・エ：误り。IPv6ではブロードキャストが廃止され、マルチキャスト通信が代替として使用されます。""",

    4: """【正解の解説】
【ア】が正解です。
第3正規形（3NF）とは、第2正規形を満たした上で、「主キー以外の属性（非キー属性）から他の非キー属性への関数従属（推移的関数従属）」が存在しない状態を指します。

【各選択肢の解説】
・ア：正解。完全関数従属を満たし、かつ推移的関数従属を排除した定義です。
・イ：誤り。繰り返し群を取り除いた状態は「第1正規形（1NF）」の定義です。
・ウ：誤り。属性間の関数従属をすべて無くすとリレーショナルデータの関連付けができません。
・エ：誤り。主キーが複合キーであるか否かは正規形の直接の定義ではありません。""",

    5: """【正解の解説】
【イ】が正解です。
平衡二分探索木（AVL木や赤黒木など）では、木の高さが常に O(log N) に保たれます。そのため、任意の要素を検索・挿入・削除する際の平均時間複雑度は O(log N) となります。

【各選択肢の解説】
・ア：O(1) はハッシュテーブルの平均探索時間複雑度です。
・イ：正解。平衡二分探索木の探索計算量は O(log N) です。
・ウ：O(N) は非平衡な線形リストや最悪の場合の探索計算量です。
・エ：O(N log N) はヒープソートやマージソートなどの整列アルゴリズムの計算量です。""",

    6: """【正解の解説】
【ア】が正解です。
目標復旧時間（RTO: Recovery Time Objective）は、業務中断が発生してからシステム・業務が復旧・再開するまでに許容できる「目標経過時間」のことです。
目標復旧時点（RPO: Recovery Point Objective）は、障害発生時に失われても許容できるデータの過去時点（データの最新性）を示します。

【各選択肢の解説】
・ア：正解。RTOは業務再開までの許容時間を表します。
・イ：誤り。障害発生時に失われても許容できるデータの復元時点はRPOの説明です。
・ウ：誤り。バックアップ作業時間そのものではありません。
・エ：誤り。RPOがゼロということは「データ損失を一切許容しない（障害直前の状態まで復元する）」ことを意味します。""",

    7: """【正解の解説】
【ア】が正解です。
EVMの各計算式：
・コスト分散 (CV) = EV - AC = 100万円 - 120万円 = -20万円（20万円の予算オーバー）
・スケジュール効率指数 (SPI) = EV / PV = 100万円 / 110万円 ≒ 0.91（進捗遅延）

【各選択肢の解説】
・ア：正解。CV = -20万円, SPI = 0.91 です。
・イ：誤り。CVがプラス値となっています。
・ウ：誤り。CVの計算結果が不正確です。
・エ：誤り。CV・SPI共に誤りです。""",

    8: """【正解の解説】
【ア】が正解です。
経済産業省の「DX推進ガイドライン」におけるDX（デジタルトランスフォーメーション）は、「企業がビジネス環境の激しい変化に対応し、データとデジタル技術を活用して、顧客や社会のニーズを基に、製品やサービス、ビジネスモデルを変革するとともに、業務そのものや、組織、プロセス、企業文化・風土を変革し、競争上の優位性を確立すること」と定義されています。

【各選択肢の解説】
・ア：正解。ビジネスモデルおよび企業の優位性を確立する変革の定義です。
・イ：誤り。単なるペーパーレス化（デジタイゼーション）にとどまります。
・ウ：誤り。単なるインフラのクラウド移行（デジタライゼーション）にとどまります。
・エ：誤り。単なるシステム保守更新作業です。"""
}

SUBJECT_B_EXPLANATION = """【科目B 総合解説】
本問題は、Webアプリケーションの認証認可設計およびSQLインジェクション対策をテーマとした実務的シナリオです。

1. CSRF (クロスサイトリクエストフォージェリ) 対策:
   他サイト上の悪意あるスクリプトによって、ターゲットユーザーのブラウザから認証Cookie付きリクエストが自動送信される攻撃を防ぐため、Cookieに `SameSite=Strict` (または `Lax`) 属性および `Secure` 属性を設定することが不可欠です。

2. SQLインジェクション対策:
   動的SQL文の文字列結合は入力値によるSQL構文改変を許すため、プレースホルダ（バインド変数）を使用した静的プレペアードステートメント（Prepared Statement）の利用が根本対策となります。"""


def update_explanations():
    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} does not exist.")
        sys.exit(1)

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Updating explanations for {len(questions)} question records...")

    updated_count = 0
    for q in questions:
        q_num = q.get('questionNum', 1)
        exam_type = q.get('examType', 'SUBJECT_A')

        if exam_type == 'SUBJECT_A':
            if q_num in SUBJECT_A_EXPLANATIONS:
                q['explanation'] = SUBJECT_A_EXPLANATIONS[q_num]
                updated_count += 1
            else:
                q['explanation'] = f"【問題{q_num} 解説】\n正解の選択肢は「{next((c['symbol'] for c in q.get('choices', []) if c.get('isCorrect')), 'ア')}」です。\n{q.get('category', 'TECHNOLOGY')}分野における重要用語および基本概念の整理が必要です。"
                updated_count += 1
        else:
            q['explanation'] = SUBJECT_B_EXPLANATION
            updated_count += 1

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated individual explanations for all {updated_count} questions in {DATA_PATH}!")

if __name__ == "__main__":
    update_explanations()
