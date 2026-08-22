'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, AlertTriangle, ArrowRight, BookOpen, CheckCircle2, RotateCcw, Filter } from 'lucide-react';

interface ReviewQuestion {
  id: string;
  year: number;
  season: string;
  examType: string;
  questionNum: number;
  category: string;
  title: string;
  bodyText: string;
  totalAnswers: number;
  correctAnswers: number;
  accuracyRate: number;
  isWeakness: boolean;
}

export default function ReviewPage() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamType, setSelectedExamType] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data.weakQuestions) {
          setQuestions(res.data.weakQuestions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = questions.filter((q) => {
    if (selectedExamType !== 'ALL' && q.examType !== selectedExamType) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">弱点集中復習リスト</h1>
            <p className="text-xs text-slate-400">正答率60%未満の苦手問題や復習対象の重要過去問を集中攻略</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">すべての試験種別</option>
            <option value="SUBJECT_A">科目A (択一)</option>
            <option value="SUBJECT_B">科目B (CBT記述)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-2">復習問題データを抽出中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">復習が必要な弱点問題はありません！</h3>
          <p className="text-xs text-slate-400">すべての問題で高い正答率を達成しています。新たな年度の演習に挑戦しましょう。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        q.examType === 'SUBJECT_A'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {q.examType === 'SUBJECT_A' ? '科目A (択一)' : '科目B (記述)'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <AlertTriangle className="w-3 h-3" /> 正答率 {q.accuracyRate}%
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {q.year}年 {q.season === 'SPRING' ? '春' : '秋'} 問{q.questionNum}
                </p>

                <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">{q.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                  {q.bodyText}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400">累計試行: {q.totalAnswers}回</span>
                <Link
                  href={q.examType === 'SUBJECT_A' ? `/subject-a?questionId=${q.id}` : `/subject-b?questionId=${q.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> この問題を再復習する
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
