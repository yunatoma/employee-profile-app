import 'dotenv/config';
import { db, auth } from '../lib/firebase';

async function setupAdmin() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf('--email');
  const uidIndex = args.indexOf('--uid');

  let uid: string | undefined;

  if (emailIndex !== -1) {
    const email = args[emailIndex + 1];
    if (!email) {
      console.error('Error: --email の後にメールアドレスを指定してください');
      process.exit(1);
    }
    const user = await auth.getUserByEmail(email);
    uid = user.uid;
    console.log(`ユーザー取得: ${email} (uid: ${uid})`);
  } else if (uidIndex !== -1) {
    uid = args[uidIndex + 1];
    if (!uid) {
      console.error('Error: --uid の後に UID を指定してください');
      process.exit(1);
    }
  } else {
    console.error('使い方: npm run setup-admin -- --email <email> または --uid <uid>');
    process.exit(1);
  }

  await db.collection('users').doc(uid).set(
    { role: 'admin' },
    { merge: true },
  );

  console.log(`✓ uid: ${uid} を admin に設定しました`);
  process.exit(0);
}

setupAdmin().catch((err) => {
  console.error('setup-admin failed:', err);
  process.exit(1);
});
