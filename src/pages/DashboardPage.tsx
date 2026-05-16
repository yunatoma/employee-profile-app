import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees } from '../features/employees/slices/employeeSlice';
import { dashboardStats } from '../features/dashboard/utils/dashboardStats';
import { StatCard } from '../components/ui/StatCard';
import { DepartmentChart } from '../components/ui/DepartmentChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const stats = dashboardStats(employees);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="在籍社員数" value={stats.totalActive} />
        <StatCard label="稼働中" value={stats.byStatus.active} />
        <StatCard label="休業中" value={stats.byStatus.leave} />
      </div>

      <p className="text-xs text-gray-700">{stats.note}</p>

      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-base font-semibold text-gray-900">部署別社員数</h2>
        <DepartmentChart data={stats.byDepartment} />
      </div>
    </div>
  );
}
