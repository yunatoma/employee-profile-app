import type { Employee } from '../../employees/types/employee';

export type DashboardStats = {
  totalActive: number;
  byDepartment: Record<string, number>;
  byStatus: {
    active: number;
    leave: number;
  };
  note: string;
};

export function dashboardStats(employees: Employee[]): DashboardStats {
  const activeEmployees = employees.filter(
    (e) => e.status === 'active' || e.status === 'leave',
  );

  const byDepartment = activeEmployees.reduce<Record<string, number>>(
    (acc, e) => {
      acc[e.department] = (acc[e.department] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return {
    totalActive: activeEmployees.length,
    byDepartment,
    byStatus: {
      active: activeEmployees.filter((e) => e.status === 'active').length,
      leave: activeEmployees.filter((e) => e.status === 'leave').length,
    },
    note: '在籍中の社員（稼働中・休業中）のみを集計しています',
  };
}
