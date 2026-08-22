import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'AP-CBT-Hub | 応用情報技術者 CBT対策＆過去問演習システム',
  description: '応用情報技術者試験(AP)のCBT化に対応。科目A(択一演習)の即時判定、科目B(記述演習)の split-pane CBTエディタ、文字数カウンター、模範解答Diff比較、学習アナリティクスを提供。',
  keywords: ['応用情報技術者', 'AP', 'CBT', '過去問', '情報処理技術者試験', '午前', '午後', '科目A', '科目B'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 AP-CBT-Hub. 応用情報技術者試験 (AP) 独自CBT演習プラットフォーム.</p>
            <p className="text-slate-400">IPA公式過去問データ構造化 DB同期対応</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
