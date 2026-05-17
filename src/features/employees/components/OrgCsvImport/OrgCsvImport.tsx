import { useRef, useState } from 'react';
import {
  parseOrgCsv,
  validateOrgCsvRows,
  buildOrgChanges,
  generateOrgCsvTemplate,
  type OrgCsvRow,
  type OrgChange,
} from '../../utils/parseOrgCsv';
import type { Employee } from '../../types/employee';

type Props = {
  employees: Employee[];
  onImport: (changes: OrgChange[]) => Promise<void>;
  importing: boolean;
};

function downloadCsv(filename: string, content: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function OrgCsvImport({ employees, onImport, importing }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<OrgCsvRow[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const emailToEmployee = new Map(employees.map((e) => [e.email, e]));
  const idToEmployee = new Map(employees.map((e) => [e.id, e]));

  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  const changes = buildOrgChanges(validRows, employees);
  // 実際に値が変わる行だけカウント
  const changedRows = changes.filter((c) => {
    const emp = employees.find((e) => e.id === c.employeeId);
    if (!emp) return false;
    return emp.managerId !== c.managerId || emp.position !== c.position;
  });

  const handleDownloadTemplate = () => {
    downloadCsv('組織図_雛形.csv', generateOrgCsvTemplate(employees));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseOrgCsv(text);
      setHeaderError(parsed.headerError ?? null);
      if (parsed.headerError) {
        setRows([]);
      } else {
        setRows(validateOrgCsvRows(parsed.rows, employees));
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleImport = async () => {
    if (changedRows.length === 0) return;
    await onImport(changedRows);
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
          現在の構成をダウンロード
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

      {/* CSV形式説明 */}
      {rows.length === 0 && !headerError && (
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">CSVの形式</p>
          <p>列: <code className="rounded bg-gray-200 px-1 dark:bg-gray-700">メールアドレス</code>・<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">上司のメールアドレス</code>・<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">役職</code></p>
          <p className="mt-1">「現在の構成をダウンロード」で現状をCSVに出力し、編集して再アップロードしてください。上司なし（ルートレベル）は上司のメールアドレスを空にしてください。</p>
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
          {changedRows.length > 0 && (
            <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              変更あり {changedRows.length} 件
            </span>
          )}
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
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">社員名</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">役職</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">上司</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">エラー内容</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row) => {
                const emp = emailToEmployee.get(row.email);
                const newManager = row.managerEmail
                  ? emailToEmployee.get(row.managerEmail)
                  : null;
                const currentManager = emp?.managerId
                  ? idToEmployee.get(emp.managerId)
                  : null;

                const positionChanged = emp && row.position && emp.position !== row.position;
                const managerChanged =
                  emp &&
                  row.errors.length === 0 &&
                  (emp.managerId ?? '') !== (newManager?.id ?? '');
                const hasChange = positionChanged || managerChanged;

                let statusBadge: React.ReactNode;
                if (row.errors.length > 0) {
                  statusBadge = (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      エラー
                    </span>
                  );
                } else if (hasChange) {
                  statusBadge = (
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                      変更あり
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      変更なし
                    </span>
                  );
                }

                return (
                  <tr
                    key={row.row}
                    className={
                      row.errors.length > 0
                        ? 'bg-red-50 dark:bg-red-900/10'
                        : hasChange
                        ? 'bg-sky-50/50 dark:bg-sky-900/5'
                        : 'bg-white dark:bg-gray-900'
                    }
                  >
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{row.row}</td>
                    <td className="px-3 py-2">{statusBadge}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white whitespace-nowrap">
                      {emp?.name ?? row.email}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {positionChanged ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          <span className="line-through text-gray-400 dark:text-gray-600">{emp?.position}</span>
                          {' → '}
                          <span className="text-sky-600 dark:text-sky-400 font-medium">{row.position}</span>
                        </span>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{row.position || emp?.position || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {managerChanged ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          <span className="line-through text-gray-400 dark:text-gray-600">
                            {currentManager?.name ?? '（なし）'}
                          </span>
                          {' → '}
                          <span className="text-sky-600 dark:text-sky-400 font-medium">
                            {newManager?.name ?? '（なし）'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {currentManager?.name ?? '—'}
                        </span>
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 適用ボタン */}
      {changedRows.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {importing ? '適用中...' : `${changedRows.length} 件の変更を適用`}
          </button>
          {errorRows.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ※ エラー行はスキップされます
            </p>
          )}
        </div>
      )}

      {validRows.length > 0 && changedRows.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          変更はありません（現在の組織図と同じ内容です）
        </p>
      )}
    </div>
  );
}
