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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl dark:bg-sky-900">
            👤
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">部署</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{employee.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">職種</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{employee.position}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">雇用形態</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">ステータス</dt>
          <dd className="mt-1">
            <StatusBadge status={employee.status} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">入社日</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{formatJoinedAt(employee.joinedAt)}</dd>
        </div>
      </dl>

      {employee.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">スキル</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {employee.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {employee.profile && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">プロフィール</p>
          <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap dark:text-white">{employee.profile}</p>
        </div>
      )}
    </div>
  );
}
