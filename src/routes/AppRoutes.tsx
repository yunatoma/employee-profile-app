import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { EmployeeDetailPage } from '../pages/EmployeeDetailPage';
import { EmployeeCreatePage } from '../pages/EmployeeCreatePage';
import { EmployeeEditPage } from '../pages/EmployeeEditPage';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/new" element={<EmployeeCreatePage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
      </Routes>
    </BrowserRouter>
  );
}