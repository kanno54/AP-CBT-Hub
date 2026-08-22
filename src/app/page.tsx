'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Edit3,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface DashboardData {
  summary: {
    totalAnswered: number;
    correctAnswers: number;
    overallAccuracy: number;
    totalTimeSec: number;
    totalTimeMin: number;
    weaknessCount: number;
  };
  categoryStats: Array<{
    category: string;
    total: number;
    correct: number;
    accuracyRate: number;
    avgTimeSec: number;
  }>;
  weakQuestions: Array<{
    id: string;
    year: number;
    season: string;
    examType: string;
    questionNum: number;
    category: string;
    title: string;
    accuracyRate: number;
    totalAnswers: number;
  }>;
  recentAnswers: Array<{
    id: string;
    questionId: string;
    examType: string;
    questionNum: number;
    category: string;
    title: string;
    isCorrect: boolean | null;
    timeSpentSec: number;
    answeredAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">学習ダッシュボードのデータをロード中...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalAnswered: 0,
    correctAnswers: 0,
    overallAccuracy: 0,
    totalTimeSec: 0,
    totalTimeMin: 0,
    weaknessCount: 0,
  };

  const categoryStats = data?.categoryStats || [];
  const weakQuestions = data?.weakQuestions || [];
  const recentAnswers = data?.recentAnswers || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> 応用情報技術者 (AP) CBT対策HUB
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              学習ダッシュボード＆弱点分析
            </h1>
            <p className="mt-2 text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              CBT形式の過去問演習データに基づき、分野別の正答率と得意・苦手傾向をリアルタイム解析。効率的な直前対策と弱点補強をサポートします。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Link
              href="/subject-a"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
            >
              <FileCheck className="w-4 h-4" /> 科目A 択一演習
            </Link>
            <Link
              href="/subject-b"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:scale-[1.02]"
            >
              <Edit3 className="w-4 h-4" /> 科目B CBT記述
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Answered */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">累計解答問題数</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{summary.totalAnswered} <span className="text-xs font-normal text-slate-400">問</span></h3>
            <p className="text-[11px] text-slate-400 mt-1">正解 {summary.correctAnswers} 問</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">総合正答率</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className={`text-3xl font-bold ${
                summary.overallAccuracy >= 60 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {summary.overallAccuracy}%
              </h3>
              <span className="text-xs text-slate-400">（基準: 60%）</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {summary.overallAccuracy >= 60 ? '合格基準達成ライン' : '弱点補強が必要です'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
            summary.overallAccuracy >= 60
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Time Spent */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">総学習時間</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">
              {summary.totalTimeMin} <span className="text-xs font-normal text-slate-400">分</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">約 {Math.round(summary.totalTimeMin / 60 * 10) / 10} 時間</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Weakness Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">要復習・弱点問題</p>
            <h3 className="text-3xl font-bold text-rose-400 mt-1">
              {summary.weaknessCount} <span className="text-xs font-normal text-slate-400">問</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">正答率 60% 未満</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Accuracy Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-400" /> 分野別正答率分析
              </h3>
              <p className="text-xs text-slate-400">各カテゴリにおける理解度と正解割合</p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              目標: 60%以上
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    formatter={(value: any) => [`${value}%`, '正答率']}
                  />
                  <Bar dataKey="accuracyRate" radius={[6, 6, 0, 0]}>
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.accuracyRate >= 60 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                問題演習を行うとここに分野別グラフが表示されます
              </div>
            )}
          </div>
        </div>

        {/* Category Radar Understanding Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" /> 分野バランスレーダー
              </h3>
              <p className="text-xs text-slate-400">テクノロジ/マネジメント/ストラテジの強みと弱点</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={categoryStats}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="正答率" dataKey="accuracyRate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                解答データが蓄積されるとレーダーチャートが描画されます
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weakness Review List & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weakness Questions Focus List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-400" /> 弱点集中復習ピックアップ
              </h3>
              <p className="text-xs text-slate-400">正答率60%未満または未解答の問題</p>
            </div>
            <Link
              href="/review"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              すべて見る <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {weakQuestions.length > 0 ? (
              weakQuestions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.examType === 'SUBJECT_A' ? '科目A' : '科目B'}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {q.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {q.year}年 {q.season === 'SPRING' ? '春' : '秋'} 問{q.questionNum}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 line-clamp-1">{q.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">正答率</p>
                      <p className={`text-sm font-bold ${q.accuracyRate >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {q.accuracyRate}%
                      </p>
                    </div>
                    <Link
                      href={q.examType === 'SUBJECT_A' ? `/subject-a?questionId=${q.id}` : `/subject-b?questionId=${q.id}`}
                      className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-500 text-sm">現在、弱点該当問題はありません！素晴らしい成果です。</p>
            )}
          </div>
        </div>

        {/* Recent Practice Log */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> 直近の解答ログ
          </h3>
          <div className="space-y-3">
            {recentAnswers.length > 0 ? (
              recentAnswers.map((ans) => (
                <div key={ans.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{ans.category} ({ans.examType === 'SUBJECT_A' ? '科目A' : '科目B'})</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      ans.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {ans.isCorrect ? '正解' : '不正解'}
                    </span>
                  </div>
                  <p className="text-slate-400 truncate">{ans.title}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> 所要時間: {ans.timeSpentSec}秒
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs py-4 text-center">まだ解答履歴がありません。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
