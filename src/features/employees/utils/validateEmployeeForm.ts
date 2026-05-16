import type { Employee, EmployeeFormErrors, EmployeeFormValues } from '../types/employee';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'intern'] as const;
const STATUSES = ['active', 'leave', 'retired'] as const;

export function validateEmployeeForm(
  values: EmployeeFormValues,
  employees: Employee[],
  editingId?: string,
): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  if (!values.name.trim()) {
    errors.name = '氏名を入力してください';
  }

  if (!values.email.trim()) {
    errors.email = 'メールアドレスを入力してください';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = '有効なメールアドレスを入力してください';
  } else {
    const duplicate = employees.find(
      (e) => e.email === values.email && e.id !== editingId,
    );
    if (duplicate) {
      errors.email = 'このメールアドレスはすでに使用されています';
    }
  }

  if (!values.department.trim()) {
    errors.department = '部署を入力してください';
  }

  if (!values.position.trim()) {
    errors.position = '職種を入力してください';
  }

  if (!(EMPLOYMENT_TYPES as readonly string[]).includes(values.employmentType)) {
    errors.employmentType = '雇用形態を選択してください';
  }

  if (!(STATUSES as readonly string[]).includes(values.status)) {
    errors.status = 'ステータスを選択してください';
  }

  if (!values.joinedAt) {
    errors.joinedAt = '入社日を入力してください';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.joinedAt)) {
    errors.joinedAt = '入社日の形式が正しくありません（YYYY-MM-DD）';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const joinedDate = new Date(values.joinedAt);
    if (joinedDate > today) {
      errors.joinedAt = '入社日に未来の日付は入力できません';
    }
  }

  return errors;
}
