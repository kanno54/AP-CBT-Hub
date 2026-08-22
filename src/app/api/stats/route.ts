import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const allAnswers = await prisma.userAnswer.findMany({
      include: {
        question: true,
      },
      orderBy: { answeredAt: 'desc' },
    });

    const totalAnswered = allAnswers.length;
    const correctAnswers = allAnswers.filter((a) => a.isCorrect === true).length;
    const overallAccuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    const totalTimeSec = allAnswers.reduce((acc, curr) => acc + (curr.timeSpentSec || 0), 0);
    const totalTimeMin = Math.round(totalTimeSec / 60);

    // Group stats by category
    const categoryMap: Record<string, { total: number; correct: number; timeSec: number }> = {};
    
    for (const ans of allAnswers) {
      const cat = ans.question.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, correct: 0, timeSec: 0 };
      }
      categoryMap[cat].total += 1;
      if (ans.isCorrect) {
        categoryMap[cat].correct += 1;
      }
      categoryMap[cat].timeSec += ans.timeSpentSec || 0;
    }

    const categoryStats = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      total: data.total,
      correct: data.correct,
      accuracyRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      avgTimeSec: data.total > 0 ? Math.round(data.timeSec / data.total) : 0,
    }));

    // Find weak questions (accuracy < 60%)
    const allQuestions = await prisma.question.findMany({
      include: {
        answers: true,
        choices: true,
      },
    });

    const weakQuestions = allQuestions
      .map((q) => {
        const total = q.answers.length;
        const correct = q.answers.filter((a) => a.isCorrect).length;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;
        return {
          id: q.id,
          year: q.year,
          season: q.season,
          examType: q.examType,
          questionNum: q.questionNum,
          category: q.category,
          title: q.title || `問${q.questionNum}`,
          bodyText: q.bodyText,
          totalAnswers: total,
          correctAnswers: correct,
          accuracyRate: Math.round(accuracy),
          isWeakness: total > 0 && accuracy < 60,
        };
      })
      .filter((q) => q.isWeakness || q.totalAnswers === 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAnswered,
          correctAnswers,
          overallAccuracy,
          totalTimeSec,
          totalTimeMin,
          weaknessCount: weakQuestions.length,
        },
        categoryStats,
        weakQuestions: weakQuestions.slice(0, 10),
        recentAnswers: allAnswers.slice(0, 5).map((a) => ({
          id: a.id,
          questionId: a.questionId,
          examType: a.question.examType,
          questionNum: a.question.questionNum,
          category: a.question.category,
          title: a.question.title || `問${a.question.questionNum}`,
          isCorrect: a.isCorrect,
          selectedSymbol: a.selectedSymbol,
          inputAnswer: a.inputAnswer,
          timeSpentSec: a.timeSpentSec,
          answeredAt: a.answeredAt,
          notes: a.notes,
        })),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch learning stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
