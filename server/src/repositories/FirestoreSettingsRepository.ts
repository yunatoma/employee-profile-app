import { db } from '../lib/firebase';

export type SkillCategory = { category: string; skills: string[] };

const SETTINGS_DOC = db.collection('settings').doc('master');

const DEFAULT_SETTINGS = {
  skillCategories: [
    {
      category: 'エンジニア系',
      skills: [
        'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
        'Node.js', 'Python', 'Java', 'Go',
        'Firebase', 'AWS', 'GCP', 'Docker',
        'SQL', 'PostgreSQL', 'MySQL',
        'Git', 'Figma', 'Excel',
      ],
    },
    {
      category: '営業系',
      skills: [
        '提案営業', 'インサイドセールス', 'カスタマーサクセス',
        'CRM', 'SFA', 'Salesforce',
        'プレゼンテーション', '交渉', '顧客折衝',
      ],
    },
    {
      category: '経営・管理系',
      skills: [
        '経営戦略', 'M&A', 'ファイナンス',
        '財務分析', '予算管理', '組織マネジメント',
        'リスクマネジメント', '事業企画', 'BizDev',
      ],
    },
  ] as SkillCategory[],
  projects: [
    '管理画面リニューアル',
    'モバイルアプリ開発',
    'APIリファクタリング',
    'データ基盤整備',
    'デザインシステム構築',
    '社内ツール開発',
    '採用プロセス改善',
    'セキュリティ強化',
    'パフォーマンス改善',
    'AI機能開発',
  ],
};

export const settingsRepository = {
  async get() {
    const snap = await SETTINGS_DOC.get();
    if (!snap.exists) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...snap.data() };
  },

  async update(data: { skillCategories?: SkillCategory[]; projects?: string[] }) {
    await SETTINGS_DOC.set(data, { merge: true });
    return this.get();
  },
};
