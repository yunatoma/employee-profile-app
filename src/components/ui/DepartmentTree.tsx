import type { Employee } from '../../features/employees/types/employee';

type DepartmentTreeProps = {
  employees: Employee[];
  mode: 'department' | 'project';
  selectedDepartment: string;
  selectedProject: string;
  onModeChange: (mode: 'department' | 'project') => void;
  onDepartmentSelect: (department: string) => void;
  onProjectSelect: (project: string) => void;
};

export function DepartmentTree({
  employees,
  mode,
  selectedDepartment,
  selectedProject,
  onModeChange,
  onDepartmentSelect,
  onProjectSelect,
}: DepartmentTreeProps) {
  const activeEmployees = employees.filter((e) => e.status !== 'retired');

  const departmentCounts = activeEmployees.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + 1;
    return acc;
  }, {});

  const departments = Object.entries(departmentCounts).sort((a, b) =>
    a[0].localeCompare(b[0], 'ja'),
  );

  const projectCounts = activeEmployees.reduce<Record<string, number>>((acc, e) => {
    (e.projects ?? []).forEach((project) => {
      acc[project] = (acc[project] ?? 0) + 1;
    });
    return acc;
  }, {});

  const projects = Object.entries(projectCounts).sort((a, b) =>
    a[0].localeCompare(b[0], 'ja'),
  );

  const selected = mode === 'department' ? selectedDepartment : selectedProject;
  const items = mode === 'department' ? departments : projects;
  const total = mode === 'department'
    ? activeEmployees.length
    : activeEmployees.filter((employee) => (employee.projects ?? []).length > 0).length;
  const onSelect = mode === 'department' ? onDepartmentSelect : onProjectSelect;

  const itemClass = (value: string) =>
    `flex items-center justify-between rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors ${
      selected === value
        ? 'bg-sky-50 text-sky-600 font-medium dark:bg-sky-900/30 dark:text-sky-400'
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;

  const tabClass = (tab: 'department' | 'project') =>
    `flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
      mode === tab
        ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    }`;

  return (
    <div className="w-64 shrink-0">
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            絞り込み
          </p>
          <div className="mt-3 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => onModeChange('department')}
              className={tabClass('department')}
            >
              所属
            </button>
            <button
              type="button"
              onClick={() => onModeChange('project')}
              className={tabClass('project')}
            >
              参画プロジェクト
            </button>
          </div>
        </div>
        <div className="p-2">
          <button
            onClick={() => onSelect('')}
            className={itemClass('')}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span>すべて</span>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
              {total}
            </span>
          </button>

          <div className="mt-1 space-y-0.5">
            {items.map(([value, count]) => (
              <button
                key={value}
                onClick={() => onSelect(value)}
                className={itemClass(value)}
                style={{ width: '100%', textAlign: 'left' }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-gray-300 dark:text-gray-600">└</span>
                  <span className="truncate">{value}</span>
                </span>
                <span className="ml-1 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                  {count}
                </span>
              </button>
            ))}
          </div>
          {items.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
              表示できる項目がありません
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
