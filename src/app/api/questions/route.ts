import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function loadFallbackQuestions(): any[] {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'textbook_questions.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      const questions = JSON.parse(raw);
      return questions.map((q: any) => ({
        id: q.id,
        year: q.year,
        season: q.season,
        examType: q.examType || 'SUBJECT_A',
        questionNum: q.questionNum,
        category: q.category || 'TECHNOLOGY',
        syllabusCategory: {
          code: q.syllabusCategoryCode || 'TECH_THEORY_ALGO',
          name: q.sectionTitle || '演習問題',
          level: 3,
          keywords: (q.choices || []).map((c: any) => ({ name: c.symbol })),
        },
        breadcrumbPath: [
          { code: 'TECH', name: 'テクノロジ系', level: 1 },
          { code: 'TECH_ALG', name: '基礎理論・アルゴリズム', level: 2 },
          { code: q.syllabusCategoryCode || 'TECH_THEORY_ALGO', name: q.chapterTitle || '教科書問題', level: 3 },
        ],
        title: q.title,
        bodyText: q.bodyText,
        explanation: q.explanation,
        imageUrls: [],
        choices: q.choices || [],
        modelAnswers: [],
        stats: {
          totalAnswers: 0,
          correctAnswers: 0,
          accuracyRate: null,
          lastAnsweredAt: null,
          lastIsCorrect: null,
          lastNotes: null,
        },
      }));
    }
  } catch (err) {
    console.error('Failed to load data/textbook_questions.json fallback:', err);
  }
  return [];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType'); // "SUBJECT_A" | "SUBJECT_B"
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const weaknessOnly = searchParams.get('weaknessOnly') === 'true';
    const keyword = searchParams.get('keyword');
    const syllabusCode = searchParams.get('syllabusCode');

    let questions: any[] = [];

    try {
      const whereClause: any = {};
      if (examType) {
        whereClause.examType = examType;
      }
      if (category && category !== 'ALL') {
        whereClause.category = category;
      }
      if (year && year !== 'ALL') {
        whereClause.year = parseInt(year);
      }

      if (syllabusCode && syllabusCode !== 'ALL') {
        const sylCat = await prisma.syllabusCategory.findUnique({
          where: { code: syllabusCode },
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        });

        if (sylCat) {
          const catIds: string[] = [sylCat.id];
          for (const child2 of sylCat.children) {
            catIds.push(child2.id);
            for (const child3 of child2.children) {
              catIds.push(child3.id);
            }
          }
          whereClause.syllabusCategoryId = { in: catIds };
        }
      }

      questions = await prisma.question.findMany({
        where: whereClause,
        include: {
          choices: true,
          modelAnswers: true,
          syllabusCategory: {
            include: {
              parent: {
                include: {
                  parent: true,
                },
              },
              keywords: true,
            },
          },
          answers: {
            orderBy: { answeredAt: 'desc' },
          },
        },
        orderBy: [{ year: 'desc' }, { questionNum: 'asc' }],
      });
    } catch (dbErr) {
      console.warn('Prisma DB query failed, using textbook_questions.json fallback:', dbErr);
      questions = [];
    }

    // If DB has no questions (e.g. serverless runtime without DB seed), use JSON fallback
    if (questions.length === 0) {
      const fallbackList = loadFallbackQuestions();
      let filtered = fallbackList;

      if (examType) {
        filtered = filtered.filter((q) => q.examType === examType);
      }
      if (category && category !== 'ALL') {
        filtered = filtered.filter((q) => q.category === category);
      }
      if (year && year !== 'ALL') {
        filtered = filtered.filter((q) => q.year === parseInt(year));
      }
      if (syllabusCode && syllabusCode !== 'ALL') {
        filtered = filtered.filter((q) => q.syllabusCategory?.code === syllabusCode || syllabusCode.includes('TECH') || syllabusCode.includes('MGMT') || syllabusCode.includes('STRAT'));
      }
      if (keyword && keyword.trim()) {
        const kwLower = keyword.trim().toLowerCase();
        filtered = filtered.filter((q) => {
          const textToSearch = [
            q.title || '',
            q.bodyText || '',
            q.explanation || '',
            q.category || '',
            ...(q.choices ? q.choices.map((c: any) => c.text) : []),
          ].join(' ').toLowerCase();
          return textToSearch.includes(kwLower);
        });
      }

      return NextResponse.json({ success: true, data: filtered });
    }

    // Filter by weaknessOnly if requested
    let resultQuestions = questions;
    if (weaknessOnly) {
      resultQuestions = questions.filter((q) => {
        if (!q.answers || q.answers.length === 0) return true;
        const correctCount = q.answers.filter((a: any) => a.isCorrect).length;
        const accuracy = correctCount / q.answers.length;
        return accuracy < 0.6;
      });
    }

    if (keyword && keyword.trim()) {
      const kwLower = keyword.trim().toLowerCase();
      resultQuestions = resultQuestions.filter((q) => {
        const textToSearch = [
          q.title || '',
          q.bodyText || '',
          q.explanation || '',
          q.category || '',
          q.syllabusCategory?.name || '',
          ...(q.syllabusCategory?.keywords ? q.syllabusCategory.keywords.map((k: any) => k.name) : []),
          ...(q.choices ? q.choices.map((c: any) => c.text) : []),
        ].join(' ').toLowerCase();
        return textToSearch.includes(kwLower);
      });
    }

    const formatted = resultQuestions.map((q) => {
      const totalAnswers = q.answers ? q.answers.length : 0;
      const correctAnswers = q.answers ? q.answers.filter((a: any) => a.isCorrect).length : 0;
      const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;
      const lastAnswer = q.answers && q.answers.length > 0 ? q.answers[0] : null;

      const breadcrumbPath: { code: string; name: string; level: number }[] = [];
      if (q.syllabusCategory) {
        if (q.syllabusCategory.parent?.parent) {
          breadcrumbPath.push({
            code: q.syllabusCategory.parent.parent.code,
            name: q.syllabusCategory.parent.parent.name,
            level: 1,
          });
        }
        if (q.syllabusCategory.parent) {
          breadcrumbPath.push({
            code: q.syllabusCategory.parent.code,
            name: q.syllabusCategory.parent.name,
            level: 2,
          });
        }
        breadcrumbPath.push({
          code: q.syllabusCategory.code,
          name: q.syllabusCategory.name,
          level: q.syllabusCategory.level,
        });
      }

      return {
        id: q.id,
        year: q.year,
        season: q.season,
        examType: q.examType,
        questionNum: q.questionNum,
        category: q.category,
        syllabusCategory: q.syllabusCategory,
        breadcrumbPath,
        title: q.title,
        bodyText: q.bodyText,
        explanation: q.explanation,
        imageUrls: q.imageUrls ? JSON.parse(q.imageUrls) : [],
        choices: q.choices || [],
        modelAnswers: q.modelAnswers || [],
        stats: {
          totalAnswers,
          correctAnswers,
          accuracyRate,
          lastAnsweredAt: lastAnswer?.answeredAt || null,
          lastIsCorrect: lastAnswer?.isCorrect ?? null,
          lastNotes: lastAnswer?.notes || null,
        },
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Failed to fetch questions:', error);
    const fallbackList = loadFallbackQuestions();
    return NextResponse.json({ success: true, data: fallbackList });
  }
}
