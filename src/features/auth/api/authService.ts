import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../../../lib/firebase';
import type { AuthUser } from '../types/user';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<AuthUser> {
  const result = await signInWithPopup(firebaseAuth, provider);
  const { user } = result;

  const userRef = doc(firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      role: 'user',
      createdAt: new Date().toISOString(),
    });
  }

  const userData = (await getDoc(userRef)).data();

  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    role: userData?.role ?? 'user',
  };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}

export async function getIdToken(): Promise<string> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error('ログインしていません');
  return user.getIdToken();
}

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  return firebaseOnAuthStateChanged(firebaseAuth, callback);
}

export function getCurrentAuthUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = firebaseOnAuthStateChanged(firebaseAuth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        resolve(null);
        return;
      }
      const data = userSnap.data();
      resolve({
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        role: data.role ?? 'user',
      });
    });
  });
}
