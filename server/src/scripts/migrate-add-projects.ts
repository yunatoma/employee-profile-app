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

function pickMultiple<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function migrateAddProjects() {
  const snapshot = await db.collection('employees').get();

  const batch = db.batch();
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (!Array.isArray(data.projects) || data.projects.length === 0) {
      const projects = pickMultiple(ALL_PROJECTS, 1, 3);
      batch.update(doc.ref, { projects });
      count++;
    }
  });

  if (count === 0) {
    console.log('全社員に projects フィールドが既に存在します。スキップしました。');
    process.exit(0);
  }

  await batch.commit();
  console.log(`${count} 件の社員にプロジェクトをランダムに割り当てました。`);
  process.exit(0);
}

migrateAddProjects().catch((err) => {
  console.error('migrate-add-projects failed:', err);
  process.exit(1);
});
