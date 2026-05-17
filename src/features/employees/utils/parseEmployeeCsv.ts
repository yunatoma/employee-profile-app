import type { EmployeeFormValues, EmploymentType, EmployeeStatus } from '../types/employee';

// ── 定数 ────────────────────────────────────────────
const VALID_EMPLOYMENT_TYPES: EmploymentType[] = ['full-time', 'part-time', 'contract', 'intern'];
const VALID_STATUSES: EmployeeStatus[] = ['active', 'leave', 'retired'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const CSV_HEADERS = [
  '氏名',
  'メールアドレス',
  '部署',
  '職種',
  '雇用形態',
  'ステータス',
  '入社日',
  'スキル',
  '参画プロジェクト',
  'プロフィール',
  '自己紹介文',
  '強み',
  '今伸ばしたいスキル',
  '興味のある分野',
  '趣味・好きなこと',
  '一言メッセージ',
  '勤務地・リモート可否',
  '稼働時間・勤務スタイル',
  '過去の経験・経歴',
  '資格',
] as const;

const REQUIRED_HEADERS: (typeof CSV_HEADERS[number])[] = [
  '氏名',
  'メールアドレス',
  '部署',
  '職種',
  '雇用形態',
  'ステータス',
  '入社日',
];

// ── 型 ──────────────────────────────────────────────
export type CsvRow = {
  row: number;
  values: EmployeeFormValues;
  errors: string[];
};

export type ParseCsvResult = {
  rows: CsvRow[];
  headerError?: string;
};

// ── 生 CSV パーサ（RFC 4180 準拠） ──────────────────
export function parseRawCsv(text: string): string[][] {
  const results: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field);
        field = '';
        results.push(row);
        row = [];
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field);
        field = '';
        results.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }
  // 末尾の行を push
  if (field !== '' || row.length > 0) {
    row.push(field);
    results.push(row);
  }

  return results.filter((r) => r.some((f) => f.trim() !== ''));
}

// ── 1 行バリデーション ───────────────────────────────
export function validateCsvRow(values: EmployeeFormValues, rowEmails: string[]): string[] {
  const errors: string[] = [];

  if (!values.name.trim()) {
    errors.push('氏名は必須です');
  }

  if (!values.email.trim()) {
    errors.push('メールアドレスは必須です');
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.push('メールアドレスの形式が正しくありません');
  } else if (rowEmails.filter((e) => e === values.email).length > 1) {
    errors.push('同じCSV内でメールアドレスが重複しています');
  }

  if (!values.department.trim()) {
    errors.push('部署は必須です');
  }

  if (!values.position.trim()) {
    errors.push('職種は必須です');
  }

  if (!VALID_EMPLOYMENT_TYPES.includes(values.employmentType)) {
    errors.push(
      `雇用形態は ${VALID_EMPLOYMENT_TYPES.join(' / ')} のいずれかを指定してください`,
    );
  }

  if (!VALID_STATUSES.includes(values.status)) {
    errors.push(`ステータスは ${VALID_STATUSES.join(' / ')} のいずれかを指定してください`);
  }

  if (!values.joinedAt.trim()) {
    errors.push('入社日は必須です');
  } else if (!DATE_PATTERN.test(values.joinedAt)) {
    errors.push('入社日は YYYY-MM-DD 形式で入力してください');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(values.joinedAt) > today) {
      errors.push('入社日に未来の日付は入力できません');
    }
  }

  return errors;
}

// ── メインのパース関数 ───────────────────────────────
export function parseEmployeeCsv(csvText: string): ParseCsvResult {
  const rawRows = parseRawCsv(csvText.trim());

  if (rawRows.length === 0) {
    return { rows: [], headerError: 'CSVが空です' };
  }

  const headers = rawRows[0].map((h) => h.trim());

  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
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

  // 重複チェック用に全メールを収集
  const allEmails = dataRows.map((raw) => get(raw, 'メールアドレス'));

  const rows: CsvRow[] = dataRows.map((raw, i) => {
    const values: EmployeeFormValues = {
      name: get(raw, '氏名'),
      email: get(raw, 'メールアドレス'),
      department: get(raw, '部署'),
      position: get(raw, '職種'),
      employmentType: get(raw, '雇用形態') as EmploymentType,
      status: get(raw, 'ステータス') as EmployeeStatus,
      joinedAt: get(raw, '入社日'),
      skills: get(raw, 'スキル')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean),
      projects: get(raw, '参画プロジェクト')
        .split('|')
        .map((p) => p.trim())
        .filter(Boolean),
      profile: get(raw, 'プロフィール'),
      selfIntroduction: get(raw, '自己紹介文'),
      strengths: get(raw, '強み'),
      growthSkills: get(raw, '今伸ばしたいスキル'),
      interests: get(raw, '興味のある分野'),
      hobbies: get(raw, '趣味・好きなこと'),
      personalMessage: get(raw, '一言メッセージ'),
      workLocation: get(raw, '勤務地・リモート可否'),
      availability: get(raw, '稼働時間・勤務スタイル'),
      careerHistory: get(raw, '過去の経験・経歴'),
      certifications: get(raw, '資格'),
    };

    const errors = validateCsvRow(values, allEmails);
    return { row: i + 2, values, errors };
  });

  return { rows };
}

// ── 雛形 CSV 文字列生成 ──────────────────────────────
export function generateCsvTemplate(): string {
  const header = CSV_HEADERS.join(',');
  const example = [
    '山田 太郎',
    'yamada.taro@example.com',
    '開発部',
    'フロントエンドエンジニア',
    'full-time',
    'active',
    '2022-04-01',
    'React|TypeScript|Git',
    '管理画面リニューアル|社内ツール開発',
    'UI改善が得意です',
    'プロダクトの使いやすさを大切にしながら開発しています',
    'ユーザー視点の設計と丁寧な実装',
    'アクセシビリティとパフォーマンス改善',
    'デザインシステム、生成AI活用',
    '週末のカフェ巡り、写真',
    '困ったときは気軽に声をかけてください',
    '東京オフィス / 週3日リモート可',
    '10:00-19:00 / 集中作業は午前中が中心',
    '前職ではBtoB SaaSのフロントエンド開発を担当',
    '基本情報技術者',
  ].join(',');
  return `${header}\n${example}\n`;
}
