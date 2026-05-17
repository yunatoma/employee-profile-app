import type { Employee } from '../../types/employee';
import { EmployeeRow } from '../EmployeeRow/EmployeeRow';

type EmployeeTableProps = {
  employees: Employee[];
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
        該当する社員が見つかりません
      </p>
    );
  }

  return (
    <table className="w-full text-sm" data-testid="employee-table">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-10"></th>
          <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">氏名</th>
          <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">部署</th>
          <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 whitespace-nowrap">職種</th>
          <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-28">ステータス</th>
          <th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">スキル</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {employees.map((employee) => (
          <EmployeeRow key={employee.id} employee={employee} />
        ))}
      </tbody>
    </table>
  );
}
