'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Table, Lightbulb, X, ShieldCheck, Zap, KeyRound, Book, Sparkles, Layers, ArrowRight } from 'lucide-react';

export interface CoreKeyword {
  term: string;
  definition: string;
  examPoint: string;
}

export interface DerivedConcept {
  term: string;
  relationType: '対比' | '上位/下位' | '周辺技術' | '関連手法';
  explanation: string;
}

export interface ComparisonMatrix {
  headers: string[];
  rows: string[][];
}

export interface SystematicLectureResponse {
  theme: string;
  syllabusCategoryName: string;
  textbookRef?: {
    chapter: string;
    section: string;
    page: number;
  };
  coreKeywords: CoreKeyword[];
  derivedConcepts: DerivedConcept[];
  comparisonMatrix: ComparisonMatrix;
  standardRules: string[];
}

interface SystematicLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  title: string | null;
  bodyText: string;
  modelAnswerText?: string;
}

export default function SystematicLectureModal({
  isOpen,
  onClose,
  questionId,
  title,
  bodyText,
  modelAnswerText = '',
}: SystematicLectureModalProps) {
  const [data, setData] = useState<SystematicLectureResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Esc key listener for modal closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background page scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fetch Lecture Data from API
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/systematic-lecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId,
        theme: title || '',
        bodyText,
        modelAnswer: modelAnswerText,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to fetch systematic lecture:', err))
      .finally(() => setLoading(false));
  }, [isOpen, questionId, title, bodyText, modelAnswerText]);

  if (!isOpen) return null;

  const tbRef = data?.textbookRef;

  const getRelationBadgeStyle = (type: string) => {
    switch (type) {
      case '対比':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case '上位/下位':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case '周辺技術':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case '関連手法':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    /* Viewport Outer Container */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto p-3 md:p-6 flex justify-center items-start sm:items-center bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-4xl max-h-[85vh] my-auto flex flex-col rounded-2xl md:rounded-3xl border border-indigo-500/40 shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Fixed Top Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
              <GraduationCap className="w-5 h-5 md:w-7 md:h-7 text-indigo-400" />
            </div>
            <div>
              <span className="text-[9px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                {data ? `シラバス: ${data.syllabusCategoryName}` : 'AP Systematic Lecture Card'}
              </span>
              <h2 className="text-sm md:text-xl font-black text-slate-100 leading-snug line-clamp-1">
                {data?.theme || '体系化ガイド（キーワード・派生・比較表・定石）'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 md:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-7 custom-scrollbar">
          {loading ? (
            <div className="p-10 md:p-12 text-center space-y-3">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs md:text-sm">出題キーワードからコア解説・派生概念・比較表を生成中...</p>
            </div>
          ) : data ? (
            <>
              {/* Textbook Reference Banner */}
              {tbRef && (
                <div className="p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 text-slate-200 text-xs md:text-sm space-y-2 shadow-md">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Book className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-extrabold text-emerald-300 text-xs md:text-sm">
                        📖 手元テキスト参照 (電子版PDF対応):
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      p.{tbRef.page}〜
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-200">
                    <div className="text-emerald-200 font-semibold">
                      {tbRef.chapter} （{tbRef.section}）
                    </div>
                  </div>

                  <p className="text-[11px] md:text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    💡 演習中に疑問を持った際、手元の電子版PDFの <strong className="text-emerald-300">p.{tbRef.page}</strong> を開くと該当節の解説・図解を復習できます。
                  </p>
                </div>
              )}

              {/* 1. Core Keywords Section (本問のコアキーワード解説) */}
              <div className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400 shrink-0" />
                  ① 本問のコアキーワード解説
                </h3>

                <div className="space-y-3">
                  {data.coreKeywords.map((kw, i) => (
                    <div
                      key={i}
                      className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-black">
                          {kw.term}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs md:text-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          ■ 定義・役割（シラバス公式定義）:
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                          {kw.definition}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs md:text-sm">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> ■ 本問での問われ方・正解のポイント:
                        </span>
                        <p className="text-amber-200 font-medium leading-relaxed bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                          {kw.examPoint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Derived Concepts Section (派生・関連キーワード解説) */}
              <div className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  ② 派生・関連キーワード解説（周辺知識の体系化）
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.derivedConcepts.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/30 space-y-2 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          {item.term}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getRelationBadgeStyle(item.relationType)}`}>
                          {item.relationType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Comparison Matrix Section (概念比較マトリックス表) */}
              <div className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-400 shrink-0" />
                  ③ 概念比較マトリックス表（対比軸の整理）
                </h3>

                {/* PC Layout Table */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="bg-indigo-950/80 text-indigo-300 uppercase tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        {data.comparisonMatrix.headers.map((h, idx) => (
                          <th key={idx} className="p-3.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {data.comparisonMatrix.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-indigo-950/30 transition-colors">
                          {row.map((cell, j) => (
                            <td
                              key={j}
                              className={`p-3.5 ${
                                j === 0
                                  ? 'font-bold text-indigo-200'
                                  : j === row.length - 1
                                  ? 'text-amber-200 font-semibold'
                                  : 'text-slate-300 leading-relaxed'
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Layout Cards */}
                <div className="block md:hidden space-y-3">
                  {data.comparisonMatrix.rows.map((row, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2 shadow-md"
                    >
                      <div className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 inline-block">
                        {row[0]}
                      </div>
                      {row.slice(1).map((val, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {data.comparisonMatrix.headers[idx + 1] || '項目'}:
                          </span>
                          <p className="text-slate-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                            {val}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. IPA Standard Rules Section (IPA試験の定石ルール) */}
              <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 md:space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  ④ IPA試験で加点される「解答の定石ルール」
                </h3>
                <ul className="space-y-2 text-xs text-amber-100 font-medium">
                  {data.standardRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Fixed Bottom Action Footer */}
        <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[10px] md:text-xs text-slate-400">
            {tbRef ? `教科書参照: ${tbRef.chapter} (p.${tbRef.page}〜) | Escキーまたは外枠で閉じられます` : 'Esc キーまたは外枠クリックで閉じられます'}
          </span>
          <button
            onClick={onClose}
            className="px-4 md:px-5 py-1.5 md:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
