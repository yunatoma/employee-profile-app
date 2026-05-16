import type { Employee } from '../types/employee';

export const employeesMock: Employee[] = [
  {
    id: '1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    department: '開発部',
    position: 'フロントエンドエンジニア',
    employmentType: 'full-time',
    status: 'active',
    joinedAt: '2022-04-01',
    skills: ['React', 'TypeScript', 'GraphQL'],
    profile:
      '管理画面のフロントエンド開発を担当。UI改善やコンポーネント設計を得意とする。',
    avatarUrl: '',
  },
  {
    id: '2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    department: 'デザイン部',
    position: 'UIデザイナー',
    employmentType: 'full-time',
    status: 'active',
    joinedAt: '2021-10-01',
    skills: ['Figma', 'Design System', 'UX Research'],
    profile:
      'プロダクトのUI設計やデザインシステムの整備を担当。使いやすい画面設計を意識している。',
    avatarUrl: '',
  },
  {
    id: '3',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    department: '開発部',
    position: 'バックエンドエンジニア',
    employmentType: 'contract',
    status: 'active',
    joinedAt: '2023-01-15',
    skills: ['Node.js', 'TypeScript', 'PostgreSQL'],
    profile:
      'API設計やデータベース設計を担当。フロントエンドとの連携を意識した実装を行う。',
    avatarUrl: '',
  },
  {
    id: '4',
    name: '田中 美咲',
    email: 'tanaka@example.com',
    department: '人事部',
    position: 'HR担当',
    employmentType: 'full-time',
    status: 'leave',
    joinedAt: '2020-07-01',
    skills: ['採用', '労務', 'オンボーディング'],
    profile:
      '採用活動や社員オンボーディングを担当。組織づくりを支える業務を行う。',
    avatarUrl: '',
  },
  {
    id: '5',
    name: '高橋 健',
    email: 'takahashi@example.com',
    department: '開発部',
    position: 'テックリード',
    employmentType: 'full-time',
    status: 'active',
    joinedAt: '2019-04-01',
    skills: ['React', 'TypeScript', 'Architecture', 'Code Review'],
    profile:
      'フロントエンド全体の設計方針やコードレビューを担当。チームの技術品質向上を支援している。',
    avatarUrl: '',
  },
];