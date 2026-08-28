import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getTextbookReferenceForCategory, TextbookReference } from '@/lib/textbook';

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
  textbookReference?: TextbookReference;
}

interface SyllabusKBUnit {
  code: string;
  name: string;
  objectives: string;
  concepts: string;
  comparisonPairs: { pair: string; keyDiff: string }[];
}

// Load Syllabus Knowledge Base dynamically
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

  // Fallback default KB structure if file reading fails
  return [
    {
      code: 'TECH_SEC_CRYPTO',
      name: '暗号技術・鍵管理・PKI認証基盤',
      objectives: '公開鍵暗号、共通鍵暗号、デジタル署名、PKI(公開鍵基盤)の仕組みと鍵管理手順を正しく理解する。',
      concepts: 'RSA, AES, デジタル署名, 秘密鍵, 公開鍵, FIDO2/パスキー認証',
      comparisonPairs: [
        {
          pair: 'デジタル署名の生成 vs 検証',
          keyDiff: '署名生成は『送信者の秘密鍵』で暗号化。署名検証は『送信者の公開鍵』で復号照合。',
        },
        {
          pair: 'メッセージ暗号化 vs 復号',
          keyDiff: '暗号化は『受信者の公開鍵』で実施。復号は『受信者の秘密鍵』で実施。',
        },
      ],
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, theme = '', bodyText = '', modelAnswer = '' } = body;

    let dbCategory = '';
    let dbTitle = '';
    let dbBodyText = bodyText;
    let choicesText = '';

    // 1. Retrieve Question from DB if questionId is supplied
    if (questionId) {
      try {
        const qRecord = await prisma.question.findUnique({
          where: { id: questionId },
          include: { choices: true },
        });
        if (qRecord) {
          dbCategory = (qRecord.category || '').toUpperCase();
          dbTitle = qRecord.title || '';
          dbBodyText = qRecord.bodyText || bodyText;
          if (qRecord.choices && qRecord.choices.length > 0) {
            choicesText = qRecord.choices.map((c) => `${c.symbol}. ${c.text}`).join(' ');
          }
        }
      } catch (dbErr) {
        // Fallback to request params
      }
    }

    const fullContext = (theme + ' ' + dbTitle + ' ' + dbBodyText + ' ' + modelAnswer + ' ' + choicesText).toLowerCase();

    // 2. Perform RAG Semantic Matching against Syllabus Knowledge Base
    const kb = loadSyllabusKB();
    let bestUnit = kb[0];
    let maxScore = 0;

    for (const unit of kb) {
      let score = 0;
      const unitText = (unit.name + ' ' + unit.concepts + ' ' + unit.objectives).toLowerCase();
      const keywords = unitText.split(/[\s,、・/()]+/);

      for (const kw of keywords) {
        if (kw.length > 1 && fullContext.includes(kw)) {
          score += 1;
        }
      }

      // Domain-specific RAG scoring boosts
      if (unit.code === 'TECH_SEC_CRYPTO' && (fullContext.includes('署名') || fullContext.includes('公開鍵') || fullContext.includes('暗号') || fullContext.includes('鍵'))) {
        score += 8;
      } else if (unit.code === 'TECH_SEC_THREAT' && (fullContext.includes('csrf') || fullContext.includes('sqli') || fullContext.includes('xss') || fullContext.includes('ゼロトラスト'))) {
        score += 8;
      } else if (unit.code === 'TECH_DB_NORM' && (fullContext.includes('正規形') || fullContext.includes('正規化') || fullContext.includes('デッドロック') || fullContext.includes('having'))) {
        score += 8;
      } else if (unit.code === 'TECH_ALG_TREE' && (fullContext.includes('二分') || fullContext.includes('計算量') || fullContext.includes('スタック') || fullContext.includes('キュー') || fullContext.includes('ハッシュ'))) {
        score += 8;
      } else if (unit.code === 'TECH_ARCH_BCP' && (fullContext.includes('rto') || fullContext.includes('rpo') || fullContext.includes('raid') || fullContext.includes('稼働率'))) {
        score += 8;
      } else if (unit.code === 'MGMT_PM_EVM' && (fullContext.includes('evm') || fullContext.includes('spi') || fullContext.includes('cv') || fullContext.includes('インシデント'))) {
        score += 8;
      } else if (unit.code === 'STRAT_ST_DX' && (fullContext.includes('dx') || fullContext.includes('デジタイゼーション') || fullContext.includes('変革') || fullContext.includes('swot'))) {
        score += 8;
      }

      if (score > maxScore) {
        maxScore = score;
        bestUnit = unit;
      }
    }

    // 3. Dynamically Construct RAG Lecture Output
    const cleanTitle = dbTitle || theme || bestUnit.name;

    // Build RAG comparison table dynamically from RAG unit comparison pairs and question context
    const comparisonTable: ComparisonRow[] = bestUnit.comparisonPairs.map((pairItem) => {
      const parts = pairItem.pair.split(' vs ');
      const conceptA = parts[0] || pairItem.pair;
      const conceptB = parts[1] || '対照概念';

      return {
        concept: pairItem.pair,
        mechanism: `${conceptA}と${conceptB}における技術仕様・動作原理の対比。`,
        countermeasure: pairItem.keyDiff,
        keyPoint: `IPA試験では「${conceptA}」と「${conceptB}」の適用条件の違いが急所。`,
      };
    });

    // Add specific problem context row if relevant
    if (dbBodyText) {
      comparisonTable.unshift({
        concept: `本問の核心テーマ (${cleanTitle.slice(0, 30)})`,
        mechanism: dbBodyText.slice(0, 75) + '...',
        countermeasure: `IPAシラバス到達目標: ${bestUnit.objectives.slice(0, 60)}...`,
        keyPoint: '本問の選択肢判定および模範解答記述における最重要照合ポイント。',
      });
    }

    // Dynamic Exam Rules from RAG Syllabus Knowledge Unit
    const examRules = [
      `【IPAシラバス到達目標】 『${bestUnit.objectives}』`,
      ...bestUnit.comparisonPairs.map((p) => `【出題の定石: ${p.pair}】 ${p.keyDiff}`),
    ];

    // Textbook reference lookup
    const textbookReference = getTextbookReferenceForCategory(bestUnit.code, bestUnit.name);

    const lectureData: SystematicLectureData = {
      themeTitle: `🎓 ${cleanTitle} （シラバス分類: ${bestUnit.name}）`,
      overview: `【IPA公式シラバス RAG体系講義】\n■ 対象分野: ${bestUnit.name} (${bestUnit.code})\n■ 到達目標: ${bestUnit.objectives}\n\n■ 体系要約:\n${bestUnit.concepts} に関する知識が問われています。本問題の文脈とシラバス定石知識を複合的に理解することで、類似問題にも対応できる本質的な解法力を養成します。`,
      comparisonTable,
      examRules,
      textbookReference,
    };

    return NextResponse.json({
      success: true,
      data: lectureData,
    });
  } catch (error: any) {
    console.error('Systematic Lecture RAG API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
