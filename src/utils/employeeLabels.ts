import type { EmployeeStatus, EmploymentType } from '../features/employees/types/employee';

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: '稼働中',
  leave: '休業中',
  retired: '退職',
  pending: '招待待ち',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'full-time': '正社員',
  'part-time': 'パート',
  contract: '契約',
  intern: 'インターン',
};

export function formatJoinedAt(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}
