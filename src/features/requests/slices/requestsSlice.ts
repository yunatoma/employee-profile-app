import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../auth/api/apiClient';
import type { MasterRequest, MasterRequestStatus, MasterRequestType } from '../types/request';

type RequestsState = {
  adminList: MasterRequest[];
  myList: MasterRequest[];
  pendingRequests: MasterRequest[];
  loading: boolean;
  error: string | null;
};

const initialState: RequestsState = {
  adminList: [],
  myList: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

export const fetchAdminRequests = createAsyncThunk(
  'requests/fetchAdmin',
  async (status?: MasterRequestStatus) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get<MasterRequest[]>(`/requests${query}`);
  },
);

export const fetchMyRequests = createAsyncThunk('requests/fetchMy', async () =>
  apiClient.get<MasterRequest[]>('/requests/my'),
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (data: {
    type: MasterRequestType;
    value: string;
    category?: string;
    reason?: string;
    requestedByName: string;
  }) => apiClient.post<MasterRequest>('/requests', data),
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateStatus',
  async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
    apiClient.patch<MasterRequest>(`/requests/${id}`, { status }),
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setPendingRequests(state, action: PayloadAction<MasterRequest[]>) {
      state.pendingRequests = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.adminList = action.payload;
      })
      .addCase(fetchAdminRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'エラーが発生しました';
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myList = action.payload;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.myList = [action.payload, ...state.myList];
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.adminList = state.adminList.map((r) => (r.id === updated.id ? updated : r));
      });
  },
});

export const { setPendingRequests } = requestsSlice.actions;
export const requestsReducer = requestsSlice.reducer;
