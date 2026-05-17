import 'dotenv/config';
import { db } from '../lib/firebase';

const ALL_PROJECTS = [
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
];

const PROFILE_DUMMIES = [
  {
    selfIntroduction: 'チームでの学びを大切にしながら、使いやすいプロダクトづくりに取り組んでいます。',
    strengths: '課題整理、関係者との調整、最後までやり切る実行力',
    growthSkills: 'データ分析とプロダクト改善の仮説検証',
    interests: '生成AI活用、業務効率化、ナレッジ共有',
    hobbies: '読書、カフェ巡り、散歩',
    personalMessage: '小さな相談でも気軽に声をかけてください。',
    workLocation: '東京オフィス / 週2-3日リモート可',
    availability: '10:00-19:00 / 午前中は集中作業が多めです',
    careerHistory: '前職ではBtoBサービスの企画・運用改善を担当していました。',
    certifications: '基本情報技術者',
  },
  {
    selfIntroduction: '新しい技術や仕組みを試しながら、チームに還元することを意識しています。',
    strengths: '技術調査、ドキュメント化、レビューでの改善提案',
    growthSkills: 'クラウド設計、セキュリティ、運用自動化',
    interests: 'クラウドネイティブ、開発者体験、品質改善',
    hobbies: '映画、音楽、料理',
    personalMessage: '一緒に試しながら良い形を探していきたいです。',
    workLocation: 'フルリモート中心 / 必要に応じて出社可',
    availability: '9:30-18:30 / チャットは日中いつでも確認します',
    careerHistory: '受託開発と自社サービス開発の両方を経験しています。',
    certifications: '応用情報技術者',
  },
  {
    selfIntroduction: 'ユーザーの声を起点に、わかりやすく続けやすい改善を進めるのが好きです。',
    strengths: 'ヒアリング、要件整理、チームを巻き込む推進力',
    growthSkills: 'UXリサーチ、ファシリテーション、英語での業務対応',
    interests: '組織開発、オンボーディング、顧客体験',
    hobbies: '旅行、写真、ボードゲーム',
    personalMessage: '初めての方とも話しやすい場づくりを心がけています。',
    workLocation: '大阪オフィス / 週1-2日リモート可',
    availability: '9:00-18:00 / 定例は午後が調整しやすいです',
    careerHistory: '営業、カスタマーサクセス、社内改善プロジェクトを経験しています。',
    certifications: 'キャリアコンサルタント',
  },
  {
    selfIntroduction: '複雑な情報を整理して、誰でも扱いやすい形にすることを大切にしています。',
    strengths: '構造化、説明資料作成、地道な改善の継続',
    growthSkills: 'マネジメント、データ可視化、プロジェクト設計',
    interests: 'ダッシュボード、業務設計、チームコミュニケーション',
    hobbies: 'ランニング、展示巡り、手帳づくり',
    personalMessage: '迷ったら一緒に整理しましょう。',
    workLocation: '東京オフィス / ハイブリッド勤務',
    availability: '10:00-18:30 / 火曜と木曜は出社が多いです',
    careerHistory: '社内システム導入、業務フロー改善、チーム運営を担当してきました。',
    certifications: '簿記2級',
  },
];

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getDummyIndex(seed: string): number {
  return Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % PROFILE_DUMMIES.length;
}

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

async function migrateAddProjects() {
  const snapshot = await db.collection('employees').get();

  const batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const updates: Record<string, string | string[]> = {};

    if (!Array.isArray(data.projects) || data.projects.length === 0) {
      updates.projects = pickMultiple(ALL_PROJECTS, 1, 3);
    }

    const dummy = PROFILE_DUMMIES[getDummyIndex(`${doc.id}${data.name ?? ''}`)];
    for (const [field, value] of Object.entries(dummy)) {
      if (isBlank(data[field])) {
        updates[field] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
    }
  });

  if (count === 0) {
    console.log('全社員に projects と詳細プロフィール項目が既に存在します。スキップしました。');
    process.exit(0);
  }

  await batch.commit();
  console.log(`${count} 件の社員に projects と詳細プロフィール項目を追加しました。`);
  process.exit(0);
}

migrateAddProjects().catch((err) => {
  console.error('migrate-add-projects failed:', err);
  process.exit(1);
});
