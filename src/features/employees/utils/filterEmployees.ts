import type { Employee } from '../types/employee';
import type { SearchCondition } from '../slices/employeeSlice';

export function filterEmployees(
  employees: Employee[],
  condition: SearchCondition,
): Employee[] {
  return employees.filter((employee) => {
    if (!condition.showRetired && employee.status === 'retired') {
      return false;
    }

    if (condition.status && condition.status !== 'all') {
      if (employee.status !== condition.status) return false;
    }

    if (condition.department) {
      if (employee.department !== condition.department) return false;
    }

    if (condition.skill) {
      const hasSkill = employee.skills.some((s) =>
        s.toLowerCase().includes(condition.skill.toLowerCase()),
      );
      if (!hasSkill) return false;
    }

    if (condition.keyword) {
      const kw = condition.keyword.toLowerCase();
      const matches =
        employee.name.toLowerCase().includes(kw) ||
        employee.email.toLowerCase().includes(kw) ||
        employee.profile.toLowerCase().includes(kw);
      if (!matches) return false;
    }

    return true;
  });
}
