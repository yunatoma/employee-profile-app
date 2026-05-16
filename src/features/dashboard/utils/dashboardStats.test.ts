import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { dashboardStats } from './dashboardStats';
import type { Employee } from '../../employees/types/employee';

const employeeArb = fc.record<Employee>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
  department: fc.constantFrom('開発部', '人事部', '営業部'),
  position: fc.string({ minLength: 1 }),
  employmentType: fc.constantFrom('full-time', 'part-time', 'contract', 'intern'),
  status: fc.constantFrom('active', 'leave', 'retired'),
  joinedAt: fc.constant('2020-01-01'),
  skills: fc.array(fc.string()),
  profile: fc.string(),
});

describe('dashboardStats - Property-Based Tests', () => {
  it('プロパティ1: totalActive === byStatus.active + byStatus.leave', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const stats = dashboardStats(employees);
        return stats.totalActive === stats.byStatus.active + stats.byStatus.leave;
      }),
    );
  });

  it('プロパティ2: retired の社員は totalActive に含まれない', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const stats = dashboardStats(employees);
        const retiredCount = employees.filter((e) => e.status === 'retired').length;
        return stats.totalActive === employees.length - retiredCount;
      }),
    );
  });

  it('プロパティ3: 空リストのとき totalActive === 0', () => {
    const stats = dashboardStats([]);
    expect(stats.totalActive).toBe(0);
    expect(stats.byStatus.active).toBe(0);
    expect(stats.byStatus.leave).toBe(0);
    expect(Object.keys(stats.byDepartment)).toHaveLength(0);
  });
});

describe('dashboardStats - 通常テスト', () => {
  const employees: Employee[] = [
    {
      id: '1', name: '田中', email: 'a@a.com', department: '開発部',
      position: 'SE', employmentType: 'full-time', status: 'active',
      joinedAt: '2020-01-01', skills: [], profile: '',
    },
    {
      id: '2', name: '佐藤', email: 'b@b.com', department: '開発部',
      position: 'SE', employmentType: 'full-time', status: 'leave',
      joinedAt: '2020-01-01', skills: [], profile: '',
    },
    {
      id: '3', name: '鈴木', email: 'c@c.com', department: '人事部',
      position: '人事', employmentType: 'full-time', status: 'retired',
      joinedAt: '2020-01-01', skills: [], profile: '',
    },
  ];

  it('部署別集計が正しい', () => {
    const stats = dashboardStats(employees);
    expect(stats.byDepartment['開発部']).toBe(2);
    expect(stats.byDepartment['人事部']).toBeUndefined();
  });

  it('退職者は集計に含まれない', () => {
    const stats = dashboardStats(employees);
    expect(stats.totalActive).toBe(2);
  });
});
