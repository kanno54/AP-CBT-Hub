import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    let dbCategory = '';
    let dbTitle = '';

    // Fetch DB record if questionId is provided to get exact domain category
    if (questionId) {
      try {
        const qRecord = await prisma.question.findUnique({
          where: { id: questionId },
          select: { category: true, title: true, bodyText: true },
        });
        if (qRecord) {
          dbCategory = (qRecord.category || '').toUpperCase();
          dbTitle = qRecord.title || '';
        }
      } catch (dbErr) {
        // Fallback to request payload if DB lookup fails
      }
    }

    const fullText = (theme + ' ' + dbTitle + ' ' + bodyText + ' ' + modelAnswer).toLowerCase();
    const cat = dbCategory;

    let lectureData: SystematicLectureData;

    // 1. SECURITY Domain (公開鍵暗号・デジタル署名・ゼロトラスト・CSRF・SQLi・WAF)
    if (
      cat === 'SECURITY' ||
      fullText.includes('署名') ||
      fullText.includes('公開鍵') ||
      fullText.includes('暗号') ||
      fullText.includes('csrf') ||
      fullText.includes('sqli') ||
      fullText.includes('sqlインジェクション') ||
      fullText.includes('ゼロトラスト') ||
      fullText.includes('waf') ||
      fullText.includes('セキュリティ')
    ) {
      lectureData = {
        themeTitle: 'Webセキュリティ・暗号基盤・認証認可の体系',
        overview: '情報セキュリティ分野における「暗号化・デジタル署名」「主要Web脆弱性（CSRF/SQLi/XSS）」「ゼロトラストアクセス制御」の核心的メカニズムと標準的対策の整理講義です。',
        comparisonTable: [
          {
            concept: 'デジタル署名 (送信者認証・改ざん検知)',
            mechanism: '送信者Aがメッセージのハッシュ値を算出。',
            countermeasure: '「送信者Aの秘密鍵」で署名作成し、「送信者Aの公開鍵」で検証。',
            keyPoint: '送信者の秘密鍵でしか作れないため「なりすまし・改ざん」を100%防止。',
          },
          {
            concept: 'メッセージ暗号化 (秘匿通信)',
            mechanism: '盗聴を防止するため本文を暗号化。',
            countermeasure: '「受信者Bの公開鍵」で暗号化し、「受信者Bの秘密鍵」で復号。',
            keyPoint: '受信者本人しか復号できない状態を確立。',
          },
          {
            concept: 'CSRF (クロスサイトリクエストフォージェリ)',
            mechanism: '他サイト上のスクリプトが、ユーザーの認証Cookie付きリクエストを自動送信させる。',
            countermeasure: 'Cookieに SameSite=Strict/Secure 属性付与、CSRFトークンの検証。',
            keyPoint: '他サイト起点の自動送信攻撃を阻止。',
          },
          {
            concept: 'SQLインジェクション (SQLi)',
            mechanism: 'ユーザー入力値の動的文字列結合により、SQL構文が改変・実行される。',
            countermeasure: 'プレースホルダを用いた静的プレペアードステートメント（バインド変数）の利用。',
            keyPoint: '「SQL構文」と「データ（値）」をDBエンジン側で分離。',
          },
        ],
        examRules: [
          '【鍵の役割定石】 署名生成＝『送信者の秘密鍵』 / 署名検証＝『送信者の公開鍵』',
          '【暗号復号定石】 メッセージ暗号化＝『受信者の公開鍵』 / 復号＝『受信者の秘密鍵』',
          '【SQLi根本対策】 『プレースホルダを用いた静的プレペアードステートメントを使用する』',
        ],
      };
    }
    // 2. DATABASE Domain (正規化・SQL・デッドロック・ACID)
    else if (
      cat === 'DATABASE' ||
      fullText.includes('正規形') ||
      fullText.includes('正規化') ||
      fullText.includes('database') ||
      fullText.includes('デッドロック') ||
      fullText.includes('acid') ||
      fullText.includes('having') ||
      fullText.includes('sql')
    ) {
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
    }
    // 3. ALGORITHM Domain (アルゴリズム・二分探索木・計算量・データ構造)
    else if (
      cat === 'ALGORITHM' ||
      fullText.includes('二分') ||
      fullText.includes('計算量') ||
      fullText.includes('スタック') ||
      fullText.includes('キュー') ||
      fullText.includes('木') ||
      fullText.includes('アルゴリズム') ||
      fullText.includes('ハッシュ') ||
      fullText.includes('o(')
    ) {
      lectureData = {
        themeTitle: 'データ構造と探索アルゴリズム・時間複雑度 (Big-O) の体系',
        overview: '探索構造におけるデータ構造別の平均時間複雑度（O表記）と比較一覧です。平衡二分探索木、スタック・キュー、ハッシュテーブルの性能特性を整理します。',
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
            concept: 'スタック (Stack / LIFO)',
            mechanism: '後に入れたデータを先に取り出す後入れ先出し構造。',
            countermeasure: 'サブルーチン呼び出しや計算式評価に利用。',
            keyPoint: 'LIFO (Last-In First-Out) 構造。',
          },
          {
            concept: 'キュー (Queue / FIFO)',
            mechanism: '先に入れたデータを先に取り出す先入れ先出し構造。',
            countermeasure: 'タスクスケジューリングやパケットバッファに利用。',
            keyPoint: 'FIFO (First-In First-Out) 構造。',
          },
        ],
        examRules: [
          '【計算量暗記】 平衡二分探索木 ＝ O(log N) / ハッシュテーブル平均 ＝ O(1) / 線形探索 ＝ O(N)',
          '【データ構造暗記】 スタック ＝ LIFO (後入れ先出し) / キュー ＝ FIFO (先入れ先出し)',
        ],
      };
    }
    // 4. NETWORK Domain (ネットワーク・IPv6・IPsec・サブネット・DNS)
    else if (
      cat === 'NETWORK' ||
      fullText.includes('ipv6') ||
      fullText.includes('ipsec') ||
      fullText.includes('サブネット') ||
      fullText.includes('ネットワーク') ||
      fullText.includes('ip') ||
      fullText.includes('dns')
    ) {
      lectureData = {
        themeTitle: 'ネットワークプロトコル・IPアドレス設計・暗号化通信の体系',
        overview: 'ネットワーク層におけるIPv6のアドレス仕様、IPsec VPN暗号化通信、サブネットマスク計算の基本事項の整理講義です。',
        comparisonTable: [
          {
            concept: 'IPv6 アドレス仕様',
            mechanism: '128ビットのアドレス空間(2^128)。',
            countermeasure: '16ビットごとにコロン(:)で区切り、16進数で表記。',
            keyPoint: 'ブロードキャスト非採用(マルチキャスト化)。',
          },
          {
            concept: 'IPsec (ESP プロトコル)',
            mechanism: 'IPパケット単位で暗号化と認証・改ざん防止を提供。',
            countermeasure: 'ESP (Encapsulating Security Payload) による暗号化。',
            keyPoint: 'VPN拠点間トンネリング暗号化の標準。',
          },
          {
            concept: 'サブネットマスク (CIDR)',
            mechanism: 'IPアドレスのネットワーク部とホスト部を識別。',
            countermeasure: 'ネットワークアドレスとブロードキャストアドレスを除く(2^N - 2台)。',
            keyPoint: '利用可能ホスト数計算の定石。',
          },
        ],
        examRules: [
          '【IPv6表記定石】 『128ビット長、16ビット単位のコロン区切り16進数表記』',
          '【サブネット計算】 利用可能ホスト数 ＝ 2^(32 - プレフィックス) - 2 台',
        ],
      };
    }
    // 5. PROJECT_MGMT / MANAGEMENT Domain (EVM・WBS・SLA・ITIL)
    else if (
      cat === 'PROJECT_MGMT' ||
      cat === 'MANAGEMENT' ||
      fullText.includes('evm') ||
      fullText.includes('wbs') ||
      fullText.includes('sla') ||
      fullText.includes('itil') ||
      fullText.includes('インシデント')
    ) {
      lectureData = {
        themeTitle: 'プロジェクトマネジメント (EVM) およびサービス運用 (ITIL/SLA) の体系',
        overview: 'ITプロジェクトにおける進捗・コスト定量評価手法 (EVM) と、ITILサービス運用における障害迅速復旧の体系的比較講義です。',
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
            countermeasure: 'SPI < 1.0 の場合は進捗遅延を意味し、ファストトラッキング等のリカバリを講じる。',
            keyPoint: '1.0未満は進捗遅れ。1.0超は進捗先行。',
          },
          {
            concept: 'ITIL: インシデント管理',
            mechanism: '障害発生時、サービス中断時間を最短化。',
            countermeasure: '根本原因究明に先立ち、最優先で「暫定復旧」を実施。',
            keyPoint: '「迅速なサービス復旧」が最優先目的。',
          },
          {
            concept: 'ITIL: 問題管理',
            mechanism: 'インシデントの根本原因を追究。',
            countermeasure: '再発防止策を策定し、恒久対策を実施。',
            keyPoint: '「根本原因の究明と再発防止」が目的。',
          },
        ],
        examRules: [
          '【計算定石】 EVM指標: CV = EV - AC / SPI = EV / PV / CPI = EV / AC',
          '【ITIL使い分け】 インシデント管理 ＝ 『迅速な暫定復旧』 / 問題管理 ＝ 『根本原因の究明』',
        ],
      };
    }
    // 6. STRATEGY Domain (DX・SWOT・PPM・BSC)
    else if (
      cat === 'STRATEGY' ||
      fullText.includes('dx') ||
      fullText.includes('swot') ||
      fullText.includes('ppm') ||
      fullText.includes('bsc') ||
      fullText.includes('ガイドライン')
    ) {
      lectureData = {
        themeTitle: '経営戦略・デジタルトランスフォーメーション (DX)・事業分析の体系',
        overview: '経済産業省「DX推進ガイドライン」におけるデジタイゼーション（ペーパーレス化）とDX（ビジネスモデル変革）、および経営分析手法の体系比較です。',
        comparisonTable: [
          {
            concept: 'デジタイゼーション (Digitization)',
            mechanism: 'アナログな紙・物理データのデジタル化。',
            countermeasure: '紙書類のスキャン、PDF化、ペーパーレス化。',
            keyPoint: '「データのデジタル形式への置き換え」段階。',
          },
          {
            concept: 'デジタライゼーション (Digitalization)',
            mechanism: '個別の業務プロセス全体のデジタル化・効率化。',
            countermeasure: 'ワークフロー導入、クラウドツールによる自動化。',
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
    }
    // 7. Safe Tailored Fallback (Specific to the exact Question's Title and Content)
    else {
      const cleanTitle = theme || dbTitle || '出題テーマ体系ガイド';
      lectureData = {
        themeTitle: `${cleanTitle} の解法体系と要点ルール`,
        overview: `本テーマ「${cleanTitle}」に関する理論背景および出題パターンです。\n問題文の要件・条件を正確に把握し、公式定義や標準仕様と照らし合わせて選択肢を判定しましょう。`,
        comparisonTable: [
          {
            concept: '出題テーマの核心定義',
            mechanism: bodyText ? bodyText.slice(0, 70) + '...' : '問題文で問われている基本仕様・特徴です。',
            countermeasure: 'IPA公式シラバスの標準定義に基づき判定します。',
            keyPoint: '問題文のキーワードと公式定義の合致を確認。',
          },
          {
            concept: '正解選択肢の判定要件',
            mechanism: '設問の条件を満たす適切な記述。',
            countermeasure: '誤った前提や逆の役割を排除。',
            keyPoint: '主述関係とキーワードの役割の一致。',
          },
        ],
        examRules: [
          `【攻略ルール 1】 問題文「${cleanTitle}」で問われている核心仕様を正確に把握する。`,
          '【攻略ルール 2】 逆の役割や異なる技術用語と混同しないよう選択肢を精査する。',
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
