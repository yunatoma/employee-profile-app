import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEmployees,
  setSearchCondition,
} from '../features/employees/slices/employeeSlice';
import { filterEmployees } from '../features/employees/utils/filterEmployees';
import { EmployeeTable } from '../features/employees/components/EmployeeTable/EmployeeTable';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';

export function EmployeeListPage() {
  const dispatch = useAppDispatch();
  const { employees, searchCondition, loading, error } = useAppSelector(
    (state) => state.employees,
  );

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const filtered = filterEmployees(employees, searchCondition);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員一覧</h1>
        <Link
          to="/employees/new"
          data-testid="employee-list-create-button"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
        >
          + 社員を登録する
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ステータス
        </label>
        <select
          id="status-filter"
          data-testid="employee-list-status-filter"
          value={
            searchCondition.showRetired
              ? 'show-retired'
              : searchCondition.status || 'all'
          }
          onChange={(e) => {
            if (e.target.value === 'show-retired') {
              dispatch(setSearchCondition({ status: '', showRetired: true }));
            } else {
              dispatch(
                setSearchCondition({
                  status: e.target.value === 'all' ? '' : e.target.value,
                  showRetired: false,
                }),
              );
            }
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="all">全て</option>
          <option value="active">稼働中</option>
          <option value="leave">休業中</option>
          <option value="show-retired">退職者を含む</option>
        </select>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="px-6 py-4">
          <EmployeeTable employees={filtered} />
        </div>
      </div>
    </div>
  );
}
