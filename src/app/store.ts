import { configureStore } from '@reduxjs/toolkit';
import { employeeReducer } from '../features/employees/slices/employeeSlice';
import { authReducer } from '../features/auth/slices/authSlice';
import { settingsReducer } from '../features/settings/slices/settingsSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    auth: authReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;