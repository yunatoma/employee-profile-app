import { Link } from 'react-router-dom';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import type { Employee } from '../../types/employee';

type EmployeeRowProps = {
  employee: Employee;
};

export function EmployeeRow({ employee }: EmployeeRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50" data-testid="employee-row">
      <td className="py-3 pr-4">
        <Link
          to={`/employees/${employee.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {employee.name}
        </Link>
      </td>
      <td className="py-3 pr-4 text-gray-900">{employee.department}</td>
      <td className="py-3 pr-4 text-gray-900">{employee.position}</td>
      <td className="py-3 pr-4">
        <StatusBadge status={employee.status} />
      </td>
      <td className="py-3">
        <div className="flex flex-wrap gap-1">
          {employee.skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>
      </td>
    </tr>
  );
}
