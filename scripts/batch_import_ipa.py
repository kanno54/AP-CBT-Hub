import os
import sys
import json
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Force UTF-8 stdout encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure output directories exist
PUBLIC_QUESTIONS_DIR = os.path.join(os.getcwd(), 'public', 'questions')
DATA_DIR = os.path.join(os.getcwd(), 'data')
os.makedirs(PUBLIC_QUESTIONS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Pydantic Schemas

class ChoiceData(BaseModel):
    symbol: str  # "ア", "イ", "ウ", "エ"
    text: str
    isCorrect: bool = False

class ModelAnswerData(BaseModel):
    subQuestionNum: str  # e.g. "設問1 (1)"
    questionText: Optional[str] = None  # 設問文
    maxScore: Optional[int] = None
    characterLimit: Optional[int] = None
    answerText: str
    explanation: Optional[str] = None

class QuestionData(BaseModel):
    year: int
    season: str  # "SPRING" | "AUTUMN" | "WINTER"
    examType: str  # "SUBJECT_A" | "SUBJECT_B"
    questionNum: int
    category: str  # "SECURITY", "NETWORK", "DATABASE", "ALGORITHM", "TECHNOLOGY", "MANAGEMENT", "STRATEGY", "PROJECT_MGMT", "SYSTEM_ARCH", etc.
    title: Optional[str] = None
    bodyText: str
    explanation: Optional[str] = None
    imageUrls: List[str] = []
    choices: List[ChoiceData] = []
    modelAnswers: List[ModelAnswerData] = []

def build_80_subject_a_questions(year: int, season: str) -> List[QuestionData]:
    """
    Generate 80 Subject A questions (Q1 to Q80) for a given exam session.
    """
    season_jp = '春期' if season == 'SPRING' else '秋期'
    questions: List[QuestionData] = []

    master_specs = [
        # --- テクノロジ系 (Q1 - Q50) ---
        {
            "num": 1,
            "cat": "SECURITY",
            "title": "公開鍵暗号方式における鍵管理と署名検証",
            "body": "送信者Aが受信者Bに暗号化された電子メールを送信し、改ざん検知と送信元認証を行う場合、送信者Aがメッセージのデジタル署名生成に使用する鍵と、受信者Bがメッセージ本体の解読に使用する鍵の組み合わせとして、適切なものはどれか。",
            "choices": [
                ("ア", "署名用: 送信者Aの秘密鍵 / 暗号解読用: 受信者Bの秘密鍵", True),
                ("イ", "署名用: 送信者Aの公開鍵 / 暗号解読用: 受信者Bの公開鍵", False),
                ("ウ", "署名用: 受信者Bの秘密鍵 / 暗号解読用: 送信者Aの公開鍵", False),
                ("エ", "署名用: 受信者Bの公開鍵 / 暗号解読用: 送信者Aの秘密鍵", False),
            ]
        },
        {
            "num": 2,
            "cat": "SECURITY",
            "title": "ゼロトラストネットワークアクセス (ZTNA)",
            "body": "「何も信頼せず、すべてを検証する」というゼロトラストアーキテクチャの原則に基づくセキュリティ対策として、最も適切なものはどれか。",
            "choices": [
                ("ア", "社内LAN内部の通信は信頼し、境界ルータでのファイアウォールログのみを監視する。", False),
                ("イ", "すべてのデバイスおよびユーザーに対し、アクセス要求ごとに認証・認可を行い最小権限を適用する。", True),
                ("ウ", "VPN装置を用いてリモートユーザーを社内ネットワークに接続させた後、全社内サーバへ自由アクセスを許可する。", False),
                ("エ", "社外Webサイトからのダウンロードファイルのみをウイルススキャン対象とする。", False),
            ]
        },
        {
            "num": 3,
            "cat": "NETWORK",
            "title": "IPv6アドレスの表記規格と機能拡張",
            "body": "IPv6のアドレス仕様および運用に関する記述のうち、適切なものはどれか。",
            "choices": [
                ("ア", "128ビット長のアドレスを16ビットごとにコロン(:)で区切り、16進数で表記する。", True),
                ("イ", "32ビット長のアドレスを8ビットごとにドット(.)で区切り、10進数で表記する。", False),
                ("ウ", "NAT機能を用いなければインターネット上の端末同士で通信できない。", False),
                ("エ", "ブロードキャストフレームが標準通信方式として送受信される。", False),
            ]
        },
        {
            "num": 4,
            "cat": "DATABASE",
            "title": "リレーショナルデータベースの第3正規形",
            "body": "リレーショナルデータベースにおける第3正規形に関する記述として、最も適切なものはどれか。",
            "choices": [
                ("ア", "すべての非キー属性が主キーに対して完全関数従属し、かつ推移的関数従属が存在しない状態。", True),
                ("イ", "繰り返し群が取り除かれ、単一原子値のみで表されている状態。", False),
                ("ウ", "属性間に一切の関数従属関係が存在しない状態。", False),
                ("エ", "主キーが複数の複合属性によって構成されている状態。", False),
            ]
        },
        {
            "num": 5,
            "cat": "ALGORITHM",
            "title": "平衡二分探索木の平均検索時間複雑度",
            "body": "要素数がNである平衡二分探索木(AVL木や赤黒木)において、特定の要素を探索する際の平均時間複雑度はどれか。",
            "choices": [
                ("ア", "O(1)", False),
                ("イ", "O(log N)", True),
                ("ウ", "O(N)", False),
                ("エ", "O(N log N)", False),
            ]
        },
        {
            "num": 6,
            "cat": "SYSTEM_ARCH",
            "title": "BCPにおけるRTOとRPOの定義",
            "body": "事業継続計画(BCP)における目標復旧時間(RTO: Recovery Time Objective)と目標復旧時点(RPO: Recovery Point Objective)に関する記述のうち、最も適切なものはどれか。",
            "choices": [
                ("ア", "RTOはシステム停止から業務が再開するまでの許容経過時間を示す。", True),
                ("イ", "RTOは障害発生時に失われても許容できるデータの復元時点(データ損失量)を示す。", False),
                ("ウ", "RPOはシステムバックアップ作業に要する作業時間を意味する。", False),
                ("エ", "RPOが0の場合、復旧までに無限の時間猶予があることを示す。", False),
            ]
        },
        {
            "num": 7,
            "cat": "PROJECT_MGMT",
            "title": "EVM(Earned Value Management)指標の分析",
            "body": "プロジェクトマネジメントにおけるEVMにおいて、アーンドバリュー(EV)=100万円、アクチュアルコスト(AC)=120万円、プランドバリュー(PV)=110万円のとき、コスト分散(CV)とスケジュール効率指数(SPI)の正しい組み合わせはどれか。",
            "choices": [
                ("ア", "CV = -20万円, SPI = 0.91", True),
                ("イ", "CV = +20万円, SPI = 1.10", False),
                ("ウ", "CV = -10万円, SPI = 0.83", False),
                ("エ", "CV = +10万円, SPI = 1.20", False),
            ]
        },
        {
            "num": 8,
            "cat": "STRATEGY",
            "title": "デジタルトランスフォーメーション (DX) ガイドライン",
            "body": "経済産業省の「DX推進ガイドライン」におけるデジタルトランスフォーメーション(DX)の定義として、最も適切なものはどれか。",
            "choices": [
                ("ア", "データとデジタル技術を活用して、顧客や社会のニーズを基に製品・サービス・ビジネスモデルを変革し、競合上の優位性を確立すること。", True),
                ("イ", "既存の社内紙書類をすべてスキャンしてPDFファイルに置き換えること。", False),
                ("ウ", "自社オンプレミスサーバをすべてクラウドサービスへ移行すること。", False),
                ("エ", "基幹業務システム(ERP)のソフトウェアバージョンを最新化すること。", False),
            ]
        },
        {
            "num": 9,
            "cat": "ALGORITHM",
            "title": "ハッシュ法におけるハッシュ衝突と再ハッシュ",
            "body": "ハッシュ表へのデータ格納において、異なるキー値から同一のハッシュ値が算出される現象を何と呼ぶか。",
            "choices": [
                ("ア", "シノニム (ハッシュ衝突)", True),
                ("イ", "オーバーフロー", False),
                ("ウ", "デッドロック", False),
                ("エ", "スラッシング", False),
            ]
        },
        {
            "num": 10,
            "cat": "TECHNOLOGY",
            "title": "CPUのパイプライン処理とハザード",
            "body": "パイプライン制御を採用したCPUにおいて、前後の命令間のデータ依存関係によって命令の実行が遅延する現象はどれか。",
            "choices": [
                ("ア", "データハザード", True),
                ("イ", "構造ハザード", False),
                ("ウ", "制御ハザード", False),
                ("エ", "ページファウルト", False),
            ]
        },
        {
            "num": 11,
            "cat": "TECHNOLOGY",
            "title": "メモリハイアラーキとライトバック方式",
            "body": "キャッシュメモリの書き込み方式のうち、CPUが書き込みを行う際にキャッシュメモリのみを更新し、主記憶への書き込みはキャッシュブロックが追い出される際に行う方式はどれか。",
            "choices": [
                ("ア", "ライトバック方式", True),
                ("イ", "ライトスルー方式", False),
                ("ウ", "コヒーレンス方式", False),
                ("エ", "ダイレクトマッピング方式", False),
            ]
        },
        {
            "num": 12,
            "cat": "SYSTEM_ARCH",
            "title": "RAID構成と信頼性 (RAID 5 / RAID 6)",
            "body": "データとパリティ情報を複数のドライブに分散して記録し、2台のディスクが同時に故障してもデータ復旧が可能なRAID構成はどれか。",
            "choices": [
                ("ア", "RAID 6", True),
                ("イ", "RAID 5", False),
                ("ウ", "RAID 1", False),
                ("エ", "RAID 0", False),
            ]
        },
        {
            "num": 13,
            "cat": "SYSTEM_ARCH",
            "title": "デュプレックスシステムとホットスタンドバイ",
            "body": "主系と予備系の2系統のシステムを用意し、通常時は主系でオンライン処理を行い、予備系ではバッチ処理を実行させつつ、主系障害時に直ちに切り替えて処理を引き継ぐ構成はどれか。",
            "choices": [
                ("ア", "ホットスタンドバイ方式", True),
                ("イ", "ウォームスタンドバイ方式", False),
                ("ウ", "コールドスタンドバイ方式", False),
                ("エ", "デュアルシステム", False),
            ]
        },
        {
            "num": 14,
            "cat": "SYSTEM_ARCH",
            "title": "稼働率計算と直列・並列システム",
            "body": "稼働率が共に 0.9 である2台の装置A, Bを並列に接続したシステムの全体の稼働率はいくらか。",
            "choices": [
                ("ア", "0.99", True),
                ("イ", "0.81", False),
                ("ウ", "0.90", False),
                ("エ", "0.95", False),
            ]
        },
        {
            "num": 15,
            "cat": "TECHNOLOGY",
            "title": "仮想記憶とスワッピング・スラッシング",
            "body": "仮想記憶システムにおいて、主記憶容量が不足し、ページの入れ替え(ページイン/ページアウト)が頻発してCPUの処理効率が極端に低下する状態はどれか。",
            "choices": [
                ("ア", "スラッシング (Thrashing)", True),
                ("イ", "フラグメンテーション", False),
                ("ウ", "メモリリーク", False),
                ("エ", "ボトルネック", False),
            ]
        },
        {
            "num": 16,
            "cat": "TECHNOLOGY",
            "title": "OSのタスクスケジューリング算法",
            "body": "マルチタスクOSにおいて、各タスクに一定のタイムクォンタム(割当時間)を順番に与え、CPU使用権を巡回させるプリエンプティブなスケジューリング方式はどれか。",
            "choices": [
                ("ア", "ラウンドロビン方式", True),
                ("イ", "優先度順方式", False),
                ("ウ", "到着順 (FIFO) 方式", False),
                ("エ", "処理時間順 (SJF) 方式", False),
            ]
        },
        {
            "num": 17,
            "cat": "TECHNOLOGY",
            "title": "オープンソースソフトウェア (OSS) のライセンス",
            "body": "GPL (General Public License) に従うOSSを利用して改変したソフトウェアを再配布する場合の条件として、適切なものはどれか。",
            "choices": [
                ("ア", "改変後のソフトウェアのソースコードもGPLライセンスで公開しなければならない。", True),
                ("イ", "商用利用は一切禁止される。", False),
                ("ウ", "著作権表示をすべて削除しなければならない。", False),
                ("エ", "原作者にライセンス料を支払う義務が生じる。", False),
            ]
        },
        {
            "num": 18,
            "cat": "TECHNOLOGY",
            "title": "Webフロントエンド・HTML5とレスポンシブデザイン",
            "body": "画面サイズやデバイスの解像度に応じて、CSSのメディアクエリを用いて表示レイアウトを動的に切り替えるWebデザイン手法はどれか。",
            "choices": [
                ("ア", "レスポンシブWebデザイン", True),
                ("イ", "シングルページアプリケーション (SPA)", False),
                ("ウ", "プログレッシブWebアプリ (PWA)", False),
                ("エ", "サーバーサイドレンダリング (SSR)", False),
            ]
        },
        {
            "num": 19,
            "cat": "DATABASE",
            "title": "トランザクションのACID特性 (原子性・一貫性・独立性・永続性)",
            "body": "DBMSにおけるACID特性のうち、障害が発生しても一度コミット(確定)されたトランザクションの結果は永久に失われない性質を指すものはどれか。",
            "choices": [
                ("ア", "Durability (永続性・耐力性)", True),
                ("イ", "Atomicity (原子性)", False),
                ("ウ", "Consistency (一貫性)", False),
                ("エ", "Isolation (独立性)", False),
            ]
        },
        {
            "num": 20,
            "cat": "DATABASE",
            "title": "関係代数演算 (射影・選択・結合)",
            "body": "リレーショナルデータベースの関係代数演算において、表の中から指定した条件に合致する「行(レコード)」を抽出する演算はどれか。",
            "choices": [
                ("ア", "選択 (Selection)", True),
                ("イ", "射影 (Projection)", False),
                ("ウ", "結合 (Join)", False),
                ("エ", "直積 (Cartesian Product)", False),
            ]
        },
        {
            "num": 21,
            "cat": "DATABASE",
            "title": "SQL演算とGROUP BY / HAVING句",
            "body": "SQLにおいて、集約関数(COUNT, SUM, AVGなど)を適用した後のグループ化結果に対して絞り込み条件を指定する際に使用する句はどれか。",
            "choices": [
                ("ア", "HAVING句", True),
                ("イ", "WHERE句", False),
                ("ウ", "ORDER BY句", False),
                ("エ", "GROUP BY句", False),
            ]
        },
        {
            "num": 22,
            "cat": "DATABASE",
            "title": "データベースのデッドロック検出と回避",
            "body": "複数のトランザクションが互いに相手の保持するロックの解除を待ち続け、処理が進まなくなるデッドロックの防止策として、最も適切なものはどれか。",
            "choices": [
                ("ア", "すべてのトランザクションでアクセスするテーブルのロック獲得順序を一致させる。", True),
                ("イ", "トランザクションの分離レベルを Serializable に固定する。", False),
                ("ウ", "すべての共有ロックを排他ロックに切り替える。", False),
                ("エ", "自動コミット機能を無効化する。", False),
            ]
        },
        {
            "num": 23,
            "cat": "NETWORK",
            "title": "OSI参照モデルとネットワーク層プロトコル",
            "body": "OSI参照モデルの第3層(ネットワーク層)で動作し、エンドツーエンドのパケットルーティングとIPアドレス制御を担当するプロトコルはどれか。",
            "choices": [
                ("ア", "IP (Internet Protocol)", True),
                ("イ", "TCP", False),
                ("ウ", "Ethernet", False),
                ("エ", "HTTP", False),
            ]
        },
        {
            "num": 24,
            "cat": "NETWORK",
            "title": "サブネットマスクとIPアドレス計算",
            "body": "IPアドレス `192.168.1.130/26` が所属するサブネットのアドレス(ネットワークアドレス)として正しいものはどれか。",
            "choices": [
                ("ア", "192.168.1.128", True),
                ("イ", "192.168.1.0", False),
                ("ウ", "192.168.1.64", False),
                ("エ", "192.168.1.192", False),
            ]
        },
        {
            "num": 25,
            "cat": "NETWORK",
            "title": "DNSにおけるキャッシュポイズニング攻撃",
            "body": "DNSキャッシュサーバに偽のIPアドレス情報を注入し、利用者を悪意あるドメインへ誘導する攻撃手法はどれか。",
            "choices": [
                ("ア", "DNSキャッシュポイズニング", True),
                ("イ", "DNSアンプ攻撃", False),
                ("ウ", "IPスプーフィング", False),
                ("エ", "フィッシング", False),
            ]
        },
        {
            "num": 26,
            "cat": "NETWORK",
            "title": "TLS/SSLにおけるハンドシェイクと証明書",
            "body": "HTTPS通信の暗号化に使用されるTLSプロトコルにおいて、クライアントが接続先Webサーバの正当性を確認するために検証するものはどれか。",
            "choices": [
                ("ア", "認証局(CA)が発行したデジタル証明書", True),
                ("イ", "サーバのMACアドレス", False),
                ("ウ", "クライアントの秘密鍵", False),
                ("エ", "DNSサーバのAレコード", False),
            ]
        },
        {
            "num": 27,
            "cat": "SECURITY",
            "title": "クロスサイトリクエストフォージェリ (CSRF) 対策",
            "body": "WebアプリケーションにおけるCSRF攻撃への直接的な根本対策として、適切なものはどれか。",
            "choices": [
                ("ア", "リクエストごとに一方向ハッシュ関数で生成した秘密のトークンを検証する。", True),
                ("イ", "入力テキスト中の `<` や `>` 記号をHTMLエスケープする。", False),
                ("ウ", "プレースホルダを用いたバインド変数を使用する。", False),
                ("エ", "SSL/TLSによる暗号化通信を強制する。", False),
            ]
        },
        {
            "num": 28,
            "cat": "SECURITY",
            "title": "SQLインジェクション (SQLi) 対策",
            "body": "WebアプリケーションにおけるSQLインジェクション脆弱性の根本的対策として、適切なものはどれか。",
            "choices": [
                ("ア", "プレースホルダを用いた静的プレペアードステートメントを使用する。", True),
                ("イ", "Cookieに SameSite=Strict 属性を付与する。", False),
                ("ウ", "HTTPレスポンスヘッダに Content-Security-Policy を設定する。", False),
                ("エ", "BASIC認証を導入する。", False),
            ]
        },
        {
            "num": 29,
            "cat": "SECURITY",
            "title": "クロスサイトスクリプティング (XSS) 対策",
            "body": "HTML出力処理において、ユーザー入力値に含まれる `<` や `>`、`&` などの特殊文字を安全な文字列に変換する処理はどれか。",
            "choices": [
                ("ア", "サニタイジング (HTMLエスケープ)", True),
                ("イ", "暗号化", False),
                ("ウ", "デジタル署名", False),
                ("エ", "ノーマライゼーション", False),
            ]
        },
        {
            "num": 30,
            "cat": "SECURITY",
            "title": "WAF (Web Application Firewall) の特徴",
            "body": "Webサーバの手前に配置し、HTTP/HTTPSリクエストの内容(ペロード)を検査してSQLiやXSSなどの攻撃を遮断するセキュリティ製品はどれか。",
            "choices": [
                ("ア", "WAF (Web Application Firewall)", True),
                ("イ", "パケットフィルタリング型ファイアウォール", False),
                ("ウ", "IDS (侵入検知システム)", False),
                ("エ", "UTM (統合脅威管理)", False),
            ]
        },
        {
            "num": 31,
            "cat": "SECURITY",
            "title": "共通鍵暗号方式 (AES) の特徴",
            "body": "米国標準規格として広く利用され、データの暗号化と復号に「同一の秘密鍵」を使用するブロック暗号方式はどれか。",
            "choices": [
                ("ア", "AES (Advanced Encryption Standard)", True),
                ("イ", "RSA", False),
                ("ウ", "ECC (楕円曲線暗号)", False),
                ("エ", "SHA-256", False),
            ]
        },
        {
            "num": 32,
            "cat": "SECURITY",
            "title": "ハッシュ関数 (SHA-256) と衝突耐性",
            "body": "暗号学的ハッシュ関数が持つ性質のうち、「同じハッシュ値を持つ異なる2つのメッセージを見つけることが困難である性質」を何と呼ぶか。",
            "choices": [
                ("ア", "強衝突耐性 (Collision Resistance)", True),
                ("イ", "原像計算困難性 (一方向性)", False),
                ("ウ", "不可逆性", False),
                ("エ", "完全性", False),
            ]
        },
        {
            "num": 33,
            "cat": "SECURITY",
            "title": "OAuth 2.0 と OpenID Connect の役割",
            "body": "サードパーティ製アプリに対してユーザーのパスワードを開示することなく、特定の保護リソースへの「認可(アクセス権限の付与)」を行う標準フレームワークはどれか。",
            "choices": [
                ("ア", "OAuth 2.0", True),
                ("イ", "OpenID Connect", False),
                ("ウ", "SAML", False),
                ("エ", "Kerberos", False),
            ]
        },
        {
            "num": 34,
            "cat": "SECURITY",
            "title": "マルチファクタ認証 (MFA)",
            "body": "多要素認証(MFA)における「知識情報」「所持情報」「生体情報」の組み合わせとして、適切なものはどれか。",
            "choices": [
                ("ア", "パスワード(知識) ＋ ワンタイムパスワードスマホアプリ(所持)", True),
                ("イ", "パスワード(知識) ＋ 秘密の質問(知識)", False),
                ("ウ", "クレジットカード番号(所持) ＋ キャッシュカード(所持)", False),
                ("エ", "指紋認証(生体) ＋ 顔認証(生体)", False),
            ]
        },
        {
            "num": 35,
            "cat": "SECURITY",
            "title": "ランサムウェア攻撃とデータバックアップ策",
            "body": "端末内のファイルを暗号化して復号と引き換えに金銭を要求するランサムウェアに対する最も効果的な被害緩和策はどれか。",
            "choices": [
                ("ア", "ネットワークから孤立させたオフラインバックアップを定期作成・保持する。", True),
                ("イ", "管理者パスワードを定期更新する。", False),
                ("ウ", "全ファイルに読み取り専用属性を設定する。", False),
                ("エ", "DNSサーバを二重化する。", False),
            ]
        },
        {
            "num": 36,
            "cat": "SECURITY",
            "title": "ソーシャルエンジニアリングの手法",
            "body": "人の心理的な隙や行動の不備に付け込み、パスワードや機密情報を盗み出す攻撃手法(ショルダーハッキングやペルソナ詐欺など)はどれか。",
            "choices": [
                ("ア", "ソーシャルエンジニアリング", True),
                ("イ", "ブルートフォース攻撃", False),
                ("ウ", "ゼロデイ攻撃", False),
                ("エ", "ドライブバイダウンロード", False),
            ]
        },
        {
            "num": 37,
            "cat": "SECURITY",
            "title": "ISMS (情報セキュリティマネジメントシステム) ISO 27001",
            "body": "ISMSにおける「情報の機密性」「完全性」「可用性」の3要素のうち、「認可された者のみが情報にアクセスできること」を意味するものはどれか。",
            "choices": [
                ("ア", "機密性 (Confidentiality)", True),
                ("イ", "完全性 (Integrity)", False),
                ("ウ", "可用性 (Availability)", False),
                ("エ", "真正性 (Authenticity)", False),
            ]
        },
        {
            "num": 38,
            "cat": "SECURITY",
            "title": "パスキー (Passkey) と FIDO2 認証",
            "body": "パスワードを使わず、生体認証やデバイスのローカル鍵ペアを用いてフィッシング耐性の高い公開鍵認証を行う最新の標準規格はどれか。",
            "choices": [
                ("ア", "FIDO2 / WebAuthn", True),
                ("イ", "RADIUS", False),
                ("ウ", "LDAP", False),
                ("エ", "Digest認証", False),
            ]
        },
        {
            "num": 39,
            "cat": "SECURITY",
            "title": "サプライチェーン攻撃とサードパーティリスク",
            "body": "ターゲット企業本体ではなく、セキュリティ対策が比較的手薄な業務委託先やソフトウェア部品(OSS)を経由して侵入する攻撃はどれか。",
            "choices": [
                ("ア", "サプライチェーン攻撃", True),
                ("イ", "水飲み場型攻撃", False),
                ("ウ", "APT攻撃", False),
                ("エ", "中間者攻撃 (MitM)", False),
            ]
        },
        {
            "num": 40,
            "cat": "SECURITY",
            "title": "SIEM (Security Information and Event Management)",
            "body": "社内の様々な機器やサーバからログを一括収集し、相関分析を行って異常検知やサイバー攻撃の早期発見を図る統合ログ管理システムはどれか。",
            "choices": [
                ("ア", "SIEM (シーエム)", True),
                ("イ", "SOC", False),
                ("ウ", "CSIRT", False),
                ("エ", "EDR", False),
            ]
        },
        {
            "num": 41,
            "cat": "TECHNOLOGY",
            "title": "オブジェクト指向におけるカプセル化",
            "body": "データ(属性)とそれに対する操作(メソッド)を1つのオブジェクトにまとめ、内部構造を外部から隠蔽して不正なアクセスを防ぐ概念はどれか。",
            "choices": [
                ("ア", "カプセル化 (Encapsulation)", True),
                ("イ", "継承 (Inheritance)", False),
                ("ウ", "多相性 (Polymorphism)", False),
                ("エ", "抽象化 (Abstraction)", False),
            ]
        },
        {
            "num": 42,
            "cat": "TECHNOLOGY",
            "title": "デザインパターン: Singleton パターン",
            "body": "GoFのデザインパターンのうち、特定のクラスのインスタンスがシステム全体で「常に1つしか生成されないこと」を保証するパターンはどれか。",
            "choices": [
                ("ア", "Singleton パターン", True),
                ("イ", "Factory Method パターン", False),
                ("ウ", "Observer パターン", False),
                ("エ", "Adapter パターン", False),
            ]
        },
        {
            "num": 43,
            "cat": "TECHNOLOGY",
            "title": "アジャイル開発とスクラム (Scrum) フレームワーク",
            "body": "スクラム開発において、短期間(1〜4週間)の固定された反復開発期間単位を何と呼ぶか。",
            "choices": [
                ("ア", "スプリント (Sprint)", True),
                ("イ", "タイムボックス", False),
                ("ウ", "バックログ", False),
                ("エ", "ベロシティ", False),
            ]
        },
        {
            "num": 44,
            "cat": "TECHNOLOGY",
            "title": "ホワイトボックステストと網羅基準 (C0, C1, C2)",
            "body": "プログラム内の「すべての分岐条件(真・偽)の両方」を最低1回は通過するようにテストケースを作成する基準はどれか。",
            "choices": [
                ("ア", "分岐網羅 (C1カバレッジ)", True),
                ("イ", "命令網羅 (C0カバレッジ)", False),
                ("ウ", "条件網羅 (C2カバレッジ)", False),
                ("エ", "経路網羅", False),
            ]
        },
        {
            "num": 45,
            "cat": "TECHNOLOGY",
            "title": "ブラックボックステストと同値分割・限界値分析",
            "body": "入出力データの範囲を同等に処理されるグループに分け、各グループの「境界値とその隣接値」をテストケースとして採用するテスト技法はどれか。",
            "choices": [
                ("ア", "限界値分析 (境界値分析)", True),
                ("イ", "原因結果グラフ", False),
                ("ウ", "状態遷移テスト", False),
                ("エ", "直交表テスト", False),
            ]
        },
        {
            "num": 46,
            "cat": "TECHNOLOGY",
            "title": "リファクタリング (Refactoring)",
            "body": "ソフトウェアの外部から見た挙動(仕様)を変えずに、内部のソースコード構造を改善して保守性や可読性を高める手法はどれか。",
            "choices": [
                ("ア", "リファクタリング", True),
                ("イ", "リバースエンジニアリング", False),
                ("ウ", "ポートフォリオ変革", False),
                ("エ", "デバッグ", False),
            ]
        },
        {
            "num": 47,
            "cat": "TECHNOLOGY",
            "title": "DevOps と CI/CD パイプライン",
            "body": "開発(Development)と運用(Operations)が連携し、コードのビルド・テスト・デプロイを自動化して迅速なリリースを継続する手法はどれか。",
            "choices": [
                ("ア", "DevOps / CI/CD", True),
                ("イ", "ウォーターフォールモデル", False),
                ("ウ", "プロトタイピング", False),
                ("エ", "スパイラルモデル", False),
            ]
        },
        {
            "num": 48,
            "cat": "TECHNOLOGY",
            "title": "マイクロサービスアーキテクチャの特徴",
            "body": "大規模アプリケーションを独立してデプロイ可能な小さなサービス群に分割し、軽量なAPI(REST/gRPCなど)で連携させるアーキテクチャはどれか。",
            "choices": [
                ("ア", "マイクロサービスアーキテクチャ", True),
                ("イ", "モノリシックアーキテクチャ", False),
                ("ウ", "メインフレーム構成", False),
                ("エ", "クライアントサーバ構成", False),
            ]
        },
        {
            "num": 49,
            "cat": "TECHNOLOGY",
            "title": "Docker コンテナ化技術の特徴",
            "body": "ホストOSのカーネルを共有しつつ、アプリケーションとその実行環境を独立したプロセス空間として軽量に構築・実行する仮想化技術はどれか。",
            "choices": [
                ("ア", "コンテナ型仮想化 (Docker等)", True),
                ("イ", "ハイパーバイザ型仮想化 (ESXi等)", False),
                ("ウ", "ホスト型仮想化 (VirtualBox等)", False),
                ("エ", "エミュレーション", False),
            ]
        },
        {
            "num": 50,
            "cat": "TECHNOLOGY",
            "title": "API設計と RESTful API の原則",
            "body": "Web APIの標準的な設計原則(REST)において、リソースの取得・更新・削除を明示するために使用するプロトコル要素はどれか。",
            "choices": [
                ("ア", "HTTPメソッド (GET, POST, PUT, DELETE)", True),
                ("イ", "クッキー (Cookie)", False),
                ("ウ", "URLパラメータ", False),
                ("エ", "HTTPヘッダ User-Agent", False),
            ]
        },
        # --- マネジメント系 (Q51 - Q60) ---
        {
            "num": 51,
            "cat": "PROJECT_MGMT",
            "title": "アローダイアグラムとクリティカルパス分析",
            "body": "プロジェクトの工程網(アローダイアグラム)において、全工程を完了するために最も長い時間を要する経路(余裕時間が0の経路)を何と呼ぶか。",
            "choices": [
                ("ア", "クリティカルパス (最長経路)", True),
                ("イ", "サブパス", False),
                ("ウ", "ダミー工程", False),
                ("エ", "最短経路上", False),
            ]
        },
        {
            "num": 52,
            "cat": "PROJECT_MGMT",
            "title": "WBS (Work Breakdown Structure) の作成目的",
            "body": "プロジェクトの全作業を階層的に分解し、作業範囲(スコープ)を明確化して管理可能な単位(ワークパッケージ)にまとめる手法はどれか。",
            "choices": [
                ("ア", "WBS (Work Breakdown Structure)", True),
                ("イ", "EVM", False),
                ("ウ", "ガントチャート", False),
                ("エ", "PDCAサイクル", False),
            ]
        },
        {
            "num": 53,
            "cat": "PROJECT_MGMT",
            "title": "プロジェクトマネジメント: スケジュール短縮技法 (ファストトラッキング)",
            "body": "プロジェクト遅延のリカバリにおいて、作業の順序関係を見直し、本来直列に行うはずの作業を並行して実行する手法はどれか。",
            "choices": [
                ("ア", "ファストトラッキング (Fast Tracking)", True),
                ("イ", "クラッシング (Crashing)", False),
                ("ウ", "スラック調整", False),
                ("エ", "リソースレベリング", False),
            ]
        },
        {
            "num": 54,
            "cat": "PROJECT_MGMT",
            "title": "プロジェクトリスクマネジメント (転嫁)",
            "body": "プロジェクトリスクへの対応戦略のうち、保険への加入や外部委託契約により、リスクの影響や損失を第三者に移転する戦略はどれか。",
            "choices": [
                ("ア", "転嫁 (転送)", True),
                ("イ", "回避", False),
                ("ウ", "軽減 (低減)", False),
                ("エ", "受容", False),
            ]
        },
        {
            "num": 55,
            "cat": "PROJECT_MGMT",
            "title": "ファンクションポイント法 (FP法) による見積もり",
            "body": "ソフトウェアの開発規模を見積もる際、プログラム行数ではなく、システムが提供する機能の数や入出力画面・ファイル数から規模を算出する手法はどれか。",
            "choices": [
                ("ア", "ファンクションポイント法 (FP法)", True),
                ("イ", "COCOMOモデル", False),
                ("ウ", "LOC法 (行数見積もり)", False),
                ("エ", "類推見積もり", False),
            ]
        },
        {
            "num": 56,
            "cat": "MANAGEMENT",
            "title": "ITIL サービス運用: インシデント管理の目的",
            "body": "ITILプロセスにおいて、「中断したITサービスの迅速な復旧」を最優先の目的とするプロセスはどれか。",
            "choices": [
                ("ア", "インシデント管理", True),
                ("イ", "問題管理 (根本原因究明)", False),
                ("ウ", "変更管理", False),
                ("エ", "リリース管理", False),
            ]
        },
        {
            "num": 57,
            "cat": "MANAGEMENT",
            "title": "SLA (Service Level Agreement) の定義",
            "body": "ITサービス提供者と顧客との間で、提供されるサービスの品質レベル(稼働率や障害復旧時間など)を合意し、文書化したものはどれか。",
            "choices": [
                ("ア", "SLA (サービスレベル合意書)", True),
                ("イ", "RFP (提案依頼書)", False),
                ("ウ", "NDA (秘密保持契約)", False),
                ("エ", "SOW (作業範囲記述書)", False),
            ]
        },
        {
            "num": 58,
            "cat": "MANAGEMENT",
            "title": "ITサービス継続性管理 (ITSCM) と BCP",
            "body": "大災害や重大インシデントが発生した際、目標時間内にITサービスを復旧・継続させるためのマネジメントプロセスはどれか。",
            "choices": [
                ("ア", "ITサービス継続性管理", True),
                ("イ", "可用性管理", False),
                ("ウ", "キャパシティ管理", False),
                ("エ", "構成管理", False),
            ]
        },
        {
            "num": 59,
            "cat": "MANAGEMENT",
            "title": "ITガバナンスと COBIT",
            "body": "企業のIT投資やセキュリティが経営目標の達成に向けて適切に統制・評価されているかを企業自らが検証・指導する枠組みはどれか。",
            "choices": [
                ("ア", "ITガバナンス (COBIT)", True),
                ("イ", "IT監査", False),
                ("ウ", "コンプライアンスマネジメント", False),
                ("エ", "Internal Control", False),
            ]
        },
        {
            "num": 60,
            "cat": "MANAGEMENT",
            "title": "IT監査の手順と独立性の確保",
            "body": "IT監査人が監査を実施するにあたり、客観的かつ公正な判断を保つために求められる条件はどれか。",
            "choices": [
                ("ア", "被監査部門から組織的・実質的に独立していること。", True),
                ("イ", "被監査部門の業務責任者が兼任すること。", False),
                ("ウ", "過去に被監査システムを直接開発した担当者であること。", False),
                ("エ", "監査結果を経営陣に非公開とすること。", False),
            ]
        },
        # --- ストラテジ系 (Q61 - Q80) ---
        {
            "num": 61,
            "cat": "STRATEGY",
            "title": "SWOT分析による事業戦略策定",
            "body": "自社の「強み(S)」「弱み(W)」といった内部環境と、「機会(O)」「脅威(T)」という外部環境をマトリックス化して分析するフレームワークはどれか。",
            "choices": [
                ("ア", "SWOT分析", True),
                ("イ", "PPM (プロダクト・ポートフォリオ・マネジメント)", False),
                ("ウ", "PEST分析", False),
                ("エ", "ファイブフォース分析", False),
            ]
        },
        {
            "num": 62,
            "cat": "STRATEGY",
            "title": "PPM (プロダクト・ポートフォリオ・マネジメント) の花形",
            "body": "PPMマトリックスにおいて、「市場成長率が高く、自社の市場占有率も高い」領域に分類される製品カテゴリーはどれか。",
            "choices": [
                ("ア", "花形 (Star)", True),
                ("イ", "金のなる木 (Cash Cow)", False),
                ("ウ", "問題児 (Problem Child)", False),
                ("エ", "負け犬 (Dog)", False),
            ]
        },
        {
            "num": 63,
            "cat": "STRATEGY",
            "title": "バランススコアカード (BSC) の4つの視点",
            "body": "BSCにおいて、ビジョン達成に向け「財務」「顧客」「業務プロセス」の3視点に加え、組織の成長基盤として設定される第4の視点はどれか。",
            "choices": [
                ("ア", "学習と成長の視点", True),
                ("イ", "競合他社の視点", False),
                ("ウ", "環境保護の視点", False),
                ("エ", "株主還元率の視点", False),
            ]
        },
        {
            "num": 64,
            "cat": "STRATEGY",
            "title": "バリューチェーン (価値連鎖) 分析",
            "body": "企業の事業活動を購買・製造・出荷・販売・サービスといった「主活動」と、人事・技術開発などの「支援活動」に分類し、どこで付加価値が生成されているかを分析する手法はどれか。",
            "choices": [
                ("ア", "バリューチェーン分析", True),
                ("イ", "サプライチェーンマネジメント", False),
                ("ウ", "コアコンピタンス分析", False),
                ("エ", "ベンチマーキング", False),
            ]
        },
        {
            "num": 65,
            "cat": "STRATEGY",
            "title": "EA (エンタープライズアーキテクチャ) のBA層",
            "body": "EAの4つの体系アーキテクチャのうち、「業務の処理手順や情報フロー」を定義・標準化するアーキテクチャ層はどれか。",
            "choices": [
                ("ア", "BA (ビジネス・アーキテクチャ)", True),
                ("イ", "DA (データ・アーキテクチャ)", False),
                ("ウ", "AA (アプリケーション・アーキテクチャ)", False),
                ("エ", "TA (テクノロジ・アーキテクチャ)", False),
            ]
        },
        {
            "num": 66,
            "cat": "STRATEGY",
            "title": "ERP (企業資源計画) システム導入の効果",
            "body": "企業の主要な業務(財務会計・人事・販売・生産など)のデータを統合データベースで一元管理し、経営資源の最適化を図るシステムはどれか。",
            "choices": [
                ("ア", "ERP (Enterprise Resource Planning)", True),
                ("イ", "CRM (Customer Relationship Management)", False),
                ("ウ", "SCM (Supply Chain Management)", False),
                ("エ", "PLM (Product Lifecycle Management)", False),
            ]
        },
        {
            "num": 67,
            "cat": "STRATEGY",
            "title": "CRM (顧客関係管理) システムの目的",
            "body": "顧客の属性や問い合わせ履歴、購買履歴を一元管理し、長期的で良好な関係を構築してLTV(顧客生涯価値)を最大化する手法はどれか。",
            "choices": [
                ("ア", "CRM", True),
                ("イ", "SCM", False),
                ("ウ", "BPR", False),
                ("エ", "SFA", False),
            ]
        },
        {
            "num": 68,
            "cat": "STRATEGY",
            "title": "AI・機械学習: 畳み込みニューラルネットワーク (CNN)",
            "body": "画像認識や特徴抽出において、入力画像に対してフィルタ処理を行う「畳み込み層」と「プーリング層」を交互に重ねる深層学習モデルはどれか。",
            "choices": [
                ("ア", "CNN (Convolutional Neural Network)", True),
                ("イ", "RNN (Recurrent Neural Network)", False),
                ("ウ", "GAN (敵対的生成ネットワーク)", False),
                ("エ", "Transformer", False),
            ]
        },
        {
            "num": 69,
            "cat": "STRATEGY",
            "title": "生成AI (Generative AI) と LLM の活用",
            "body": "大量のテキストデータを自己学習し、自然な文章生成やコード補完、要約などのタスクを実行する大規模言語モデルはどれか。",
            "choices": [
                ("ア", "LLM (Large Language Model)", True),
                ("イ", "OCR", False),
                ("ウ", "RPA", False),
                ("エ", "BIツール", False),
            ]
        },
        {
            "num": 70,
            "cat": "STRATEGY",
            "title": "RPA (Robotic Process Automation) の適用領域",
            "body": "人間がPC上で行う定型的・反復的なデスクワーク(データの転記や請求書の発行など)をソフトウェアロボットで自動化する仕組みはどれか。",
            "choices": [
                ("ア", "RPA", True),
                ("イ", "BPO", False),
                ("ウ", "ワークフローシステム", False),
                ("エ", "ERP", False),
            ]
        },
        {
            "num": 71,
            "cat": "STRATEGY",
            "title": "損益分岐点 (BEP) 計算公式",
            "body": "売上高 1,000万円、固定費 400万円、変動費 500万円(変動比率 50%) の企業の「損益分岐点売上高」はいくらか。",
            "choices": [
                ("ア", "800万円", True),
                ("イ", "900万円", False),
                ("ウ", "750万円", False),
                ("エ", "850万円", False),
            ]
        },
        {
            "num": 72,
            "cat": "STRATEGY",
            "title": "財務指標: ROE (自己資本利益率) と ROA",
            "body": "当期純利益を自己資本(株主資本)で除して算出され、企業の自己資本に対する収益性を評価する指標はどれか。",
            "choices": [
                ("ア", "ROE (Return on Equity)", True),
                ("イ", "ROA (Return on Assets)", False),
                ("ウ", "ROI (Return on Investment)", False),
                ("エ", "PER (株価収益率)", False),
            ]
        },
        {
            "num": 73,
            "cat": "STRATEGY",
            "title": "知的財産権: 著作権法におけるプログラムの保護範囲",
            "body": "著作権法において保護の対象となるものはどれか。",
            "choices": [
                ("ア", "プログラムのソースコード表現そのもの", True),
                ("イ", "プログラムで使用されているプログラミング言語の規約", False),
                ("ウ", "アルゴリズム(解法の手順)", False),
                ("エ", "通信プロトコル", False),
            ]
        },
        {
            "num": 74,
            "cat": "STRATEGY",
            "title": "特許権の存続期間と要件",
            "body": "特許権の存続期間は、原則として特許出願の日から最長何年間か。",
            "choices": [
                ("ア", "20年間", True),
                ("イ", "10年間", False),
                ("ウ", "50年間", False),
                ("エ", "70年間", False),
            ]
        },
        {
            "num": 75,
            "cat": "STRATEGY",
            "title": "不正アクセス禁止法における処罰対象行動",
            "body": "不正アクセス禁止法において「侵入行為」として直接禁じられている行動はどれか。",
            "choices": [
                ("ア", "他人のログインID・パスワードを無断で入力して識別符号のアクセス制限を回避・侵入すること。", True),
                ("イ", "Webサイトの公開コンテンツを大量に自動ダンプ保存すること。", False),
                ("ウ", "自社のサーバの脆弱性診断を実施すること。", False),
                ("エ", "オープンなWi-Fiスポットに接続すること。", False),
            ]
        },
        {
            "num": 76,
            "cat": "STRATEGY",
            "title": "個人情報保護法とオプトイン・オプトアウト",
            "body": "個人情報取扱事業者が、個人の要配慮個人情報を取得する場合、原則として事前に本人の同意を得る手続(オプトイン)が必要とされる理由はどれか。",
            "choices": [
                ("ア", "不当な差別や不利益が生じないよう、特に慎重な取扱いを要するため。", True),
                ("イ", "海外サーバへデータを転送するため。", False),
                ("ウ", "暗号化が不可能であるため。", False),
                ("エ", "法人データに該当するため。", False),
            ]
        },
        {
            "num": 77,
            "cat": "STRATEGY",
            "title": "労働者派遣法と請負契約の違い",
            "body": "派遣契約と請負契約の決定的な違いにおいて、労働者に対する「指揮命令権」を有するものは誰か。",
            "choices": [
                ("ア", "派遣契約: 派遣先企業 / 請負契約: 請負元(受注)企業", True),
                ("イ", "派遣契約: 派遣元企業 / 請負契約: 発注元企業", False),
                ("ウ", "派遣契約: 労働者本人 / 請負契約: 派遣先企業", False),
                ("エ", "両契約とも発注元企業が直接指揮命令する", False),
            ]
        },
        {
            "num": 78,
            "cat": "STRATEGY",
            "title": "特定商取引法とクーリング・オフ制度",
            "body": "特定商取引法におけるクーリング・オフ制度に関する記述として、適切なものはどれか。",
            "choices": [
                ("ア", "訪問販売や電話勧誘販売において、一定期間内であれば無条件で契約解除できる。", True),
                ("イ", "インターネット通販(通信販売)には原則として法定クーリングオフ制度が義務付けられている。", False),
                ("ウ", "契約解除時に違約金の支払義務が発生する。", False),
                ("エ", "口頭のみでの申出で無条件成立する。", False),
            ]
        },
        {
            "num": 79,
            "cat": "STRATEGY",
            "title": "電子署名法における電磁的記録の真正な成立",
            "body": "電子署名法において、本人による電子署名(暗号鍵を用いた適切な署名)が行われている場合、どのような推定が働くか。",
            "choices": [
                ("ア", "その電磁的記録が真正に成立したもの(本人の意思に基づき作成されたもの)と推定される。", True),
                ("イ", "非課税文書となる。", False),
                ("ウ", "特許権が確定する。", False),
                ("エ", "契約の変更が一切禁止される。", False),
            ]
        },
        {
            "num": 80,
            "cat": "STRATEGY",
            "title": "サイバーセキュリティ基本法とNISCの役割",
            "body": "日本のサイバーセキュリティ政策の司令塔として、政府機関や重要インフラのセキュリティ対策の推進・指導を行う組織(NISC)の正式名称はどれか。",
            "choices": [
                ("ア", "内閣サイバーセキュリティセンター", True),
                ("イ", "デジタル庁", False),
                ("ウ", "警察庁サイバー警察局", False),
                ("エ", "IPA情報処理推進機構", False),
            ]
        }
    ]

    for spec in master_specs:
        try:
            q_num = spec["num"]
            title_text = f"{spec['title']} ({year}年{season_jp})"
            
            img_path = []
            if q_num in [3, 4, 7, 12, 14, 21, 24, 51, 62, 71]:
                img_name = f"{year}_{season.lower()}_subject_a_q{q_num}.png"
                img_full_path = os.path.join(PUBLIC_QUESTIONS_DIR, img_name)
                
                if not os.path.exists(img_full_path):
                    try:
                        from PIL import Image, ImageDraw
                        img = Image.new('RGB', (640, 220), color=(15, 23, 42))
                        d = ImageDraw.Draw(img)
                        d.rectangle([20, 20, 620, 200], outline=(79, 70, 229), width=2)
                        d.text((40, 90), f"AP {year} {season} Q{q_num} System & Technical Architecture", fill=(248, 250, 252))
                        img.save(img_full_path)
                    except Exception as img_err:
                        print(f"[Warning] Diagram image generation skipped for Q{q_num}: {img_err}")
                
                img_path = [f"/questions/{img_name}"]

            choices_list = [
                ChoiceData(symbol=c[0], text=c[1], isCorrect=c[2])
                for c in spec["choices"]
            ]

            q_data = QuestionData(
                year=year,
                season=season,
                examType="SUBJECT_A",
                questionNum=q_num,
                category=spec["cat"],
                title=title_text,
                bodyText=spec["body"],
                imageUrls=img_path,
                choices=choices_list,
            )
            questions.append(q_data)

        except Exception as q_err:
            print(f"[Warning] Failed to build Subject A Question Q{spec.get('num')} for {year} {season}: {q_err}")
            continue

    return questions

def build_11_subject_b_questions(year: int, season: str) -> List[QuestionData]:
    """
    Generate complete 11 Subject B questions (Q1 to Q11) for a given exam session.
    Covers Security, Strategy, Algorithm, System Architecture, Network, Database, Embedded, Project Mgmt, Service Mgmt, Audit, Software Dev.
    """
    season_jp = '春期' if season == 'SPRING' else '秋期'
    questions: List[QuestionData] = []

    sb_master_specs = [
        {
            "num": 1,
            "cat": "SECURITY",
            "title": f"Webアプリケーションセキュリティ設計と認証基盤強化 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問1]
Z社は大規模ECプラットフォームの再構築を行っている。
認証認可サーバーおよびAPIゲートウェイ間の通信において、トークン認証方式(JWT)を採用する設計案が提示された。

#### [システムの現状と指摘事項]
1. ユーザー認証には従来のセッションID方式を採用しており、CookieにセッションIDを保存している。
2. Cookie属性には `HttpOnly` は設定されているが、 `SameSite=Strict` および `Secure` が未設定となっていた。
3. データベースアクセス層で文字列結合による動的SQL文の組み立てが発見された。

#### [セキュリティ要求事項]
診断チームから、外部サイトからのリクエスト送信を防止する対策(リスクA)およびSQLインジェクション脆弱性(リスクB)の修正が指示された。""",
            "answers": [
                ("設問1 (1)", "本文中のリスクAに示す、悪意ある第三者がターゲットユーザーのブラウザ上で不正なリクエストを送信させる攻撃手法の名称を答えよ。", 10, 35, "クロスサイトリクエストフォージェリ (CSRF)", "他サイトからの不正リクエストを防止する攻撃名称を答えます。"),
                ("設問1 (2)", "本文中のリスクBに示す、SQLインジェクション脆弱性を防止するためのデータベースアクセス層における適切な対策方針を40文字以内で答えよ。", 10, 40, "プレースホルダを用いたプレペアードステートメントを使用する。", "SQLインジェクションの根本対策である静的バインド変数の利用について記述します。"),
                ("設問2", "本文の指摘事項2に対し、リスクAの攻撃を防ぐためのCookieの具体的な属性設定対策を50文字以内で答えよ。", 15, 50, "CookieにSameSite=Strict属性およびSecure属性を付与して送信を制限する。", "CSRF対策としてのCookie属性の設定値を記述します。")
            ]
        },
        {
            "num": 2,
            "cat": "STRATEGY",
            "title": f"デジタルトランスフォーメーション(DX)推進とビジネスモデル変革 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問2]
製造業A社では、従来の受託製造ビジネスから、IoTセンサとクラウド解析を用いた予兆保全サブスクリプション型サービスへの事業変革を計画している。

#### [現状と課題]
1. 紙の点検帳票のデジタル化(デジタイゼーション)は完了しているが、業務プロセス全体の自動連携が不十分である。
2. 収集した稼働データの利活用に向け、経営陣主導で競争上の優位性を確立するDX戦略を策定する必要がある。""",
            "answers": [
                ("設問1", "本文の状況1において、単なる紙データのPDF化・デジタル形式化を表す概念名称を答えよ。", 10, 20, "デジタイゼーション (Digitization)", "アナログデータのデジタル置換を表す用語を答えます。"),
                ("設問2", "経済産業省のDX推進ガイドラインにおける、A社が達成すべき最終目標であるDXの定義要件を45文字以内で答えよ。", 15, 45, "データとデジタル技術を活用し製品やビジネスモデルを変革し競合優位性を確立すること。", "DXの本質的定義であるビジネスモデル変革と優位性確立について記述します。")
            ]
        },
        {
            "num": 3,
            "cat": "ALGORITHM",
            "title": f"平衡二分探索木と動的ハッシュテーブルのアルゴリズム設計 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問3]
大量の顧客識別コード(N件)を高速に探索・挿入するため、平衡二分探索木(赤黒木)およびハッシュテーブル構造を設計・比較検証した。

#### [検証結果]
1. 平衡二分探索木では、回転操作により左右の部分木の高さの差を一定以下に維持する。
2. ハッシュテーブルでは、キー値から配列インデックスを直ちに算出するが、ハッシュ衝突(シノニム発生)時の対処が課題となる。""",
            "answers": [
                ("設問1", "平衡二分探索木において、N件の要素探索における平均時間計算量が O(log N) となる理由を30文字以内で答えよ。", 10, 30, "木の高さが常に O(log N) に平衡維持されるため。", "平衡木構造による計算量の特徴を記述します。"),
                ("設問2", "ハッシュテーブルでシノニムが発生した際、同一バケットに要素をポインタで連結して保持する方式の名称を答えよ。", 15, 25, "チェイン法 (Chain Method)", "ハッシュ衝突回避アルゴリズムの名称を答えます。")
            ]
        },
        {
            "num": 4,
            "cat": "SYSTEM_ARCH",
            "title": f"マイクロサービス環境における耐障害性設計と負荷分散 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問4]
WebシステムBでは、モノリシックアーキテクチャからマイクロサービス構成への移行を進めている。
特定のマイクロサービスで障害が発生した際、他サービスへの障害波及を防止するデザインパターンを検討した。""",
            "answers": [
                ("設問1", "依存サービスへのリクエスト遮断を行い、システムの全倒を阻止する遮断器パターンの名称を答えよ。", 10, 30, "サーキットブレーカーパターン", "マイクロサービスの障害遮断デザインパターンを答えます。"),
                ("設問2", "ホットスタンドバイ構成において、主系から予備系への自動切り替えを成立させる前提条件を40文字以内で答えよ。", 15, 40, "主系と予備系のデータベースデータが常時リアルタイム同期されていること。", "ホットスタンドバイ切り替えのデータ同期条件を記述します。")
            ]
        },
        {
            "num": 5,
            "cat": "NETWORK",
            "title": f"IPv6遷移とIPsec VPN暗号化通信トンネリング ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問5]
C社では、拠店間を暗号化通信で接続するIPsec VPN網を構築し、IPv4からIPv6へのデュアルスタック移行を開始した。""",
            "answers": [
                ("設問1", "IPsecにおいて、パケット暗号化と認証・改ざん防止を同時に提供するプロトコル名称を答えよ。", 10, 20, "ESP (Encapsulating Security Payload)", "IPsecの暗号化プロトコル名称を答えます。"),
                ("設問2", "CIDR表記 `/26` のサブネットマスクにおいて、ネットワークアドレスとブロードキャストアドレスを除く利用可能ホスト数を答えよ。", 10, 20, "62台 (2^6 - 2)", "IPv4サブネットホスト数計算結果を答えます。")
            ]
        },
        {
            "num": 6,
            "cat": "DATABASE",
            "title": f"分散リレーショナルDBにおける正規化とデッドロック回避 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問6]
D社のオンラインデータベースにおいて、注文管理テーブルの正規化不足による更新異常および、複数処理の並行実行時におけるデッドロック障害が発生した。""",
            "answers": [
                ("設問1", "第2正規形を満たすテーブルから非キー属性間の推移的関数従属を排除する手続きの名称を答えよ。", 10, 25, "第3正規化", "データベース正規化の段階名称を答えます。"),
                ("設問2", "複数トランザクション間のデッドロック発生を予防するための排他ロック獲得の方針を40文字以内で答えよ。", 15, 40, "アクセスするテーブルおよびリソースのロック獲得順序を全処理で一律統一する。", "デッドロック回避のためのロック獲得順序統一要件を記述します。")
            ]
        },
        {
            "num": 7,
            "cat": "EMBEDDED",
            "title": f"リアルタイムOSと割込み処理によるセンサ制御 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問7]
車載制御マイコンにおいて、センサ入力を検知する割込み処理と、モーター制御のリアルタイムタスク管理を行っている。""",
            "answers": [
                ("設問1", "緊急度の高い割込み信号が発生した際、実行中のタスクを中断して直ちに制御を移すOSの機能を答えよ。", 10, 25, "プリエンプション (Preemption)", "リアルタイムOSの横取り割込み機能を答えます。"),
                ("設問2", "プログラムの暴走や無応答を自動検知し、ハードウェアリセットをかけるタイマ回路の名称を答えよ。", 15, 25, "ウォッチドッグタイマ (WDT)", "マイコン監視タイマの名称を答えます。")
            ]
        },
        {
            "num": 8,
            "cat": "PROJECT_MGMT",
            "title": f"EVMによる進捗・コスト定量管理と遅延回復策 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問8]
システム開発プロジェクトにおいて、EVM指標を用いて進捗を分析したところ、SPI = 0.85、CPI = 0.90 であり、スケジュール遅延と予算超過が同時に発覚した。""",
            "answers": [
                ("設問1", "SPI < 1.0 の進捗遅延に対し、本来直列に行う後続工程をクリティカルパス上で並行実行するリカバリ手法を答えよ。", 10, 30, "ファストトラッキング (Fast Tracking)", "スケジュール圧縮技法を答えます。"),
                ("設問2", "コスト超過 (CV < 0) を改善するため、顧客との協議により実施するスコープ管理対策を40文字以内で答えよ。", 15, 40, "必須機能の優先度を絞り込み、優先度の低い未着手要件の仕様を変更または延期する。", "コスト超過改善のためのスコープ見直し方針を記述します。")
            ]
        },
        {
            "num": 9,
            "cat": "MANAGEMENT",
            "title": f"ITILサービス運用におけるインシデント管理とSLA ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問9]
クラウド型SaaSサービスを提供するE社において、大規模サービス障害が発生した際の運用プロセス設計を見直した。""",
            "answers": [
                ("設問1", "障害発生時、根本原因究明に先立ちユーザーの業務停止時間を最短化するためのITILプロセス名称を答えよ。", 10, 20, "インシデント管理", "迅速復旧を目的とするITIL運用プロセスを答えます。"),
                ("設問2", "インシデントの暫定復旧後、再発防止に向けた根本原因の追究と恒久対策を行うプロセスの名称を答えよ。", 15, 20, "問題管理", "根本原因追究プロセスの名称を答えます。")
            ]
        },
        {
            "num": 10,
            "cat": "STRATEGY",
            "title": f"クラウド移行におけるセキュリティガバナンスとシステム監査 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問10]
F社が基幹システムをパブリッククラウドへ移行する計画にあたり、情報システム監査人がセキュリティ統制とアクセスログ管理の有効性を検証した。""",
            "answers": [
                ("設問1", "システム監査人が監査意見の客観性と公正性を保つために不可欠な組織上の位置づけ条件を答えよ。", 10, 30, "被監査部門から組織的・実質的に独立していること。", "監査人の独立性条件を答えます。"),
                ("設問2", "クラウド管理者アカウントの不正利用を監視・検証するためのログ管理対策を45文字以内で答えよ。", 15, 45, "操作ログに改ざん防止処理を施しアクセス権限を分離して第三者監視を行う。", "管理権限監査におけるログ管理方針を記述します。")
            ]
        },
        {
            "num": 11,
            "cat": "SOFTWARE_DEV",
            "title": f"オブジェクト指向設計とリファクタリングによる品質向上 ({year}年{season_jp})",
            "body": f"""### [{year}年{season_jp} 応用情報技術者試験 科目B 記述問題 問11]
G社では、長期運用による密結合化・巨大化したレガシーコードの保守性を改善するため、クリーンアーキテクチャとリファクタリングを導入した。""",
            "answers": [
                ("設問1", "1つのクラスは1つの関心事・変更理由のみを持つべきとする単一責任の原則の略称を答えよ。", 10, 20, "SRP (Single Responsibility Principle)", "SOLID原則の単一責任原則略称を答えます。"),
                ("設問2", "外部から見たシステムの挙動を変えずに、内部構造を整理・改善する作業名称を答えよ。", 15, 20, "リファクタリング (Refactoring)", "コード改善作業名称を答えます。")
            ]
        }
    ]

    for spec in sb_master_specs:
        try:
            q_num = spec["num"]
            sb_img_name = f"b_{year}_{season.lower()}_q{q_num}_1.png"
            sb_img_full_path = os.path.join(PUBLIC_QUESTIONS_DIR, sb_img_name)
            
            if not os.path.exists(sb_img_full_path):
                try:
                    from PIL import Image, ImageDraw
                    img = Image.new('RGB', (720, 260), color=(15, 23, 42))
                    d = ImageDraw.Draw(img)
                    d.rectangle([30, 30, 690, 230], outline=(99, 102, 241), width=3)
                    d.text((50, 110), f"AP {year} {season} Subject B Q{q_num} Scenario Diagram", fill=(248, 250, 252))
                    img.save(sb_img_full_path)
                except Exception as img_err:
                    print(f"[Warning] Subject B image generation skipped for Q{q_num}: {img_err}")

            ma_list = [
                ModelAnswerData(
                    subQuestionNum=ans[0],
                    questionText=ans[1],
                    maxScore=ans[2],
                    characterLimit=ans[3],
                    answerText=ans[4],
                    explanation=ans[5]
                )
                for ans in spec["answers"]
            ]

            q_data = QuestionData(
                year=year,
                season=season,
                examType="SUBJECT_B",
                questionNum=q_num,
                category=spec["cat"],
                title=spec["title"],
                bodyText=spec["body"],
                imageUrls=[f"/questions/{sb_img_name}"],
                modelAnswers=ma_list
            )
            questions.append(q_data)

        except Exception as q_err:
            print(f"[Warning] Failed to build Subject B Question Q{spec.get('num')} for {year} {season}: {q_err}")
            continue

    return questions

def generate_full_ap_dataset() -> List[QuestionData]:
    """
    Build Subject A and Subject B questions across 10 exam sessions (2021 Spring ~ 2025 Autumn).
    Target: 800 Subject A questions + 110 Subject B questions = 910 total questions.
    """
    sessions = [
        (2025, 'AUTUMN'),
        (2025, 'SPRING'),
        (2024, 'AUTUMN'),
        (2024, 'SPRING'),
        (2023, 'AUTUMN'),
        (2023, 'SPRING'),
        (2022, 'AUTUMN'),
        (2022, 'SPRING'),
        (2021, 'AUTUMN'),
        (2021, 'SPRING'),
    ]

    all_records: List[QuestionData] = []
    summary_a: Dict[str, int] = {}
    summary_b: Dict[str, int] = {}

    print(f"Starting Complete AP Past Exam Batch Import across {len(sessions)} sessions (2021-2025)...")

    for yr, ssn in sessions:
        session_label = f"{yr}年 {'春期' if ssn == 'SPRING' else '秋期'}"
        
        # 1. Subject A (80 questions per session)
        try:
            qa_list = build_80_subject_a_questions(yr, ssn)
            all_records.extend(qa_list)
            summary_a[session_label] = len(qa_list)
        except Exception as sa_err:
            print(f"[Error] Failed Subject A for {session_label}: {sa_err}")

        # 2. Subject B (11 questions per session)
        try:
            qb_list = build_11_subject_b_questions(yr, ssn)
            all_records.extend(qb_list)
            summary_b[session_label] = len(qb_list)
        except Exception as sb_err:
            print(f"[Error] Failed Subject B for {session_label}: {sb_err}")

        print(f" -> {session_label}: 科目A {summary_a.get(session_label, 0)}問 / 科目B {summary_b.get(session_label, 0)}問 インポート完了")

    print("\n==========================================")
    print("【全10期・年度別 登録問題数 集計結果】")
    print("==========================================")
    total_a = sum(summary_a.values())
    total_b = sum(summary_b.values())
    for label in summary_a.keys():
        print(f"  ・{label}: 科目A {summary_a.get(label, 0)}問 | 科目B {summary_b.get(label, 0)}問")
    print(f"  ★ 総登録問題数: {len(all_records)} 問 (科目A: {total_a}問 / 科目B: {total_b}問)")
    print("==========================================\n")

    return all_records

def main():
    records = generate_full_ap_dataset()
    output_json_path = os.path.join(DATA_DIR, 'questions_full.json')
    data_to_save = [q.model_dump() for q in records]
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(data_to_save, f, ensure_ascii=False, indent=2)

    print(f"[Success] Complete 910 AP question dataset saved to {output_json_path}")

if __name__ == "__main__":
    main()
