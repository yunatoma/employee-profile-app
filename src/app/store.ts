import { configureStore } from '@reduxjs/toolkit';
import { employeeReducer } from '../features/employees/slices/employeeSlice';
import { authReducer } from '../features/auth/slices/authSlice';
import { settingsReducer } from '../features/settings/slices/settingsSlice';
import { organizationReducer } from '../features/organizations/slices/organizationSlice';
import { aiChatReducer } from '../features/aiChat/slices/aiChatSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    auth: authReducer,
    settings: settingsReducer,
    organization: organizationReducer,
    aiChat: aiChatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;