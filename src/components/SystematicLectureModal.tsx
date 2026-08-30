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
    /* 1. 最背面オーバーレイ (ナビバー z-50 を完全上回る z-[999]) */
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
    >
      {/* 2. モーダル本体コンテナ (高さ上限 88vh, flex-col でヘッダー・本文・フッター分離) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* 3. 固定ヘッダー (flex-shrink-0 で常時最上部に固定) */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">🎓</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-1">
                {data?.theme || '体系化ガイド & 派生ナレッジ'}
              </h2>
              <p className="text-xs text-indigo-400 font-medium line-clamp-1">
                {data ? `シラバス: ${data.syllabusCategoryName}` : 'シラバス出題テーマ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4. スクロール可能コンテンツ (flex-1 overflow-y-auto で中身のみスクロール) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain text-slate-200 text-sm custom-scrollbar">
          {loading ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs sm:text-sm">出題キーワードからコア解説・派生概念・比較表を生成中...</p>
            </div>
          ) : data ? (
            <>
              {/* Textbook Reference Banner */}
              {tbRef && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 text-slate-200 text-xs sm:text-sm space-y-2 shadow-md">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Book className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-extrabold text-emerald-300 text-xs sm:text-sm">
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

                  <p className="text-[11px] sm:text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    💡 演習中に疑問を持った際、手元の電子版PDFの <strong className="text-emerald-300">p.{tbRef.page}</strong> を開くと該当節の解説・図解を復習できます。
                  </p>
                </div>
              )}

              {/* 🔑 1. Core Keywords Section (コアキーワード解説) */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-indigo-400 shrink-0" />
                  🔑 ① 本問のコアキーワード解説
                </h3>

                <div className="space-y-3">
                  {data.coreKeywords.map((kw, i) => (
                    <div
                      key={i}
                      className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-black">
                          {kw.term}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          ■ 定義・役割（シラバス公式定義）:
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                          {kw.definition}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs sm:text-sm">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> ■ 本問での問われ方・正解のポイント:
                        </span>
                        <p className="text-amber-200 font-medium leading-relaxed bg-amber-950/30 p-3 rounded-lg border border-amber-500/30">
                          {kw.examPoint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🌐 2. Derived Concepts Section (派生・関連キーワード解説) */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  🌐 ② 派生・関連キーワード解説（周辺知識の体系化）
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.derivedConcepts.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/30 space-y-2 transition-colors shadow-sm"
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
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 📊 3. Comparison Matrix Section (概念比較マトリックス表) */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-400 shrink-0" />
                  📊 ③ 概念比較マトリックス表（対比軸の整理）
                </h3>

                {/* PC Layout Table */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="bg-slate-800/90 text-indigo-300 uppercase tracking-wider font-bold border-b border-slate-700">
                      <tr>
                        {data.comparisonMatrix.headers.map((h, idx) => (
                          <th key={idx} className="p-3.5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {data.comparisonMatrix.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors">
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
                <div className="block sm:hidden space-y-3">
                  {data.comparisonMatrix.rows.map((row, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2.5 shadow-md"
                    >
                      <div className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30 inline-block">
                        {row[0]}
                      </div>
                      {row.slice(1).map((val, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block">
                            {data.comparisonMatrix.headers[idx + 1] || '項目'}:
                          </span>
                          <p className="text-slate-200 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                            {val}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 🎯 4. Standard Rules Section (IPA試験の定石ルール) */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  🎯 ④ IPA試験で加点される「解答の定石ルール」
                </h3>
                <ul className="space-y-2 text-xs text-amber-100 font-medium">
                  {data.standardRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-lg border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* 5. 固定フッター (教科書参照 & 閉じるボタン) */}
        <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="line-clamp-1 pr-2">
            {tbRef ? (
              <span className="text-emerald-300 font-medium">
                📖 教科書参照: {tbRef.chapter} {tbRef.section} (p.{tbRef.page}〜)
              </span>
            ) : (
              <span>Esc キーまたは外枠クリックで閉じられます</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors flex-shrink-0"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
