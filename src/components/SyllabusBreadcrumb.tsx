'use client';

import React from 'react';
import { ChevronRight, FolderTree, Tag } from 'lucide-react';

export interface BreadcrumbItem {
  code: string;
  name: string;
  level: number;
}

export interface SyllabusKeywordItem {
  id: string;
  name: string;
}

interface SyllabusBreadcrumbProps {
  breadcrumbPath?: BreadcrumbItem[];
  keywords?: SyllabusKeywordItem[];
  onSelectSyllabusCode?: (code: string) => void;
}

export default function SyllabusBreadcrumb({
  breadcrumbPath = [],
  keywords = [],
  onSelectSyllabusCode,
}: SyllabusBreadcrumbProps) {
  if (!breadcrumbPath || breadcrumbPath.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-sm">
      {/* Breadcrumb Hierarchy Path */}
      <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-300">
        <FolderTree className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
          IPA シラバス:
        </span>
        {breadcrumbPath.map((item, index) => (
          <React.Fragment key={item.code}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
            <button
              onClick={() => onSelectSyllabusCode && onSelectSyllabusCode(item.code)}
              className={`hover:underline cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                index === breadcrumbPath.length - 1
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Keywords Badges */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          <Tag className="w-3 h-3 text-slate-500 mr-0.5" />
          {keywords.slice(0, 4).map((kw) => (
            <span
              key={kw.id}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750 font-mono"
            >
              {kw.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
