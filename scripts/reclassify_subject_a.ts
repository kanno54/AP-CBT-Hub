import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SyllabusKBUnit {
  code: string;
  name: string;
  objectives: string;
  concepts: string;
  comparisonPairs: { pair: string; keyDiff: string }[];
}

// Step B: IPA Official Range Default Mapping Expectations
function getRangeExpectedDomain(qNum: number): { category: string; l2Code: string; l3Code: string; label: string } {
  if (qNum >= 1 && qNum <= 10) {
    return { category: 'TECHNOLOGY', l2Code: 'TECH_ALG', l3Code: 'TECH_ALG_TREE', label: '基礎理論・アルゴリズム' };
  } else if (qNum >= 11 && qNum <= 25) {
    return { category: 'TECHNOLOGY', l2Code: 'TECH_ARCH', l3Code: 'TECH_ARCH_BCP', label: 'コンピュータシステム・構成要素' };
  } else if (qNum >= 26 && qNum <= 35) {
    return { category: 'TECHNOLOGY', l2Code: 'TECH_DB', l3Code: 'TECH_DB_NORM', label: 'データベース' };
  } else if (qNum >= 36 && qNum <= 45) {
    return { category: 'TECHNOLOGY', l2Code: 'TECH_NET', l3Code: 'TECH_NET_IP', label: 'ネットワーク' };
  } else if (qNum >= 46 && qNum <= 50) {
    return { category: 'TECHNOLOGY', l2Code: 'TECH_SEC', l3Code: 'TECH_SEC_THREAT', label: '情報セキュリティ' };
  } else if (qNum >= 51 && qNum <= 55) {
    return { category: 'MANAGEMENT', l2Code: 'MGMT_PM', l3Code: 'MGMT_PM_EVM', label: '開発技術・ソフトウェア設計' };
  } else if (qNum >= 56 && qNum <= 60) {
    return { category: 'MANAGEMENT', l2Code: 'MGMT_PM', l3Code: 'MGMT_PM_EVM', label: 'プロジェクトマネジメント' };
  } else if (qNum >= 61 && qNum <= 65) {
    return { category: 'MANAGEMENT', l2Code: 'MGMT_SM', l3Code: 'MGMT_PM_EVM', label: 'サービスマネジメント・システム監査' };
  } else if (qNum >= 66 && qNum <= 75) {
    return { category: 'STRATEGY', l2Code: 'STRAT_ST', l3Code: 'STRAT_ST_DX', label: '経営戦略・システム戦略' };
  } else {
    return { category: 'STRATEGY', l2Code: 'STRAT_ST', l3Code: 'STRAT_ST_DX', label: '企業活動・法務' };
  }
}

// Step A: RAG Semantic Context Matcher
function matchSyllabusKB(fullText: string, kbUnits: SyllabusKBUnit[]): { bestCode: string; score: number } {
  const textLower = fullText.toLowerCase();
  let bestCode = 'TECH_ALG_TREE';
  let maxScore = 0;

  for (const unit of kbUnits) {
    let score = 0;
    const keywords = (unit.concepts + ' ' + unit.objectives).toLowerCase().split(/[\s,、・/()]+/);
    for (const kw of keywords) {
      if (kw.length > 1 && textLower.includes(kw)) {
        score += 1;
      }
    }

    // Specific domain keyword boosts
    if (unit.code === 'TECH_SEC_CRYPTO' && (textLower.includes('署名') || textLower.includes('公開鍵') || textLower.includes('暗号') || textLower.includes('rsa') || textLower.includes('aes') || textLower.includes('鍵'))) {
      score += 8;
    } else if (unit.code === 'TECH_SEC_THREAT' && (textLower.includes('csrf') || textLower.includes('sqli') || textLower.includes('xss') || textLower.includes('ゼロトラスト') || textLower.includes('waf') || textLower.includes('脆弱性'))) {
      score += 8;
    } else if (unit.code === 'TECH_DB_NORM' && (textLower.includes('正規形') || textLower.includes('正規化') || textLower.includes('デッドロック') || textLower.includes('having') || textLower.includes('引き出'))) {
      score += 8;
    } else if (unit.code === 'TECH_ALG_TREE' && (textLower.includes('二分') || textLower.includes('計算量') || textLower.includes('スタック') || textLower.includes('キュー') || textLower.includes('ハッシュ') || textLower.includes('補数'))) {
      score += 8;
    } else if (unit.code === 'TECH_ARCH_BCP' && (textLower.includes('rto') || textLower.includes('rpo') || textLower.includes('raid') || textLower.includes('ライトバック') || textLower.includes('稼働率') || textLower.includes('割込み'))) {
      score += 8;
    } else if (unit.code === 'MGMT_PM_EVM' && (textLower.includes('evm') || textLower.includes('spi') || textLower.includes('cv') || textLower.includes('クリティカルパス') || textLower.includes('インシデント'))) {
      score += 8;
    } else if (unit.code === 'STRAT_ST_DX' && (textLower.includes('dx') || textLower.includes('変革') || textLower.includes('デジタイゼーション') || textLower.includes('swot') || textLower.includes('法務') || textLower.includes('著作権'))) {
      score += 8;
    }

    if (score > maxScore) {
      maxScore = score;
      bestCode = unit.code;
    }
  }

  return { bestCode, score: maxScore };
}

async function main() {
  console.log('===============================================================');
  console.log('【科目A過去問 カテゴリ分類・シラバス紐付け 一括再検証・修正】');
  console.log('===============================================================');

  // Load Syllabus KB
  const kbPath = path.join(process.cwd(), 'data', 'syllabus_knowledge_base.json');
  let kbUnits: SyllabusKBUnit[] = [];
  if (fs.existsSync(kbPath)) {
    kbUnits = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    console.log(`[Success] Loaded ${kbUnits.length} Syllabus KB Units.`);
  }

  // Fetch Syllabus Categories from DB
  const categories = await prisma.syllabusCategory.findMany();
  const catMapByCode: Record<string, string> = {};
  categories.forEach((cat) => {
    catMapByCode[cat.code] = cat.id;
  });

  // Fetch Subject A Questions
  const questions = await prisma.question.findMany({
    where: { examType: 'SUBJECT_A' },
    include: { choices: true },
    orderBy: { questionNum: 'asc' },
  });

  console.log(`[Info] Fetched ${questions.length} Subject A Questions from Database.\n`);

  // Summary Counters
  const summary: Record<string, Record<string, number>> = {
    TECHNOLOGY: {
      '基礎理論・アルゴリズム': 0,
      'コンピュータ構成要素・システム': 0,
      'データベース': 0,
      'ネットワーク': 0,
      'セキュリティ': 0,
      '開発技術': 0,
    },
    MANAGEMENT: {
      'プロジェクトマネジメント': 0,
      'サービスマネジメント': 0,
      'システム監査': 0,
    },
    STRATEGY: {
      '経営戦略・システム戦略': 0,
      '企業活動・法務': 0,
    },
  };

  let duplicateChoiceIssues = 0;
  let reclassifiedCount = 0;

  for (const q of questions) {
    const qNum = q.questionNum;
    const fullText = `${q.title} ${q.bodyText} ${q.explanation || ''} ${q.choices.map((c) => c.text).join(' ')}`;

    // 1. Choice Integrity Check
    const seenChoiceTexts = new Set<string>();
    for (const c of q.choices) {
      const trimmed = (c.text || '').trim();
      if (seenChoiceTexts.has(trimmed)) {
        duplicateChoiceIssues++;
        console.warn(`[WARNING Choice Duplicate] 問${qNum} 選択肢${c.symbol}: "${trimmed}"`);
      }
      seenChoiceTexts.add(trimmed);
    }

    // 2. Hybrid Classification (Step A Semantic + Step B Range)
    const rangeExpectation = getRangeExpectedDomain(qNum);
    const semanticMatch = matchSyllabusKB(fullText, kbUnits);

    let finalCategory = rangeExpectation.category;
    let finalL3Code = rangeExpectation.l3Code;
    let subCategoryLabel = rangeExpectation.label;

    // Direct Security Boost Check for Crypto / Threat questions
    if (semanticMatch.bestCode === 'TECH_SEC_CRYPTO' || semanticMatch.bestCode === 'TECH_SEC_THREAT') {
      finalCategory = 'TECHNOLOGY';
      finalL3Code = semanticMatch.bestCode;
      subCategoryLabel = 'セキュリティ';
    } else if (semanticMatch.bestCode === 'TECH_DB_NORM' && qNum >= 20 && qNum <= 35) {
      finalCategory = 'TECHNOLOGY';
      finalL3Code = 'TECH_DB_NORM';
      subCategoryLabel = 'データベース';
    } else if (semanticMatch.bestCode === 'TECH_NET_IP' && qNum >= 30 && qNum <= 45) {
      finalCategory = 'TECHNOLOGY';
      finalL3Code = 'TECH_NET_IP';
      subCategoryLabel = 'ネットワーク';
    } else if (semanticMatch.bestCode === 'MGMT_PM_EVM' && qNum >= 50 && qNum <= 65) {
      finalCategory = 'MANAGEMENT';
      finalL3Code = 'MGMT_PM_EVM';
      subCategoryLabel = qNum <= 55 ? 'プロジェクトマネジメント' : 'サービスマネジメント';
    } else if (semanticMatch.bestCode === 'STRAT_ST_DX' && qNum >= 60) {
      finalCategory = 'STRATEGY';
      finalL3Code = 'STRAT_ST_DX';
      subCategoryLabel = qNum >= 76 ? '企業活動・法務' : '経営戦略・システム戦略';
    }

    // Map syllabusCategoryId
    let syllabusCategoryId = catMapByCode[finalL3Code] || catMapByCode[rangeExpectation.l2Code];

    // Log if category or mapping changed
    if (q.category !== finalCategory || q.syllabusCategoryId !== syllabusCategoryId) {
      reclassifiedCount++;
      console.log(`[Reclassified Q${qNum}] ${q.category} -> ${finalCategory} | Code: ${finalL3Code} (${subCategoryLabel})`);
    }

    // Update Prisma DB
    await prisma.question.update({
      where: { id: q.id },
      data: {
        category: finalCategory,
        syllabusCategoryId: syllabusCategoryId,
      },
    });

    // Increment summary
    if (summary[finalCategory]) {
      if (summary[finalCategory][subCategoryLabel] !== undefined) {
        summary[finalCategory][subCategoryLabel]++;
      } else {
        summary[finalCategory][Object.keys(summary[finalCategory])[0]]++;
      }
    }
  }

  // Also update data/verified_2024_spring.json & data/questions_full.json
  const verifiedPath = path.join(process.cwd(), 'data', 'verified_2024_spring.json');
  const fullPath = path.join(process.cwd(), 'data', 'questions_full.json');

  if (fs.existsSync(verifiedPath)) {
    const raw = fs.readFileSync(verifiedPath, 'utf-8');
    const qList = JSON.parse(raw);
    for (const item of qList) {
      const exp = getRangeExpectedDomain(item.questionNum);
      item.category = exp.category;
    }
    fs.writeFileSync(verifiedPath, JSON.stringify(qList, null, 2), 'utf-8');
    fs.writeFileSync(fullPath, JSON.stringify(qList, null, 2), 'utf-8');
    console.log('[Success] Synchronized data/verified_2024_spring.json and questions_full.json.');
  }

  // Print Summary Output
  console.log('\n===============================================================');
  console.log('【科目A分野別・シラバス再検証 問題数内訳サマリー】');
  console.log('===============================================================');

  let techTotal = 0;
  console.log('■ 1. テクノロジ系 (TECHNOLOGY)');
  for (const [sub, cnt] of Object.entries(summary.TECHNOLOGY)) {
    console.log(`   ・${sub}: ${cnt} 問`);
    techTotal += cnt;
  }
  console.log(`   └─ テクノロジ系 計: ${techTotal} 問\n`);

  let mgmtTotal = 0;
  console.log('■ 2. マネジメント系 (MANAGEMENT)');
  for (const [sub, cnt] of Object.entries(summary.MANAGEMENT)) {
    console.log(`   ・${sub}: ${cnt} 問`);
    mgmtTotal += cnt;
  }
  console.log(`   └─ マネジメント系 計: ${mgmtTotal} 問\n`);

  let stratTotal = 0;
  console.log('■ 3. ストラテジ系 (STRATEGY)');
  for (const [sub, cnt] of Object.entries(summary.STRATEGY)) {
    console.log(`   ・${sub}: ${cnt} 問`);
    stratTotal += cnt;
  }
  console.log(`   └─ ストラテジ系 計: ${stratTotal} 問\n`);

  console.log('---------------------------------------------------------------');
  console.log(`★ 総合再判定問題数: ${questions.length} 問 (再設定: ${reclassifiedCount}件 / 選択肢重複異常: ${duplicateChoiceIssues}件)`);
  console.log('===============================================================\n');
}

main()
  .catch((e) => {
    console.error('Error during reclassification script execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
