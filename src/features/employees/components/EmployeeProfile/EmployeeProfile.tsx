import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import { EMPLOYMENT_TYPE_LABELS, formatJoinedAt } from '../../../../utils/employeeLabels';
import type { Employee } from '../../types/employee';

type EmployeeProfileProps = {
  employee: Employee;
};

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {employee.avatarUrl ? (
          <img
            src={employee.avatarUrl}
            alt={`${employee.name}のアバター`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl text-gray-500">
            👤
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
          <p className="text-sm text-gray-700">{employee.email}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-gray-700">部署</dt>
          <dd className="mt-1 text-gray-900">{employee.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">職種</dt>
          <dd className="mt-1 text-gray-900">{employee.position}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">雇用形態</dt>
          <dd className="mt-1 text-gray-900">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">ステータス</dt>
          <dd className="mt-1">
            <StatusBadge status={employee.status} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-700">入社日</dt>
          <dd className="mt-1 text-gray-900">{formatJoinedAt(employee.joinedAt)}</dd>
        </div>
      </dl>

      {employee.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">スキル</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {employee.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {employee.profile && (
        <div>
          <p className="text-sm font-medium text-gray-700">プロフィール</p>
          <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">{employee.profile}</p>
        </div>
      )}
    </div>
  );
}
