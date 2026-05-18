import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  signInWithGoogle as firebaseSignIn,
  signOut as firebaseSignOut,
  getCurrentAuthUser,
} from '../api/authService';
import type { AuthUser, OrgStatus } from '../types/user';

interface AuthState {
  user: AuthUser | null;
  orgStatus: OrgStatus;
  organizationId: string | undefined;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  orgStatus: 'loading',
  organizationId: undefined,
  loading: true,
  error: null,
};

export const signInWithGoogle = createAsyncThunk('auth/signInWithGoogle', async () => {
  return firebaseSignIn();
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await firebaseSignOut();
});

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  return getCurrentAuthUser();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOrgStatus(state, action: PayloadAction<OrgStatus>) {
      state.orgStatus = action.payload;
    },
    setOrganizationId(state, action: PayloadAction<string>) {
      state.organizationId = action.payload;
    },
    setUserRole(state, action: PayloadAction<AuthUser['role']>) {
      if (state.user) {
        state.user = { ...state.user, role: action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // signInWithGoogle
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.orgStatus = action.payload.orgStatus;
        state.organizationId = action.payload.organizationId;
        state.loading = false;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'ログインに失敗しました';
      })
      // signOut
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.orgStatus = 'no-org';
        state.organizationId = undefined;
        state.loading = false;
        state.error = null;
      })
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.orgStatus = 'loading';
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.orgStatus = action.payload.orgStatus;
          state.organizationId = action.payload.organizationId;
        } else {
          state.user = null;
          state.orgStatus = 'no-org';
          state.organizationId = undefined;
        }
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.orgStatus = 'no-org';
        state.loading = false;
      });
  },
});

export const { setOrgStatus, setOrganizationId, setUserRole } = authSlice.actions;
export const authReducer = authSlice.reducer;
