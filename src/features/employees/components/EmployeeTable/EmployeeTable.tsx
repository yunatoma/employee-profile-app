import type { Employee } from '../../types/employee';
import { EmployeeRow } from '../EmployeeRow/EmployeeRow';

type EmployeeTableProps = {
  employees: Employee[];
};

export function EmployeeTable({ employees }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-700">
        該当する社員が見つかりません
      </p>
    );
  }

  return (
    <table className="w-full text-sm" data-testid="employee-table">
      <thead>
        <tr className="border-b border-gray-200 text-left">
          <th className="py-3 pr-4 font-medium text-gray-700">氏名</th>
          <th className="py-3 pr-4 font-medium text-gray-700">部署</th>
          <th className="py-3 pr-4 font-medium text-gray-700">職種</th>
          <th className="py-3 pr-4 font-medium text-gray-700">ステータス</th>
          <th className="py-3 font-medium text-gray-700">スキル</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((employee) => (
          <EmployeeRow key={employee.id} employee={employee} />
        ))}
      </tbody>
    </table>
  );
}
