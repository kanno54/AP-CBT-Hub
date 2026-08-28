import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTextbookReferenceForCategory } from '@/lib/textbook';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
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

      if (!category) {
        return NextResponse.json({ success: false, error: 'Syllabus category not found' }, { status: 404 });
      }

      const textbookRef = getTextbookReferenceForCategory(category.code, category.name);
      return NextResponse.json({ success: true, data: { ...category, textbookRef } });
    }

    // Fetch full hierarchy (Level 1 -> Level 2 -> Level 3 with keywords and questions count)
    const syllabusTree = await prisma.syllabusCategory.findMany({
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

    // Attach textbookRef to each level 3 category
    const enrichedTree = syllabusTree.map((l1) => ({
      ...l1,
      children: l1.children.map((l2) => ({
        ...l2,
        textbookRef: getTextbookReferenceForCategory(l2.code, l2.name),
        children: l2.children.map((l3) => ({
          ...l3,
          textbookRef: getTextbookReferenceForCategory(l3.code, l3.name),
        })),
      })),
    }));

    return NextResponse.json({ success: true, data: enrichedTree });
  } catch (error: any) {
    console.error('Syllabus API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
