import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { validateEmployeeForm } from './validateEmployeeForm';
import type { Employee, EmployeeFormValues } from '../types/employee';

const validValues: EmployeeFormValues = {
  name: '田中太郎',
  email: 'tanaka@example.com',
  department: '開発部',
  position: 'エンジニア',
  employmentType: 'full-time',
  status: 'active',
  joinedAt: '2020-01-01',
  skills: ['TypeScript', 'React'],
  profile: '',
};

const employees: Employee[] = [];

describe('validateEmployeeForm - Property-Based Tests', () => {
  it('プロパティ1: 必須フィールドが空なら必ずエラーが返る', () => {
    const emptyValues: EmployeeFormValues = {
      ...validValues,
      name: '',
      email: '',
      department: '',
      position: '',
      joinedAt: '',
    };
    const errors = validateEmployeeForm(emptyValues, employees);
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.department).toBeDefined();
    expect(errors.position).toBeDefined();
    expect(errors.joinedAt).toBeDefined();
  });

  it('プロパティ2: 正常な入力値ではエラーが返らない', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (name, department, position) => {
          const values: EmployeeFormValues = {
            ...validValues,
            name,
            department,
            position,
          };
          const errors = validateEmployeeForm(values, employees);
          return !errors.name && !errors.department && !errors.position;
        },
      ),
    );
  });
});

describe('validateEmployeeForm - メールバリデーション', () => {
  const invalidEmails = [
    'notanemail',
    '@nodomain.com',
    'noatsign',
    'space in@email.com',
    'double@@at.com',
  ];

  invalidEmails.forEach((email) => {
    it(`無効なメール "${email}" はエラーになる`, () => {
      const errors = validateEmployeeForm({ ...validValues, email }, employees);
      expect(errors.email).toBeDefined();
    });
  });

  it('有効なメールはエラーにならない', () => {
    const errors = validateEmployeeForm(validValues, employees);
    expect(errors.email).toBeUndefined();
  });
});

describe('validateEmployeeForm - メール重複チェック', () => {
  const existingEmployees: Employee[] = [
    {
      id: 'existing-1',
      name: '既存社員',
      email: 'existing@example.com',
      department: '開発部',
      position: 'SE',
      employmentType: 'full-time',
      status: 'active',
      joinedAt: '2020-01-01',
      skills: [],
      profile: '',
    },
  ];

  it('同じメールが登録済みの場合は重複エラー', () => {
    const errors = validateEmployeeForm(
      { ...validValues, email: 'existing@example.com' },
      existingEmployees,
    );
    expect(errors.email).toMatch(/すでに使用/);
  });

  it('編集時は自分のメールは重複扱いしない', () => {
    const errors = validateEmployeeForm(
      { ...validValues, email: 'existing@example.com' },
      existingEmployees,
      'existing-1',
    );
    expect(errors.email).toBeUndefined();
  });
});

describe('validateEmployeeForm - 入社日バリデーション', () => {
  it('未来の日付はエラーになる', () => {
    const errors = validateEmployeeForm(
      { ...validValues, joinedAt: '2099-01-01' },
      employees,
    );
    expect(errors.joinedAt).toMatch(/未来/);
  });

  it('不正な形式はエラーになる', () => {
    const errors = validateEmployeeForm(
      { ...validValues, joinedAt: '20200101' },
      employees,
    );
    expect(errors.joinedAt).toBeDefined();
  });
});
