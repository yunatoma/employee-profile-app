import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authReducer, signInWithGoogle, signOut, initializeAuth } from './authSlice';
import type { AuthUser } from '../types/user';

vi.mock('../api/authService', () => ({
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getCurrentAuthUser: vi.fn(),
}));

import * as authService from '../api/authService';

const mockUser: AuthUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'user',
};

const initialState = {
  user: null,
  loading: true,
  error: null,
};

describe('authSlice reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態が正しい', () => {
    const state = authReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialState);
  });

  it('signInWithGoogle.pending で loading が true になる', () => {
    const state = authReducer(
      { user: null, loading: false, error: null },
      signInWithGoogle.pending('', undefined),
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('signInWithGoogle.fulfilled で user がセットされる', () => {
    const state = authReducer(
      { user: null, loading: true, error: null },
      signInWithGoogle.fulfilled(mockUser, '', undefined),
    );
    expect(state.user).toEqual(mockUser);
    expect(state.loading).toBe(false);
  });

  it('signInWithGoogle.rejected で error がセットされる', () => {
    const error = new Error('ログイン失敗');
    const state = authReducer(
      { user: null, loading: true, error: null },
      signInWithGoogle.rejected(error, '', undefined),
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('ログイン失敗');
  });

  it('signOut.fulfilled で user が null になる', () => {
    const state = authReducer(
      { user: mockUser, loading: false, error: null },
      signOut.fulfilled(undefined, '', undefined),
    );
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('initializeAuth.fulfilled で user がセットされる', () => {
    const state = authReducer(
      { user: null, loading: true, error: null },
      initializeAuth.fulfilled(mockUser, '', undefined),
    );
    expect(state.user).toEqual(mockUser);
    expect(state.loading).toBe(false);
  });

  it('initializeAuth.fulfilled で user が null の場合も正常に処理される', () => {
    const state = authReducer(
      { user: null, loading: true, error: null },
      initializeAuth.fulfilled(null, '', undefined),
    );
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('initializeAuth.rejected で user が null のまま loading が false になる', () => {
    const state = authReducer(
      { user: null, loading: true, error: null },
      initializeAuth.rejected(null, '', undefined),
    );
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });
});

describe('signInWithGoogle thunk', () => {
  it('authService.signInWithGoogle を呼び出す', async () => {
    vi.mocked(authService.signInWithGoogle).mockResolvedValue(mockUser);
    const dispatch = vi.fn();
    const thunk = signInWithGoogle();
    await thunk(dispatch, () => ({}), undefined);
    expect(authService.signInWithGoogle).toHaveBeenCalledOnce();
  });
});

describe('signOut thunk', () => {
  it('authService.signOut を呼び出す', async () => {
    vi.mocked(authService.signOut).mockResolvedValue(undefined);
    const dispatch = vi.fn();
    const thunk = signOut();
    await thunk(dispatch, () => ({}), undefined);
    expect(authService.signOut).toHaveBeenCalledOnce();
  });
});
