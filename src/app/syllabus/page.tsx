'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FolderTree,
  Search,
  ChevronDown,
  ChevronRight,
  FileCheck,
  Edit3,
  Award,
  BarChart3,
  Sparkles,
  Layers,
  Tag,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface Keyword {
  id: string;
  name: string;
}

interface SyllabusLevel3 {
  id: string;
  code: string;
  level: number;
  name: string;
  keywords: Keyword[];
  _count: {
    questions: number;
  };
}

interface SyllabusLevel2 {
  id: string;
  code: string;
  level: number;
  name: string;
  children: SyllabusLevel3[];
  keywords: Keyword[];
  _count: {
    questions: number;
  };
}

interface SyllabusLevel1 {
  id: string;
  code: string;
  level: number;
  name: string;
  children: SyllabusLevel2[];
  _count: {
    questions: number;
  };
}

interface StatsSummary {
  totalCategories: number;
  totalQuestions: number;
  subjectAQuestions: number;
  subjectBQuestions: number;
  answeredCount: number;
  accuracyRate: number;
}

export default function SyllabusPage() {
  const [syllabusTree, setSyllabusTree] = useState<SyllabusLevel1[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Accordion expanded state for Level 1 and Level 2
  const [expandedL1, setExpandedL1] = useState<Record<string, boolean>>({
    TECH: true,
    MGMT: true,
    STRAT: true,
  });

  const [expandedL2, setExpandedL2] = useState<Record<string, boolean>>({
    TECH_SEC: true,
    TECH_DB: true,
    TECH_NET: true,
    MGMT_PM: true,
  });

  const [stats, setStats] = useState<StatsSummary>({
    totalCategories: 19,
    totalQuestions: 910,
    subjectAQuestions: 800,
    subjectBQuestions: 110,
    answeredCount: 0,
    accuracyRate: 0,
  });

  // Fetch Syllabus Tree & Stats
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch('/api/syllabus').then((res) => res.json()),
      fetch('/api/stats').then((res) => res.json()).catch(() => null),
    ])
      .then(([sylRes, statsRes]) => {
        if (sylRes.success) {
          setSyllabusTree(sylRes.data);

          // Calculate total categories count
          let categoryCount = 0;
          sylRes.data.forEach((l1: SyllabusLevel1) => {
            categoryCount += 1;
            l1.children.forEach((l2) => {
              categoryCount += 1;
              categoryCount += l2.children.length;
            });
          });

          setStats((prev) => ({
            ...prev,
            totalCategories: categoryCount,
          }));
        }

        if (statsRes && statsRes.success) {
          setStats((prev) => ({
            ...prev,
            answeredCount: statsRes.data.totalAnswered || 0,
            accuracyRate: statsRes.data.overallAccuracy || 0,
          }));
        }
      })
      .catch((err) => console.error('Failed to fetch syllabus data:', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleL1 = (code: string) => {
    setExpandedL1((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleL2 = (code: string) => {
    setExpandedL2((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Filter Level 3 subcategories based on searchQuery
  const filterMatchesSearch = (l3: SyllabusLevel3, l2Name: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const textToSearch = (
      l3.name +
      ' ' +
      l3.code +
      ' ' +
      l2Name +
      ' ' +
      l3.keywords.map((k) => k.name).join(' ')
    ).toLowerCase();
    return textToSearch.includes(q);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Page Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              <FolderTree className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-100">IPA公式シラバス 階層ブラウザ</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  AP全910問連動
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                応用情報技術者(AP)シラバス階層体系と過去問800問(科目A)＋110問(科目B)の出題マップ＆特訓ブラウザ
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary Grid (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">① シラバス体系数</span>
            <div className="text-lg md:text-xl font-black text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" /> {stats.totalCategories} 分類項目
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">② 収録過去問総数</span>
            <div className="text-lg md:text-xl font-black text-blue-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" /> {stats.totalQuestions} 問
              <span className="text-[10px] font-normal text-slate-400"> (A:800 / B:110)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">③ 演習解答数</span>
            <div className="text-lg md:text-xl font-black text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {stats.answeredCount} 問演習済
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">④ 正答率</span>
            <div className="text-lg md:text-xl font-black text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> {stats.accuracyRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Keyword Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="シラバス分類・キーワードで即時検索 (例: CSRF, 正規化, EVM, 公開鍵暗号, IPアドレス)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Syllabus Hierarchy Tree Container */}
      {loading ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">IPA公式シラバス階層ツリーをロード中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {syllabusTree.map((l1) => {
            const isL1Expanded = expandedL1[l1.code] || Boolean(searchQuery);

            return (
              <div
                key={l1.id}
                className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden shadow-lg transition-all"
              >
                {/* Level 1 Header (大分類) */}
                <button
                  onClick={() => toggleL1(l1.code)}
                  className="w-full p-4 md:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 hover:from-slate-850 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {isL1Expanded ? (
                        <ChevronDown className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                          {l1.code}
                        </span>
                        <h2 className="text-base md:text-lg font-bold text-slate-100">{l1.name}</h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        中分類 {l1.children.length} 項目所属
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    計 {l1._count.questions} 問収録
                  </span>
                </button>

                {/* Level 1 Content Body */}
                {isL1Expanded && (
                  <div className="p-4 md:p-6 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    {l1.children.map((l2) => {
                      const isL2Expanded = expandedL2[l2.code] || Boolean(searchQuery);

                      // Filter Level 3 subcategories
                      const matchingL3Children = l2.children.filter((l3) =>
                        filterMatchesSearch(l3, l2.name)
                      );

                      if (searchQuery && matchingL3Children.length === 0) return null;

                      return (
                        <div
                          key={l2.id}
                          className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden"
                        >
                          {/* Level 2 Header (中分類) */}
                          <button
                            onClick={() => toggleL2(l2.code)}
                            className="w-full p-3.5 md:p-4 bg-slate-900 hover:bg-slate-850 flex items-center justify-between transition-colors text-left"
                          >
                            <div className="flex items-center gap-2.5">
                              {isL2Expanded ? (
                                <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                {l2.code}
                              </span>
                              <h3 className="text-sm md:text-base font-bold text-slate-200">{l2.name}</h3>
                            </div>

                            <span className="text-xs font-medium text-slate-400">
                              {l2._count.questions} 問
                            </span>
                          </button>

                          {/* Level 2 Content Body (Level 3 小分類 List) */}
                          {isL2Expanded && (
                            <div className="p-3.5 md:p-5 border-t border-slate-800/60 space-y-3 bg-slate-950/60">
                              {matchingL3Children.map((l3) => (
                                <div
                                  key={l3.id}
                                  className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/20 hover:border-indigo-500/40 space-y-3 transition-colors shadow-sm"
                                >
                                  {/* Level 3 Subcategory Title & Badges */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                      <h4 className="text-sm md:text-base font-extrabold text-indigo-200">
                                        {l3.name}
                                      </h4>
                                    </div>
                                    <span className="text-xs text-slate-400 self-start md:self-auto">
                                      収録問題数: <strong className="text-indigo-300 font-bold">{l3._count.questions}問</strong>
                                    </span>
                                  </div>

                                  {/* Important Keywords Tag Badges */}
                                  {l3.keywords && l3.keywords.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        シラバス重要キーワード:
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {l3.keywords.map((kw) => (
                                          <span
                                            key={kw.id}
                                            className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 text-xs font-mono flex items-center gap-1"
                                          >
                                            <Tag className="w-3 h-3 text-indigo-400 shrink-0" />
                                            {kw.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Buttons: Practice Subject A / Subject B */}
                                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                                    <Link
                                      href={`/subject-a?syllabusCode=${l3.code}`}
                                      className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                                    >
                                      <FileCheck className="w-4 h-4 text-blue-200" />
                                      <span>🎯 科目A 択一特訓</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-blue-200 ml-1" />
                                    </Link>

                                    <Link
                                      href={`/subject-b?syllabusCode=${l3.code}`}
                                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-950/60 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                                    >
                                      <Edit3 className="w-4 h-4 text-indigo-400" />
                                      <span>📝 科目B CBT記述演習</span>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
