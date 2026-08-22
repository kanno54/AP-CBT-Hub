'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Table, Lightbulb, X, RotateCcw } from 'lucide-react';

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

  return (
    /* Viewport Fixed Centered Modal Overlay */
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden"
    >
      {/* Modal Dialog Card (Fixed height limit, scrollable content only) */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside card
        className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl border border-indigo-500/40 shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Fixed Top Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-800/80 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                AP Systematic Lecture Card
              </span>
              <h2 className="text-base md:text-xl font-black text-slate-100 leading-snug">
                {data?.themeTitle || '体系化ガイド（全体像・比較表・定石）'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">出題テーマから体系的講義・比較マトリックス表を生成中...</p>
            </div>
          ) : data ? (
            <>
              {/* Lecture Summary Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 text-slate-200 text-sm leading-relaxed whitespace-pre-line shadow-inner">
                {data.overview}
              </div>

              {/* Comparison Matrix Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-400" />
                  概念比較マトリックス表 (Comparison Matrix)
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90">
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
              </div>

              {/* Exam Golden Rules */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  IPA試験で加点される「解答の定石ルール」
                </h3>
                <ul className="space-y-2 text-xs text-amber-100 font-medium">
                  {data.examRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Fixed Bottom Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">Esc キーまたは外枠クリックで閉じられます</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
