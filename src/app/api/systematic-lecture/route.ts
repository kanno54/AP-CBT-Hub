import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getTextbookReferenceForCategory } from '@/lib/textbook';

export interface CoreKeyword {
  term: string;           // 用語名（例: "主成分分析"）
  definition: string;     // 定義・役割（教科書・シラバスに基づく厳密な解説）
  examPoint: string;      // 本問での問われ方・正解のポイント
}

export interface DerivedConcept {
  term: string;           // 派生用語（例: "因子分析", "回帰分析", "クラスタリング"）
  relationType: "対比" | "上位/下位" | "周辺技術" | "関連手法";
  explanation: string;    // コア用語との違いや関連性の解説
}

export interface ComparisonMatrix {
  headers: string[];      // ["概念・手法", "目的・特徴", "入力データ", "試験での出題パターン"]
  rows: string[][];
}

export interface SystematicLectureResponse {
  theme: string;
  syllabusCategoryName: string;
  textbookRef?: {
    chapter: string;
    section: string;
    page: number;
  };
  coreKeywords: CoreKeyword[];
  derivedConcepts: DerivedConcept[];
  comparisonMatrix: ComparisonMatrix;
  standardRules: string[];
}

interface SyllabusKBUnit {
  code: string;
  name: string;
  objectives: string;
  concepts: string;
  comparisonPairs: { pair: string; keyDiff: string }[];
}

function loadSyllabusKB(): SyllabusKBUnit[] {
  try {
    const kbPath = path.join(process.cwd(), 'data', 'syllabus_knowledge_base.json');
    if (fs.existsSync(kbPath)) {
      const raw = fs.readFileSync(kbPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load syllabus_knowledge_base.json:', err);
  }
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, theme = '', bodyText = '', modelAnswer = '' } = body;

    let dbTitle = '';
    let dbBodyText = bodyText;
    let choicesText = '';

    if (questionId) {
      try {
        const qRecord = await prisma.question.findUnique({
          where: { id: questionId },
          include: { choices: true },
        });
        if (qRecord) {
          dbTitle = qRecord.title || '';
          dbBodyText = qRecord.bodyText || bodyText;
          if (qRecord.choices && qRecord.choices.length > 0) {
            choicesText = qRecord.choices.map((c) => `${c.symbol}. ${c.text}`).join(' ');
          }
        }
      } catch (dbErr) {
        // DB lookup optional fallback
      }
    }

    const fullText = (theme + ' ' + dbTitle + ' ' + dbBodyText + ' ' + modelAnswer + ' ' + choicesText).toLowerCase();

    // Perform Topic Match & Knowledge Synthesis
    let coreKeywords: CoreKeyword[] = [];
    let derivedConcepts: DerivedConcept[] = [];
    let comparisonMatrix: ComparisonMatrix = { headers: [], rows: [] };
    let standardRules: string[] = [];
    let categoryCode = "TECH_THEORY_ALGO";
    let categoryName = "基礎理論・応用数学";
    let mainTheme = dbTitle || theme || "情報処理技術者試験";

    if (fullText.includes("主成分") || fullText.includes("因子分析") || fullText.includes("回帰") || fullText.includes("多変量")) {
      categoryCode = "STRAT_ST_DX";
      categoryName = "業務分析・多変量解析・統計手法";
      mainTheme = "多変量解析とデータ要約 (主成分分析・因子分析)";

      coreKeywords = [
        {
          term: "主成分分析 (PCA)",
          definition: "多数の互いに関連する変数を持つデータセットにおいて、分散が最大となる新たな合成変数（主成分）を計算し、情報の損失を抑えながら次元削減（要約）を行う多変量解析手法。",
          examPoint: "IPA試験では『変数を統合した新たな変数を使用して、データがもつ変数の数を減らす（要約する）』という定義が正解の決め手となります。"
        }
      ];

      derivedConcepts = [
        {
          term: "因子分析",
          relationType: "対比",
          explanation: "主成分分析が『変数をまとめて次元削減する』のに対し、因子分析は『観測データの背後にある潜在的な共通要因(因子)を抽出する』手法です。"
        },
        {
          term: "回帰分析 (単回帰/重回帰)",
          relationType: "対比",
          explanation: "目的変数yと説明変数xの間の因果関係を直線・曲線でモデル化し、将来の数値を予測・推定する手法です。"
        },
        {
          term: "クラスタリング (k-means法等)",
          relationType: "関連手法",
          explanation: "データ間の類似度（距離指標）に基づいて、事前にラベルのないデータを類似するグループに分類する非監督学習手法です。"
        }
      ];

      comparisonMatrix = {
        headers: ["解析手法", "分析の目的", "変数・データの扱い", "出題での正解判定キーワード"],
        rows: [
          ["主成分分析", "データの次元削減・情報要約", "合成変数 (第1主成分等) を算出", "『変数を統合して次元を減らす』"],
          ["因子分析", "背後にある潜在因子の抽出", "観測データの共通要因を分析", "『背後にある共通の要因を抽出』"],
          ["回帰分析", "因果関係のモデル化と将来予測", "目的変数と説明変数の数式化", "『変数の値から他の変数を予測』"],
          ["クラスタリング", "類似データ群のグループ化", "距離・類似度指標による自動分類", "『値が互いに類似するものを分類』"]
        ]
      };

      standardRules = [
        "【主成分分析】 変数を統合して情報を維持したまま次元削減（要約）する手法。",
        "【因子分析】 データ全体の背後にある目に見えない『共通因子』を抽出する手法。",
        "【回帰分析】 目的変数を説明変数で方程式化し、将来の数値を予測する手法。",
        "【クラスタリング】 似ているデータ同士を集めてグループ分けする分類手法。"
      ];
    } else if (fullText.includes("ディープラーニング") || fullText.includes("交差検証") || fullText.includes("機械学習") || fullText.includes("ai")) {
      categoryCode = "STRAT_ST_DX";
      categoryName = "AI・機械学習・データ分析技術";
      mainTheme = "AI・ディープラーニングと学習評価手法";

      coreKeywords = [
        {
          term: "ディープラーニング (深層学習)",
          definition: "人間の脳神経回路（ニューラルネットワーク）を模した多層のノード構造を持ち、大量のデータから自動的に高度な特徴量を抽出・学習するAIアルゴリズム。",
          examPoint: "IPA試験では『人間の脳神経回路のように多層の処理を重ねることによって複雑な判断を可能にする』という記述が正解です。"
        }
      ];

      derivedConcepts = [
        {
          term: "交差検証 (Cross Validation)",
          relationType: "周辺技術",
          explanation: "データを複数のグループに分割し、一部を学習用・残りを評価用に使い、順にグループを入れ替えて評価することで、過学習を防ぎモデルの汎化性能を正確に測定する手法。"
        },
        {
          term: "アンサンブル学習",
          relationType: "関連手法",
          explanation: "複数の異なる機械学習モデル（決定木や回帰モデルなど）を組み合わせて予測を行うことで、単一モデルよりも高い精度と安定性を得る手法。"
        },
        {
          term: "教師あり学習 vs 教師なし学習",
          relationType: "上位/下位",
          explanation: "正解ラベル付きデータで学習する『教師あり学習』と、ラベルなしデータから構造やパターンを見出す『教師なし学習』に大別されます。"
        }
      ];

      comparisonMatrix = {
        headers: ["技術・手法", "モデル構造 / 評価メカニズム", "適用目的", "出題での正解判定キーワード"],
        rows: [
          ["ディープラーニング", "多層ニューラルネットワーク (DNN)", "複雑なパターン認識・画像・音声処理", "『脳神経回路』『多層の処理』"],
          ["交差検証 (Cross Validation)", "データをk分割し学習と評価を交互実施", "モデルの過学習防止・汎化性能の測定", "『データをグループ分割』『入れ替えて評価』"],
          ["アンサンブル学習", "バギング/ブースティング/ランダムフォレスト", "単一モデルの弱点補完・精度向上", "『複数のモデルを組み合わせる』"],
          ["データマイニング", "統計分析・パターン認識・相関抽出", "大量データからの有用な知見発見", "『未知の規則や仮説を発見』"]
        ]
      };

      standardRules = [
        "【ディープラーニング】 『脳神経回路（ニューラルネットワーク）』の『多層処理』で複雑な判断を実現。",
        "【交差検証】 データを分割し学習と評価を入れ替えることで『汎化性能』を正しく評価。",
        "【アンサンブル学習】 複数の独立した学習モデルを組み合わせて総合精度を向上。"
      ];
    } else if (fullText.includes("暗号") || fullText.includes("鍵") || fullText.includes("署名") || fullText.includes("pki") || fullText.includes("rsa")) {
      categoryCode = "TECH_SEC_CRYPTO";
      categoryName = "情報セキュリティ・暗号技術とPKI認証基盤";
      mainTheme = "暗号技術とデジタル署名・PKI基盤";

      coreKeywords = [
        {
          term: "公開鍵暗号方式 (RSA / ECC)",
          definition: "暗号化と復号で異なるペア鍵（公開鍵と秘密鍵）を使用する暗号方式。暗号化鍵を公開できるため、鍵配送問題を解決する。",
          examPoint: "受信者の『公開鍵』で暗号化し、受信者自身の『秘密鍵』で復号します。"
        }
      ];

      derivedConcepts = [
        {
          term: "デジタル署名",
          relationType: "対比",
          explanation: "送信者が自身の『秘密鍵』でハッシュ値を暗号化して作成し、受信者が送信者の『公開鍵』で検証することで、改ざん検知と送信元の真正性を証明する技術。"
        },
        {
          term: "共通鍵暗号方式 (AES / DES)",
          relationType: "対比",
          explanation: "暗号化と復号に同一の鍵を使用する方式。処理速度が非常に高速だが、鍵をいかに安全に送るか（鍵配送問題）が課題。"
        },
        {
          term: "PKI (公開鍵基盤)",
          relationType: "周辺技術",
          explanation: "認証局 (CA) が発行するデジタル証明書によって、公開鍵が本人のものであることを証明し信頼を担保するセキュリティインフラ。"
        }
      ];

      comparisonMatrix = {
        headers: ["暗号・認証技術", "使用する鍵", "達成されるセキュリティ目的", "IPA試験での最重要照合ポイント"],
        rows: [
          ["メッセージ暗号化", "受信者の公開鍵 (暗号化) / 受信者の秘密鍵 (復号)", "データの機密性確保 (第三者解読不可)", "『受信者の公開鍵で暗号化』"],
          ["デジタル署名", "送信者の秘密鍵 (署名) / 送信者の公開鍵 (検証)", "真正性確保・改ざん検知・否認防止", "『送信者の秘密鍵で署名生成』"],
          ["共通鍵暗号 (AES)", "送信者・受信者で共通の単一鍵", "高速な大量データの暗号化", "『同一の鍵を使用』『処理が高速』"],
          ["PKI (認証局)", "認証局 (CA) の秘密鍵で証明書発行", "公開鍵の持ち主の真正性証明", "『電子証明書で公開鍵を証明』"]
        ]
      };

      standardRules = [
        "【暗号化】 通信データを暗号化するときは『受信者の公開鍵』を使う。",
        "【デジタル署名】 署名を作成するときは『送信者の秘密鍵』を使い、検証は『送信者の公開鍵』で行う。",
        "【共通鍵】 同一鍵のため処理速度が速いが、鍵配送管理が必要。"
      ];
    } else if (fullText.includes("csrf") || fullText.includes("sqli") || fullText.includes("xss") || fullText.includes("ゼロトラスト") || fullText.includes("waf")) {
      categoryCode = "TECH_SEC_THREAT";
      categoryName = "情報セキュリティ・Web攻撃手法と防御策";
      mainTheme = "Webアプリケーションの脆弱性と攻撃防御策";

      coreKeywords = [
        {
          term: "クロスサイトリクエストフォージェリ (CSRF)",
          definition: "Webサイトにログイン中のユーザーに悪意あるリンクを踏ませ、ユーザーの意図しないリクエスト（パスワード変更や商品購入等）を対象サイトに送信させる攻撃。",
          examPoint: "防御策としては『リクエストごとに一方向ハッシュによるトークンを発行・検証する』や『SameSite Cookie属性の設定』が正解となります。"
        }
      ];

      derivedConcepts = [
        {
          term: "SQLインジェクション (SQLi)",
          relationType: "対比",
          explanation: "Webフォーム等の入力値に悪意あるSQL文を注入し、DBを不正操作・情報漏洩させる攻撃。根本対策は『プレースホルダによるバインド変数処理』。"
        },
        {
          term: "クロスサイトスクリプティング (XSS)",
          relationType: "対比",
          explanation: "Webページに入力された悪意あるJavaScriptコードを閲覧者のブラウザ上で実行させる攻撃。根本対策は『サニタイジング (エスケープ処理)』。"
        },
        {
          term: "ゼロトラスト (ZTNA)",
          relationType: "周辺技術",
          explanation: "社内LANであっても信頼せず『すべてのアクセスを常に認証・認可・検証する』次世代セキュリティアーキテクチャ。"
        }
      ];

      comparisonMatrix = {
        headers: ["攻撃手法", "攻撃の発生メカニズム", "根本的防御策", "試験での解答キーポイント"],
        rows: [
          ["CSRF", "ログイン状態を利用し意図しない操作を実行させる", "独自トークンの検証 / SameSite Cookie", "『リクエストの正当性をトークンで検証』"],
          ["SQLインジェクション", "入力値の処理不備で意図しないSQL文が実行される", "静的プレペアードステートメント (バインド変数)", "『プレースホルダでSQL構文を固定』"],
          ["XSS", "悪意あるHTML/JSが閲覧者ブラウザで動的実行される", "HTML特殊文字のエスケープ処理 (サニタイジング)", "『< や > などの文字をエスケープ』"],
          ["ゼロトラスト", "社内ネットワーク内部からの攻撃や境界の突破", "アクセスごとの継続的認証・最小権限の適用", "『何も信頼せずアクセスごとに検証』"]
        ]
      };

      standardRules = [
        "【CSRF対策】 乱数トークンを発行してリクエストの正当性を検証する。",
        "【SQLインジェクション対策】 動的文字列結合を排除し『バインド変数 (プレースホルダ)』を使用する。",
        "【XSS対策】 出力時にHTML特殊文字を『サニタイジング (エスケープ)』する。"
      ];
    } else if (fullText.includes("正規化") || fullText.includes("正規形") || fullText.includes("デッドロック") || fullText.includes("having") || fullText.includes("データベース")) {
      categoryCode = "TECH_DB_NORM";
      categoryName = "データベース・正規化理論とトランザクション制御";
      mainTheme = "DB正規化理論と排他制御・SQL集約";

      coreKeywords = [
        {
          term: "データベース正規化 (1NF〜3NF)",
          definition: "データ構造の重複や更新異常（追加・更新・削除異常）を排除し、データの整合性を維持するためにテーブルを段階的に分割する設計手法。",
          examPoint: "第2正規形は『部分関数従属の排除』、第3正規形は『推移的関数従属の排除』が試験での判定キーワードです。"
        }
      ];

      derivedConcepts = [
        {
          term: "第2正規形 vs 第3正規形",
          relationType: "上位/下位",
          explanation: "第2正規形は『主キーの一部に対する部分関数従属の排除』、第3正規形は『非キー属性間の推移的関数従属の排除』を行います。"
        },
        {
          term: "デッドロック (Deadlock)",
          relationType: "周辺技術",
          explanation: "複数のトランザクションが互いに相手のロック解除を永久に待ち続ける状態。防止策は『資源のロック順番を統一する』こと。"
        },
        {
          term: "HAVING句 vs WHERE句",
          relationType: "対比",
          explanation: "WHERE句はGROUP BY実行前の個別行の絞り込み、HAVING句はGROUP BY実行後の集約結果に対するフィルタリングを行います。"
        }
      ];

      comparisonMatrix = {
        headers: ["正規形・概念", "排除する従属関係・状態", "適用条件・テーブル構造", "IPA試験での判定キーワード"],
        rows: [
          ["第1正規形 (1NF)", "繰り返し項目・単一セル内の複数値", "すべての属性が原子値を持つ", "『繰り返し項目の排除』"],
          ["第2正規形 (2NF)", "主キーの一部に対する『部分関数従属』", "複合主キーの一部に依存する項目を分割", "『部分関数従属の排除』"],
          ["第3正規形 (3NF)", "主キー以外の属性間の『推移的関数従属』", "非主キー項目に従属する項目を分割", "『推移的関数従属の排除』"],
          ["HAVING句", "GROUP BY集約結果に対するフィルタリング", "COUNT/AVG等の集約関数条件を指定", "『集約結果に対する条件指定』"]
        ]
      };

      standardRules = [
        "【第2正規形】 複合主キーの一部分に依存する『部分関数従属』を排除する。",
        "【第3正規形】 主キー以外の項目に依存する『推移的関数従属』を排除する。",
        "【WHEREとHAVING】 行ごとの抽出はWHERE句、GROUP BY後の集約判定はHAVING句。"
      ];
    } else if (fullText.includes("evm") || fullText.includes("spi") || fullText.includes("cpi") || fullText.includes("クリティカルパス") || fullText.includes("wbs")) {
      categoryCode = "MGMT_PM_EVM";
      categoryName = "プロジェクトマネジメント・EVM定量進捗管理";
      mainTheme = "EVMによるコスト・スケジュール進捗の定量評価";

      coreKeywords = [
        {
          term: "EVM (Earned Value Management)",
          definition: "プロジェクトの進捗とコストを、PV (計画価値)、EV (出来高価値)、AC (実績コスト) という金額単位の指標で統合的に定量管理する手法。",
          examPoint: "SPI (スケジュール効率) = EV / PV、CPI (コスト効率) = EV / AC。どちらも1.0未満でパフォーマンス低下（遅延・予算超過）を意味します。"
        }
      ];

      derivedConcepts = [
        {
          term: "SPI (スケジュール効率指数) vs CPI (コスト効率指数)",
          relationType: "対比",
          explanation: "SPI = EV / PV (1.0未満で遅延)、CPI = EV / AC (1.0未満で予算超過)。進捗率とコスト使用率をそれぞれ測定します。"
        },
        {
          term: "クリティカルパス (Critical Path)",
          relationType: "周辺技術",
          explanation: "アローダイアグラムにおいて、開始から終了までの全経路の中で最も所要時間が長い経路。余裕時間(スラック)が0である。"
        },
        {
          term: "ファストトラッキング (Fast Tracking)",
          relationType: "関連手法",
          explanation: "先行工程の完了を待たずに後続工程を並行して進めるスケジュール圧縮技法。手戻りリスクが増大するデメリットがある。"
        }
      ];

      comparisonMatrix = {
        headers: ["EVM指標/手法", "計算式・定義", "評価基準 (1.0との比較)", "試験での出題・判定パターン"],
        rows: [
          ["SPI (スケジュール効率)", "EV / PV (出来高 ÷ 計画値)", "SPI < 1.0 (計画遅延) / SPI > 1.0 (順調)", "『1.0未満でスケジュール遅延』"],
          ["CPI (コスト効率)", "EV / AC (出来高 ÷ 実績コスト)", "CPI < 1.0 (予算超過) / CPI > 1.0 (予算内)", "『1.0未満でコスト超過』"],
          ["CV (コスト差分)", "EV - AC", "CV < 0 (予算超過) / CV > 0 (予算内)", "『マイナスで予算オーバー』"],
          ["ファストトラッキング", "作業の並行実施", "期間短縮可能だが手戻りリスク増加", "『本来順番に行う作業を並行実施』"]
        ]
      };

      standardRules = [
        "【SPI】 EV / PV < 1.0 ならスケジュール遅延。",
        "【CPI】 EV / AC < 1.0 なら予算超過（コストオーバー）。",
        "【ファストトラッキング】 工程を並行実施して期間短縮（リスク増加）。"
      ];
    } else if (fullText.includes("著作権") || fullText.includes("不正アクセス") || fullText.includes("派遣") || fullText.includes("請負") || fullText.includes("法務")) {
      categoryCode = "STRAT_LEGAL";
      categoryName = "企業活動・法務・知的財産権と契約";
      mainTheme = "IT関連法規・知的財産権と労働契約形態";

      coreKeywords = [
        {
          term: "著作権法とプログラム保護",
          definition: "思想または感情を創作的に表現した著作物を保護する法律。プログラムのソースコード等の『表現』は保護されるが、プログラミング言語・規約・解法（アルゴリズム）自体は保護対象外。",
          examPoint: "IPA試験では『プログラム言語、解法（アルゴリズム）、約定（プロトコル）は著作権法の保護対象外』という点が最大の合否分岐点です。"
        }
      ];

      derivedConcepts = [
        {
          term: "不正アクセス禁止法",
          relationType: "周辺技術",
          explanation: "アクセス制御機能を持つコンピュータに、他人のID/パスワードを無断入力して侵入する行為や、他人のパスワードを第三者に無断提供する行為を処罰する法律。"
        },
        {
          term: "労働者派遣契約 vs 請負契約 (業務委託)",
          relationType: "対比",
          explanation: "派遣契約は『派遣先企業』に指揮命令権があり、請負契約は『受託（請負）企業』に指揮命令権があります。"
        },
        {
          term: "特許権 (産業財産権)",
          relationType: "対比",
          explanation: "自然法則を利用した技術的思想の創作（発明）を独占的に保護する権利。出願と特許庁の登録が必要（著作権は無方式主義で登録不要）。"
        }
      ];

      comparisonMatrix = {
        headers: ["法律/契約形態", "保護対象 / 指揮命令権", "主要な特徴・禁止規定", "IPA試験での選択肢判定ポイント"],
        rows: [
          ["著作権法", "プログラムの『表現』", "無方式主義(登録不要)。言語・アルゴリズムは対象外", "『アルゴリズムやプロトコルは保護対象外』"],
          ["不正アクセス禁止法", "アクセス制御機能を持つ全システム", "他人のパスワード無断入力・不正提供を禁止", "『他人のID/パスワード入力で不正ログイン』"],
          ["労働者派遣契約", "派遣先に指揮命令権あり", "派遣元が雇用関係、派遣先が業務指示", "『派遣先が指揮命令を行う』"],
          ["請負契約 (業務委託)", "受託者に指揮命令権あり", "成果物の完成義務。委託者に指揮命令権なし", "『受託者が自ら指示して完成させる』"]
        ]
      };

      standardRules = [
        "【著作権法】 プログラムの『表現』を保護。『言語・アルゴリズム・プロトコル』は保護対象外。",
        "【労働者派遣】 指揮命令権は『派遣先』にある。",
        "【請負契約】 指揮命令権は『受託者（請負側）』にある（委託側が指示すると二重派遣）。"
      ];
    } else {
      // General fallback domain
      categoryCode = "TECH_THEORY_ALGO";
      categoryName = "テクノロジ系・基礎理論";
      mainTheme = dbTitle || theme || "情報処理技術者試験 核心テーマ";

      coreKeywords = [
        {
          term: dbTitle || "応用情報技術者 核心概念",
          definition: dbBodyText.slice(0, 150) + "...",
          examPoint: "本問の文脈において、標準的な仕様・アルゴリズム定義に基づいて選択肢の正誤を判定します。"
        }
      ];

      derivedConcepts = [
        {
          term: "関連要素技術",
          relationType: "周辺技術",
          explanation: "基本となる動作原理と関連仕様をあわせて理解することで応用出題に対応します。"
        },
        {
          term: "上位システム構成",
          relationType: "上位/下位",
          explanation: "全体アーキテクチャにおける当該コンポーネントの位置づけを把握します。"
        }
      ];

      comparisonMatrix = {
        headers: ["概念・技術", "動作メカニズム", "主要な特徴", "出題ポイント"],
        rows: [
          [dbTitle.slice(0, 20) || "本問のテーマ", "基本仕様に沿った動作", "標準的な評価基準", "問題文の条件指定"],
          ["関連技術要素", "相互補完的な動作原理", "システムの信頼性向上", "比較選択肢の判定"]
        ]
      };

      standardRules = [
        "問題文の制約条件（前提条件・用語の定義）を正確に読み取る。",
        "各選択肢のキーワードとシラバス定石知識を照合して判定する。"
      ];
    }

    const textbookRef = getTextbookReferenceForCategory(categoryCode, categoryName);

    const responseData: SystematicLectureResponse = {
      theme: mainTheme,
      syllabusCategoryName: categoryName,
      textbookRef: {
        chapter: `第${textbookRef.chapterNum}章 ${textbookRef.chapterTitle}`,
        section: `${textbookRef.sectionNum} ${textbookRef.sectionTitle}`,
        page: textbookRef.page,
      },
      coreKeywords,
      derivedConcepts,
      comparisonMatrix,
      standardRules,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Systematic Lecture API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
