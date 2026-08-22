import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedSyllabusMaster() {
  console.log('Seeding IPA Official Syllabus Master Hierarchy...');

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
      code: 'TECH_ARCH_BCP',
      level: 3,
      name: 'システム構成要素と信頼性',
      parentCode: 'TECH_ARCH',
      keywords: ['BCP', 'RTO', 'RPO', '目標復旧時間', '目標復旧時点', 'ホットスタンドバイ'],
    },
    {
      code: 'MGMT_PM_EVM',
      level: 3,
      name: 'プロジェクト進捗・コスト管理',
      parentCode: 'MGMT_PM',
      keywords: ['EVM', 'SPI', 'CPI', 'CV', 'PV', 'EV', 'AC', 'アーンドバリュー'],
    },
    {
      code: 'STRAT_ST_DX',
      level: 3,
      name: 'DX推進とビジネス変革',
      parentCode: 'STRAT_ST',
      keywords: ['DXガイドライン', 'デジタイゼーション', 'デジタライゼーション', '競争上の優位性'],
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
  console.log('Checking AP-CBT-Hub Database seed status...');

  const { l3Map, l2Map } = await seedSyllabusMaster();

  const fullDataPath = path.join(process.cwd(), 'data', 'questions_full.json');
  let questionsToLoad: any[] = [];

  if (fs.existsSync(fullDataPath)) {
    console.log(`Loading full AP exam dataset from ${fullDataPath}...`);
    const rawData = fs.readFileSync(fullDataPath, 'utf-8');
    questionsToLoad = JSON.parse(rawData);
  }

  if (questionsToLoad.length === 0) {
    console.log('No data/questions_full.json dataset found. Skipping question seeding.');
    return;
  }

  console.log('Cleaning up existing question records to prevent duplicates...');
  await prisma.userAnswer.deleteMany({});
  await prisma.modelAnswer.deleteMany({});
  await prisma.choice.deleteMany({});
  await prisma.question.deleteMany({});
  console.log('Database cleanup completed.');

  console.log(`Upserting ${questionsToLoad.length} AP past questions with Syllabus mapping...`);

  const summaryBySession: Record<string, number> = {};

  for (const qItem of questionsToLoad) {
    const { choices, modelAnswers, imageUrls, ...qInfo } = qItem;

    const sessionKey = `${qInfo.year}年 ${qInfo.season === 'SPRING' ? '春期' : '秋期'}`;
    if (qInfo.examType === 'SUBJECT_A') {
      summaryBySession[sessionKey] = (summaryBySession[sessionKey] || 0) + 1;
    }

    // Map syllabus category
    let syllabusCategoryId = l2Map['TECH_SEC'];
    const cat = (qInfo.category || '').toUpperCase();
    const qNum = qInfo.questionNum;

    if (qInfo.examType === 'SUBJECT_B') {
      syllabusCategoryId = l3Map['TECH_SEC_THREAT'];
    } else if (qNum === 1 || (qNum >= 31 && qNum <= 34)) {
      syllabusCategoryId = l3Map['TECH_SEC_CRYPTO'];
    } else if (qNum === 2 || (qNum >= 27 && qNum <= 30) || (qNum >= 35 && qNum <= 40)) {
      syllabusCategoryId = l3Map['TECH_SEC_THREAT'];
    } else if (qNum === 3 || (qNum >= 23 && qNum <= 26)) {
      syllabusCategoryId = l3Map['TECH_NET_IP'];
    } else if (qNum === 4 || qNum === 19 || qNum === 20 || qNum === 21 || qNum === 22) {
      syllabusCategoryId = l3Map['TECH_DB_NORM'];
    } else if (qNum === 5 || qNum === 9 || (qNum >= 41 && qNum <= 50)) {
      syllabusCategoryId = l3Map['TECH_ALG_TREE'];
    } else if (qNum === 6 || (qNum >= 10 && qNum <= 18)) {
      syllabusCategoryId = l3Map['TECH_ARCH_BCP'];
    } else if (qNum === 7 || (qNum >= 51 && qNum <= 55)) {
      syllabusCategoryId = l3Map['MGMT_PM_EVM'];
    } else if (qNum >= 56 && qNum <= 60) {
      syllabusCategoryId = l2Map['MGMT_SM'];
    } else if (qNum === 8 || (qNum >= 61 && qNum <= 70)) {
      syllabusCategoryId = l3Map['STRAT_ST_DX'];
    } else if (qNum >= 71 && qNum <= 80) {
      syllabusCategoryId = l2Map['STRAT_ST'];
    } else if (cat.includes('SEC')) {
      syllabusCategoryId = l2Map['TECH_SEC'];
    } else if (cat.includes('NET')) {
      syllabusCategoryId = l2Map['TECH_NET'];
    } else if (cat.includes('DB') || cat.includes('DATA')) {
      syllabusCategoryId = l2Map['TECH_DB'];
    } else if (cat.includes('ALG')) {
      syllabusCategoryId = l2Map['TECH_ALG'];
    } else if (cat.includes('PM') || cat.includes('PROJECT')) {
      syllabusCategoryId = l2Map['MGMT_PM'];
    } else if (cat.includes('STRAT')) {
      syllabusCategoryId = l2Map['STRAT_ST'];
    }

    const createdQ = await prisma.question.upsert({
      where: {
        year_season_examType_questionNum: {
          year: qInfo.year,
          season: qInfo.season,
          examType: qInfo.examType,
          questionNum: qInfo.questionNum,
        },
      },
      update: {
        ...qInfo,
        syllabusCategoryId,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      },
      create: {
        ...qInfo,
        syllabusCategoryId,
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : null,
      },
    });

    if (choices && choices.length > 0) {
      await prisma.choice.deleteMany({ where: { questionId: createdQ.id } });
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

    if (modelAnswers && modelAnswers.length > 0) {
      await prisma.modelAnswer.deleteMany({ where: { questionId: createdQ.id } });
      for (const ma of modelAnswers) {
        await prisma.modelAnswer.create({
          data: {
            questionId: createdQ.id,
            subQuestionNum: ma.subQuestionNum,
            questionText: ma.questionText,
            maxScore: ma.maxScore,
            characterLimit: ma.characterLimit,
            answerText: ma.answerText,
            explanation: ma.explanation,
          },
        });
      }
    }
  }

  console.log('\n==========================================');
  console.log('【年度別・科目A 登録問題数 DB投入結果】');
  console.log('==========================================');
  let totalSubjectA = 0;
  for (const [sess, count] of Object.entries(summaryBySession)) {
    console.log(`  ・${sess}: ${count} 問`);
    totalSubjectA += count;
  }
  console.log(`  ★ データベース総投入件数: ${questionsToLoad.length} 問 (うち科目A: ${totalSubjectA}問)`);
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('Error during database seed execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
