import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const isEmulator = !!(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST);
  admin.initializeApp(
    isEmulator
      ? { projectId: 'employee-profile-app-dev' }
      : { credential: admin.credential.applicationDefault() }
  );
}

export const auth = admin.auth();
export const db = admin.firestore();
