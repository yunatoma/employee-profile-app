import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { filterEmployees } from './filterEmployees';
import type { Employee } from '../types/employee';
import type { SearchCondition } from '../slices/employeeSlice';

const employeeArb = fc.record<Employee>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
  department: fc.constantFrom('開発部', '人事部', '営業部', '総務部'),
  position: fc.string({ minLength: 1 }),
  employmentType: fc.constantFrom('full-time', 'part-time', 'contract', 'intern'),
  status: fc.constantFrom('active', 'leave', 'retired'),
  joinedAt: fc.constant('2020-01-01'),
  skills: fc.array(fc.string({ minLength: 1 })),
  profile: fc.string(),
});

const defaultCondition: SearchCondition = {
  keyword: '',
  department: '',
  status: '',
  skill: '',
  showRetired: false,
};

describe('filterEmployees - Property-Based Tests', () => {
  it('プロパティ1: 返却リストは入力リストの部分集合', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const result = filterEmployees(employees, defaultCondition);
        return result.every((e) => employees.some((orig) => orig.id === e.id));
      }),
    );
  });

  it('プロパティ2: showRetired=false のとき retired が含まれない', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const result = filterEmployees(employees, { ...defaultCondition, showRetired: false });
        return result.every((e) => e.status !== 'retired');
      }),
    );
  });

  it('プロパティ3: keyword が空のとき全員が返る（退職者を含む場合）', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const result = filterEmployees(employees, { ...defaultCondition, showRetired: true });
        return result.length === employees.length;
      }),
    );
  });

  it('プロパティ4: フィルタを2回適用しても結果が変わらない（冪等性）', () => {
    fc.assert(
      fc.property(fc.array(employeeArb), (employees) => {
        const once = filterEmployees(employees, defaultCondition);
        const twice = filterEmployees(once, defaultCondition);
        return (
          once.length === twice.length &&
          once.every((e, i) => e.id === twice[i].id)
        );
      }),
    );
  });
});

describe('filterEmployees - 通常テスト', () => {
  const employees: Employee[] = [
    {
      id: '1',
      name: '田中太郎',
      email: 'tanaka@example.com',
      department: '開発部',
      position: 'エンジニア',
      employmentType: 'full-time',
      status: 'active',
      joinedAt: '2020-01-01',
      skills: ['TypeScript', 'React'],
      profile: 'フロントエンド担当',
    },
    {
      id: '2',
      name: '佐藤花子',
      email: 'sato@example.com',
      department: '人事部',
      position: '人事担当',
      employmentType: 'full-time',
      status: 'retired',
      joinedAt: '2019-04-01',
      skills: ['Excel'],
      profile: '退職済み',
    },
  ];

  it('showRetired=false のとき退職者は除外される', () => {
    const result = filterEmployees(employees, { ...defaultCondition, showRetired: false });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('部署フィルタが完全一致で動作する', () => {
    const result = filterEmployees(employees, { ...defaultCondition, showRetired: true, department: '開発部' });
    expect(result).toHaveLength(1);
    expect(result[0].department).toBe('開発部');
  });

  it('キーワードフィルタが名前に部分一致する', () => {
    const result = filterEmployees(employees, { ...defaultCondition, showRetired: true, keyword: '田中' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('田中太郎');
  });
});
