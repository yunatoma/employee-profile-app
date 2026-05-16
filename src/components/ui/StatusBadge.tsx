import type { EmployeeStatus } from '../../features/employees/types/employee';
import { STATUS_LABELS } from '../../utils/employeeLabels';

type StatusBadgeProps = {
  status: EmployeeStatus;
};

const STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  leave: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
