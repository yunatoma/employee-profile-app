import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import type { Employee } from '../../types/employee';

type EmployeeCardProps = {
  employee: Employee;
};

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Link
      to={`/employees/${employee.id}`}
      className="flex flex-col items-center gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-sky-200 transition dark:bg-gray-900 dark:ring-gray-800 dark:hover:ring-sky-800"
    >
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-2xl dark:bg-sky-900">
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>

      <div className="w-full text-center">
        <p className="font-semibold text-gray-900 dark:text-white">{employee.name}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{employee.department}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{employee.position}</p>
      </div>

      <StatusBadge status={employee.status} />

      {employee.skills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {employee.skills.slice(0, 3).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {employee.skills.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              +{employee.skills.length - 3}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
