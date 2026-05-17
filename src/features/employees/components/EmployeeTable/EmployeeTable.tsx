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

  const thBase = 'py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400';
  const thSticky = 'bg-white dark:bg-gray-900 sticky z-10';

  return (
    <div className="overflow-x-auto">
      <table className="min-w-max w-full text-sm" data-testid="employee-table">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className={`${thBase} ${thSticky} left-0 w-[60px] pr-4`}></th>
            <th className={`${thBase} ${thSticky} left-[60px] min-w-[120px] pr-8 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gray-200 after:dark:bg-gray-700 relative`}>氏名</th>
            <th className={`${thBase} whitespace-nowrap px-4`}>部署</th>
            <th className={`${thBase} whitespace-nowrap px-4`}>職種</th>
            <th className={`${thBase} w-28 px-4`}>ステータス</th>
            <th className={`${thBase} px-4`}>スキル</th>
            <th className={`${thBase} px-4`}>参画プロジェクト</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
