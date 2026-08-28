'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Table, Lightbulb, X, ShieldCheck, Zap, KeyRound, Book } from 'lucide-react';
import { TextbookReference } from '@/lib/textbook';

export interface ComparisonRow {
  concept: string;
  mechanism: string;
  countermeasure: string;
  keyPoint: string;
}

export interface SystematicLectureData {
  themeTitle: string;
  overview: string;
  comparisonTable: ComparisonRow[];
  examRules: string[];
  textbookReference?: TextbookReference;
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
  const [data, setData] = useState<SystematicLectureData | null>(null);
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

  const tbRef = data?.textbookReference;

  return (
    /* Viewport Outer Container (Scrollable outer container preventing top overflow) */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto p-3 md:p-6 flex justify-center items-start sm:items-center bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      {/* Modal Dialog Card (Fixed max height, header & footer shrink-0, inner content scroll) */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
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
                AP Systematic Lecture Card
              </span>
              <h2 className="text-sm md:text-xl font-black text-slate-100 leading-snug line-clamp-1">
                {data?.themeTitle || '体系化ガイド（全体像・比較表・定石）'}
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
          {loading ? (
            <div className="p-10 md:p-12 text-center space-y-3">
              <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-xs md:text-sm">出題テーマから体系的講義・比較マトリックス表を生成中...</p>
            </div>
          ) : data ? (
            <>
              {/* Textbook Reference Banner */}
              {tbRef && (
                <div className="p-4 md:p-4.5 rounded-xl md:rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40 text-slate-200 text-xs md:text-sm space-y-2 shadow-md">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
                    <div>
                      <span className="text-slate-400">書籍名: </span>
                      <strong className="text-white font-bold">{tbRef.bookTitle}</strong>
                    </div>
                    <div className="text-emerald-200 font-semibold">
                      第{tbRef.chapterNum}章 {tbRef.chapterTitle} （{tbRef.sectionNum} {tbRef.sectionTitle}）
                    </div>
                  </div>

                  <p className="text-[11px] md:text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    💡 演習中に疑問を持った際、手元の電子版PDFの <strong className="text-emerald-300">p.{tbRef.page}</strong> を開くと該当節の解説・図解を復習できます。
                  </p>
                </div>
              )}

              {/* Lecture Summary Box */}
              <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-line shadow-inner">
                {data.overview}
              </div>

              {/* Comparison Section */}
              <div className="space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-400 shrink-0" />
                  概念比較マトリックス表 (Comparison Matrix)
                </h3>

                {/* PC Layout: 4-Column Table (hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="bg-indigo-950/80 text-indigo-300 uppercase tracking-wider font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 w-1/4">概念・用語</th>
                        <th className="p-3.5 w-1/4">発生メカニズム・定義</th>
                        <th className="p-3.5 w-1/4">技術的対策・標準設定</th>
                        <th className="p-3.5 w-1/4">解答キーポイント</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {data.comparisonTable.map((row, i) => (
                        <tr key={i} className="hover:bg-indigo-950/30 transition-colors">
                          <td className="p-3.5 font-bold text-indigo-200">{row.concept}</td>
                          <td className="p-3.5 text-slate-300 leading-relaxed">{row.mechanism}</td>
                          <td className="p-3.5 text-emerald-300 font-medium leading-relaxed">{row.countermeasure}</td>
                          <td className="p-3.5 text-amber-200 leading-relaxed font-semibold">{row.keyPoint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Layout: Responsive Card List (block on mobile) */}
                <div className="block md:hidden space-y-3">
                  {data.comparisonTable.map((row, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5 shadow-md"
                    >
                      {/* Concept Badge Header */}
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800">
                        <span className="text-xs font-black text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                          {row.concept}
                        </span>
                      </div>

                      {/* Mechanism */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3 text-indigo-400" /> 発生メカニズム・定義
                        </span>
                        <p className="text-slate-200 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                          {row.mechanism}
                        </p>
                      </div>

                      {/* Countermeasure */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> 技術的対策・標準設定
                        </span>
                        <p className="text-emerald-200 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20 font-medium leading-relaxed">
                          {row.countermeasure}
                        </p>
                      </div>

                      {/* Key Point */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-400" /> 解答キーポイント
                        </span>
                        <p className="text-amber-200 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20 font-semibold leading-relaxed">
                          {row.keyPoint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Golden Rules */}
              <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5 md:space-y-3">
                <h3 className="text-xs md:text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  IPA試験で加点される「解答の定石ルール」
                </h3>
                <ul className="space-y-2 text-xs text-amber-100 font-medium">
                  {data.examRules.map((rule, idx) => (
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
            {tbRef ? `教科書参照: p.${tbRef.page}〜 | Escキーまたは外枠クリックで閉じられます` : 'Esc キーまたは外枠クリックで閉じられます'}
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
