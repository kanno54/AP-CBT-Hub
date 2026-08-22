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

    if (fullText.includes('csrf') || fullText.includes('sql') || fullText.includes('security') || fullText.includes('ゼロトラスト') || fullText.includes('暗号') || fullText.includes('鍵')) {
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
          '【鍵の役割定石】 デジタル署名生成＝『送信者の秘密鍵』 / 暗号文解読＝『受信者の秘密鍵』',
        ],
      };
    } else if (fullText.includes('正規形') || fullText.includes('database') || fullText.includes('db') || fullText.includes('デッドロック') || fullText.includes('トランザクション')) {
      lectureData = {
        themeTitle: 'データベース構造化・正規化理論とトランザクション制御の体系',
        overview: 'リレーショナルデータベースにおけるデータ矛盾を防ぐ正規化（第1〜第3正規形）と、並行処理における排他制御（ロック・デッドロック回避）の構造比較講義です。',
        comparisonTable: [
          {
            concept: '第1正規形 (1NF)',
            mechanism: '表の中の繰り返し群（配列・複数値）が存在する状態。',
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
          '【定石の定義 1】 第3正規形: 『完全関数従属を満たし、非キー属性間の推移的関数従属が存在しない状態』',
          '【定石対策記述 2】 デッドロック回避: 『資源アクセスのロック獲得順序を全処理で一律に固定する』',
        ],
      };
    } else if (fullText.includes('ipv6') || fullText.includes('network') || fullText.includes('プロトコル') || fullText.includes('ip')) {
      lectureData = {
        themeTitle: 'ネットワークプロトコルとアドレス体系 (IPv6/IPv4) の全体像',
        overview: '次世代インターネットプロトコルIPv6の仕様と、従来のIPv4プロトコルの相違点およびセキュリティ機能の整理です。',
        comparisonTable: [
          {
            concept: 'IPv4 アドレス体系',
            mechanism: '32ビット長（4バイト）。10進数ドット区切り表記。アドレス枯渇が深刻。',
            countermeasure: 'NAT/NAPT機能によるプライベートIPアドレス変換。',
            keyPoint: 'ブロードキャスト通信が存在。',
          },
          {
            concept: 'IPv6 アドレス体系',
            mechanism: '128ビット長（16バイト）。16進数コロン区切り表記。ほぼ無限のアドレス数。',
            countermeasure: '標準機能としてIPsec暗号化プロトコルを標準実装。',
            keyPoint: 'ブロードキャストが廃止されマルチキャストが代替。',
          },
        ],
        examRules: [
          '【定石知識 1】 IPv6仕様: 128ビット長・16進数コロン区切り・IPsec標準化・マルチキャスト通信採用',
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
          '【計算定石 1】 EVM指標: CV = EV - AC / SV = EV - PV / SPI = EV / PV / CPI = EV / AC',
          '【指標使い分け 2】 RTO ＝ 復旧までの『時間』 / RPO ＝ 復元のデータ『時点・過去ポイント』',
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
