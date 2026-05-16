import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import type { Employee } from '../../types/employee';

type EmployeeRowProps = {
  employee: Employee;
};

export function EmployeeRow({ employee }: EmployeeRowProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-testid="employee-row">
      <td className="py-3.5 pr-4 w-10">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <Link
          to={`/employees/${employee.id}`}
          className="font-medium text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
        >
          {employee.name}
        </Link>
      </td>
      <td className="py-3.5 pr-4 text-gray-700 dark:text-gray-300">{employee.department}</td>
      <td className="py-3.5 pr-4 text-gray-700 dark:text-gray-300">{employee.position}</td>
      <td className="py-3.5 pr-4">
        <StatusBadge status={employee.status} />
      </td>
      <td className="py-3.5">
        <div className="flex flex-wrap gap-1">
          {employee.skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      </td>
    </tr>
  );
}
