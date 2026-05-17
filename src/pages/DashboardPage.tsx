import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees } from '../features/employees/slices/employeeSlice';
import { dashboardStats } from '../features/dashboard/utils/dashboardStats';
import { StatCard } from '../components/ui/StatCard';
import { DepartmentChart } from '../components/ui/DepartmentChart';
import { StatusChart } from '../components/ui/StatusChart';
import { SkillChart } from '../components/ui/SkillChart';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">ダッシュボード</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{stats.note}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="在籍社員数" value={stats.totalActive} accent />
        <StatCard label="稼働中" value={stats.byStatus.active} />
        <StatCard label="休業中" value={stats.byStatus.leave} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">ステータス内訳</h2>
          <StatusChart active={stats.byStatus.active} leave={stats.byStatus.leave} />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">部署別社員数</h2>
          <DepartmentChart data={stats.byDepartment} />
        </div>
      </div>

      {stats.bySkill.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">スキル別人数 TOP10</h2>
          <SkillChart data={stats.bySkill} />
        </div>
      )}
    </div>
  );
}
