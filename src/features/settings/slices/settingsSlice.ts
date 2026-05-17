import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient } from '../../auth/api/apiClient';

export type SkillCategory = { category: string; skills: string[] };

export type Settings = {
  skillCategories: SkillCategory[];
  projects: string[];
};

type SettingsState = {
  skillCategories: SkillCategory[];
  projects: string[];
  loading: boolean;
  error: string | null;
};

const initialState: SettingsState = {
  skillCategories: [],
  projects: [],
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async () => apiClient.get<Settings>('/settings'),
);

export const updateSettings = createAsyncThunk(
  'settings/update',
  async (settings: Settings) => apiClient.put<Settings>('/settings', settings),
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.skillCategories = action.payload.skillCategories;
        state.projects = action.payload.projects;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'エラーが発生しました';
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.skillCategories = action.payload.skillCategories;
        state.projects = action.payload.projects;
      });
  },
});

export const settingsReducer = settingsSlice.reducer;
