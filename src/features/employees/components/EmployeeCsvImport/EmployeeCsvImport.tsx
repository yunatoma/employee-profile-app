import { useRef, useState } from 'react';
import { parseEmployeeCsv, generateCsvTemplate, type CsvRow } from '../../utils/parseEmployeeCsv';
import type { EmployeeFormValues } from '../../types/employee';

type Props = {
  onImport: (rows: EmployeeFormValues[]) => Promise<void>;
  importing: boolean;
};

function downloadCsv(filename: string, content: string) {
  const bom = '\uFEFF'; // Excel で文字化けしないよう BOM 付き UTF-8
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EmployeeCsvImport({ onImport, importing }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  const handleDownloadTemplate = () => {
    downloadCsv('社員登録_雛形.csv', generateCsvTemplate());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseEmployeeCsv(text);
      setHeaderError(result.headerError ?? null);
      setRows(result.rows);
    };
    reader.readAsText(file, 'UTF-8');
    // 同じファイルを再選択できるようリセット
    e.target.value = '';
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    await onImport(validRows.map((r) => r.values));
    setRows([]);
    setFileName(null);
    setHeaderError(null);
  };

  return (
    <div className="space-y-5">
      {/* ボタン行 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          雛形をダウンロード
        </button>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          CSVファイルを選択
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {fileName && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{fileName}</span>
        )}
      </div>

      {/* ヘッダーエラー */}
      {headerError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {headerError}
        </div>
      )}

      {/* 読み込み結果サマリ */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            合計 {rows.length} 件
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            正常 {validRows.length} 件
          </span>
          {errorRows.length > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              エラー {errorRows.length} 件
            </span>
          )}
        </div>
      )}

      {/* プレビューテーブル */}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-max w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">行</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">状態</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">氏名</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">メールアドレス</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">部署</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">職種</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">入社日</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">エラー内容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => (
                <tr
                  key={row.row}
                  className={
                    row.errors.length > 0
                      ? 'bg-red-50 dark:bg-red-900/10'
                      : 'bg-white dark:bg-gray-900'
                  }
                >
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.row}</td>
                  <td className="px-3 py-2">
                    {row.errors.length === 0 ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        エラー
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{row.values.name || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.values.email || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.values.department || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.values.position || '—'}</td>
                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.values.joinedAt || '—'}</td>
                  <td className="px-3 py-2">
                    {row.errors.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5">
                        {row.errors.map((err, i) => (
                          <li key={i} className="text-xs text-red-600 dark:text-red-400">
                            {err}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 一括登録ボタン */}
      {validRows.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {importing ? '登録中...' : `正常な ${validRows.length} 件を一括登録`}
          </button>
          {errorRows.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ※ エラー行はスキップされます
            </p>
          )}
        </div>
      )}
    </div>
  );
}
