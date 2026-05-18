import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { firebaseAuth } from '../../../lib/firebase';
import { employeeRepository } from '../../employees/api/employeeRepository';
import { ApiError } from './apiErrors';
import type { AuthUser, OrgStatus } from '../types/user';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export type AuthResult = {
  user: AuthUser;
  orgStatus: OrgStatus;
  organizationId?: string;
};

async function handlePostSignIn(firebaseUser: User): Promise<AuthResult> {
  const idTokenResult = await firebaseUser.getIdTokenResult();
  const claims = idTokenResult.claims;

  const authUser: AuthUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    role: (claims.role as AuthUser['role'] | undefined) ?? 'member',
  };

  // 高速パス: カスタムクレームに organizationId がある場合はすでにメンバー
  if (claims.organizationId) {
    return { user: authUser, orgStatus: 'member', organizationId: claims.organizationId as string };
  }

  // クレームなし: link-uid API を呼んで紐付けを試みる
  try {
    const result = await employeeRepository.linkUid(firebaseUser.email ?? '', firebaseUser.uid);
    if (result.forceTokenRefresh) {
      await firebaseUser.getIdToken(true);
      // リフレッシュ後のクレームから organizationId と role を取得
      const refreshedToken = await firebaseUser.getIdTokenResult();
      const orgId = refreshedToken.claims.organizationId as string | undefined;
      const role = (refreshedToken.claims.role as AuthUser['role'] | undefined) ?? 'member';
      return {
        user: { ...authUser, role },
        orgStatus: 'member',
        organizationId: orgId,
      };
    }
    return { user: authUser, orgStatus: 'member' };
  } catch (err: unknown) {
    // 404: 事前登録なし → 新規組織作成が必要
    if (err instanceof ApiError && err.status === 404) {
      return { user: authUser, orgStatus: 'no-org' };
    }
    throw err;
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const result = await signInWithPopup(firebaseAuth, provider);
  return handlePostSignIn(result.user);
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

export function getCurrentAuthUser(): Promise<{ user: AuthUser; orgStatus: OrgStatus } | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = firebaseOnAuthStateChanged(firebaseAuth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }
      try {
        const result = await handlePostSignIn(user);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}
