import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { organizationRepository } from '../api/organizationRepository';
import type { Organization } from '../types/organization';

interface OrganizationState {
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  currentOrganization: null,
  loading: false,
  error: null,
};

export const fetchOrganization = createAsyncThunk(
  'organization/fetchById',
  async (orgId: string) => organizationRepository.getById(orgId),
);

// CreateOrgResponse を返す（forceTokenRefresh はコンポーネント側で処理するため payload に含める）
export const createOrganization = createAsyncThunk(
  'organization/create',
  async (data: { name: string; logoUrl?: string; creatorName?: string }) => organizationRepository.create(data),
);

export const updateOrganization = createAsyncThunk(
  'organization/update',
  async ({ orgId, data }: { orgId: string; data: { name?: string; logoUrl?: string } }) =>
    organizationRepository.update(orgId, data),
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization(state, action: PayloadAction<Organization>) {
      state.currentOrganization = action.payload;
      state.error = null;
    },
    clearOrganization(state) {
      state.currentOrganization = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganization.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? '組織情報の取得に失敗しました';
      })
      .addCase(createOrganization.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        // API は { organization, forceTokenRefresh } を返す
        state.currentOrganization = action.payload.organization;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? '組織の作成に失敗しました';
      })
      .addCase(updateOrganization.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload;
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? '組織情報の更新に失敗しました';
      });
  },
});

export const { setCurrentOrganization, clearOrganization } = organizationSlice.actions;
export const organizationReducer = organizationSlice.reducer;
