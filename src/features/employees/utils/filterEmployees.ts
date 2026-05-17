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
      const searchableText = [
        employee.name,
        employee.email,
        employee.profile,
        employee.selfIntroduction,
        employee.strengths,
        employee.growthSkills,
        employee.interests,
        employee.hobbies,
        employee.personalMessage,
        employee.workLocation,
        employee.availability,
        employee.careerHistory,
        employee.certifications,
      ].filter(Boolean).join(' ').toLowerCase();
      const matches = searchableText.includes(kw);
      if (!matches) return false;
    }

    return true;
  });
}
