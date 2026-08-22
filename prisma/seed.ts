import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AP-CBT-Hub Database...');

  // Clean existing tables
  await prisma.userAnswer.deleteMany({});
  await prisma.choice.deleteMany({});
  await prisma.modelAnswer.deleteMany({});
  await prisma.question.deleteMany({});

  // 1. Subject A Questions
  const subjectAQuestions = [
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_A',
      questionNum: 1,
      category: 'SECURITY',
      title: '公開鍵暗号方式における暗号化と復号',
      bodyText: '送信者Aが受信者Bに暗号化された電子メールを送信する場合、送信者Aがメッセージの暗号化に使用する鍵として、最も適切なものはどれか。',
      choices: [
        { symbol: 'ア', text: '送信者Aの公開鍵', isCorrect: false },
        { symbol: 'イ', text: '送信者Aの秘密鍵', isCorrect: false },
        { symbol: 'ウ', text: '受信者Bの公開鍵', isCorrect: true },
        { symbol: 'エ', text: '受信者Bの秘密鍵', isCorrect: false },
      ],
    },
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_A',
      questionNum: 2,
      category: 'NETWORK',
      title: 'IPv6アドレスの表記規格と仕様',
      bodyText: 'IPv6のアドレス表現形式および特徴に関する記述のうち、最も適切なものはどれか。',
      choices: [
        { symbol: 'ア', text: '128ビット長のアドレスを16ビットごとにコロン(:)で区切り、16進数で表記する。', isCorrect: true },
        { symbol: 'イ', text: '32ビット長のアドレスを8ビットごとにドット(.)で区切り、10進数で表記する。', isCorrect: false },
        { symbol: 'ウ', text: 'アドレス空間はIPv4の2倍の大きさを持つ。', isCorrect: false },
        { symbol: 'エ', text: 'ブロードキャスト通信が標準で必須機能としてサポートされている。', isCorrect: false },
      ],
    },
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_A',
      questionNum: 3,
      category: 'DATABASE',
      title: 'リレーショナルデータベースの第3正規形',
      bodyText: '第3正規形に関する記述として、最も適切なものはどれか。',
      choices: [
        { symbol: 'ア', text: 'すべての非キー属性が主キーに対して完全関数従属し、かつ推移的関数従属が存在しない状態。', isCorrect: true },
        { symbol: 'イ', text: '繰り返し群が取り除かれ、単一値のみが格納されている状態。', isCorrect: false },
        { symbol: 'ウ', text: 'すべての非キー属性が主キーに対して部分関数従属している状態。', isCorrect: false },
        { symbol: 'エ', text: '主キー以外の属性間にのみ関数従属が存在する状態。', isCorrect: false },
      ],
    },
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_A',
      questionNum: 4,
      category: 'ALGORITHM',
      title: '平衡二分探索木の計算量',
      bodyText: '要素数がNである平衡二分探索木において、特定の値を探索する際の平均時間複雑度はどれか。',
      choices: [
        { symbol: 'ア', text: 'O(1)', isCorrect: false },
        { symbol: 'イ', text: 'O(log N)', isCorrect: true },
        { symbol: 'ウ', text: 'O(N)', isCorrect: false },
        { symbol: 'エ', text: 'O(N log N)', isCorrect: false },
      ],
    },
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_A',
      questionNum: 5,
      category: 'PROJECT_MGMT',
      title: 'EVM(Earned Value Management)におけるコスト分散(CV)',
      bodyText: 'アーンドバリューマネジメント(EVM)において、アーンドバリュー(EV)が100万円、アクチュアルコスト(AC)が120万円、プランドバリュー(PV)が110万円であるとき、コスト分散(CV = EV - AC)は何万円か。',
      choices: [
        { symbol: 'ア', text: '-20', isCorrect: true },
        { symbol: 'イ', text: '-10', isCorrect: false },
        { symbol: 'ウ', text: '10', isCorrect: false },
        { symbol: 'エ', text: '20', isCorrect: false },
      ],
    },
    {
      year: 2024,
      season: 'AUTUMN',
      examType: 'SUBJECT_A',
      questionNum: 6,
      category: 'SYSTEM_ARCH',
      title: 'RTOとRPOの定義',
      bodyText: '事業継続計画(BCP)における目標復旧時間(RTO)と目標復旧時点(RPO)に関する記述のうち、最も適切なものはどれか。',
      choices: [
        { symbol: 'ア', text: 'RTOはシステム障害発生時に許容できるデータの最新性(データ損失量)を示す。', isCorrect: false },
        { symbol: 'イ', text: 'RTOは業務中断からシステムが再開するまでの許容経過時間を示す。', isCorrect: true },
        { symbol: 'ウ', text: 'RPOは復旧処理にかかる目標作業時間を示す。', isCorrect: false },
        { symbol: 'エ', text: 'RPOがゼロであれば復旧完了までに時間制限がないことを意味する。', isCorrect: false },
      ],
    },
    {
      year: 2024,
      season: 'AUTUMN',
      examType: 'SUBJECT_A',
      questionNum: 7,
      category: 'STRATEGY',
      title: 'デジタルトランスフォーメーション (DX)',
      bodyText: '経済産業省が策定した「DX推進ガイドライン」において定義されているDXの意味として、最も適切なものはどれか。',
      choices: [
        { symbol: 'ア', text: '既存システムを最新クラウドインフラへ移行し、保守運用コストを削減すること。', isCorrect: false },
        { symbol: 'イ', text: 'データとデジタル技術を活用して、製品やサービス、ビジネスモデルを変換し、競争上の優位性を確立すること。', isCorrect: true },
        { symbol: 'ウ', text: '社内業務の紙書類をすべてPDF化し、ペーパーレス環境を完了すること。', isCorrect: false },
        { symbol: 'エ', text: '基幹系システム(ERP)のパッケージソフトウェアを導入すること。', isCorrect: false },
      ],
    },
  ];

  for (const qData of subjectAQuestions) {
    const { choices, ...qInfo } = qData;
    const createdQ = await prisma.question.create({
      data: qInfo,
    });
    for (const c of choices) {
      await prisma.choice.create({
        data: {
          questionId: createdQ.id,
          symbol: c.symbol,
          text: c.text,
          isCorrect: c.isCorrect,
        },
      });
    }
  }

  // 2. Subject B Questions
  const subjectBQuestions = [
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_B',
      questionNum: 1,
      category: 'SECURITY',
      title: 'Webアプリケーション認証強化とセキュリティ設計',
      bodyText: `### [問題概要]
ECサイトを運営するX社では、近年多発する認証バイパスおよびSQLインジェクション攻撃への対策として、認証・認可基盤の見直しを行っている。

#### [システムの現状と指摘事項]
1. ユーザー認証には従来のセッションID方式を採用しており、CookieにセッションIDを保存している。
2. Cookie属性には \`HttpOnly\` は設定されているが、 \`SameSite\` 属性および \`Secure\` 属性が未設定となっている。
3. DBアクセス層において、一部の検索処理で文字列結合による動的SQL生成を行っている箇所が判明した。

#### [攻撃シナリオ分析]
セキュリティ診断チームの報告によると、悪意ある第三者がターゲットユーザーのブラウザ上で不正なリクエストを送信させ、意図しない送金や登録変更を実行させるリスク(リスクA)が指摘された。
また、ログインフォームの入力値に特定の特殊文字を挿入することで、データベース内の全顧客情報を不正取得されるリスク(リスクB)も確認された。

以下の各設問に答えなさい。`,
      modelAnswers: [
        {
          subQuestionNum: '設問1 (1)',
          maxScore: 10,
          characterLimit: 35,
          answerText: 'クロスサイトリクエストフォージェリ (CSRF)',
          explanation: '他サイトから悪意あるリクエストを送信させる攻撃手法の名前を答えます。',
        },
        {
          subQuestionNum: '設問1 (2)',
          maxScore: 10,
          characterLimit: 40,
          answerText: 'プレースホルダを用いたプレペアードステートメントを使用する。',
          explanation: 'SQLインジェクション防止のためのデータベースアクセス層の根本的な対策です。',
        },
        {
          subQuestionNum: '設問2',
          maxScore: 15,
          characterLimit: 50,
          answerText: 'CookieにSameSite=Strict属性およびSecure属性を付与して送信を制限する。',
          explanation: 'リスクA（CSRF攻撃）に対するCookie属性における具体的な設定対策を記述します。',
        },
      ],
    },
    {
      year: 2025,
      season: 'SPRING',
      examType: 'SUBJECT_B',
      questionNum: 2,
      category: 'DATABASE',
      title: '大規模分散データベースのデッドロック回避とロック制御',
      bodyText: `### [システム構成と背景]
Y社はマルチリージョンで稼働するマイクロサービスアーキテクチャを採用している。
在庫管理サービスでは、商品購入に伴う在庫数の減算処理においてトランザクション制御を行っている。

#### [発生した障害]
アクセス集中時に特定商品の購入要求が同時に多数発生した際、複数トランザクション間でデッドロックが発生し、システム全体が応答停止する事態が発生した。

| トランザクション | 処理順序 | 対象リソース | 保持ロック | 要求ロック |
| --- | --- | --- | --- | --- |
| TX-A | 1 → 2 | 商品マスター → 在庫テーブル | 商品マスター(排他) | 在庫テーブル(排他) |
| TX-B | 1 → 2 | 在庫テーブル → 商品マスター | 在庫テーブル(排他) | 商品マスター(排他) |

分析の結果、トランザクション間でリソースにアクセスする順番が統一されていないことが原因と特定された。

以下の各設問に答えなさい。`,
      modelAnswers: [
        {
          subQuestionNum: '設問1',
          maxScore: 12,
          characterLimit: 45,
          answerText: 'すべてのトランザクションでリソースへのアクセス順番を統一する。',
          explanation: 'デッドロック発生を防止するためのアクセス順序に関する根本的ルールです。',
        },
        {
          subQuestionNum: '設問2',
          maxScore: 18,
          characterLimit: 50,
          answerText: '悲観的ロックから楽観的ロックに変更し、バージョン番号による衝突検知を行う。',
          explanation: '高コンテンション環境でのデッドロック回避策です。',
        },
      ],
    },
  ];

  for (const qData of subjectBQuestions) {
    const { modelAnswers, ...qInfo } = qData;
    const createdQ = await prisma.question.create({
      data: qInfo,
    });
    for (const ma of modelAnswers) {
      await prisma.modelAnswer.create({
        data: {
          questionId: createdQ.id,
          subQuestionNum: ma.subQuestionNum,
          maxScore: ma.maxScore,
          characterLimit: ma.characterLimit,
          answerText: ma.answerText,
          explanation: ma.explanation,
        },
      });
    }
  }

  // 3. Create Sample User Answer History for Initial Analytics
  const qList = await prisma.question.findMany({ include: { choices: true } });
  
  if (qList.length > 0) {
    const q1 = qList.find((q) => q.questionNum === 1 && q.examType === 'SUBJECT_A');
    if (q1) {
      await prisma.userAnswer.create({
        data: {
          questionId: q1.id,
          selectedSymbol: 'ウ',
          isCorrect: true,
          timeSpentSec: 42,
          notes: '公開鍵暗号の送信者・受信者の鍵役割の整理要。',
        },
      });
    }

    const q2 = qList.find((q) => q.questionNum === 2 && q.examType === 'SUBJECT_A');
    if (q2) {
      await prisma.userAnswer.create({
        data: {
          questionId: q2.id,
          selectedSymbol: 'イ',
          isCorrect: false, // Incorrect answer (<60% accuracy)
          timeSpentSec: 65,
          notes: 'IPv6は128ビット、コロン区切り16進数！',
        },
      });
    }

    const q3 = qList.find((q) => q.questionNum === 3 && q.examType === 'SUBJECT_A');
    if (q3) {
      await prisma.userAnswer.create({
        data: {
          questionId: q3.id,
          selectedSymbol: 'ア',
          isCorrect: true,
          timeSpentSec: 38,
        },
      });
    }
  }

  console.log('Database Seeding Completed Successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
