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
        <h1 className="text-2xl font-bold text-gray-900">社員一覧</h1>
        <Link
          to="/employees/new"
          data-testid="employee-list-create-button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          社員を登録する
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
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
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">全て</option>
          <option value="active">稼働中</option>
          <option value="leave">休業中</option>
          <option value="show-retired">退職者を含む</option>
        </select>
      </div>

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-4">
          <EmployeeTable employees={filtered} />
        </div>
      </div>
    </div>
  );
}
