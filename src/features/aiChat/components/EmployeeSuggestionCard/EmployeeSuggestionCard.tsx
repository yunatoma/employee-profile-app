import { Link } from 'react-router-dom';
import type { EmployeeSuggestion } from '../../types/aiChat';

type Props = {
  suggestion: EmployeeSuggestion;
};

const statusLabel: Record<string, string> = {
  active: '稼働中',
  leave: '休暇中',
  retired: '退職済み',
  pending: '入社予定',
};

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  leave: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  retired: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

export function EmployeeSuggestionCard({ suggestion }: Props) {
  return (
    <Link
      to={`/employees/${suggestion.employeeId}`}
      data-testid="suggestion-card"
      className="block rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-sky-300 hover:bg-sky-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-600 dark:hover:bg-sky-950"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {suggestion.name}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {suggestion.department}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColor[suggestion.status] ?? statusColor.active}`}
        >
          {statusLabel[suggestion.status] ?? suggestion.status}
        </span>
      </div>
      {suggestion.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {suggestion.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              {skill}
            </span>
          ))}
          {suggestion.skills.length > 4 && (
            <span className="text-[10px] text-gray-400">+{suggestion.skills.length - 4}</span>
          )}
        </div>
      )}
    </Link>
  );
}
