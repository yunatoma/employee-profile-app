/**
 * 開発用 DB リセットスクリプト
 * 実行: npx tsx src/scripts/reset-db.ts
 *
 * WARNING: 全 organizations / employees ドキュメントを削除します。
 *          開発環境のみで使用してください。
 */
import 'dotenv/config';
import { db } from '../lib/firebase';

async function deleteCollection(collectionName: string): Promise<number> {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`  ${collectionName}: 0 件（スキップ）`);
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`  ${collectionName}: ${snapshot.size} 件削除`);
  return snapshot.size;
}

async function main() {
  console.log('=== DB リセット開始 ===');
  await deleteCollection('employees');
  await deleteCollection('organizations');
  await deleteCollection('users'); // NFR-ORG2-03: 旧 users コレクション後方互換性対応
  console.log('=== DB リセット完了 ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('リセット失敗:', err);
  process.exit(1);
});
