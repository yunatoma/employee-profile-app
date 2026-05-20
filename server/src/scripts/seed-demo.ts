import dotenv from 'dotenv';
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: envFile });

import { db, auth } from '../lib/firebase';

const DEMO_EMAIL = 'demo@example.com';
const DEMO_ID = 'demo-admin-001';
const now = new Date().toISOString();

async function seedDemo() {
  const args = process.argv.slice(2);
  const codeIndex = args.indexOf('--code');
  const accessCode = codeIndex !== -1 ? args[codeIndex + 1] : process.env.DEMO_ACCESS_CODE;
  if (!accessCode) {
    console.error('使い方: npm run seed:demo -- --code <アクセスコード>  または DEMO_ACCESS_CODE 環境変数を設定してください');
    process.exit(1);
  }
  if (accessCode.length < 6) {
    console.error('アクセスコードは6文字以上にしてください');
    process.exit(1);
  }

  // ORG_ID を既存の prod- 社員から取得
  const empsSnap = await db.collection('employees')
    .where('email', '==', 'yamazaki@example.com')
    .limit(1)
    .get();

  if (empsSnap.empty) {
    console.error('本番シードデータが見つかりません。先に npm run seed:prod を実行してください。');
    process.exit(1);
  }
  const ORG_ID = empsSnap.docs[0].data().organizationId as string;
  console.log(`組織ID: ${ORG_ID}`);

  // Firebase Auth ユーザー作成 or パスワード更新
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(DEMO_EMAIL);
    await auth.updateUser(existing.uid, { password: accessCode });
    uid = existing.uid;
    console.log(`既存デモユーザーのパスワードを更新しました (uid: ${uid})`);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'auth/user-not-found') {
      const created = await auth.createUser({
        email: DEMO_EMAIL,
        password: accessCode,
        displayName: 'デモ管理者',
      });
      uid = created.uid;
      console.log(`デモユーザーを作成しました (uid: ${uid})`);
    } else {
      throw err;
    }
  }

  // カスタムクレーム設定（ログイン時の高速パスに使用）
  await auth.setCustomUserClaims(uid, {
    organizationId: ORG_ID,
    role: 'admin',
  });
  console.log('カスタムクレームを設定しました');

  // Firestore 社員レコード作成 or 更新
  await db.collection('employees').doc(DEMO_ID).set({
    id: DEMO_ID,
    organizationId: ORG_ID,
    name: 'デモ管理者',
    email: DEMO_EMAIL,
    department: '経営',
    position: '管理者（デモ）',
    employmentType: 'full-time',
    status: 'active',
    joinedAt: '2024-01-01',
    skills: [],
    profile: 'デモ用の管理者アカウントです。',
    avatarUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=demo-admin&backgroundColor=b6e3f4',
    uid,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
    createdBy: 'seed',
  });
  console.log('社員レコードを作成/更新しました');

  console.log('\n✅ デモアカウントの準備が完了しました');
  console.log(`   メール: ${DEMO_EMAIL}`);
  console.log(`   アクセスコード: ${accessCode}`);
  console.log(`   ロール: admin`);
  process.exit(0);
}

seedDemo().catch((err) => {
  console.error('seed-demo failed:', err);
  process.exit(1);
});
