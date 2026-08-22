import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType'); // "SUBJECT_A" | "SUBJECT_B"
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const weaknessOnly = searchParams.get('weaknessOnly') === 'true';

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

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        choices: true,
        modelAnswers: true,
        answers: {
          orderBy: { answeredAt: 'desc' },
        },
      },
      orderBy: [{ year: 'desc' }, { questionNum: 'asc' }],
    });

    const keyword = searchParams.get('keyword');

    // If weaknessOnly filter is requested, filter questions where accuracy rate is < 60%
    let resultQuestions = questions;
    if (weaknessOnly) {
      resultQuestions = questions.filter((q) => {
        if (q.answers.length === 0) return true; // Unanswered questions count as review needed
        const correctCount = q.answers.filter((a) => a.isCorrect).length;
        const accuracy = correctCount / q.answers.length;
        return accuracy < 0.6;
      });
    }

    // If keyword filter is provided, perform case-insensitive keyword search
    if (keyword && keyword.trim()) {
      const kwLower = keyword.trim().toLowerCase();
      resultQuestions = resultQuestions.filter((q) => {
        const textToSearch = [
          q.title || '',
          q.bodyText || '',
          q.explanation || '',
          q.category || '',
          ...q.choices.map((c) => c.text),
        ].join(' ').toLowerCase();
        return textToSearch.includes(kwLower);
      });
    }

    // Format response to include calculated user accuracy
    const formatted = resultQuestions.map((q) => {
      const totalAnswers = q.answers.length;
      const correctAnswers = q.answers.filter((a) => a.isCorrect).length;
      const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;
      const lastAnswer = q.answers[0] || null;

      return {
        id: q.id,
        year: q.year,
        season: q.season,
        examType: q.examType,
        questionNum: q.questionNum,
        category: q.category,
        title: q.title,
        bodyText: q.bodyText,
        explanation: q.explanation,
        imageUrls: q.imageUrls ? JSON.parse(q.imageUrls) : [],
        choices: q.choices,
        modelAnswers: q.modelAnswers,
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
