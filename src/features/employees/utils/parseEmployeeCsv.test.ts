import { describe, it, expect } from 'vitest';
import {
  parseRawCsv,
  parseEmployeeCsv,
  validateCsvRow,
  generateCsvTemplate,
} from './parseEmployeeCsv';
import type { EmployeeFormValues } from '../types/employee';

// ─── ヘルパー ────────────────────────────────────────
const VALID_ROW: EmployeeFormValues = {
  name: '山田 太郎',
  email: 'yamada@example.com',
  department: '開発部',
  position: 'エンジニア',
  employmentType: 'full-time',
  status: 'active',
  joinedAt: '2022-04-01',
  skills: ['React'],
  projects: [],
  profile: '',
};

const VALID_CSV = `氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール
山田 太郎,yamada@example.com,開発部,エンジニア,full-time,active,2022-04-01,React|TypeScript,管理画面リニューアル,得意です
佐藤 花子,sato@example.com,デザイン部,デザイナー,part-time,active,2021-10-01,Figma,,`;

// ─── parseRawCsv ────────────────────────────────────
describe('parseRawCsv', () => {
  it('カンマ区切りの基本的な CSV を解析できる', () => {
    const result = parseRawCsv('a,b,c\n1,2,3');
    expect(result).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('ダブルクォートで囲まれたフィールドを解析できる', () => {
    const result = parseRawCsv('"hello, world",b');
    expect(result[0]).toEqual(['hello, world', 'b']);
  });

  it('ダブルクォートのエスケープ（""）を処理できる', () => {
    const result = parseRawCsv('"say ""hi""",b');
    expect(result[0]).toEqual(['say "hi"', 'b']);
  });

  it('CRLF 改行を処理できる', () => {
    const result = parseRawCsv('a,b\r\n1,2');
    expect(result).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('空行を無視する', () => {
    const result = parseRawCsv('a,b\n\n1,2');
    expect(result).toEqual([['a', 'b'], ['1', '2']]);
  });
});

// ─── validateCsvRow ─────────────────────────────────
describe('validateCsvRow', () => {
  it('正常な行はエラーなし', () => {
    const errors = validateCsvRow(VALID_ROW, ['yamada@example.com']);
    expect(errors).toHaveLength(0);
  });

  it('氏名が空のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, name: '' }, ['yamada@example.com']);
    expect(errors).toContain('氏名は必須です');
  });

  it('メールアドレスが空のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, email: '' }, ['']);
    expect(errors).toContain('メールアドレスは必須です');
  });

  it('メールアドレスの形式が不正のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, email: 'not-an-email' }, ['not-an-email']);
    expect(errors).toContain('メールアドレスの形式が正しくありません');
  });

  it('同じ CSV 内でメールアドレスが重複しているとき エラー', () => {
    const emails = ['yamada@example.com', 'yamada@example.com'];
    const errors = validateCsvRow(VALID_ROW, emails);
    expect(errors).toContain('同じCSV内でメールアドレスが重複しています');
  });

  it('部署が空のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, department: '' }, ['yamada@example.com']);
    expect(errors).toContain('部署は必須です');
  });

  it('職種が空のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, position: '' }, ['yamada@example.com']);
    expect(errors).toContain('職種は必須です');
  });

  it('無効な雇用形態のとき エラー', () => {
    const errors = validateCsvRow(
      { ...VALID_ROW, employmentType: 'invalid' as any },
      ['yamada@example.com'],
    );
    expect(errors.some((e) => e.includes('雇用形態'))).toBe(true);
  });

  it('無効なステータスのとき エラー', () => {
    const errors = validateCsvRow(
      { ...VALID_ROW, status: 'unknown' as any },
      ['yamada@example.com'],
    );
    expect(errors.some((e) => e.includes('ステータス'))).toBe(true);
  });

  it('入社日が空のとき エラー', () => {
    const errors = validateCsvRow({ ...VALID_ROW, joinedAt: '' }, ['yamada@example.com']);
    expect(errors).toContain('入社日は必須です');
  });

  it('入社日の形式が不正のとき エラー', () => {
    const errors = validateCsvRow(
      { ...VALID_ROW, joinedAt: '20220401' },
      ['yamada@example.com'],
    );
    expect(errors).toContain('入社日は YYYY-MM-DD 形式で入力してください');
  });

  it('入社日が未来のとき エラー', () => {
    const errors = validateCsvRow(
      { ...VALID_ROW, joinedAt: '2099-01-01' },
      ['yamada@example.com'],
    );
    expect(errors).toContain('入社日に未来の日付は入力できません');
  });

  it('複数のエラーをまとめて返す', () => {
    const errors = validateCsvRow(
      { ...VALID_ROW, name: '', email: '' },
      [''],
    );
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── parseEmployeeCsv ────────────────────────────────
describe('parseEmployeeCsv', () => {
  it('正常な CSV を解析してエラーなしの行を返す', () => {
    const result = parseEmployeeCsv(VALID_CSV);
    expect(result.headerError).toBeUndefined();
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].errors).toHaveLength(0);
    expect(result.rows[1].errors).toHaveLength(0);
  });

  it('スキルを | で分割して配列に変換する', () => {
    const result = parseEmployeeCsv(VALID_CSV);
    expect(result.rows[0].values.skills).toEqual(['React', 'TypeScript']);
  });

  it('参画プロジェクトを | で分割して配列に変換する', () => {
    const result = parseEmployeeCsv(VALID_CSV);
    expect(result.rows[0].values.projects).toEqual(['管理画面リニューアル']);
  });

  it('スキル・プロジェクトが空のとき空配列を返す', () => {
    const result = parseEmployeeCsv(VALID_CSV);
    expect(result.rows[1].values.skills).toEqual(['Figma']);
    expect(result.rows[1].values.projects).toEqual([]);
  });

  it('行番号が CSV の実際の行番号（ヘッダー=1行目）を反映する', () => {
    const result = parseEmployeeCsv(VALID_CSV);
    expect(result.rows[0].row).toBe(2);
    expect(result.rows[1].row).toBe(3);
  });

  it('空の CSV のとき headerError を返す', () => {
    const result = parseEmployeeCsv('');
    expect(result.headerError).toBe('CSVが空です');
  });

  it('必須ヘッダーが欠けているとき headerError を返す', () => {
    const csv = '氏名,メールアドレス\n山田,yamada@example.com';
    const result = parseEmployeeCsv(csv);
    expect(result.headerError).toMatch(/必須ヘッダーがありません/);
    expect(result.rows).toHaveLength(0);
  });

  it('バリデーションエラーのある行を errors に格納する', () => {
    const csv = `氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール
,invalid-email,,,bad-type,bad-status,not-a-date,,, `;
    const result = parseEmployeeCsv(csv);
    expect(result.rows[0].errors.length).toBeGreaterThan(0);
  });

  it('CSV 内のメール重複をエラーとして検出する', () => {
    const csv = `氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール
山田 太郎,dup@example.com,開発部,エンジニア,full-time,active,2022-04-01,,,
佐藤 花子,dup@example.com,開発部,エンジニア,full-time,active,2022-04-01,,,`;
    const result = parseEmployeeCsv(csv);
    expect(result.rows[0].errors).toContain('同じCSV内でメールアドレスが重複しています');
    expect(result.rows[1].errors).toContain('同じCSV内でメールアドレスが重複しています');
  });

  it('ヘッダーのみで行なし のとき rows が空配列', () => {
    const csv = '氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール';
    const result = parseEmployeeCsv(csv);
    expect(result.headerError).toBeUndefined();
    expect(result.rows).toHaveLength(0);
  });

  it('CRLF 改行の CSV を正常に解析できる', () => {
    const csv =
      '氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール\r\n' +
      '山田 太郎,yamada@example.com,開発部,エンジニア,full-time,active,2022-04-01,,,\r\n';
    const result = parseEmployeeCsv(csv);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].errors).toHaveLength(0);
  });
});

// ─── generateCsvTemplate ────────────────────────────
describe('generateCsvTemplate', () => {
  it('1行目が正しいヘッダーである', () => {
    const csv = generateCsvTemplate();
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe(
      '氏名,メールアドレス,部署,職種,雇用形態,ステータス,入社日,スキル,参画プロジェクト,プロフィール',
    );
  });

  it('サンプル行（2行目）が含まれる', () => {
    const csv = generateCsvTemplate();
    const lines = csv.split('\n').filter(Boolean);
    expect(lines).toHaveLength(2);
  });
});
