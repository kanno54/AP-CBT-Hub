import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

      return NextResponse.json({ success: true, data: category });
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

    return NextResponse.json({ success: true, data: syllabusTree });
  } catch (error: any) {
    console.error('Syllabus API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
