import type { Employee } from '../../employees/types/employee';

export type DashboardStats = {
  totalActive: number;
  byDepartment: Record<string, number>;
  byStatus: {
    active: number;
    leave: number;
  };
  bySkill: { skill: string; count: number }[];
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

  const skillCounts = activeEmployees.reduce<Record<string, number>>((acc, e) => {
    for (const skill of e.skills) {
      acc[skill] = (acc[skill] ?? 0) + 1;
    }
    return acc;
  }, {});

  const bySkill = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalActive: activeEmployees.length,
    byDepartment,
    byStatus: {
      active: activeEmployees.filter((e) => e.status === 'active').length,
      leave: activeEmployees.filter((e) => e.status === 'leave').length,
    },
    bySkill,
    note: '在籍中の社員（稼働中・休業中）のみを集計しています',
  };
}
