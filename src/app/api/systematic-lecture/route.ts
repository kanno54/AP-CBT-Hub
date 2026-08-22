import { NextRequest, NextResponse } from 'next/server';

export interface ComparisonRow {
  concept: string;
  mechanism: string;
  countermeasure: string;
  keyPoint: string;
}

export interface SystematicLectureData {
  themeTitle: string;
  overview: string;
  comparisonTable: ComparisonRow[];
  examRules: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, theme = '', bodyText = '', modelAnswer = '' } = body;

    const fullText = (theme + ' ' + bodyText + ' ' + modelAnswer).toLowerCase();

    let lectureData: SystematicLectureData;

    if (fullText.includes('署名') || fullText.includes('公開鍵') || fullText.includes('暗号') || fullText.includes('鍵')) {
      lectureData = {
        themeTitle: '公開鍵暗号方式・デジタル署名と鍵管理の体系',
        overview: '公開鍵暗号方式における暗号化とデジタル署名（改ざん防止・本人認証）のメカニズムおよび、各処理で使用する「送信者・受信者の鍵」の対応関係講義です。',
        comparisonTable: [
          {
            concept: 'デジタル署名の生成 (送信時)',
            mechanism: '送信者Aがメッセージのハッシュ値を算出。',
            countermeasure: '「送信者Aの秘密鍵」でハッシュ値を暗号化して署名作成。',
            keyPoint: '送信者A本人しか秘密鍵を持たないため「なりすまし防止・非否認」が確立。',
          },
          {
            concept: 'デジタル署名の検証 (受信時)',
            mechanism: '受信者Bが受け取った署名を復号。',
            countermeasure: '「送信者Aの公開鍵」で署名を復号しハッシュ値を照合。',
            keyPoint: '誰でも入手できる送信者Aの公開鍵で検証可能。一致すれば「改ざんゼロ」。',
          },
          {
            concept: 'メッセージの暗号化 (送信時)',
            mechanism: '送信者Aが第三者に盗聴されないよう本文を暗号化。',
            countermeasure: '「受信者Bの公開鍵」でメッセージを暗号化。',
            keyPoint: '受信者Bしか復号できない状態にする。',
          },
          {
            concept: 'メッセージの復号 (受信時)',
            mechanism: '受信者Bが暗号文を解読。',
            countermeasure: '「受信者Bの秘密鍵」で暗号文を復号。',
            keyPoint: '受信者Bの秘密鍵のみで復号が可能。',
          },
        ],
        examRules: [
          '【鍵の役割黄金律】 署名生成＝『送信者の秘密鍵』 / 署名検証＝『送信者の公開鍵』',
          '【暗号復号黄金律】 メッセージ暗号化＝『受信者の公開鍵』 / メッセージ解読＝『受信者の秘密鍵』',
        ],
      };
    } else if (fullText.includes('二分') || fullText.includes('計算量') || fullText.includes('木') || fullText.includes('アルゴリズム') || fullText.includes('o(')) {
      lectureData = {
        themeTitle: 'データ構造と探索アルゴリズム・時間複雑度 (Big-O) の体系',
        overview: '探索構造におけるデータ構造別の平均時間複雑度（O表記）と比較一覧です。平衡二分探索木とハッシュテーブルの性能特性を正しく整理しましょう。',
        comparisonTable: [
          {
            concept: '平衡二分探索木 (AVL木 / 赤黒木)',
            mechanism: '木の高さが常に O(log N) に保たれる二分木。',
            countermeasure: '左右の部分木の高さの差を一定内に自動維持。',
            keyPoint: '平均・最悪共に探索・挿入・削除の計算量は O(log N)。',
          },
          {
            concept: 'ハッシュテーブル (Hash Table)',
            mechanism: 'キー値からハッシュ関数で配列インデックスを直接算出。',
            countermeasure: 'ハッシュ衝突発生時にチェイン法やオープンアドレス法で回避。',
            keyPoint: '平均検索計算量は極めて高速な O(1)。',
          },
          {
            concept: '線形リスト / 非平衡木',
            mechanism: '要素を先頭から順番に1つずつ走査して検索。',
            countermeasure: '要素数が膨大になると検索効率が著しく低下。',
            keyPoint: '平均探索計算量は O(N)。',
          },
        ],
        examRules: [
          '【計算量暗記】 平衡二分探索木 ＝ O(log N) / ハッシュテーブル平均 ＝ O(1) / 線形探索 ＝ O(N)',
        ],
      };
    } else if (fullText.includes('dx') || fullText.includes('ガイドライン') || fullText.includes('変革')) {
      lectureData = {
        themeTitle: 'デジタルトランスフォーメーション (DX) 定義と企業変革の体系',
        overview: '経済産業省「DX推進ガイドライン」におけるデジタイゼーション（ペーパーレス化）、デジタライゼーション（業務IT化）、そしてDX（ビジネスモデル変革）の3段階の定義比較です。',
        comparisonTable: [
          {
            concept: 'デジタイゼーション (Digitization)',
            mechanism: 'アナログな紙・物理データのデジタル化。',
            countermeasure: '紙書類のスキャン、PDF化、ペーパーレス化の推進。',
            keyPoint: '「データのデジタル形式への置き換え」段階。',
          },
          {
            concept: 'デジタライゼーション (Digitalization)',
            mechanism: '個別の業務プロセス全体のデジタル化・効率化。',
            countermeasure: 'ワークフローシステム導入、クラウドツールによる自動化。',
            keyPoint: '「業務プロセスのIT化」段階。',
          },
          {
            concept: 'DX (Digital Transformation)',
            mechanism: 'データとデジタル技術による製品・サービス・ビジネスモデルの根本変革。',
            countermeasure: '顧客ニーズを起点とした企業風土・組織・プロセス全体の刷新。',
            keyPoint: '「競争上の優位性を確立するビジネス変革」段階。',
          },
        ],
        examRules: [
          '【DX定義の正解肢キーワード】 『データとデジタル技術を活用し、製品・サービス・ビジネスモデルを変革し、競争上の優位性を確立すること』',
        ],
      };
    } else if (fullText.includes('csrf') || fullText.includes('sql') || fullText.includes('security') || fullText.includes('ゼロトラスト')) {
      lectureData = {
        themeTitle: 'Webアプリケーションセキュリティと認証・認可基盤の体系',
        overview: '現代のWebシステム開発において頻出する主要な脆弱性（CSRF・SQLi・XSS）の発生機構と、標準的な技術対策の比較一覧です。IPA試験では「攻撃名」「発生原因」「具体的対策記述」の3点がセットで問われます。',
        comparisonTable: [
          {
            concept: 'CSRF (クロスサイトリクエストフォージェリ)',
            mechanism: '他サイト上の悪意あるスクリプトが、ターゲットの認証Cookie付きリクエストを自動送信させる。',
            countermeasure: 'Cookieに SameSite=Strict / Secure 属性を付与。CSRFトークンの検証。',
            keyPoint: '「他サイト起点」での自動リクエスト送信を防止することが主眼。',
          },
          {
            concept: 'SQLインジェクション (SQLi)',
            mechanism: 'ユーザー入力値の動的文字列結合により、データベースのSQL構文そのものが改変・実行される。',
            countermeasure: 'プレースホルダを用いた静的プレペアードステートメント（バインド変数）の使用。',
            keyPoint: '「SQL構文」と「データ（値）」をデータベースエンジン側で厳格分離。',
          },
          {
            concept: 'XSS (クロスサイトスクリプティング)',
            mechanism: 'HTML出力処理の未エスケープにより、閲覧者のブラウザ上で悪意あるJavaScriptが実行される。',
            countermeasure: 'HTML特殊文字のエスケープ処理。Cookieへ HttpOnly 属性を付与（JavaScript読み取り防止）。',
            keyPoint: '「ブラウザ上でのスクリプト非実行化」とセッション情報の保護。',
          },
          {
            concept: 'ゼロトラスト (Zero Trust)',
            mechanism: '従来型の境界防御（社内LAN＝安全）の限界。内部・外部を問わず脅威が存在すると仮定。',
            countermeasure: 'すべてのアクセス要求ごとに暗号化・認証・認可を実施。最小権限の原則適用。',
            keyPoint: '「何も信頼せず、常に検証する」アクセスごとの厳格な認可制御。',
          },
        ],
        examRules: [
          '【定石対策記述 1】 CSRF対策: 『CookieにSameSite=Strict属性およびSecure属性を付与する』',
          '【定石対策記述 2】 SQLi対策: 『プレースホルダを用いた静的プレペアードステートメントを使用する』',
        ],
      };
    } else if (fullText.includes('正規形') || fullText.includes('database') || fullText.includes('db') || fullText.includes('デッドロック')) {
      lectureData = {
        themeTitle: 'データベース構造化・正規化理論とトランザクション制御の体系',
        overview: 'リレーショナルデータベースにおけるデータ矛盾を防ぐ正規化（第1〜第3正規形）と、排他制御（ロック・デッドロック回避）の構造比較講義です。',
        comparisonTable: [
          {
            concept: '第1正規形 (1NF)',
            mechanism: '表の中に繰り返し群（配列・複数値）が存在する状態。',
            countermeasure: '繰り返し群を分離し、すべての列の値を単一の原子値（Atomic Value）にする。',
            keyPoint: '「繰り返し要素の排除」が必須条件。',
          },
          {
            concept: '第2正規形 (2NF)',
            mechanism: '主キーの一部のみに関数従属する列（部分関数従属）が存在する状態。',
            countermeasure: '主キーの一部に従属する列を別テーブルへ分割し、完全関数従属のみにする。',
            keyPoint: '「複合主キーの一部に対する従属の解消」。',
          },
          {
            concept: '第3正規形 (3NF)',
            mechanism: '主キー以外の非キー属性から、他の非キー属性へ関数従属（推移的関数従属）している状態。',
            countermeasure: '非キー属性間の関数従属列を別テーブルに独立させ、推移的従属を排除する。',
            keyPoint: '「非キー属性から非キー属性への従属排除」。',
          },
          {
            concept: 'デッドロック (Deadlock)',
            mechanism: '複数のトランザクションが互いに相手の保持するロック解除を永久に待ち続ける現象。',
            countermeasure: '全トランザクションにおいてリソースアクセスの獲得順序を固定・一律統一する。',
            keyPoint: '「リソース確保順序の統一」による循環待ち阻止。',
          },
        ],
        examRules: [
          '【定石の定義】 第3正規形: 『完全関数従属を満たし、非キー属性間の推移的関数従属が存在しない状態』',
          '【定石対策記述】 デッドロック回避: 『資源アクセスのロック獲得順序を全処理で一律に固定する』',
        ],
      };
    } else {
      lectureData = {
        themeTitle: 'プロジェクトマネジメント (EVM) および事業継続計画 (BCP) の体系',
        overview: 'ITプロジェクトにおける進捗・コスト定量評価手法 (EVM) と、災害・障害発生時の事業継続指標 (RTO / RPO) の体系的比較講義です。',
        comparisonTable: [
          {
            concept: 'EVM: コスト分散 (CV)',
            mechanism: 'CV = EV (出来高) - AC (実コスト)',
            countermeasure: 'CV < 0 の場合は予算オーバーを意味し、コスト削減対策を実施。',
            keyPoint: 'マイナスは予算超過。プラスは予算節減。',
          },
          {
            concept: 'EVM: スケジュール効率 (SPI)',
            mechanism: 'SPI = EV (出来高) / PV (計画値)',
            countermeasure: 'SPI < 1.0 の場合は進捗遅延を意味し、要員追加等のリカバリ策を講じる。',
            keyPoint: '1.0未満は進捗遅れ。1.0超は進捗先行。',
          },
          {
            concept: 'BCP: 目標復旧時間 (RTO)',
            mechanism: 'システム停止発生から業務が再開・復旧するまでの目標経過時間。',
            countermeasure: '予備系システムのホットスタンドバイ化等で許容時間内に復旧。',
            keyPoint: '「復旧にかかる経過時間」の許容限度。',
          },
          {
            concept: 'BCP: 目標復旧時点 (RPO)',
            mechanism: '障害発生時に失われても許容できる過去のデータ損失量（復元の最新性）。',
            countermeasure: 'リアルタイムレプリケーションや頻繁な増分バックアップの実施。',
            keyPoint: '「どの過去時点のデータまで戻せるか」の許容限界。',
          },
        ],
        examRules: [
          '【計算定石】 EVM指標: CV = EV - AC / SV = EV - PV / SPI = EV / PV / CPI = EV / AC',
          '【指標使い分け】 RTO ＝ 復旧までの『時間』 / RPO ＝ 復元のデータ『時点・過去ポイント』',
        ],
      };
    }

    return NextResponse.json({
      success: true,
      data: lectureData,
    });
  } catch (error: any) {
    console.error('Systematic Lecture API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
