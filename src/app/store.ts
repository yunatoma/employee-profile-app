import { configureStore } from '@reduxjs/toolkit';
import { employeeReducer } from '../features/employees/slices/employeeSlice';
import { authReducer } from '../features/auth/slices/authSlice';
import { settingsReducer } from '../features/settings/slices/settingsSlice';
import { organizationReducer } from '../features/organizations/slices/organizationSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    auth: authReducer,
    settings: settingsReducer,
    organization: organizationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;