'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
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
  Highlighter,
  Sparkles,
  CheckCircle2,
  XCircle,
  Filter,
  Trash2,
  Bot,
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

interface AIEvaluationResult {
  score: number;
  maxScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
}

function SubjectBContent() {
  const searchParams = useSearchParams();
  const initialQuestionId = searchParams.get('questionId');

  const [questions, setQuestions] = useState<QuestionB[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Problem text highlighter state
  const scenarioRef = useRef<HTMLDivElement>(null);
  const [highlightColor, setHighlightColor] = useState<string>('yellow');

  // User input state per subQuestion (keyed by subQuestionNum)
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [aiEvaluations, setAiEvaluations] = useState<Record<string, AIEvaluationResult>>({});
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
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
    const params = new URLSearchParams({
      examType: 'SUBJECT_B',
      category: selectedCategory,
    });

    fetch(`/api/questions?${params.toString()}`)
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
  }, [selectedCategory]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setUserInputs({});
    setUserScores({});
    setAiEvaluations({});
    setIsSubmitted(false);
    setTimeSpent(0);
    setNotes('');
  }, [currentIndex, currentQ]);

  // Text Highlighter Handler
  const applyHighlight = (color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !scenarioRef.current) return;

    const range = selection.getRangeAt(0);
    if (!scenarioRef.current.contains(range.commonAncestorContainer)) return;

    const span = document.createElement('mark');
    if (color === 'yellow') {
      span.style.backgroundColor = 'rgba(253, 224, 71, 0.4)';
      span.style.color = '#fef08a';
    } else if (color === 'green') {
      span.style.backgroundColor = 'rgba(74, 222, 128, 0.4)';
      span.style.color = '#bbf7d0';
    } else if (color === 'cyan') {
      span.style.backgroundColor = 'rgba(103, 232, 249, 0.4)';
      span.style.color = '#a5f3fc';
    }
    span.style.padding = '1px 3px';
    span.style.borderRadius = '3px';
    span.className = 'cbt-highlight-mark';

    try {
      range.surroundContents(span);
    } catch (e) {
      console.warn('Highlight failed for complex range:', e);
    }
    selection.removeAllRanges();
  };

  const clearHighlights = () => {
    if (!scenarioRef.current) return;
    const marks = scenarioRef.current.querySelectorAll('.cbt-highlight-mark');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent?.insertBefore(mark.firstChild, mark);
      }
      parent?.removeChild(mark);
    });
  };

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

  // Run AI Evaluation for all subquestions
  const runAiGrading = async () => {
    if (!currentQ) return;
    setIsAiLoading(true);

    const evals: Record<string, AIEvaluationResult> = {};
    for (const ma of currentQ.modelAnswers) {
      const uInput = userInputs[ma.subQuestionNum] || '';
      try {
        const res = await fetch('/api/ai-grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subQuestionNum: ma.subQuestionNum,
            userInput: uInput,
            answerText: ma.answerText,
            explanation: ma.explanation,
            maxScore: ma.maxScore || 10,
            characterLimit: ma.characterLimit,
          }),
        });
        const data = await res.json();
        if (data.success) {
          evals[ma.subQuestionNum] = data.data;
          // Set score state automatically from AI
          handleScoreChange(ma.subQuestionNum, data.data.score);
        }
      } catch (e) {
        console.error('AI grading error:', e);
      }
    }
    setAiEvaluations(evals);
    setIsAiLoading(false);
  };

  const handleSubmit = async () => {
    if (!currentQ) return;
    setIsSubmitted(true);
    await runAiGrading();

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
                本番CBT Dual-Pane & AI採点
              </span>
            </div>
            <p className="text-xs text-slate-400">問題文ハイライター / AIキーワード判定採点 / Diff比較 / リアルタイム文字数制限</p>
          </div>
        </div>

        {/* Category Filter & Timer */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">全分野</option>
              <option value="SECURITY">SECURITY (セキュリティ)</option>
              <option value="DATABASE">DATABASE (データベース)</option>
              <option value="NETWORK">NETWORK (ネットワーク)</option>
              <option value="PROJECT_MGMT">PROJECT_MGMT (プロジェクト管理)</option>
              <option value="ALGORITHM">ALGORITHM (アルゴリズム)</option>
            </select>
          </div>

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
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">科目B（記述式）データをロード中...</p>
        </div>
      ) : !currentQ ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-slate-400">表示できる問題がありません。分野フィルターを変更してください。</p>
        </div>
      ) : (
        /* Split Pane Dual View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Left Pane: Scenario Text + Text Highlighter Toolbar */}
          <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col space-y-4 max-h-[780px]">
            {/* Highlighter Toolbar */}
            <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <Highlighter className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">CBTマーカー:</span>
                <button
                  onClick={() => applyHighlight('yellow')}
                  className="px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/40 text-xs font-semibold border border-yellow-400/40 transition-colors"
                >
                  黄色
                </button>
                <button
                  onClick={() => applyHighlight('green')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/40 text-xs font-semibold border border-emerald-400/40 transition-colors"
                >
                  緑色
                </button>
                <button
                  onClick={() => applyHighlight('cyan')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/40 text-xs font-semibold border border-cyan-400/40 transition-colors"
                >
                  シアン
                </button>
              </div>
              <button
                onClick={clearHighlights}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> マーカー削除
              </button>
            </div>

            {/* Problem Header */}
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

            {/* Scenario Text Content with Selection Ref */}
            <div ref={scenarioRef} className="overflow-y-auto flex-1 space-y-4 pr-1 selection:bg-indigo-500/30">
              {currentQ.title && (
                <h2 className="text-lg font-bold text-slate-100 leading-snug border-l-4 border-indigo-500 pl-3">
                  {currentQ.title}
                </h2>
              )}

              <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans space-y-3">
                {currentQ.bodyText}
              </div>
            </div>
          </div>

          {/* Right Pane: CBT Sub-question Inputs & AI Grading & Diff Visualizer */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex-1 space-y-6 overflow-y-auto max-h-[780px]">
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
                  const aiEval = aiEvaluations[ma.subQuestionNum];

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

                      {/* AI Grading & Feedback Card */}
                      {isSubmitted && (
                        <div className="mt-4 space-y-3 border-t border-slate-800 pt-4 animate-fade-in">
                          {/* AI Evaluation Output */}
                          {aiEval && (
                            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                                  <Bot className="w-4 h-4 text-indigo-400" /> AI即時自動採点 & 概念分析
                                </span>
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  {aiEval.score} / {aiEval.maxScore} 点
                                </span>
                              </div>

                              {/* Keyword Match Tags */}
                              <div className="space-y-1.5 text-xs">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-slate-400">検出キーワード:</span>
                                  {aiEval.matchedKeywords.length > 0 ? (
                                    aiEval.matchedKeywords.map((kw, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {kw}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-500 italic">一致する重要語句なし</span>
                                  )}
                                </div>

                                {aiEval.missingKeywords.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-slate-400">不足キーワード:</span>
                                    {aiEval.missingKeywords.map((kw, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                                        <XCircle className="w-3 h-3 text-amber-400" /> {kw}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Advice Feedback Text */}
                              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                {aiEval.feedback}
                              </p>
                            </div>
                          )}

                          {/* Diff Comparison */}
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400">模範解答との Diff 文字差分:</span>
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

                          {/* Model Answer */}
                          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
                            <p className="font-bold text-emerald-400">【模範解答】 {ma.answerText}</p>
                            {ma.explanation && <p className="text-slate-300">{ma.explanation}</p>}
                          </div>
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
                    disabled={isAiLoading}
                    onClick={handleSubmit}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        AI 採点分析中...
                      </>
                    ) : (
                      <>
                        AI自動採点 & 提出判定 <Sparkles className="w-4 h-4 text-yellow-300" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserInputs({});
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 再解答・修正する
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
