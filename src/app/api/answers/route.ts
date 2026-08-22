import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, selectedSymbol, inputAnswer, isCorrect, timeSpentSec, notes } = body;

    if (!questionId) {
      return NextResponse.json({ success: false, error: 'questionId is required' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { choices: true },
    });

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    // Auto-calculate correctness for Subject A if not provided
    let finalIsCorrect = isCorrect;
    if (question.examType === 'SUBJECT_A' && selectedSymbol && isCorrect === undefined) {
      const correctChoice = question.choices.find((c) => c.isCorrect);
      finalIsCorrect = correctChoice?.symbol === selectedSymbol;
    }

    const userAnswer = await prisma.userAnswer.create({
      data: {
        questionId,
        selectedSymbol: selectedSymbol || null,
        inputAnswer: inputAnswer || null,
        isCorrect: typeof finalIsCorrect === 'boolean' ? finalIsCorrect : null,
        timeSpentSec: timeSpentSec || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: userAnswer,
      correctChoiceSymbol: question.choices.find((c) => c.isCorrect)?.symbol,
    });
  } catch (error: any) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
