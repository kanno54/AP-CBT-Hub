import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('====================================================');
  console.log('【DB初期化】 既存過去問・解答データの完全クリア処理');
  console.log('====================================================');

  await prisma.userAnswer.deleteMany({});
  await prisma.modelAnswer.deleteMany({});
  await prisma.choice.deleteMany({});
  await prisma.question.deleteMany({});

  console.log('既存データを全件消去（完全初期化）完了。');
}

async function seedSyllabusMaster() {
  console.log('IPA Official Syllabus Master Hierarchy をシード中...');

  // Level 1: 大分類
  const level1Data = [
    { code: 'TECH', level: 1, name: 'テクノロジ系', parentId: null },
    { code: 'MGMT', level: 1, name: 'マネジメント系', parentId: null },
    { code: 'STRAT', level: 1, name: 'ストラテジ系', parentId: null },
  ];

  const l1Map: Record<string, string> = {};
  for (const item of level1Data) {
    const created = await prisma.syllabusCategory.upsert({
      where: { code: item.code },
      update: { name: item.name, level: item.level },
      create: { code: item.code, name: item.name, level: item.level },
    });
    l1Map[item.code] = created.id;
  }

  // Level 2: 中分類
  const level2Data = [
    { code: 'TECH_SEC', level: 2, name: 'セキュリティ', parentCode: 'TECH' },
    { code: 'TECH_NET', level: 2, name: 'ネットワーク', parentCode: 'TECH' },
    { code: 'TECH_DB', level: 2, name: 'データベース', parentCode: 'TECH' },
    { code: 'TECH_ALG', level: 2, name: '基礎理論・アルゴリズム', parentCode: 'TECH' },
    { code: 'TECH_ARCH', level: 2, name: 'コンピュータ構成要素・システムアーキテクチャ', parentCode: 'TECH' },
    { code: 'MGMT_PM', level: 2, name: 'プロジェクトマネジメント', parentCode: 'MGMT' },
    { code: 'MGMT_SM', level: 2, name: 'サービスマネジメント', parentCode: 'MGMT' },
    { code: 'STRAT_ST', level: 2, name: '経営戦略マネジメント・DX', parentCode: 'STRAT' },
  ];

  const l2Map: Record<string, string> = {};
  for (const item of level2Data) {
    const parentId = l1Map[item.parentCode];
    const created = await prisma.syllabusCategory.upsert({
      where: { code: item.code },
      update: { name: item.name, level: item.level, parentId },
      create: { code: item.code, name: item.name, level: item.level, parentId },
    });
    l2Map[item.code] = created.id;
  }

  // Level 3: 小分類 & Keywords
  const level3Data = [
    {
      code: 'TECH_THEORY_ALGO',
      level: 3,
      name: '基礎理論と離散数学',
      parentCode: 'TECH_ALG',
      keywords: ['2進数', '補数', '浮動小数点', '離散数学', '集合', '論理演算'],
    },
    {
      code: 'TECH_SEC_CRYPTO',
      level: 3,
      name: '暗号技術と鍵管理',
      parentCode: 'TECH_SEC',
      keywords: ['公開鍵暗号', 'RSA', '共通鍵暗号', 'AES', 'デジタル署名', '秘密鍵', '公開鍵'],
    },
    {
      code: 'TECH_SEC_THREAT',
      level: 3,
      name: '攻撃手法とWeb脆弱性対策',
      parentCode: 'TECH_SEC',
      keywords: ['CSRF', 'SQLインジェクション', 'XSS', 'ゼロトラスト', 'SameSite属性', 'Secure属性', 'プレペアードステートメント'],
    },
    {
      code: 'TECH_NET_IP',
      level: 3,
      name: 'ネットワークプロトコルと通信体系',
      parentCode: 'TECH_NET',
      keywords: ['IPv6', 'IPv4', 'サブネットマスク', 'IPsec', 'マルチキャスト'],
    },
    {
      code: 'TECH_DB_NORM',
      level: 3,
      name: 'DB正規化理論と排他制御',
      parentCode: 'TECH_DB',
      keywords: ['第1正規形', '第2正規形', '第3正規形', '関数従属', '推移的関数従属', 'デッドロック', '排他ロック'],
    },
    {
      code: 'TECH_ALG_TREE',
      level: 3,
      name: 'データ構造と探索計算量',
      parentCode: 'TECH_ALG',
      keywords: ['平衡二分探索木', 'AVL木', '赤黒木', 'ハッシュテーブル', 'O(log N)', 'O(1)', 'O(N)'],
    },
    {
      code: 'TECH_ARCH',
      level: 3,
      name: 'プロセッサとコンピュータ構成要素',
      parentCode: 'TECH_ARCH',
      keywords: ['CPU', 'クロック周波数', 'キャッシュメモリ', 'パイプライン', '主記憶'],
    },
    {
      code: 'TECH_ARCH_BCP',
      level: 3,
      name: 'システム構成要素と信頼性',
      parentCode: 'TECH_ARCH',
      keywords: ['BCP', 'RTO', 'RPO', '目標復旧時間', '目標復旧時点', 'ホットスタンドバイ', 'RAID', 'デュプレックス'],
    },
    {
      code: 'MGMT_PM_EVM',
      level: 3,
      name: 'プロジェクト進捗・コスト管理',
      parentCode: 'MGMT_PM',
      keywords: ['EVM', 'SPI', 'CPI', 'CV', 'PV', 'EV', 'AC', 'アーンドバリュー'],
    },
    {
      code: 'MGMT_SM_SERVICE',
      level: 3,
      name: 'サービスマネジメントと運用',
      parentCode: 'MGMT_SM',
      keywords: ['ITIL', 'SLA', 'インシデント管理', '問題管理', 'ファシリティマネジメント'],
    },
    {
      code: 'STRAT_ST_DX',
      level: 3,
      name: 'DX推進とビジネス変革',
      parentCode: 'STRAT_ST',
      keywords: ['DXガイドライン', 'デジタイゼーション', 'デジタライゼーション', 'SWOT分析', 'PPM', 'BSC'],
    },
    {
      code: 'STRAT_LEGAL',
      level: 3,
      name: '企業活動と関連法規',
      parentCode: 'STRAT_ST',
      keywords: ['著作権法', '不正アクセス禁止法', '労働基準法', '標準化'],
    },
  ];

  const l3Map: Record<string, string> = {};
  for (const item of level3Data) {
    const parentId = l2Map[item.parentCode];
    const created = await prisma.syllabusCategory.upsert({
      where: { code: item.code },
      update: { name: item.name, level: item.level, parentId },
      create: { code: item.code, name: item.name, level: item.level, parentId },
    });
    l3Map[item.code] = created.id;

    // Seed Keywords
    await prisma.syllabusKeyword.deleteMany({ where: { categoryId: created.id } });
    for (const kw of item.keywords) {
      await prisma.syllabusKeyword.create({
        data: { name: kw, categoryId: created.id },
      });
    }
  }

  console.log('IPA Syllabus Master Hierarchy Seeded Successfully!');
  return { l1Map, l2Map, l3Map };
}

async function main() {
  await resetDatabase();
  const { l3Map } = await seedSyllabusMaster();

  // Load verified textbook questions
  const tbDataPath = path.join(process.cwd(), 'data', 'textbook_questions.json');
  if (!fs.existsSync(tbDataPath)) {
    console.error('ERROR: data/textbook_questions.json not found! Run scripts/import_textbook_questions.py first.');
    return;
  }

  const raw = fs.readFileSync(tbDataPath, 'utf-8');
  const questions: any[] = JSON.parse(raw);
  console.log(`Loaded ${questions.length} verified textbook questions from data/textbook_questions.json.`);

  const chapterCounts: Record<string, number> = {};
  const insertedQuestions: any[] = [];

  for (const q of questions) {
    const code = q.syllabusCategoryCode || 'TECH_THEORY_ALGO';
    let categoryId = l3Map[code];

    if (!categoryId) {
      // Fallback matching
      if (code.includes('SEC')) categoryId = l3Map['TECH_SEC_THREAT'];
      else if (code.includes('DB')) categoryId = l3Map['TECH_DB_NORM'];
      else if (code.includes('NET')) categoryId = l3Map['TECH_NET_IP'];
      else if (code.includes('ARCH')) categoryId = l3Map['TECH_ARCH'];
      else if (code.includes('PM')) categoryId = l3Map['MGMT_PM_EVM'];
      else if (code.includes('SM')) categoryId = l3Map['MGMT_SM_SERVICE'];
      else if (code.includes('STRAT')) categoryId = l3Map['STRAT_ST_DX'];
      else if (code.includes('LEGAL')) categoryId = l3Map['STRAT_LEGAL'];
      else categoryId = l3Map['TECH_THEORY_ALGO'];
    }

    const created = await prisma.question.create({
      data: {
        year: q.year,
        season: q.season,
        examType: q.examType || 'SUBJECT_A',
        questionNum: q.questionNum,
        category: q.category || 'TECHNOLOGY',
        syllabusCategoryId: categoryId,
        title: q.title,
        bodyText: q.bodyText,
        explanation: q.explanation,
        choices: {
          create: q.choices.map((c: any) => ({
            symbol: c.symbol,
            text: c.text,
            isCorrect: c.isCorrect,
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    const cKey = `第${q.chapterNum}章 ${q.chapterTitle}`;
    chapterCounts[cKey] = (chapterCounts[cKey] || 0) + 1;
    insertedQuestions.push({ ...created, chapterNum: q.chapterNum, chapterTitle: q.chapterTitle });
  }

  console.log('\n====================================================');
  console.log('【DB投入結果】 登録された章別の問題数一覧');
  console.log('====================================================');
  for (const [chap, count] of Object.entries(chapterCounts)) {
    console.log(`  - ${chap}: ${count} 問`);
  }
  console.log(`  ----------------------------------`);
  console.log(`  計: ${insertedQuestions.length} 問 登録完了`);

  console.log('\n====================================================');
  console.log('【目視確認ログ】 第1章・第2章のサンプル問題照合');
  console.log('====================================================');

  const ch1Samples = insertedQuestions.filter((q) => q.chapterNum === 1).slice(0, 2);
  const ch2Samples = insertedQuestions.filter((q) => q.chapterNum === 2).slice(0, 2);

  for (const [idx, q] of [...ch1Samples, ...ch2Samples].entries()) {
    console.log(`\n--- サンプル問題 ${idx + 1} (第${q.chapterNum}章: ${q.title}) ---`);
    console.log(`【問題文冒頭】: ${q.bodyText.slice(0, 100)}...`);
    console.log(`【選択肢 (計${q.choices.length}件)】:`);
    for (const c of q.choices) {
      console.log(`  ${c.symbol}. ${c.text} ${c.isCorrect ? ' (★正解)' : ''}`);
    }
    const correctChoice = q.choices.find((c: any) => c.isCorrect);
    console.log(`【判定正解】: ${correctChoice ? correctChoice.symbol : '未確定'}`);
    console.log(`【解説冒頭】: ${q.explanation ? q.explanation.slice(0, 120).replace(/\n/g, ' ') : ''}...`);
  }

  console.log('\nデータベースの再構築・検証が正常に完了しました！');
}

main()
  .catch((e) => {
    console.error('Seeding process failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
