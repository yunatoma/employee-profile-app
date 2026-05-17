import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import type { Employee } from '../../types/employee';

type EmployeeRowProps = {
  employee: Employee;
};

export function EmployeeRow({ employee }: EmployeeRowProps) {
  const tdSticky = 'sticky z-10 bg-white dark:bg-gray-900 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50';
  const projects = employee.projects ?? [];

  return (
    <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50" data-testid="employee-row">
      <td className={`${tdSticky} left-0 py-3.5 pr-4 w-[60px]`}>
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
          {employee.avatarUrl ? (
            <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
      </td>
      <td className={`${tdSticky} left-[60px] py-3.5 pr-8 relative after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gray-200 after:dark:bg-gray-700`}>
        <Link
          to={`/employees/${employee.id}`}
          className="font-medium text-sky-600 hover:text-sky-700 hover:underline dark:text-sky-400 dark:hover:text-sky-300 whitespace-nowrap"
        >
          {employee.name}
        </Link>
      </td>
      <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{employee.department}</td>
      <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{employee.position}</td>
      <td className="py-3.5 px-4">
        <StatusBadge status={employee.status} />
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-nowrap gap-1 overflow-hidden">
          {employee.skills.slice(0, 2).map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {employee.skills.length > 2 && (
            <span className="inline-flex shrink-0 items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              +{employee.skills.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-nowrap gap-1 overflow-hidden">
          {projects.slice(0, 1).map((project) => (
            <span
              key={project}
              className="inline-flex shrink-0 items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {project}
            </span>
          ))}
          {projects.length > 1 && (
            <span className="inline-flex shrink-0 items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              +{projects.length - 1}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
