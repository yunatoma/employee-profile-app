import type { Employee } from '../../features/employees/types/employee';

type DepartmentTreeProps = {
  employees: Employee[];
  selected: string;
  onSelect: (department: string) => void;
};

export function DepartmentTree({ employees, selected, onSelect }: DepartmentTreeProps) {
  const activeEmployees = employees.filter((e) => e.status !== 'retired');

  const departmentCounts = activeEmployees.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + 1;
    return acc;
  }, {});

  const departments = Object.entries(departmentCounts).sort((a, b) =>
    a[0].localeCompare(b[0], 'ja'),
  );

  const itemClass = (dept: string) =>
    `flex items-center justify-between rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors ${
      selected === dept
        ? 'bg-sky-50 text-sky-600 font-medium dark:bg-sky-900/30 dark:text-sky-400'
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="w-52 shrink-0">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            所属
          </p>
        </div>
        <div className="p-2">
          <button
            onClick={() => onSelect('')}
            className={itemClass('')}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span>すべて</span>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
              {activeEmployees.length}
            </span>
          </button>

          <div className="mt-1 space-y-0.5">
            {departments.map(([dept, count]) => (
              <button
                key={dept}
                onClick={() => onSelect(dept)}
                className={itemClass(dept)}
                style={{ width: '100%', textAlign: 'left' }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-gray-300 dark:text-gray-600">└</span>
                  <span className="truncate">{dept}</span>
                </span>
                <span className="ml-1 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
