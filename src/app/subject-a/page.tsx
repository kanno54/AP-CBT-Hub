'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Save,
} from 'lucide-react';

interface Choice {
  id: string;
  symbol: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  year: number;
  season: string;
  examType: string;
  questionNum: number;
  category: string;
  title: string | null;
  bodyText: string;
  explanation?: string | null;
  choices: Choice[];
  stats: {
    totalAnswers: number;
    correctAnswers: number;
    accuracyRate: number | null;
    lastIsCorrect: boolean | null;
    lastNotes: string | null;
  };
}

function SubjectAContent() {
  const searchParams = useSearchParams();
  const initialQuestionId = searchParams.get('questionId');
  const keywordParam = searchParams.get('keyword');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [weaknessOnly, setWeaknessOnly] = useState<boolean>(false);
  const [keywordFilter, setKeywordFilter] = useState<string | null>(keywordParam);

  useEffect(() => {
    setKeywordFilter(keywordParam);
  }, [keywordParam]);

  // Quiz state
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [savedNotesMessage, setSavedNotesMessage] = useState<string>('');

  // Timer ticker
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
      examType: 'SUBJECT_A',
      category: selectedCategory,
      year: selectedYear,
      weaknessOnly: weaknessOnly ? 'true' : 'false',
    });

    if (keywordFilter) {
      params.append('keyword', keywordFilter);
    }

    fetch(`/api/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setQuestions(res.data);
          if (initialQuestionId) {
            const idx = res.data.findIndex((q: Question) => q.id === initialQuestionId);
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
  }, [selectedCategory, selectedYear, weaknessOnly, keywordFilter]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setSelectedSymbol(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setTimeSpent(0);
    setNotes(currentQ?.stats?.lastNotes || '');
    setSavedNotesMessage('');
  }, [currentIndex, currentQ]);

  const handleSubmit = async () => {
    if (!selectedSymbol || !currentQ) return;

    const correctChoice = currentQ.choices.find((c) => c.isCorrect);
    const correct = correctChoice?.symbol === selectedSymbol;
    setIsCorrect(correct);
    setIsSubmitted(true);

    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedSymbol,
          isCorrect: correct,
          timeSpentSec: timeSpent,
          notes,
        }),
      });
    } catch (e) {
      console.error('Failed to submit answer:', e);
    }
  };

  const handleSaveNotes = async () => {
    if (!currentQ) return;
    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          selectedSymbol: selectedSymbol || currentQ.choices.find((c) => c.isCorrect)?.symbol,
          isCorrect: isCorrect ?? true,
          timeSpentSec: timeSpent,
          notes,
        }),
      });
      setSavedNotesMessage('復習メモを保存しました');
      setTimeout(() => setSavedNotesMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">科目A 択一演習モード</h1>
              <p className="text-xs text-slate-400">分野別フィルタ・弱点自動抽出・即時判定演習</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
              <option value="NETWORK">NETWORK (ネットワーク)</option>
              <option value="DATABASE">DATABASE (データベース)</option>
              <option value="ALGORITHM">ALGORITHM (アルゴリズム)</option>
              <option value="PROJECT_MGMT">PROJECT_MGMT (プロジェクトマネジメント)</option>
              <option value="SYSTEM_ARCH">SYSTEM_ARCH (システム構成)</option>
              <option value="STRATEGY">STRATEGY (ストラテジ)</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="ALL">全年度</option>
              <option value="2025">2025年</option>
              <option value="2024">2024年</option>
            </select>
          </div>

          {/* Weakness Switch */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold cursor-pointer hover:bg-rose-500/20 transition-colors">
            <input
              type="checkbox"
              checked={weaknessOnly}
              onChange={(e) => setWeaknessOnly(e.target.checked)}
              className="rounded border-rose-500 text-rose-500 focus:ring-rose-500 accent-rose-500"
            />
            <span>弱点(正答率&lt;60%)のみ</span>
          </label>
        </div>
      </div>

      {/* Keyword Filter Banner */}
      {keywordFilter && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              キーワード <strong className="text-white underline font-bold px-1">{keywordFilter}</strong> に関連する科目A過去問を横断抽出中
            </span>
          </div>
          <button
            onClick={() => setKeywordFilter(null)}
            className="px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 font-semibold border border-indigo-500/40 text-xs transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 絞り込み解除
          </button>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">問題データを読み込み中...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3 border border-slate-800">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">指定された条件に一致する問題がありません</h3>
          <p className="text-xs text-slate-400">フィルタ条件を変更するか、弱点条件を解除してください。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Stepper & Progress */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                問題 {currentIndex + 1} / {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {currentQ.category}
              </span>
              <span className="text-slate-500">
                {currentQ.year}年 {currentQ.season === 'SPRING' ? '春' : '秋'} 問{currentQ.questionNum}
              </span>
            </div>

            {/* Live CBT Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>解答時間: <strong className="text-blue-400 font-mono">{timeSpent}</strong> 秒</span>
            </div>
          </div>

          {/* Main Question Card */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
            {/* Title / Question Statement */}
            <div className="space-y-3 border-b border-slate-800/80 pb-6">
              {currentQ.title && (
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                  {currentQ.title}
                </span>
              )}
              <div className="text-base md:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-line">
                {currentQ.bodyText}
              </div>
            </div>

            {/* Options Choices (ア, イ, ウ, エ) */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">選択肢を選んで解答してください:</p>
              <div className="grid grid-cols-1 gap-3">
                {currentQ.choices.map((choice) => {
                  const isSelected = selectedSymbol === choice.symbol;
                  let btnStyle = 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60';

                  if (isSubmitted) {
                    if (choice.isCorrect) {
                      btnStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold';
                    } else if (isSelected && !choice.isCorrect) {
                      btnStyle = 'border-rose-500/50 bg-rose-500/10 text-rose-300';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-blue-500 bg-blue-500/20 text-blue-300 ring-2 ring-blue-500/40';
                  }

                  return (
                    <button
                      key={choice.id}
                      disabled={isSubmitted}
                      onClick={() => setSelectedSymbol(choice.symbol)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150 ${btnStyle}`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSubmitted && choice.isCorrect
                            ? 'bg-emerald-500 text-slate-950'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {choice.symbol}
                      </span>
                      <span className="text-sm md:text-base leading-snug pt-1">{choice.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                disabled={!selectedSymbol || isSubmitted}
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                解答を送信して判定 <CheckCircle2 className="w-4 h-4" />
              </button>

              {isSubmitted && (
                <button
                  onClick={() => {
                    setSelectedSymbol(null);
                    setIsSubmitted(false);
                    setIsCorrect(null);
                    setTimeSpent(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> もう一度解く
                </button>
              )}
            </div>

            {/* Feedback & Detailed Explanation Box */}
            {isSubmitted && (
              <div
                className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-lg font-bold">
                        {isCorrect ? '正解です！お見事！' : '不正解です。解説を確認しましょう'}
                      </h4>
                      <p className="text-xs opacity-80">
                        正解: <strong className="font-bold underline">{currentQ.choices.find((c) => c.isCorrect)?.symbol}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Explanation Content */}
                <div className="space-y-2 pt-2 border-t border-slate-700/50">
                  <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400" /> 詳細解説・誤答選択肢の分析
                  </h5>
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {currentQ.explanation || `正解の選択肢は「${currentQ.choices.find((c) => c.isCorrect)?.symbol}」です。`}
                  </div>
                </div>
              </div>
            )}

            {/* User Review Note Textarea */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> マイ復習メモ・気づき
                </label>
                {savedNotesMessage && <span className="text-xs text-emerald-400">{savedNotesMessage}</span>}
              </div>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="解き方のポイントや覚えるべき用語を自由にメモできます..."
                  className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 self-end transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> メモ保存
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Pagination Stepper */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> 前の問題
            </button>
            <span className="text-xs text-slate-400">
              {currentIndex + 1} / {questions.length}
            </span>
            <button
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1 transition-colors"
            >
              次の問題 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubjectAPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        科目A演習画面を準備中...
      </div>
    }>
      <SubjectAContent />
    </Suspense>
  );
}
