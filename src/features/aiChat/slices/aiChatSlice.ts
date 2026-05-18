import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import type { ChatMessage } from '../types/aiChat';
import { queryAI, saveMessages } from '../api/aiChatRepository';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateSessionId(): string {
  return `session-${Date.now()}`;
}

interface AIChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  sessionId: string;
}

const initialState: AIChatState = {
  messages: [],
  isOpen: false,
  loading: false,
  error: null,
  sessionId: generateSessionId(),
};

export const sendMessage = createAsyncThunk(
  'aiChat/sendMessage',
  async (question: string, { getState }) => {
    const state = getState() as RootState;
    const employees = state.employees.employees;
    const userId = state.auth.user?.uid ?? 'anonymous';
    const sessionId = state.aiChat.sessionId;
    const history = state.aiChat.messages;

    const response = await queryAI(question, employees, history);

    saveMessages(userId, sessionId, question, response.text, response.suggestions);

    return response;
  },
);

const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    toggleChat(state) {
      state.isOpen = !state.isOpen;
    },
    closeChat(state) {
      state.isOpen = false;
    },
    clearMessages(state) {
      state.messages = [];
      state.sessionId = generateSessionId();
    },
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: generateId(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          id: generateId(),
          role: 'model',
          content: action.payload.text,
          suggestions: action.payload.suggestions,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'エラーが発生しました';
        state.messages.push({
          id: generateId(),
          role: 'model',
          content: 'エラーが発生しました。しばらくしてからもう一度お試しください。',
          timestamp: new Date().toISOString(),
          isError: true,
        });
      });
  },
});

export const { toggleChat, closeChat, clearMessages, addUserMessage } = aiChatSlice.actions;
export const aiChatReducer = aiChatSlice.reducer;
