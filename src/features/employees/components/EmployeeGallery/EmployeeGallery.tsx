import { EmployeeCard } from '../EmployeeCard/EmployeeCard';
import type { Employee } from '../../types/employee';

type EmployeeGalleryProps = {
  employees: Employee[];
};

export function EmployeeGallery({ employees }: EmployeeGalleryProps) {
  if (employees.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
        該当する社員が見つかりません
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}
