import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchEmployees,
  setSearchCondition,
} from '../features/employees/slices/employeeSlice';
import { filterEmployees } from '../features/employees/utils/filterEmployees';
import { EmployeeTable } from '../features/employees/components/EmployeeTable/EmployeeTable';
import { DepartmentTree } from '../components/ui/DepartmentTree';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';

export function EmployeeListPage() {
  const dispatch = useAppDispatch();
  const { employees, searchCondition, loading, error } = useAppSelector(
    (state) => state.employees,
  );
  const isAdmin = useAppSelector((state) => state.auth.user?.role === 'admin');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  // フィルタ条件が変わったらページを先頭に戻す
  useEffect(() => {
    setPage(1);
  }, [searchCondition]);

  const filtered = filterEmployees(employees, searchCondition);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員一覧</h1>
        {isAdmin && (
          <Link
            to="/employees/new"
            data-testid="employee-list-create-button"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
          >
            + 社員を登録する
          </Link>
        )}
      </div>

      {/* フィルタ行：テーブル列 + 所属列のグリッドに合わせる */}
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
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
          <div className="flex items-center gap-2">
            <label htmlFor="per-page" className="text-sm text-gray-500 dark:text-gray-400">
              表示件数
            </label>
            <select
              id="per-page"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}件</option>
              ))}
            </select>
          </div>
        </div>
        {/* 所属ツリーと同幅の空白 */}
        <div className="w-52 shrink-0" />
      </div>

      {/* 本体：テーブル + 所属ツリー */}
      <div className="flex items-start gap-4">
        <div className="flex-1 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <div className="px-6 py-4">
            <EmployeeTable employees={paginated} />
          </div>
          <Pagination
            total={filtered.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
          />
        </div>
        <DepartmentTree
          employees={employees}
          selected={searchCondition.department}
          onSelect={(dept) => dispatch(setSearchCondition({ department: dept }))}
        />
      </div>
    </div>
  );
}
