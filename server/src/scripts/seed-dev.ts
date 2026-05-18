import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import { db } from '../lib/firebase';

const ORG_ID = '91558c8b-1e34-4840-9ab7-0bb79afb6c2e';
const now = new Date().toISOString();

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

type Emp = {
  id: string;
  organizationId: string;
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
  uid: null;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

function emp(
  id: string, name: string, email: string,
  department: string, position: string,
  employmentType: string, status: string,
  joinedAt: string, skills: string[], profile: string,
  avatarSeed: string, managerId?: string,
  role: 'admin' | 'member' = 'member',
): Emp {
  return {
    id, organizationId: ORG_ID, name, email, department, position,
    employmentType, status, joinedAt, skills, profile,
    avatarUrl: avatar(avatarSeed),
    ...(managerId ? { managerId } : {}),
    uid: null, role, createdAt: now, updatedAt: now, createdBy: 'seed',
  };
}

const employees: Emp[] = [
  // ── 管理者アカウント ───────────────────────────────────
  emp('dev-admin-001', '青木 由奈', 'yuna.aoki.web@gmail.com',
    '経営', '管理者', 'full-time', 'active', '2024-01-01',
    ['TypeScript', 'React', 'Firebase'],
    'システム管理者です。',
    'axolotl-pink', undefined, 'admin'),

  // ── 経営 (4名) ────────────────────────────────────────
  emp('dev-ceo-001', '山崎 誠一', 'yamazaki@example.com',
    '経営', '代表取締役社長', 'full-time', 'active', '2010-04-01',
    ['経営戦略', 'M&A', 'ファイナンス'],
    '創業以来、会社の成長を牽引。ビジョン実現に向けてチーム全員と向き合っています。',
    'lion-king', undefined, 'admin'),

  emp('dev-exec-001', '岩田 龍二', 'iwata@example.com',
    '経営', '取締役CTO', 'full-time', 'active', '2011-07-01',
    ['TypeScript', 'Go', 'AWS', 'アーキテクチャ設計'],
    '技術戦略の立案と開発組織の統括を担当。エンジニア文化の醸成に取り組んでいます。',
    'tiger-ryu', 'dev-ceo-001'),

  emp('dev-exec-002', '中島 裕美子', 'nakajima@example.com',
    '経営', '取締役（営業・マーケティング担当）', 'full-time', 'active', '2012-04-01',
    ['マーケティング戦略', '営業マネジメント', 'ブランド戦略'],
    '営業とマーケティングを統括。顧客起点のビジネス成長を推進しています。',
    'fox-yumi', 'dev-ceo-001'),

  emp('dev-exec-003', '大野 健太', 'ohno@example.com',
    '経営', '取締役COO', 'full-time', 'active', '2013-01-01',
    ['コンサルタント', '組織設計', 'オペレーション改善'],
    '管理部門全体を統括。人事・総務・カスタマーサポートの基盤整備を推進しています。',
    'bear-kenta', 'dev-ceo-001'),

  // ── 開発部 (12名) ─────────────────────────────────────
  emp('dev-dev-001', '田中 太郎', 'tanaka@example.com',
    '開発部', '部長', 'full-time', 'active', '2015-04-01',
    ['TypeScript', 'Go', 'AWS', 'Docker'],
    'バックエンドからインフラまで幅広く担当。チームのリードとして活動しています。',
    'cat-felix', 'dev-exec-001'),

  emp('dev-dev-002', '鈴木 花子', 'suzuki@example.com',
    '開発部', 'リードエンジニア', 'full-time', 'active', '2017-04-01',
    ['React', 'TypeScript', 'Figma'],
    'フロントエンド開発を中心に、UI/UX にこだわったプロダクト開発が得意です。',
    'cat-mimi', 'dev-dev-001'),

  emp('dev-dev-003', '佐藤 健', 'sato@example.com',
    '開発部', 'シニアエンジニア', 'full-time', 'active', '2019-04-01',
    ['React', 'TypeScript', 'Node.js'],
    'フロントエンド開発を中心に担当しています。',
    'dog-pochi', 'dev-dev-002'),

  emp('dev-dev-004', '高橋 美咲', 'takahashi@example.com',
    '開発部', 'エンジニア', 'full-time', 'active', '2021-04-01',
    ['Vue.js', 'JavaScript', 'Figma'],
    '新卒入社。日々成長中です。',
    'dog-hachi', 'dev-dev-002'),

  emp('dev-dev-005', '伊藤 大輔', 'ito@example.com',
    '開発部', 'リードエンジニア', 'full-time', 'active', '2016-07-01',
    ['Go', 'Python', 'PostgreSQL', 'Docker'],
    'バックエンドからインフラまで幅広く担当。',
    'bear-kuma', 'dev-dev-001'),

  emp('dev-dev-006', '渡辺 さくら', 'watanabe@example.com',
    '開発部', 'シニアエンジニア', 'full-time', 'active', '2018-10-01',
    ['Python', 'Node.js', 'PostgreSQL'],
    'データ分析とビジネス改善が専門。',
    'rabbit-usagi', 'dev-dev-005'),

  emp('dev-dev-007', '山本 拓也', 'yamamoto@example.com',
    '開発部', 'エンジニア', 'full-time', 'leave', '2020-04-01',
    ['Go', 'Docker', 'AWS'],
    'インフラ・バックエンドを担当しています。',
    'fox-kitsune', 'dev-dev-005'),

  emp('dev-dev-008', '中村 麻衣', 'nakamura@example.com',
    '開発部', 'リードエンジニア', 'full-time', 'active', '2017-10-01',
    ['AWS', 'GCP', 'Docker', 'Terraform'],
    'インフラ全般を担当しています。',
    'hamster-choco', 'dev-dev-001'),

  emp('dev-dev-009', '小林 翔', 'kobayashi@example.com',
    '開発部', 'エンジニア', 'full-time', 'active', '2022-04-01',
    ['AWS', 'Docker', 'Python'],
    '新卒入社。インフラを中心に学んでいます。',
    'penguin-pen', 'dev-dev-008'),

  emp('dev-dev-010', '加藤 由美', 'kato@example.com',
    '開発部', 'エンジニア', 'contract', 'active', '2023-01-01',
    ['GCP', 'Docker', 'SQL'],
    '契約社員としてインフラチームをサポートしています。',
    'owl-fukuro', 'dev-dev-008'),

  emp('dev-dev-011', '西村 光', 'nishimura@example.com',
    '開発部', 'エンジニア', 'full-time', 'active', '2023-04-01',
    ['React', 'TypeScript'],
    '新卒入社。フロントエンドを中心に取り組んでいます。',
    'deer-shika', 'dev-dev-002'),

  emp('dev-dev-012', '森田 明美', 'morita@example.com',
    '開発部', 'エンジニア', 'full-time', 'active', '2022-10-01',
    ['Node.js', 'PostgreSQL', 'Git'],
    'バックエンドAPIの開発を担当しています。',
    'bear-panda', 'dev-dev-005'),

  // ── 人事部 (6名) ──────────────────────────────────────
  emp('dev-hr-001', '吉田 誠', 'yoshida@example.com',
    '人事部', '部長', 'full-time', 'active', '2014-04-01',
    ['Excel', 'コンサルタント'],
    '採用・育成・制度設計を担当。社員が働きやすい環境づくりを目指しています。',
    'deer-bambi', 'dev-exec-003'),

  emp('dev-hr-002', '山田 彩', 'yamada@example.com',
    '人事部', 'マネージャー', 'full-time', 'active', '2018-04-01',
    ['Excel', 'アナリスト'],
    '採用チームのマネージャーとして採用活動全般を統括しています。',
    'cat-tama', 'dev-hr-001'),

  emp('dev-hr-003', '佐々木 航', 'sasaki@example.com',
    '人事部', '採用担当', 'full-time', 'active', '2020-04-01',
    ['Excel', 'アナリスト'],
    '中途採用を中心に担当しています。',
    'dog-maron', 'dev-hr-002'),

  emp('dev-hr-004', '松本 京子', 'matsumoto@example.com',
    '人事部', '採用担当', 'part-time', 'active', '2021-07-01',
    ['Excel'],
    '新卒採用とインターン採用を担当しています。',
    'rabbit-mochi', 'dev-hr-002'),

  emp('dev-hr-005', '井上 蓮', 'inoue@example.com',
    '人事部', 'マネージャー', 'full-time', 'active', '2019-04-01',
    ['Excel', 'コンサルタント'],
    '人事制度・評価制度の設計を担当しています。',
    'bear-grizzly', 'dev-hr-001'),

  emp('dev-hr-006', '坂本 拳', 'sakamoto@example.com',
    '人事部', '人事担当', 'full-time', 'active', '2022-04-01',
    ['Excel'],
    '労務管理・給与計算を担当しています。',
    'hamster-pika', 'dev-hr-005'),

  // ── 営業部 (12名) ─────────────────────────────────────
  emp('dev-sales-001', '木村 奈々', 'kimura@example.com',
    '営業部', '部長', 'full-time', 'active', '2013-04-01',
    ['SQL', 'Excel', 'アナリスト'],
    '営業部門全体のマネジメントを担当しています。',
    'fox-sora', 'dev-exec-002'),

  emp('dev-sales-002', '林 雄介', 'hayashi@example.com',
    '営業部', 'リーダー', 'full-time', 'active', '2017-04-01',
    ['Excel', 'SQL'],
    '第一営業チームのリーダーとして既存顧客対応を担当しています。',
    'penguin-taro', 'dev-sales-001'),

  emp('dev-sales-003', '清水 沙織', 'shimizu@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2020-04-01',
    ['Excel'],
    '既存顧客のフォローを担当しています。',
    'owl-wise', 'dev-sales-002'),

  emp('dev-sales-004', '山口 隼人', 'yamaguchi@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2021-04-01',
    ['Excel'],
    '新規開拓営業を中心に担当しています。',
    'cat-kuro', 'dev-sales-002'),

  emp('dev-sales-005', '池田 真由', 'ikeda@example.com',
    '営業部', 'リーダー', 'full-time', 'active', '2016-10-01',
    ['Excel', 'アナリスト'],
    '第二営業チームのリーダーとして新規顧客開拓を担当しています。',
    'rabbit-luna', 'dev-sales-001'),

  emp('dev-sales-006', '橋本 浩二', 'hashimoto@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2022-04-01',
    ['Excel'],
    '新規開拓営業を担当しています。',
    'fox-hana', 'dev-sales-005'),

  emp('dev-sales-007', '野口 麻子', 'noguchi@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2021-10-01',
    ['Excel', 'SQL'],
    '既存顧客のアップセルを担当しています。',
    'cat-shiro', 'dev-sales-002'),

  emp('dev-sales-008', '菊地 大樹', 'kikuchi@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2022-07-01',
    ['Excel'],
    '新規開拓を中心に担当しています。',
    'dog-coco', 'dev-sales-005'),

  emp('dev-sales-009', '原田 千尋', 'harada@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2023-04-01',
    ['Excel'],
    '新卒入社。先輩のもとで営業を学んでいます。',
    'bear-brown', 'dev-sales-002'),

  emp('dev-sales-010', '上田 涼', 'ueda@example.com',
    '営業部', '営業担当', 'full-time', 'active', '2023-04-01',
    ['Excel'],
    '新卒入社。新規開拓に取り組んでいます。',
    'bear-honey', 'dev-sales-005'),

  emp('dev-sales-011', '三浦 里奈', 'miura@example.com',
    '営業部', '営業担当', 'part-time', 'active', '2022-01-01',
    ['Excel'],
    '既存顧客サポートを担当しています。',
    'rabbit-snow', 'dev-sales-002'),

  emp('dev-sales-012', '藤原 雄大', 'fujiwara@example.com',
    '営業部', '営業担当', 'full-time', 'leave', '2020-07-01',
    ['Excel', 'アナリスト'],
    '大手顧客を中心に担当しています。',
    'dog-koro', 'dev-sales-005'),

  // ── 総務部 (6名) ──────────────────────────────────────
  emp('dev-ga-001', '阿部 葵', 'abe@example.com',
    '総務部', '部長', 'full-time', 'active', '2015-10-01',
    ['Excel', 'コンサルタント'],
    '総務・法務・経理を統括しています。',
    'cat-kuro', 'dev-exec-003'),

  emp('dev-ga-002', '石川 竜也', 'ishikawa@example.com',
    '総務部', 'マネージャー', 'full-time', 'active', '2018-04-01',
    ['Excel'],
    '総務全般のマネジメントを担当しています。',
    'dog-coco', 'dev-ga-001'),

  emp('dev-ga-003', '前田 愛', 'maeda@example.com',
    '総務部', '総務担当', 'full-time', 'active', '2020-10-01',
    ['Excel'],
    '庶務・経費精算を担当しています。',
    'bear-panda', 'dev-ga-002'),

  emp('dev-ga-004', '藤田 悠', 'fujita@example.com',
    '総務部', '総務担当', 'full-time', 'leave', '2021-04-01',
    ['Excel'],
    '施設管理・備品管理を担当しています。',
    'bear-brown', 'dev-ga-002'),

  emp('dev-ga-005', '岸本 美羽', 'kishimoto@example.com',
    '総務部', '経理担当', 'full-time', 'active', '2019-07-01',
    ['Excel', 'SQL'],
    '経理・決算業務を担当しています。',
    'fox-hana', 'dev-ga-001'),

  emp('dev-ga-006', '浜田 慎吾', 'hamada@example.com',
    '総務部', '法務担当', 'full-time', 'active', '2020-01-01',
    ['コンサルタント', 'Excel'],
    '契約書レビュー・法務相談を担当しています。',
    'owl-fukuro', 'dev-ga-001'),

  // ── マーケティング部 (7名) ────────────────────────────
  emp('dev-mkt-001', '後藤 理沙', 'goto@example.com',
    'マーケティング部', '部長', 'full-time', 'active', '2016-04-01',
    ['JavaScript', 'アナリスト', 'Figma'],
    'マーケティング戦略の立案・実行を担当しています。',
    'rabbit-luna', 'dev-exec-002'),

  emp('dev-mkt-002', '岡田 亮', 'okada@example.com',
    'マーケティング部', 'マネージャー', 'full-time', 'active', '2019-07-01',
    ['JavaScript', 'アナリスト'],
    'コンテンツマーケティングを担当しています。',
    'fox-kitsune', 'dev-mkt-001'),

  emp('dev-mkt-003', '長谷川 菜穂', 'hasegawa@example.com',
    'マーケティング部', 'マーケター', 'full-time', 'active', '2022-04-01',
    ['JavaScript', 'Figma'],
    '新卒入社。SNSマーケティングを中心に担当しています。',
    'rabbit-snow', 'dev-mkt-002'),

  emp('dev-mkt-004', '中野 彩花', 'nakano@example.com',
    'マーケティング部', 'マーケター', 'full-time', 'active', '2021-04-01',
    ['Figma', 'JavaScript'],
    'デザインとコンテンツ制作を担当しています。',
    'cat-mimi', 'dev-mkt-002'),

  emp('dev-mkt-005', '小島 剛志', 'kojima@example.com',
    'マーケティング部', 'マネージャー', 'full-time', 'active', '2018-10-01',
    ['アナリスト', 'SQL', 'Excel'],
    'データドリブンなマーケティング施策を推進しています。',
    'bear-grizzly', 'dev-mkt-001'),

  emp('dev-mkt-006', '辻 友里', 'tsuji@example.com',
    'マーケティング部', 'マーケター', 'full-time', 'active', '2022-07-01',
    ['Excel', 'アナリスト'],
    '広告運用・効果測定を担当しています。',
    'dog-hachi', 'dev-mkt-005'),

  emp('dev-mkt-007', '桜井 翔太', 'sakurai@example.com',
    'マーケティング部', 'マーケター', 'contract', 'active', '2023-01-01',
    ['JavaScript', 'Figma'],
    'Web制作・LP制作を担当しています。',
    'penguin-pen', 'dev-mkt-005'),

  // ── カスタマーサポート部 (7名) ────────────────────────
  emp('dev-cs-001', '村田 剛', 'murata@example.com',
    'カスタマーサポート部', '部長', 'full-time', 'active', '2017-04-01',
    ['Excel', 'コンサルタント'],
    'カスタマーサポート全体を統括しています。',
    'bear-honey', 'dev-exec-003'),

  emp('dev-cs-002', '近藤 春奈', 'kondo@example.com',
    'カスタマーサポート部', 'リーダー', 'full-time', 'active', '2020-04-01',
    ['Excel'],
    'サポートチームのリーダーとしてお客様対応を統括しています。',
    'rabbit-usagi', 'dev-cs-001'),

  emp('dev-cs-003', '内田 葵', 'uchida@example.com',
    'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2021-04-01',
    ['Excel'],
    'お客様からの問い合わせ対応を担当しています。',
    'cat-tama', 'dev-cs-002'),

  emp('dev-cs-004', '三浦 健一', 'miura2@example.com',
    'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2022-04-01',
    ['Excel'],
    'テクニカルサポートを担当しています。',
    'dog-pochi', 'dev-cs-002'),

  emp('dev-cs-005', '宮本 彩', 'miyamoto@example.com',
    'カスタマーサポート部', 'サポート担当', 'part-time', 'active', '2022-07-01',
    ['Excel'],
    'チャットサポートを中心に担当しています。',
    'fox-sora', 'dev-cs-002'),

  emp('dev-cs-006', '藤井 大志', 'fujii@example.com',
    'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2023-04-01',
    ['Excel'],
    '新卒入社。お客様の声を大切にしながら対応しています。',
    'owl-wise', 'dev-cs-002'),

  emp('dev-cs-007', '中川 美里', 'nakagawa@example.com',
    'カスタマーサポート部', 'サポート担当', 'full-time', 'active', '2023-07-01',
    ['Excel'],
    'メールサポートを担当しています。',
    'deer-bambi', 'dev-cs-002'),
];

async function seedDev() {
  // 既存データを削除
  const existing = await db.collection('employees')
    .where('organizationId', '==', ORG_ID)
    .get();
  if (existing.docs.length > 0) {
    const deleteBatch = db.batch();
    existing.docs.forEach((doc) => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`✓ 既存データ ${existing.docs.length} 件を削除しました`);
  }

  // Firestoreのバッチ上限(500)を超えないよう分割
  const CHUNK = 400;
  for (let i = 0; i < employees.length; i += CHUNK) {
    const batch = db.batch();
    employees.slice(i, i + CHUNK).forEach((e) => {
      batch.set(db.collection('employees').doc(e.id), e);
    });
    await batch.commit();
  }

  console.log(`✓ ${employees.length} 件の階層付きダミーデータを登録しました`);
  process.exit(0);
}

seedDev().catch((err) => {
  console.error('seed-dev failed:', err);
  process.exit(1);
});
