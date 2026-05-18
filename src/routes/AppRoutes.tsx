import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { CreateOrgPage } from '../pages/CreateOrgPage';
import { OrgSettingsPage } from '../pages/OrgSettingsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { EmployeeDetailPage } from '../pages/EmployeeDetailPage';
import { EmployeeCreatePage } from '../pages/EmployeeCreatePage';
import { EmployeeEditPage } from '../pages/EmployeeEditPage';
import { OrgChartPage } from '../pages/OrgChartPage';
import { MyProfilePage } from '../pages/MyProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { RequestsPage } from '../pages/RequestsPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/new-org" element={<CreateOrgPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/employees/new" element={<EmployeeCreatePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
          <Route path="/org" element={<OrgChartPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/admin/organization" element={<OrgSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}