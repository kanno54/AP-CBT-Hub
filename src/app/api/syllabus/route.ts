import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTextbookReferenceForCategory, loadTextbookToc } from '@/lib/textbook';

function getFallbackSyllabusTree() {
  const toc = loadTextbookToc();
  const level1Map: Record<string, any> = {
    TECH: { id: 'l1-tech', code: 'TECH', level: 1, name: 'テクノロジ系', children: [], _count: { questions: 60 } },
    MGMT: { id: 'l1-mgmt', code: 'MGMT', level: 1, name: 'マネジメント系', children: [], _count: { questions: 25 } },
    STRAT: { id: 'l1-strat', code: 'STRAT', level: 1, name: 'ストラテジ系', children: [], _count: { questions: 40 } },
  };

  const level2Map: Record<string, any> = {
    TECH_ALG: { id: 'l2-alg', code: 'TECH_ALG', level: 2, name: '基礎理論・アルゴリズム', parentCode: 'TECH', children: [], keywords: [], _count: { questions: 15 } },
    TECH_ARCH: { id: 'l2-arch', code: 'TECH_ARCH', level: 2, name: 'コンピュータ構成要素・システムアーキテクチャ', parentCode: 'TECH', children: [], keywords: [], _count: { questions: 15 } },
    TECH_DB: { id: 'l2-db', code: 'TECH_DB', level: 2, name: 'データベース', parentCode: 'TECH', children: [], keywords: [], _count: { questions: 15 } },
    TECH_NET: { id: 'l2-net', code: 'TECH_NET', level: 2, name: 'ネットワーク', parentCode: 'TECH', children: [], keywords: [], _count: { questions: 15 } },
    TECH_SEC: { id: 'l2-sec', code: 'TECH_SEC', level: 2, name: 'セキュリティ', parentCode: 'TECH', children: [], keywords: [], _count: { questions: 15 } },
    MGMT_PM: { id: 'l2-pm', code: 'MGMT_PM', level: 2, name: 'プロジェクトマネジメント', parentCode: 'MGMT', children: [], keywords: [], _count: { questions: 15 } },
    MGMT_SM: { id: 'l2-sm', code: 'MGMT_SM', level: 2, name: 'サービスマネジメント', parentCode: 'MGMT', children: [], keywords: [], _count: { questions: 10 } },
    STRAT_ST: { id: 'l2-st', code: 'STRAT_ST', level: 2, name: '経営戦略マネジメント・DX', parentCode: 'STRAT', children: [], keywords: [], _count: { questions: 40 } },
  };

  for (const chap of toc.chapters) {
    for (const sec of chap.sections) {
      const code = sec.syllabusCategoryCode || 'TECH_THEORY_ALGO';
      let parentKey = 'TECH_ALG';

      if (code.includes('SEC')) parentKey = 'TECH_SEC';
      else if (code.includes('NET')) parentKey = 'TECH_NET';
      else if (code.includes('DB')) parentKey = 'TECH_DB';
      else if (code.includes('ARCH')) parentKey = 'TECH_ARCH';
      else if (code.includes('PM')) parentKey = 'MGMT_PM';
      else if (code.includes('SM') || code.includes('AUDIT')) parentKey = 'MGMT_SM';
      else if (code.includes('STRAT') || code.includes('LEGAL') || code.includes('CORP')) parentKey = 'STRAT_ST';

      const l3Node = {
        id: `l3-${sec.sectionNum}`,
        code: sec.syllabusCategoryCode,
        level: 3,
        name: `${sec.sectionNum} ${sec.title}`,
        keywords: (sec.keywords || []).map((k, i) => ({ id: `kw-${i}`, name: k })),
        textbookRef: getTextbookReferenceForCategory(sec.syllabusCategoryCode, sec.title),
        _count: { questions: 10 },
      };

      if (level2Map[parentKey]) {
        level2Map[parentKey].children.push(l3Node);
      }
    }
  }

  for (const l2 of Object.values(level2Map)) {
    const parentCode = l2.parentCode;
    if (level1Map[parentCode]) {
      level1Map[parentCode].children.push(l2);
    }
  }

  return Object.values(level1Map);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      try {
        const category = await prisma.syllabusCategory.findUnique({
          where: { code },
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
            keywords: true,
            questions: true,
          },
        });

        if (category) {
          const textbookRef = getTextbookReferenceForCategory(category.code, category.name);
          return NextResponse.json({ success: true, data: { ...category, textbookRef } });
        }
      } catch (e) {
        // Fallback
      }

      const textbookRef = getTextbookReferenceForCategory(code);
      return NextResponse.json({
        success: true,
        data: {
          code,
          name: code,
          level: 3,
          keywords: [],
          questions: [],
          textbookRef,
        },
      });
    }

    let syllabusTree: any[] = [];
    try {
      syllabusTree = await prisma.syllabusCategory.findMany({
        where: { level: 1 },
        include: {
          children: {
            include: {
              children: {
                include: {
                  keywords: true,
                  _count: {
                    select: { questions: true },
                  },
                },
              },
              keywords: true,
              _count: {
                select: { questions: true },
              },
            },
          },
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { code: 'asc' },
      });
    } catch (dbErr) {
      console.warn('Prisma DB syllabus query failed, using fallback:', dbErr);
      syllabusTree = [];
    }

    if (syllabusTree.length === 0) {
      const fallbackTree = getFallbackSyllabusTree();
      return NextResponse.json({ success: true, data: fallbackTree });
    }

    const enrichedTree = syllabusTree.map((l1) => ({
      ...l1,
      children: l1.children.map((l2: any) => ({
        ...l2,
        textbookRef: getTextbookReferenceForCategory(l2.code, l2.name),
        children: l2.children.map((l3: any) => ({
          ...l3,
          textbookRef: getTextbookReferenceForCategory(l3.code, l3.name),
        })),
      })),
    }));

    return NextResponse.json({ success: true, data: enrichedTree });
  } catch (error: any) {
    console.error('Syllabus API Error:', error);
    const fallbackTree = getFallbackSyllabusTree();
    return NextResponse.json({ success: true, data: fallbackTree });
  }
}
