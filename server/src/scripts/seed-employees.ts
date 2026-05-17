import 'dotenv/config';
import { db } from '../lib/firebase';
import { randomUUID } from 'crypto';

const DEPARTMENTS = ['開発部', '人事部', '営業部', '総務部', 'マーケティング部', 'カスタマーサポート部'];
const POSITIONS = ['エンジニア', 'シニアエンジニア', 'リードエンジニア', 'マネージャー', 'ディレクター', 'アナリスト', 'デザイナー', 'コンサルタント'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'intern'] as const;
const STATUSES = ['active', 'active', 'active', 'active', 'leave', 'retired'] as const; // active 多め
const ALL_SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'Go',
  'Firebase', 'AWS', 'GCP', 'Docker',
  'SQL', 'PostgreSQL', 'MySQL',
  'Git', 'Figma', 'Excel',
];

const NAMES = [
  '田中 太郎', '鈴木 花子', '佐藤 健', '高橋 美咲', '伊藤 大輔',
  '渡辺 さくら', '山本 拓也', '中村 麻衣', '小林 翔', '加藤 由美',
  '吉田 誠', '山田 彩', '佐々木 航', '松本 京子', '井上 蓮',
  '木村 奈々', '林 雄介', '清水 沙織', '山口 隼人', '池田 真由',
  '橋本 浩二', '阿部 葵', '石川 竜也', '前田 愛', '藤田 悠',
  '後藤 理沙', '岡田 亮', '長谷川 菜穂', '村田 剛', '近藤 春奈',
];

// DiceBear adventurer スタイル + 動物シード
// https://api.dicebear.com/9.x/adventurer/svg?seed={seed} で生成
const AVATAR_SEEDS = [
  'cat-felix', 'cat-mimi', 'cat-tama', 'cat-kuro', 'cat-shiro',
  'dog-pochi', 'dog-hachi', 'dog-koro', 'dog-maron', 'dog-coco',
  'bear-kuma', 'bear-grizzly', 'bear-panda', 'bear-brown', 'bear-honey',
  'rabbit-usagi', 'rabbit-mochi', 'rabbit-luna', 'rabbit-snow',
  'fox-kitsune', 'fox-sora', 'fox-hana',
  'hamster-choco', 'hamster-pika',
  'penguin-pen', 'penguin-taro',
  'owl-fukuro', 'owl-wise',
  'deer-shika', 'deer-bambi',
];

const PROFILES = [
  'フロントエンド開発を中心に、UI/UX にこだわったプロダクト開発が得意です。',
  'バックエンドからインフラまで幅広く担当。チームのリードとして活動しています。',
  '新卒入社。日々成長中です。チームの皆さんに感謝しながら業務に取り組んでいます。',
  'データ分析とビジネス改善が専門。数字から課題を見つけることにやりがいを感じています。',
  '採用・育成・制度設計を担当。社員が働きやすい環境づくりを目指しています。',
  '',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().split('T')[0];
}

async function seedEmployees() {
  const now = new Date().toISOString();
  const batch = db.batch();

  for (let i = 0; i < 30; i++) {
    const id = randomUUID();
    const name = NAMES[i];
    const nameParts = name.replace(' ', '');
    const email = `${nameParts.toLowerCase().replace(/\s/g, '')}${i + 1}@example.com`;

    const employee = {
      id,
      name,
      email,
      department: pick(DEPARTMENTS),
      position: pick(POSITIONS),
      employmentType: pick(EMPLOYMENT_TYPES),
      status: pick(STATUSES),
      joinedAt: randomDate(2015, 2024),
      skills: pickMultiple(ALL_SKILLS, 2, 6),
      profile: pick(PROFILES),
      avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${AVATAR_SEEDS[i % AVATAR_SEEDS.length]}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      createdAt: now,
      updatedAt: now,
    };

    batch.set(db.collection('employees').doc(id), employee);
  }

  await batch.commit();
  console.log('✓ 30件の社員ダミーデータを Firestore に追加しました');
  process.exit(0);
}

seedEmployees().catch((err) => {
  console.error('seed-employees failed:', err);
  process.exit(1);
});
