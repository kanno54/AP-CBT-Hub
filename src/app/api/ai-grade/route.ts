import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subQuestionNum, userInput, answerText, explanation, maxScore = 10, characterLimit } = body;

    if (!userInput || typeof userInput !== 'string' || !userInput.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          score: 0,
          maxScore,
          matchedKeywords: [],
          missingKeywords: [],
          feedback: '解答が入力されていません。キーワードを含めた記述を入力してください。',
        },
      });
    }

    const trimmedInput = userInput.trim();
    const trimmedModel = (answerText || '').trim();

    // Key technical terms extractor logic
    const termRegex = /([A-Za-z0-9_=]+|[ァ-ヴー]{3,}|[一-龠]{2,})/g;
    const rawMatches: string[] = trimmedModel.match(termRegex) || [];
    const modelTerms: string[] = Array.from(new Set(rawMatches)).filter(
      (term: string) => term.length >= 2 && !['する', 'こと', 'ため', 'ある', 'ない', '行う', '使用'].includes(term)
    );

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const term of modelTerms) {
      if (trimmedInput.toLowerCase().includes(term.toLowerCase())) {
        matchedKeywords.push(term);
      } else {
        missingKeywords.push(term);
      }
    }

    // Score calculation ratio
    const keywordMatchRatio = modelTerms.length > 0 ? matchedKeywords.length / modelTerms.length : 0.5;

    // Check length penalty
    let lengthRatio = 1.0;
    if (characterLimit && trimmedInput.length > characterLimit) {
      lengthRatio = 0.8; // Minor penalty for exceeding character limit
    }

    const calculatedScore = Math.min(
      maxScore,
      Math.max(0, Math.round(maxScore * keywordMatchRatio * lengthRatio))
    );

    // Generate constructive advice
    let feedback = '';
    if (calculatedScore === maxScore) {
      feedback = '素晴らしい模範的な解答です！必要な技術キーワードが過不足なく含まれており、文字数制限内にも収まっています。';
    } else if (calculatedScore >= maxScore * 0.6) {
      feedback = `合格点に達しています。より高得点を目指すには、「${missingKeywords.join('」「')}」などのキーワードを明確に記述に取り入れるとさらに良くなります。`;
    } else {
      feedback = `必須キーワード「${missingKeywords.join('」「')}」が不足しているため減点対象となります。問題文の指摘事項に対応する標準技術用語を含めて論理的に構成してください。`;
    }

    if (characterLimit && trimmedInput.length > characterLimit) {
      feedback += ` (注: 指定文字数 ${characterLimit} 文字を超過しているため調整が必要です)`;
    }

    return NextResponse.json({
      success: true,
      data: {
        score: calculatedScore,
        maxScore,
        matchedKeywords,
        missingKeywords,
        feedback,
      },
    });
  } catch (error: any) {
    console.error('AI Grade API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
