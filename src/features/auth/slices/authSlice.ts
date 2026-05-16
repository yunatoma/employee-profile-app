import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  signInWithGoogle as firebaseSignIn,
  signOut as firebaseSignOut,
  getCurrentAuthUser,
} from '../api/authService';
import type { AuthUser } from '../types/user';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // signInWithGoogle
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'ログインに失敗しました';
      })
      // signOut
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      // initializeAuth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
