import { useEffect } from 'react';
import { fetchEmployees } from '../features/employees/slices/employeeSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';

export function EmployeeListPage() {
  const dispatch = useAppDispatch();

  const { employees, loading, error } = useAppSelector(
    (state) => state.employees,
  );

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) {
    return <p className="p-6">読み込み中です...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error}</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">社員一覧</h1>
        <p className="mt-1 text-sm text-gray-500">
          社員の基本情報や所属部署、保有スキルを確認できます。
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                氏名
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                部署
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                職種
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                ステータス
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                スキル
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {employee.department}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {employee.position}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {employee.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}