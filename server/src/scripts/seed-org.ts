import 'dotenv/config';
import { db } from '../lib/firebase';

const now = new Date().toISOString();
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

type EmpData = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: string;
  status: string;
  joinedAt: string;
  skills: string[];
  profile: string;
  avatarUrl: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

const employees: EmpData[] = [
  // ── 経営 (4名) ────────────────────────────────
  {
    id: 'emp-ceo-001', name: '山崎 誠一', email: 'yamazaki@example.com',
    department: '経営', position: '代表取締役社長', employmentType: 'full-time', status: 'active',
    joinedAt: '2010-04-01', skills: ['経営戦略', 'M&A', 'ファイナンス'],
    profile: '創業以来、会社の成長を牽引。ビジョン実現に向けてチーム全員と向き合っています。',
    avatarUrl: avatar('lion-king'),
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-exec-001', name: '岩田 龍二', email: 'iwata@example.com',
    department: '経営', position: '取締役CTO', employmentType: 'full-time', status: 'active',
    joinedAt: '2011-07-01', skills: ['TypeScript', 'Go', 'AWS', 'アーキテクチャ設計'],
    profile: '技術戦略の立案と開発組織の統括を担当。エンジニア文化の醸成に取り組んでいます。',
    avatarUrl: avatar('tiger-ryu'), managerId: 'emp-ceo-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-exec-002', name: '中島 裕美子', email: 'nakajima@example.com',
    department: '経営', position: '取締役（営業・マーケティング担当）', employmentType: 'full-time', status: 'active',
    joinedAt: '2012-04-01', skills: ['マーケティング戦略', '営業マネジメント', 'ブランド戦略'],
    profile: '営業とマーケティングを統括。顧客起点のビジネス成長を推進しています。',
    avatarUrl: avatar('fox-yumi'), managerId: 'emp-ceo-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-exec-003', name: '大野 健太', email: 'ohno@example.com',
    department: '経営', position: '取締役COO', employmentType: 'full-time', status: 'active',
    joinedAt: '2013-01-01', skills: ['コンサルタント', '組織設計', 'オペレーション改善'],
    profile: '管理部門全体を統括。人事・総務・カスタマーサポートの基盤整備を推進しています。',
    avatarUrl: avatar('bear-kenta'), managerId: 'emp-ceo-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── 開発部 (10名) ──────────────────────────────
  {
    id: 'emp-dev-001', name: '田中 太郎', email: 'tanaka@example.com',
    department: '開発部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2015-04-01', skills: ['TypeScript', 'Go', 'AWS', 'Docker'],
    profile: 'バックエンドからインフラまで幅広く担当。チームのリードとして活動しています。',
    avatarUrl: avatar('cat-felix'), managerId: 'emp-exec-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-002', name: '鈴木 花子', email: 'suzuki@example.com',
    department: '開発部', position: 'リードエンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2017-04-01', skills: ['React', 'TypeScript', 'Figma'],
    profile: 'フロントエンド開発を中心に、UI/UX にこだわったプロダクト開発が得意です。',
    avatarUrl: avatar('cat-mimi'), managerId: 'emp-dev-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-003', name: '佐藤 健', email: 'sato@example.com',
    department: '開発部', position: 'シニアエンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2019-04-01', skills: ['React', 'TypeScript', 'Node.js'],
    profile: 'フロントエンド開発を中心に、UI/UX にこだわったプロダクト開発が得意です。',
    avatarUrl: avatar('dog-pochi'), managerId: 'emp-dev-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-004', name: '高橋 美咲', email: 'takahashi@example.com',
    department: '開発部', position: 'エンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2021-04-01', skills: ['Vue.js', 'JavaScript', 'Figma'],
    profile: '新卒入社。日々成長中です。',
    avatarUrl: avatar('dog-hachi'), managerId: 'emp-dev-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-005', name: '伊藤 大輔', email: 'ito@example.com',
    department: '開発部', position: 'リードエンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2016-07-01', skills: ['Go', 'Python', 'PostgreSQL', 'Docker'],
    profile: 'バックエンドからインフラまで幅広く担当。',
    avatarUrl: avatar('bear-kuma'), managerId: 'emp-dev-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-006', name: '渡辺 さくら', email: 'watanabe@example.com',
    department: '開発部', position: 'シニアエンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2018-10-01', skills: ['Python', 'Node.js', 'PostgreSQL'],
    profile: 'データ分析とビジネス改善が専門。',
    avatarUrl: avatar('rabbit-usagi'), managerId: 'emp-dev-005',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-007', name: '山本 拓也', email: 'yamamoto@example.com',
    department: '開発部', position: 'エンジニア', employmentType: 'full-time', status: 'leave',
    joinedAt: '2020-04-01', skills: ['Go', 'Docker', 'AWS'],
    profile: 'インフラ・バックエンドを担当しています。',
    avatarUrl: avatar('fox-kitsune'), managerId: 'emp-dev-005',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-008', name: '中村 麻衣', email: 'nakamura@example.com',
    department: '開発部', position: 'リードエンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2017-10-01', skills: ['AWS', 'GCP', 'Docker', 'Terraform'],
    profile: 'インフラ全般を担当しています。',
    avatarUrl: avatar('hamster-choco'), managerId: 'emp-dev-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-009', name: '小林 翔', email: 'kobayashi@example.com',
    department: '開発部', position: 'エンジニア', employmentType: 'full-time', status: 'active',
    joinedAt: '2022-04-01', skills: ['AWS', 'Docker', 'Python'],
    profile: '新卒入社。インフラを中心に学んでいます。',
    avatarUrl: avatar('penguin-pen'), managerId: 'emp-dev-008',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-dev-010', name: '加藤 由美', email: 'kato@example.com',
    department: '開発部', position: 'エンジニア', employmentType: 'contract', status: 'active',
    joinedAt: '2023-01-01', skills: ['GCP', 'Docker', 'SQL'],
    profile: '契約社員としてインフラチームをサポートしています。',
    avatarUrl: avatar('owl-fukuro'), managerId: 'emp-dev-008',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── 人事部 (5名) ──────────────────────────────
  {
    id: 'emp-hr-001', name: '吉田 誠', email: 'yoshida@example.com',
    department: '人事部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2014-04-01', skills: ['Excel', 'コンサルタント'],
    profile: '採用・育成・制度設計を担当。社員が働きやすい環境づくりを目指しています。',
    avatarUrl: avatar('deer-shika'), managerId: 'emp-exec-003',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-hr-002', name: '山田 彩', email: 'yamada@example.com',
    department: '人事部', position: 'マネージャー', employmentType: 'full-time', status: 'active',
    joinedAt: '2018-04-01', skills: ['Excel', 'アナリスト'],
    profile: '採用チームのマネージャーとして採用活動全般を統括しています。',
    avatarUrl: avatar('cat-tama'), managerId: 'emp-hr-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-hr-003', name: '佐々木 航', email: 'sasaki@example.com',
    department: '人事部', position: '採用担当', employmentType: 'full-time', status: 'active',
    joinedAt: '2020-04-01', skills: ['Excel', 'アナリスト'],
    profile: '中途採用を中心に担当しています。',
    avatarUrl: avatar('dog-maron'), managerId: 'emp-hr-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-hr-004', name: '松本 京子', email: 'matsumoto@example.com',
    department: '人事部', position: '採用担当', employmentType: 'part-time', status: 'active',
    joinedAt: '2021-07-01', skills: ['Excel'],
    profile: '新卒採用とインターン採用を担当しています。',
    avatarUrl: avatar('rabbit-mochi'), managerId: 'emp-hr-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-hr-005', name: '井上 蓮', email: 'inoue@example.com',
    department: '人事部', position: 'マネージャー', employmentType: 'full-time', status: 'active',
    joinedAt: '2019-04-01', skills: ['Excel', 'コンサルタント'],
    profile: '人事制度・評価制度の設計を担当しています。',
    avatarUrl: avatar('bear-grizzly'), managerId: 'emp-hr-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── 営業部 (6名) ──────────────────────────────
  {
    id: 'emp-sales-001', name: '木村 奈々', email: 'kimura@example.com',
    department: '営業部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2013-04-01', skills: ['SQL', 'Excel', 'アナリスト'],
    profile: '営業部門全体のマネジメントを担当しています。',
    avatarUrl: avatar('fox-sora'), managerId: 'emp-exec-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-sales-002', name: '林 雄介', email: 'hayashi@example.com',
    department: '営業部', position: 'リーダー', employmentType: 'full-time', status: 'active',
    joinedAt: '2017-04-01', skills: ['Excel', 'SQL'],
    profile: '第一営業チームのリーダーとして既存顧客対応を担当しています。',
    avatarUrl: avatar('hamster-pika'), managerId: 'emp-sales-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-sales-003', name: '清水 沙織', email: 'shimizu@example.com',
    department: '営業部', position: '営業担当', employmentType: 'full-time', status: 'active',
    joinedAt: '2020-04-01', skills: ['Excel'],
    profile: '既存顧客のフォローを担当しています。',
    avatarUrl: avatar('penguin-taro'), managerId: 'emp-sales-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-sales-004', name: '山口 隼人', email: 'yamaguchi@example.com',
    department: '営業部', position: '営業担当', employmentType: 'full-time', status: 'active',
    joinedAt: '2021-04-01', skills: ['Excel'],
    profile: '新規開拓営業を中心に担当しています。',
    avatarUrl: avatar('owl-wise'), managerId: 'emp-sales-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-sales-005', name: '池田 真由', email: 'ikeda@example.com',
    department: '営業部', position: 'リーダー', employmentType: 'full-time', status: 'active',
    joinedAt: '2016-10-01', skills: ['Excel', 'アナリスト'],
    profile: '第二営業チームのリーダーとして新規顧客開拓を担当しています。',
    avatarUrl: avatar('deer-bambi'), managerId: 'emp-sales-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-sales-006', name: '橋本 浩二', email: 'hashimoto@example.com',
    department: '営業部', position: '営業担当', employmentType: 'full-time', status: 'active',
    joinedAt: '2022-04-01', skills: ['Excel'],
    profile: '新規開拓営業を担当しています。',
    avatarUrl: avatar('cat-kuro'), managerId: 'emp-sales-005',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── 総務部 (4名) ──────────────────────────────
  {
    id: 'emp-ga-001', name: '阿部 葵', email: 'abe@example.com',
    department: '総務部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2015-10-01', skills: ['Excel', 'コンサルタント'],
    profile: '総務・法務・経理を統括しています。',
    avatarUrl: avatar('cat-shiro'), managerId: 'emp-exec-003',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-ga-002', name: '石川 竜也', email: 'ishikawa@example.com',
    department: '総務部', position: 'マネージャー', employmentType: 'full-time', status: 'active',
    joinedAt: '2018-04-01', skills: ['Excel'],
    profile: '総務全般のマネジメントを担当しています。',
    avatarUrl: avatar('dog-coco'), managerId: 'emp-ga-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-ga-003', name: '前田 愛', email: 'maeda@example.com',
    department: '総務部', position: '総務担当', employmentType: 'full-time', status: 'active',
    joinedAt: '2020-10-01', skills: ['Excel'],
    profile: '庶務・経費精算を担当しています。',
    avatarUrl: avatar('bear-panda'), managerId: 'emp-ga-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-ga-004', name: '藤田 悠', email: 'fujita@example.com',
    department: '総務部', position: '総務担当', employmentType: 'full-time', status: 'leave',
    joinedAt: '2021-04-01', skills: ['Excel'],
    profile: '施設管理・備品管理を担当しています。',
    avatarUrl: avatar('bear-brown'), managerId: 'emp-ga-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── マーケティング部 (3名) ────────────────────
  {
    id: 'emp-mkt-001', name: '後藤 理沙', email: 'goto@example.com',
    department: 'マーケティング部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2016-04-01', skills: ['JavaScript', 'アナリスト', 'Figma'],
    profile: 'マーケティング戦略の立案・実行を担当しています。',
    avatarUrl: avatar('rabbit-luna'), managerId: 'emp-exec-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-mkt-002', name: '岡田 亮', email: 'okada@example.com',
    department: 'マーケティング部', position: 'マネージャー', employmentType: 'full-time', status: 'active',
    joinedAt: '2019-07-01', skills: ['JavaScript', 'アナリスト'],
    profile: 'コンテンツマーケティングを担当しています。',
    avatarUrl: avatar('fox-hana'), managerId: 'emp-mkt-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-mkt-003', name: '長谷川 菜穂', email: 'hasegawa@example.com',
    department: 'マーケティング部', position: 'マーケター', employmentType: 'full-time', status: 'active',
    joinedAt: '2022-04-01', skills: ['JavaScript', 'Figma'],
    profile: '新卒入社。SNSマーケティングを中心に担当しています。',
    avatarUrl: avatar('rabbit-snow'), managerId: 'emp-mkt-002',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },

  // ── カスタマーサポート部 (2名) ────────────────
  {
    id: 'emp-cs-001', name: '村田 剛', email: 'murata@example.com',
    department: 'カスタマーサポート部', position: '部長', employmentType: 'full-time', status: 'active',
    joinedAt: '2017-04-01', skills: ['Excel', 'コンサルタント'],
    profile: 'カスタマーサポート全体を統括しています。',
    avatarUrl: avatar('bear-honey'), managerId: 'emp-exec-003',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
  {
    id: 'emp-cs-002', name: '近藤 春奈', email: 'kondo@example.com',
    department: 'カスタマーサポート部', position: 'サポートリーダー', employmentType: 'full-time', status: 'active',
    joinedAt: '2020-04-01', skills: ['Excel'],
    profile: 'お客様対応を中心に担当しています。',
    avatarUrl: avatar('dog-koro'), managerId: 'emp-cs-001',
    createdAt: now, updatedAt: now, createdBy: 'system',
  },
];

async function seedOrg() {
  // 既存データを全削除して再投入
  const existing = await db.collection('employees').get();
  const deleteBatch = db.batch();
  existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();
  console.log(`✓ 既存データ ${existing.docs.length} 件を削除しました`);

  const batch = db.batch();
  for (const emp of employees) {
    batch.set(db.collection('employees').doc(emp.id), emp);
  }
  await batch.commit();
  console.log(`✓ ${employees.length} 件の階層付き社員データを Firestore に登録しました`);
  process.exit(0);
}

seedOrg().catch((err) => {
  console.error('seed-org failed:', err);
  process.exit(1);
});
