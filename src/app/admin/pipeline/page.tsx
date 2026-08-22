'use client';

import { useState } from 'react';
import { Database, FileText, CheckCircle2, Code, Terminal, UploadCloud, RefreshCw } from 'lucide-react';

export default function PipelinePage() {
  const [jsonText, setJsonText] = useState<string>(`[
  {
    "year": 2025,
    "season": "AUTUMN",
    "examType": "SUBJECT_A",
    "questionNum": 10,
    "category": "NETWORK",
    "title": "DNSサーバーのDNSSEC拡張規格",
    "bodyText": "DNSSEC(DNS Security Extensions)に関する記述のうち、最も適切なものはどれか。",
    "choices": [
      { "symbol": "ア", "text": "公開鍵暗号技術を用いてDNS応答データの送信元認証と改ざん検知を行う。", "isCorrect": true },
      { "symbol": "イ", "text": "DNS通信のパケット全体をIPsecで暗号化する。", "isCorrect": false },
      { "symbol": "ウ", "text": "ゾーン転送時にTCPの代わりにTLSを使用する。", "isCorrect": false },
      { "symbol": "エ", "text": "クエリの送信元IPアドレスを偽装する攻撃を防ぐ。", "isCorrect": false }
    ]
  }
]`);

  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleImport = async () => {
    setLoading(true);
    setMessage('');
    try {
      const parsed = JSON.parse(jsonText);
      // Simulate pipeline API import call
      setTimeout(() => {
        setMessage(`成功: ${parsed.length} 件の過去問データを構造化DBへ登録しました。`);
        setLoading(false);
      }, 800);
    } catch (e: any) {
      setMessage(`エラー: JSON構文が無効です - ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">過去問データパイプライン & DB管理者 UI</h1>
            <p className="text-xs text-slate-400">IPA公式過去問PDFからの自動抽出データ（`scripts/pdf_extractor.py`）の検証と登録</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Python Script Instruction Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> Python PDFデータ抽出スクリプト
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            `scripts/pdf_extractor.py` は、IPA（情報処理推進機構）公式の試験PDFから問題文・選択肢・正解記号・配点・問番号を自動抽出し、Pydanticスキーマを用いて標準JSONへ構造化します。
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <p className="text-slate-500"># 依存ライブラリのインストール</p>
            <p className="text-cyan-400">pip install pdfplumber pydantic</p>
            <p className="text-slate-500 pt-2"># PDF解析とJSON出力の実行</p>
            <p className="text-emerald-400">python scripts/pdf_extractor.py --input ap_2025_spring.pdf</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> パイプライン処理のフロー
            </h3>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>IPA問題PDFをダウンロードして `scripts/` ディレクトリに配置</li>
              <li>`pdf_extractor.py` が問題ブロック・選択肢（ア〜エ）を正規表現パース</li>
              <li>分野分類アルゴリズムがテクノロジ・マネジメント・ストラテジへ振り分け</li>
              <li>出力されたJSONデータを右側のフォームからDBへ直接流し込み</li>
            </ol>
          </div>
        </div>

        {/* JSON Import & Database Sync Panel */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" /> 構造化JSONデータのDBインポート
            </h2>
            <span className="text-xs text-slate-400">Prisma SQLite Direct Sync</span>
          </div>

          <p className="text-xs text-slate-300">
            抽出された問題データのJSON構造を検証し、SQLite DBへ一括登録できます。
          </p>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
          />

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                message.startsWith('エラー')
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setJsonText(`[
  {
    "year": 2025,
    "season": "SPRING",
    "examType": "SUBJECT_A",
    "questionNum": 8,
    "category": "DATABASE",
    "title": "ACID特性とトランザクション隔離性レベル",
    "bodyText": "RDBMSにおけるACID特性のうち、独立性(Isolation)の説明として最も適切なものはどれか。",
    "choices": [
      { "symbol": "ア", "text": "複数のトランザクションが同時に実行されても、相互に干渉せず順番に実行された場合と同じ結果になること。", "isCorrect": true },
      { "symbol": "イ", "text": "トランザクションが完了すると、その結果は永久に保存されること。", "isCorrect": false },
      { "symbol": "ウ", "text": "トランザクション内の全処理が完了するか、一切実行されないかのいずれかであること。", "isCorrect": false },
      { "symbol": "エ", "text": "データベースの状態が常に整合性を保つこと。", "isCorrect": false }
    ]
  }
]`);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> サンプルJSONリセット
            </button>

            <button
              disabled={loading}
              onClick={handleImport}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" /> DBへインポート実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
