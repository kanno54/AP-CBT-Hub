'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Edit3,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Split,
  FileText,
  Send,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import * as diff from 'diff';

interface ModelAnswer {
  id: string;
  subQuestionNum: string;
  maxScore: number | null;
  characterLimit: number | null;
  answerText: string;
  explanation: string | null;
}

interface QuestionB {
  id: string;
  year: number;
  season: string;
  examType: string;
  questionNum: number;
  category: string;
  title: string | null;
  bodyText: string;
  modelAnswers: ModelAnswer[];
}

function SubjectBContent() {
  const searchParams = useSearchParams();
  const initialQuestionId = searchParams.get('questionId');

  const [questions, setQuestions] = useState<QuestionB[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // User input state per subQuestion (keyed by subQuestionNum)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, currentIndex]);

  const fetchQuestions = () => {
    setLoading(true);
    fetch('/api/questions?examType=SUBJECT_B')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setQuestions(res.data);
          if (initialQuestionId) {
            const idx = res.data.findIndex((q: QuestionB) => q.id === initialQuestionId);
            if (idx !== -1) setCurrentIndex(idx);
          } else {
            setCurrentIndex(0);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setUserInputs({});
    setUserScores({});
    setIsSubmitted(false);
    setTimeSpent(0);
    setNotes('');
  }, [currentIndex, currentQ]);

  const handleInputChange = (subNum: string, text: string) => {
    setUserInputs((prev) => ({ ...prev, [subNum]: text }));
  };

  const handleScoreChange = (subNum: string, score: number) => {
    setUserScores((prev) => ({ ...prev, [subNum]: score }));
  };

  const calculateTotalScore = () => {
    if (!currentQ) return 0;
    return currentQ.modelAnswers.reduce((sum, ma) => sum + (userScores[ma.subQuestionNum] || 0), 0);
  };

  const calculateMaxScoreTotal = () => {
    if (!currentQ) return 0;
    return currentQ.modelAnswers.reduce((sum, ma) => sum + (ma.maxScore || 0), 0);
  };

  const handleSubmit = async () => {
    if (!currentQ) return;
    setIsSubmitted(true);

    const totalEarned = calculateTotalScore();
    const totalMax = calculateMaxScoreTotal();
    const isPassed = totalMax > 0 ? totalEarned / totalMax >= 0.6 : true;

    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          inputAnswer: JSON.stringify(userInputs),
          isCorrect: isPassed,
          timeSpentSec: timeSpent,
          notes,
        }),
      });
    } catch (e) {
      console.error('Failed to submit CBT answer:', e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top CBT Header bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">科目B CBT記述演習モード</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                本番CBT Dual-Pane Layout
              </span>
            </div>
            <p className="text-xs text-slate-400">問題文・図表とエディタの左右分割画面 / リアルタイム文字数カウンター / Diff比較採点</p>
          </div>
        </div>

        {/* Timer & Stepper */}
        {currentQ && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>経過時間: <strong className="text-indigo-400 font-mono text-sm">{Math.floor(timeSpent / 60)}分 {timeSpent % 60}秒</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-300 px-2">
                {currentIndex + 1} / {questions.length}
              </span>
              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">科目B（記述式）データをロード中...</p>
        </div>
      ) : !currentQ ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-slate-400">表示できる問題がありません。</p>
        </div>
      ) : (
        /* Split Pane Dual View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Pane: Problem Scenario & Markdown Content */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 overflow-y-auto max-h-[750px] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">問題文・長文シナリオ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  {currentQ.category}
                </span>
                <span className="text-xs text-slate-400">
                  {currentQ.year}年 {currentQ.season === 'SPRING' ? '春' : '秋'} 問{currentQ.questionNum}
                </span>
              </div>
            </div>

            {currentQ.title && (
              <h2 className="text-lg font-bold text-slate-100 leading-snug border-l-4 border-indigo-500 pl-3">
                {currentQ.title}
              </h2>
            )}

            <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans space-y-3">
              {currentQ.bodyText}
            </div>
          </div>

          {/* Right Pane: CBT Sub-question Inputs & Character Counter & Self-Grading */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex-1 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">解答入力エリア (CBTエディタ)</span>
                </div>
                {isSubmitted && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <Award className="w-4 h-4" /> 獲得スコア: {calculateTotalScore()} / {calculateMaxScoreTotal()} 点
                  </div>
                )}
              </div>

              {/* Sub-questions input list */}
              <div className="space-y-6">
                {currentQ.modelAnswers.map((ma) => {
                  const val = userInputs[ma.subQuestionNum] || '';
                  const charCount = val.length;
                  const limit = ma.characterLimit;
                  const isExceeded = limit !== null && charCount > limit;

                  const diffParts = isSubmitted ? diff.diffChars(val, ma.answerText) : [];

                  return (
                    <div key={ma.id} className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          {ma.subQuestionNum}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          {ma.maxScore && <span className="text-slate-400">配点: {ma.maxScore}点</span>}
                          {limit && (
                            <span
                              className={`font-mono px-2 py-0.5 rounded ${
                                isExceeded
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold animate-pulse'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {charCount} / {limit} 文字
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Textarea input */}
                      <textarea
                        rows={3}
                        disabled={isSubmitted}
                        value={val}
                        onChange={(e) => handleInputChange(ma.subQuestionNum, e.target.value)}
                        placeholder={`ここに「${ma.subQuestionNum}」の解答を入力してください...`}
                        className={`w-full p-3 rounded-xl bg-slate-950 border text-sm text-slate-100 focus:outline-none resize-none transition-colors ${
                          isExceeded ? 'border-rose-500/80' : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />

                      {/* Over limit warning */}
                      {isExceeded && (
                        <p className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> 指定文字数 ({limit}文字) を超過しています！
                        </p>
                      )}

                      {/* Self grading diff visualizer when submitted */}
                      {isSubmitted && (
                        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400">模範解答との Diff 比較:</span>
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed break-all">
                              {diffParts.map((part, index) => (
                                <span
                                  key={index}
                                  className={
                                    part.added
                                      ? 'bg-emerald-500/30 text-emerald-300 font-bold px-0.5 underline'
                                      : part.removed
                                      ? 'bg-rose-500/30 text-rose-300 line-through px-0.5 opacity-70'
                                      : 'text-slate-200'
                                  }
                                >
                                  {part.value}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Model answer text */}
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                            <p className="font-bold text-emerald-400">【模範解答】 {ma.answerText}</p>
                            {ma.explanation && <p className="text-slate-300">{ma.explanation}</p>}
                          </div>

                          {/* Self score selector */}
                          {ma.maxScore && (
                            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                              <label className="text-xs font-semibold text-slate-300">自己採点スコア:</label>
                              <select
                                value={userScores[ma.subQuestionNum] || 0}
                                onChange={(e) => handleScoreChange(ma.subQuestionNum, parseInt(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-emerald-400 font-bold outline-none"
                              >
                                {Array.from({ length: ma.maxScore + 1 }, (_, i) => (
                                  <option key={i} value={i}>
                                    {i} 点 / {ma.maxScore} 点
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Submit / Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                  >
                    解答を提出して Diff 比較自己採点 <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserInputs({});
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> もう一度解答する
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubjectBPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2"></div>
        科目B演習画面を準備中...
      </div>
    }>
      <SubjectBContent />
    </Suspense>
  );
}
