import { parseRawCsv } from './parseEmployeeCsv';
import type { Employee } from '../types/employee';

// ── 定数 ────────────────────────────────────────────
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ORG_CSV_HEADERS = [
  'メールアドレス',
  '上司のメールアドレス',
  '役職',
] as const;

// ── 型 ──────────────────────────────────────────────
export type OrgCsvRow = {
  row: number;
  email: string;
  managerEmail: string;
  position: string;
  errors: string[];
};

export type OrgChange = {
  employeeId: string;
  managerId: string | undefined;
  position: string;
};

export type ParseOrgCsvResult = {
  rows: OrgCsvRow[];
  headerError?: string;
};

// ── 生CSVパース（社員リスト不要） ───────────────────
export function parseOrgCsv(csvText: string): ParseOrgCsvResult {
  const rawRows = parseRawCsv(csvText.trim());

  if (rawRows.length === 0) {
    return { rows: [], headerError: 'CSVが空です' };
  }

  const headers = rawRows[0].map((h) => h.trim());
  const missing = ORG_CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return {
      rows: [],
      headerError: `必須ヘッダーがありません: ${missing.join(', ')}`,
    };
  }

  const get = (raw: string[], header: string) => {
    const idx = headers.indexOf(header);
    return idx >= 0 ? (raw[idx] ?? '').trim() : '';
  };

  const dataRows = rawRows.slice(1);
  const rows: OrgCsvRow[] = dataRows.map((raw, i) => ({
    row: i + 2,
    email: get(raw, 'メールアドレス'),
    managerEmail: get(raw, '上司のメールアドレス'),
    position: get(raw, '役職'),
    errors: [],
  }));

  return { rows };
}

// ── バリデーション（社員リスト照合） ────────────────
export function validateOrgCsvRows(
  rows: OrgCsvRow[],
  employees: Employee[],
): OrgCsvRow[] {
  const emailToEmployee = new Map(employees.map((e) => [e.email, e]));
  const csvEmails = new Set(rows.map((r) => r.email).filter(Boolean));
  // CSV内のメール→上司メールのマップ（循環参照検出用）
  const csvManagerMap = new Map(
    rows.filter((r) => r.managerEmail).map((r) => [r.email, r.managerEmail]),
  );

  return rows.map((row) => {
    const errors: string[] = [];

    // メールアドレス検証
    if (!row.email) {
      errors.push('メールアドレスは必須です');
    } else if (!EMAIL_PATTERN.test(row.email)) {
      errors.push('メールアドレスの形式が正しくありません');
    } else if (!emailToEmployee.has(row.email)) {
      errors.push('この社員はシステムに存在しません');
    }

    // 上司メールアドレス検証
    if (row.managerEmail) {
      if (!EMAIL_PATTERN.test(row.managerEmail)) {
        errors.push('上司のメールアドレスの形式が正しくありません');
      } else if (row.managerEmail === row.email) {
        errors.push('自分自身を上司に設定することはできません');
      } else if (
        !emailToEmployee.has(row.managerEmail) &&
        !csvEmails.has(row.managerEmail)
      ) {
        errors.push('上司の社員がシステムに存在しません');
      } else {
        // 循環参照検出（CSV内の定義を辿る）
        const visited = new Set<string>();
        let current: string = row.email;
        let hasCycle = false;
        while (current) {
          if (visited.has(current)) {
            hasCycle = true;
            break;
          }
          visited.add(current);
          current = csvManagerMap.get(current) ?? '';
        }
        if (hasCycle) {
          errors.push('上司の設定が循環しています');
        }
      }
    }

    return { ...row, errors };
  });
}

// ── 変更オブジェクト生成 ─────────────────────────────
export function buildOrgChanges(
  rows: OrgCsvRow[],
  employees: Employee[],
): OrgChange[] {
  const emailToEmployee = new Map(employees.map((e) => [e.email, e]));

  return rows
    .filter((r) => r.errors.length === 0)
    .map((r) => {
      const emp = emailToEmployee.get(r.email)!;
      const manager = r.managerEmail
        ? emailToEmployee.get(r.managerEmail)
        : undefined;
      return {
        employeeId: emp.id,
        managerId: manager?.id,
        position: r.position || emp.position,
      };
    });
}

// ── 現状をCSV文字列として出力（テンプレート生成） ───
export function generateOrgCsvTemplate(employees: Employee[]): string {
  const emailMap = new Map(employees.map((e) => [e.id, e.email]));
  const header = ORG_CSV_HEADERS.join(',');

  // ルートノード（上司なし）を先に、以降は部署・名前順
  const sorted = [...employees].sort((a, b) => {
    const aIsRoot = !a.managerId ? 0 : 1;
    const bIsRoot = !b.managerId ? 0 : 1;
    if (aIsRoot !== bIsRoot) return aIsRoot - bIsRoot;
    if (a.department !== b.department) return a.department.localeCompare(b.department, 'ja');
    return a.name.localeCompare(b.name, 'ja');
  });

  const dataRows = sorted.map((e) => {
    const managerEmail = e.managerId ? (emailMap.get(e.managerId) ?? '') : '';
    // カンマを含む値をクォート
    const pos = e.position.includes(',') ? `"${e.position}"` : e.position;
    return `${e.email},${managerEmail},${pos}`;
  });

  return [header, ...dataRows, ''].join('\n');
}
