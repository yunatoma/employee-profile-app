import { describe, it, expect } from 'vitest';
import {
  parseOrgCsv,
  validateOrgCsvRows,
  buildOrgChanges,
  generateOrgCsvTemplate,
} from './parseOrgCsv';
import type { Employee } from '../types/employee';

// ─── テスト用データ ───────────────────────────────────
const BASE: Omit<Employee, 'id' | 'name' | 'email' | 'position' | 'managerId'> = {
  department: '開発部',
  employmentType: 'full-time',
  status: 'active',
  joinedAt: '2022-04-01',
  skills: [],
  projects: [],
  profile: '',
};

const EMPLOYEES: Employee[] = [
  { ...BASE, id: '1', name: '山田 太郎', email: 'yamada@example.com', position: 'テックリード' },
  { ...BASE, id: '2', name: '佐藤 花子', email: 'sato@example.com', position: 'エンジニア', managerId: '1' },
  { ...BASE, id: '3', name: '鈴木 一郎', email: 'suzuki@example.com', position: 'エンジニア', managerId: '1' },
];

const VALID_CSV = `メールアドレス,上司のメールアドレス,役職
yamada@example.com,,テックリード
sato@example.com,yamada@example.com,エンジニア
suzuki@example.com,yamada@example.com,シニアエンジニア`;

// ─── parseOrgCsv ─────────────────────────────────────
describe('parseOrgCsv', () => {
  it('正常なCSVを解析してエラーなしの行を返す', () => {
    const result = parseOrgCsv(VALID_CSV);
    expect(result.headerError).toBeUndefined();
    expect(result.rows).toHaveLength(3);
  });

  it('各フィールドを正しく取り出す', () => {
    const result = parseOrgCsv(VALID_CSV);
    expect(result.rows[0].email).toBe('yamada@example.com');
    expect(result.rows[0].managerEmail).toBe('');
    expect(result.rows[0].position).toBe('テックリード');
    expect(result.rows[1].managerEmail).toBe('yamada@example.com');
  });

  it('行番号がヘッダーを1行目とした実際の行番号を反映する', () => {
    const result = parseOrgCsv(VALID_CSV);
    expect(result.rows[0].row).toBe(2);
    expect(result.rows[2].row).toBe(4);
  });

  it('空のCSVのとき headerError を返す', () => {
    const result = parseOrgCsv('');
    expect(result.headerError).toBe('CSVが空です');
  });

  it('必須ヘッダーが欠けているとき headerError を返す', () => {
    const result = parseOrgCsv('メールアドレス\nyamada@example.com');
    expect(result.headerError).toMatch(/必須ヘッダーがありません/);
    expect(result.rows).toHaveLength(0);
  });

  it('ヘッダーのみで行なしのとき rows が空配列', () => {
    const result = parseOrgCsv('メールアドレス,上司のメールアドレス,役職');
    expect(result.headerError).toBeUndefined();
    expect(result.rows).toHaveLength(0);
  });

  it('CRLF改行のCSVを正常に解析できる', () => {
    const csv =
      'メールアドレス,上司のメールアドレス,役職\r\n' +
      'yamada@example.com,,テックリード\r\n';
    const result = parseOrgCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe('yamada@example.com');
  });
});

// ─── validateOrgCsvRows ──────────────────────────────
describe('validateOrgCsvRows', () => {
  it('正常な行はエラーなし', () => {
    const { rows } = parseOrgCsv(VALID_CSV);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated.every((r) => r.errors.length === 0)).toBe(true);
  });

  it('メールアドレスが空のときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\n,,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('メールアドレスは必須です');
  });

  it('メールアドレスの形式が不正のときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\nnot-email,,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('メールアドレスの形式が正しくありません');
  });

  it('システムに存在しない社員のときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\nunknown@example.com,,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('この社員はシステムに存在しません');
  });

  it('上司のメールアドレスの形式が不正のときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\nyamada@example.com,bad-email,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('上司のメールアドレスの形式が正しくありません');
  });

  it('上司がシステムにも CSV にも存在しないときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\nyamada@example.com,ghost@example.com,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('上司の社員がシステムに存在しません');
  });

  it('自分自身を上司にするときエラー', () => {
    const { rows } = parseOrgCsv(`メールアドレス,上司のメールアドレス,役職\nyamada@example.com,yamada@example.com,エンジニア`);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toContain('自分自身を上司に設定することはできません');
  });

  it('循環参照を検出する（A→B, B→A）', () => {
    const csv = `メールアドレス,上司のメールアドレス,役職
yamada@example.com,sato@example.com,エンジニア
sato@example.com,yamada@example.com,エンジニア`;
    const { rows } = parseOrgCsv(csv);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const cycleErrors = validated.filter((r) =>
      r.errors.includes('上司の設定が循環しています'),
    );
    expect(cycleErrors.length).toBeGreaterThan(0);
  });

  it('上司がCSV内の別行の社員でもOK', () => {
    // sato の上司を yamada に変更（yamada も CSV 内に存在）
    const csv = `メールアドレス,上司のメールアドレス,役職
yamada@example.com,,テックリード
sato@example.com,yamada@example.com,エンジニア`;
    const { rows } = parseOrgCsv(csv);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[1].errors).toHaveLength(0);
  });

  it('上司が空文字のとき（ルートレベル）エラーなし', () => {
    const csv = `メールアドレス,上司のメールアドレス,役職\nyamada@example.com,,テックリード`;
    const { rows } = parseOrgCsv(csv);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    expect(validated[0].errors).toHaveLength(0);
  });
});

// ─── buildOrgChanges ─────────────────────────────────
describe('buildOrgChanges', () => {
  it('メールアドレスからIDに正しく変換する', () => {
    const { rows } = parseOrgCsv(VALID_CSV);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes[0].employeeId).toBe('1');
    expect(changes[1].employeeId).toBe('2');
  });

  it('上司メールが空のとき managerId が undefined になる', () => {
    const { rows } = parseOrgCsv(VALID_CSV);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes[0].managerId).toBeUndefined();
  });

  it('上司メールがあるとき managerId が上司のIDになる', () => {
    const { rows } = parseOrgCsv(VALID_CSV);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes[1].managerId).toBe('1');
  });

  it('役職が指定されているとき position に反映される', () => {
    const { rows } = parseOrgCsv(VALID_CSV);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes[2].position).toBe('シニアエンジニア');
  });

  it('役職が空のとき既存の position を維持する', () => {
    const csv = `メールアドレス,上司のメールアドレス,役職\nyamada@example.com,,`;
    const { rows } = parseOrgCsv(csv);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes[0].position).toBe('テックリード'); // 既存値
  });

  it('エラーのある行は変更に含まれない', () => {
    const csv = `メールアドレス,上司のメールアドレス,役職
yamada@example.com,,テックリード
unknown@example.com,,エンジニア`;
    const { rows } = parseOrgCsv(csv);
    const validated = validateOrgCsvRows(rows, EMPLOYEES);
    const changes = buildOrgChanges(validated, EMPLOYEES);
    expect(changes).toHaveLength(1);
    expect(changes[0].employeeId).toBe('1');
  });
});

// ─── generateOrgCsvTemplate ──────────────────────────
describe('generateOrgCsvTemplate', () => {
  it('1行目が正しいヘッダーである', () => {
    const csv = generateOrgCsvTemplate(EMPLOYEES);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('メールアドレス,上司のメールアドレス,役職');
  });

  it('社員数分のデータ行が含まれる', () => {
    const csv = generateOrgCsvTemplate(EMPLOYEES);
    const lines = csv.split('\n').filter(Boolean);
    expect(lines).toHaveLength(EMPLOYEES.length + 1); // ヘッダー + 社員数
  });

  it('上司のメールアドレスが正しく出力される', () => {
    const csv = generateOrgCsvTemplate(EMPLOYEES);
    const lines = csv.split('\n').filter(Boolean);
    // sato (managerId='1') の行を探して上司のメールが yamada@example.com であること
    const satoLine = lines.find((l) => l.startsWith('sato@example.com'));
    expect(satoLine).toContain('yamada@example.com');
  });

  it('上司なし（ルート）のとき上司のメールアドレスが空', () => {
    const csv = generateOrgCsvTemplate(EMPLOYEES);
    const lines = csv.split('\n').filter(Boolean);
    const yamadaLine = lines.find((l) => l.startsWith('yamada@example.com'));
    // yamada@example.com,,テックリード
    expect(yamadaLine).toMatch(/^yamada@example\.com,,/);
  });

  it('社員が空のとき行なし', () => {
    const csv = generateOrgCsvTemplate([]);
    const lines = csv.split('\n').filter(Boolean);
    expect(lines).toHaveLength(1); // ヘッダーのみ
  });
});
