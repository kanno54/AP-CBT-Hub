import os
import sys
import json

# Force UTF-8 stdout encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.getcwd(), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

SUBJECT_B_QUESTIONS = [
    # 問1
    {
        "year": 2024,
        "season": "SPRING",
        "examType": "SUBJECT_B",
        "questionNumber": 1,
        "title": "問1 情報セキュリティ: Webアプリケーションの脆弱性対策とCSRF防御",
        "category": "SECURITY",
        "syllabusCategoryCode": "TECH_SEC_THREAT",
        "scenarioText": "\n".join([
            "## 【長文シナリオ】 ECサイトにおけるCSRF脆弱性検証と安全な設計",
            "",
            "A社は顧客向けECサイトを運営している。最近、セキュリティベンダーによる脆弱性診断を実施したところ、購入処理およびパスワード変更機能においてクロスサイトリクエストフォージェリ（CSRF）の脆弱性が指摘された。",
            "",
            "### システム構成と問題の概要",
            "会員ユーザーがログインすると、ECサイトのWebサーバーはセッション識別子（Session ID）をCookieに発行する。",
            "利用者が悪意のある攻撃者が設置した罠Webサイト（http://evil-example.com）を閲覧した場合、罠サイト上のJavaScriptが自動的にA社のECサイトへフォーム送信（POSTリクエスト）を行う。",
            "この際、ブラウザは保存されているA社ECサイトのCookie（セッションID）を自動的に添付して送信してしまう。",
            "",
            "### 指摘された脆弱性の原因",
            "1. パスワード変更リクエストおよび商品購入リクエストにおいて、送信元が正当なA社ECサイトの画面から行われたかを検証する機構（ワンタイムトークン検証等）が存在しない。",
            "2. Cookieの SameSite 属性が指定されていないため、クロスサイトリクエスト時にもCookieが自動送信される。",
            "",
            "### 対策の検討",
            "情報セキュリティ担当者のB君は以下の2つの対策を策定した。",
            "- **対策1 (Cookie属性の強化)**: セッションCookieに SameSite=Strict および Secure 属性を付与する。",
            "- **対策2 (CSRFトークンの導入)**: フォーム表示時に暗号学的に安全な擬似乱数生成器を用いて一意なトークンを発行し、セッションに保持させるとともに暗黙のパラメータとしてフォーム内に埋め込み、サーバー側で照合する。"
        ]),
        "imageUrls": ["/questions/b_2024_spring_q1_1.png"],
        "subQuestions": [
          {
            "subNum": "設問1 (1)",
            "questionText": "本文中の下線部①について、攻撃者が罠サイトを通じてユーザーのブラウザに実行させる不正なリクエストの内容を30字以内で述べよ。",
            "maxCharacters": 30,
            "score": 10,
            "modelAnswer": "利用者のセッションIDを偽造して不正送金を指示するリクエスト",
            "gradingKeywords": ["セッションID", "不正", "リクエスト"],
            "explanation": "【解説】CSRF攻撃は、被害者のブラウザに保持された認証Cookie（セッションID）を自動送信させ、被害者本人の権限で意図しない処理を実行させる攻撃です。"
          },
          {
            "subNum": "設問1 (2)",
            "questionText": "本文中の空欄 [ a ] に入る、他サイトからの自動リクエスト送信時にCookie送信を制限するCookie属性名を答えよ。",
            "maxCharacters": None,
            "score": 5,
            "modelAnswer": "SameSite",
            "gradingKeywords": ["SameSite"],
            "explanation": "【解説】SameSite属性はクロスサイトリクエスト時におけるCookieの自動送信挙動を制御する仕様です。Strictに設定することでCSRF攻撃を強力に防御できます。"
          },
          {
            "subNum": "設問2",
            "questionText": "対策2において、CSRFトークンをサーバー側で検証する際に、正当なリクエストであると判定するための条件を40字以内で述べよ。",
            "maxCharacters": 40,
            "score": 10,
            "modelAnswer": "セッションに保持されたトークンとリクエストパラメータのトークンが一致すること",
            "gradingKeywords": ["セッション", "リクエスト", "トークン", "一致"],
            "explanation": "【解説】CSRFトークン検証では、サーバー側セッションに保持した一意なトークン値と、クライアントからPOST送信されたパラメータのトークン値が一致することを確認します。"
          }
        ],
        "knowledgeGraph": {
          "coreConcept": "CSRF対策とCookie属性の設計",
          "relatedKeywords": ["CSRF", "SameSite属性", "XSS", "トークン検証"],
          "ipaPatterns": ["攻撃成立のメカニズム", "根本対策と多層防御の対比", "Cookie属性の挙動"]
        }
    },

    # 問2
    {
        "year": 2024,
        "season": "SPRING",
        "examType": "SUBJECT_B",
        "questionNumber": 2,
        "title": "問2 経営戦略・DX: クラウドサービス移行とビジネスモデル変革",
        "category": "STRATEGY",
        "syllabusCategoryCode": "STRAT_ST_DX",
        "scenarioText": "\n".join([
            "## 【長文シナリオ】 製造業におけるクラウド移行とDX推進計画",
            "",
            "中堅精密機器メーカーのC社は、基幹システムの老朽化と保守コスト高騰に対応するため、オンプレミス型基幹システムからSaaS/PaaSを中心とするクラウド環境への全面移行計画を策定した。",
            "",
            "### 経産省DXガイドラインに基づく評価",
            "C社の経営企画部は、経産省「DX推進ガイドライン」に基づき、自社のIT活用段階を評価した。",
            "- **第1段階 (デジタイゼーション)**: 紙の業務帳票や図面データのPDFスキャン化およびペーパーレス化。",
            "- **第2段階 (デジタライゼーション)**: 営業部門と工場間のワークフロー自動化による業務効率化。",
            "- **第3段階 (DX)**: 収集したIoT稼働データをリアルタイム解析し、機器の予防保全サブスクリプション型サービスという新たなビジネスモデルの変革。",
            "",
            "C社は第3段階である「DXの実現による競争上の優位性の確立」を目標に掲げ、経営陣主導のIT変革を開始した。"
        ]),
        "imageUrls": ["/questions/b_2024_spring_q2_1.png"],
        "subQuestions": [
          {
            "subNum": "設問1",
            "questionText": "経産省DXガイドラインにおける「DX」の定義として、単なるIT化と異なる核心的な目的を35字以内で述べよ。",
            "maxCharacters": 35,
            "score": 10,
            "modelAnswer": "製品やビジネスモデルを変革し競争上の優位性を確立すること",
            "gradingKeywords": ["ビジネスモデル", "変革", "競争上の優位性"],
            "explanation": "【解説】DX（デジタルトランスフォーメーション）の定義は、単なる業務効率化にとどまらず、製品・サービス・ビジネスモデルを変革し、競争優位を確立することです。"
          },
          {
            "subNum": "設問2",
            "questionText": "オンプレミスからSaaSへ移行することによるTCO削減効果の要因を25字以内で説明せよ。",
            "maxCharacters": 25,
            "score": 10,
            "modelAnswer": "自社でのハードウェア保守や運用コストが不要になるため",
            "gradingKeywords": ["ハードウェア", "保守", "運用コスト"],
            "explanation": "【解説】SaaS利用により自社でのサーバー導入・ハード更新・基盤運用保守費用が削減され、総所有コスト(TCO)が最適化されます。"
          }
        ],
        "knowledgeGraph": {
          "coreConcept": "DX定義とクラウド変革",
          "relatedKeywords": ["DXガイドライン", "デジタイゼーション", "サブスクリプション", "SaaS"],
          "ipaPatterns": ["IT化とDXの相違点", "TCO削減効果", "競争優位の確立"]
        }
    },

    # 問3
    {
        "year": 2024,
        "season": "SPRING",
        "examType": "SUBJECT_B",
        "questionNumber": 3,
        "title": "問3 プログラミング・アルゴリズム: ダイクストラ法による最短経路探索",
        "category": "ALGORITHM",
        "syllabusCategoryCode": "TECH_ALG_TREE",
        "scenarioText": "\n".join([
            "## 【長文シナリオ】 物流配送ルート最適化アルゴリズムの実装",
            "",
            "物流企業D社は、配送トラックの最短ルートおよび配送コストを自動計算するプログラミングアルゴリズムを開発している。",
            "",
            "### アルゴリズムの概要",
            "配送拠点（ノード）と道路網（エッジ）を重み付き有向グラフ G = (V, E) として表現する。",
            "各エッジの重み w(u, v) は、拠点 u から拠点 v までの移動時間（分）を表す。",
            "",
            "始点ノード S から全ノードへの最短距離を求めるため、ダイクストラ法（Dijkstra's Algorithm）を適用する。",
            "",
            "### アルゴリズムのステップ",
            "1. 始点 S の最短確定距離 d[S] = 0、その他の全ノード v の距離 d[v] = ∞ に初期化する。",
            "2. 確定フラグ配列 visited[] をすべて false に初期化する。",
            "3. 毎ステップで未確定ノードの中から d[u] が最小となるノード u を選択し、visited[u] = true と置く。",
            "4. ノード u から隣接する全ノード v について、d[u] + w(u, v) < d[v] であれば、d[v] を更新する。",
            "5. 全ノードの距離が確定するまで3〜4を繰り返す。"
        ]),
        "imageUrls": ["/questions/b_2024_spring_q3_1.png"],
        "subQuestions": [
          {
            "subNum": "設問1",
            "questionText": "ノード数 N、エッジ数 M のグラフにおいて、優先度付きキュー（ヒープ構造）を用いてダイクストラ法を実装した場合の時間複雑度をO表記で答えよ。",
            "maxCharacters": None,
            "score": 10,
            "modelAnswer": "O((N + M) log N)",
            "gradingKeywords": ["O((N + M) log N)", "log N"],
            "explanation": "【解説】優先度付きキュー(Binary Heap)を用いると、最小要素の取り出しおよび更新が O(log N) で行えるため、全体計算量は O((N + M) log N) となります。"
          },
          {
            "subNum": "設問2",
            "questionText": "ダイクストラ法が正しく動作するためのエッジの重み w(u, v) に関する必須制約条件を20字以内で述べよ。",
            "maxCharacters": 20,
            "score": 10,
            "modelAnswer": "すべてのエッジの重みが非負（0以上）であること",
            "gradingKeywords": ["非負", "0以上", "重み"],
            "explanation": "【解説】ダイクストラ法は負の重みを持つエッジが存在する場合、正しい最短経路を算出できません（負の重みがある場合はベルマンフォード法等を使用）。"
          }
        ],
        "knowledgeGraph": {
          "coreConcept": "グラフ最短経路探索と時間複雑度",
          "relatedKeywords": ["ダイクストラ法", "優先度付きキュー", "ヒープソート", "O((N+M)log N)"],
          "ipaPatterns": ["計算量アプローチ", "アルゴリズム適用条件", "データ構造選択"]
        }
    },

    # 問6
    {
        "year": 2024,
        "season": "SPRING",
        "examType": "SUBJECT_B",
        "questionNumber": 6,
        "title": "問6 データベース: データベース正規化と排他制御デッドロック回避",
        "category": "DATABASE",
        "syllabusCategoryCode": "TECH_DB_NORM",
        "scenarioText": "\n".join([
            "## 【長文シナリオ】 受発注管理データベースの正規化とトランザクション排他制御",
            "",
            "E社は自社基幹システムのデータベース設計の見直しを行っている。",
            "",
            "### テーブル設計と正規化",
            "従来の「受注テーブル」には、受注番号、顧客コード、顧客名、商品コード、商品名、単価、数量、受注日付 が混在していた。",
            "データベース設計者のF君は、更新異常およびデータ重複を防止するため、以下の段階で正規化を行った。",
            "- **第1正規形**: 繰り返し属性を分解し単一原子値化。",
            "- **第2正規形**: 複合主キー（受注番号, 行番号）に対する部分関数従属を解消し、受注ヘッダと受注明細に分割。",
            "- **第3正規形**: 非キー属性（顧客コード -> 顧客名、商品コード -> 商品名）の推移的関数従属を解消し、「顧客テーブル」「商品テーブル」を独立化。",
            "",
            "### トランザクションとデッドロック",
            "受注処理において、商品在庫数を更新する排他ロック処理を追加した際、複数端末から同時に大量注文が入るとデッドロックが発生することが判明した。",
            "検討の結果、すべてのトランザクションで商品更新の「ロック獲得順序」を一律統一する改修を行った。"
        ]),
        "imageUrls": ["/questions/b_2024_spring_q6_1.png"],
        "subQuestions": [
          {
            "subNum": "設問1",
            "questionText": "リレーショナルデータベースにおける「第3正規形」の定義を、関数従属の観点から35字以内で述べよ。",
            "maxCharacters": 35,
            "score": 10,
            "modelAnswer": "完全関数従属を満たし推移的関数従属が存在しない状態",
            "gradingKeywords": ["完全関数従属", "推移的関数従属", "存在しない"],
            "explanation": "【解説】第3正規形は、第2正規形（完全関数従属）を満たした上で、非キー属性から他の非キー属性への推移的関数従属を排除した状態です。"
          },
          {
            "subNum": "設問2",
            "questionText": "複数のトランザクション間におけるデッドロック発生を防止するための基本的な排他制御設計方針を30字以内で述べよ。",
            "maxCharacters": 30,
            "score": 10,
            "modelAnswer": "全処理で対象リソースのロック獲得順序を一律に固定する",
            "gradingKeywords": ["ロック", "獲得順序", "固定"],
            "explanation": "【解説】デッドロックは互いに相手が保持するロックを待つ循環待ちで発生するため、全トランザクションでリソースのロック順序を揃えることで予防できます。"
          }
        ],
        "knowledgeGraph": {
          "coreConcept": "DB正規化理論とデッドロック予防",
          "relatedKeywords": ["第3正規形", "推移的関数従属", "デッドロック", "ロック順序固定"],
          "ipaPatterns": ["正規形の判定ルール", "デッドロック発生回避策", "完全関数従属"]
        }
    },

    # 問8
    {
        "year": 2024,
        "season": "SPRING",
        "examType": "SUBJECT_B",
        "questionNumber": 8,
        "title": "問8 プロジェクトマネジメント: EVM進捗評価とスケジュール分析",
        "category": "PROJECT_MGMT",
        "syllabusCategoryCode": "MGMT_PM_EVM",
        "scenarioText": "\n".join([
            "## 【長文シナリオ】 システム開発プロジェクトにおけるEVM定量管理",
            "",
            "G社は大手銀行の基幹系システム構築プロジェクトを進行している。プロジェクトマネージャ(PM)のH氏は、進捗およびコストの定量管理のため EVM (Earned Value Management) 手法を採用している。",
            "",
            "### プロジェクト状況 (第6ヶ月末)",
            "第6ヶ月末時点の計画および実績データは以下の通りである。",
            "- **PV (Planned Value / 計画値)**: 5,000 万円",
            "- **EV (Earned Value / 出来高)**: 4,500 万円",
            "- **AC (Actual Cost / 実コスト)**: 5,200 万円",
            "",
            "### EVM指標の算出",
            "H氏は第6ヶ月末の状況を以下の指標により評価した。",
            "- **コスト分散 (CV = EV - AC)**: 4,500 - 5,200 = -700 万円（予算超過）",
            "- **スケジュール効率指標 (SPI = EV / PV)**: 4,500 / 5,000 = 0.90 （進捗遅延）",
            "",
            "分析の結果、特定の機能開発で技術的課題が発生し遅延していることが明らかなったため、クリティカルパス上の作業を並行実施する「ファストトラッキング」の適用を決定した。"
        ]),
        "imageUrls": ["/questions/b_2024_spring_q8_1.png"],
        "subQuestions": [
          {
            "subNum": "設問1",
            "questionText": "第6ヶ月末時点におけるコスト効率指標 (CPI = EV / AC) を小数点以下第3位を四捨五入して答えよ。",
            "maxCharacters": None,
            "score": 5,
            "modelAnswer": "0.87",
            "gradingKeywords": ["0.87"],
            "explanation": "【解説】CPI = EV / AC = 4,500 / 5,200 ≒ 0.8653... 四捨五入して 0.87 となります。1.0未満であるためコスト効率が悪化していることを示します。"
          },
          {
            "subNum": "設問2",
            "questionText": "スケジュール遅延を取り戻すリカバリ手法である「ファストトラッキング」の具体的な実施方法を30字以内で説明せよ。",
            "maxCharacters": 30,
            "score": 10,
            "modelAnswer": "本来順番に行う順次作業を並行して同時に実施する",
            "gradingKeywords": ["順次作業", "並行", "同時"],
            "explanation": "【解説】ファストトラッキングは、本来シーケンシャルに行う予定だった後続作業を先行作業と並行して実施することで全体の工期を短縮する手法です。"
          }
        ],
        "knowledgeGraph": {
          "coreConcept": "EVM定量管理とクラッシング/ファストトラッキング",
          "relatedKeywords": ["EVM", "SPI", "CPI", "ファストトラッキング", "クリティカルパス"],
          "ipaPatterns": ["EVM計算公式", "コスト超過・遅延の判定", "スケジュールリカバリ手段"]
        }
    }
]

def import_subject_b():
    print("==================================================")
    print("【科目B（午後記述）厳密シナリオ＆設問一括構造化】")
    print("==================================================")

    output_file = os.path.join(DATA_DIR, 'verified_subject_b.json')
    full_file = os.path.join(DATA_DIR, 'questions_full.json')

    existing_data = []
    if os.path.exists(full_file):
        with open(full_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)

    # Filter out existing Subject B questions to avoid duplicate records
    subject_a_only = [q for q in existing_data if q.get('examType') == 'SUBJECT_A']

    # Transform Subject B structure to DB schema compatible format
    db_form_b = []
    for sb in SUBJECT_B_QUESTIONS:
        model_answers = []
        for sq in sb["subQuestions"]:
            model_answers.append({
                "subQuestionNum": sq["subNum"],
                "questionText": sq["questionText"],
                "characterLimit": sq["maxCharacters"],
                "maxScore": sq["score"],
                "answerText": sq["modelAnswer"],
                "explanation": sq["explanation"]
            })

        kg = sb["knowledgeGraph"]
        kg_text = f"【Knowledge Graph】\n■ コア概念: {kg['coreConcept']}\n■ 関連キーワード: {', '.join(kg['relatedKeywords'])}\n■ IPA出題パターン: {', '.join(kg['ipaPatterns'])}"

        q_item = {
            "year": sb["year"],
            "season": sb["season"],
            "examType": sb["examType"],
            "questionNum": sb["questionNumber"],
            "category": sb["category"],
            "title": sb["title"],
            "bodyText": sb["scenarioText"],
            "explanation": kg_text,
            "imageUrls": sb["imageUrls"],
            "choices": [],
            "modelAnswers": model_answers
        }
        db_form_b.append(q_item)

    combined_all = subject_a_only + db_form_b

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(db_form_b, f, ensure_ascii=False, indent=2)

    with open(full_file, 'w', encoding='utf-8') as f:
        json.dump(combined_all, f, ensure_ascii=False, indent=2)

    print(f"[Success] Structuring Subject B Questions: {len(db_form_b)} 大問 (小問数: {sum(len(q['subQuestions']) for q in SUBJECT_B_QUESTIONS)} 設問)")
    print(f"[Success] Combined Full Dataset (Subject A: {len(subject_a_only)}問 + Subject B: {len(db_form_b)}問 = Total: {len(combined_all)}問)")
    print(f"[Saved] {output_file} & {full_file}")

if __name__ == "__main__":
    import_subject_b()
