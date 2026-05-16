import { describe, expect, it } from 'vitest';
import { employeeReducer, setSearchCondition, clearSearchCondition } from './employeeSlice';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from './employeeSlice';
import type { Employee } from '../types/employee';

const mockEmployee: Employee = {
  id: '1',
  name: '田中太郎',
  email: 'tanaka@example.com',
  department: '開発部',
  position: 'エンジニア',
  employmentType: 'full-time',
  status: 'active',
  joinedAt: '2020-01-01',
  skills: ['TypeScript'],
  profile: '',
};

const initialState = {
  employees: [],
  selectedEmployee: null,
  searchCondition: {
    keyword: '',
    department: '',
    status: '',
    skill: '',
    showRetired: false,
  },
  loading: false,
  error: null,
};

describe('employeeSlice', () => {
  it('fetchEmployees fulfilled: employees が更新される', () => {
    const action = fetchEmployees.fulfilled([mockEmployee], '', undefined);
    const state = employeeReducer(initialState, action);
    expect(state.employees).toHaveLength(1);
    expect(state.employees[0].id).toBe('1');
    expect(state.loading).toBe(false);
  });

  it('fetchEmployees pending: loading が true になる', () => {
    const action = fetchEmployees.pending('', undefined);
    const state = employeeReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('fetchEmployees rejected: error メッセージが設定される', () => {
    const action = fetchEmployees.rejected(new Error(), '', undefined);
    const state = employeeReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBeTruthy();
  });

  it('createEmployee fulfilled: 新しい社員が追加される', () => {
    const action = createEmployee.fulfilled(mockEmployee, '', mockEmployee);
    const state = employeeReducer(initialState, action);
    expect(state.employees).toHaveLength(1);
    expect(state.employees[0].name).toBe('田中太郎');
  });

  it('updateEmployee fulfilled: 対象社員が更新される', () => {
    const stateWithEmployee = { ...initialState, employees: [mockEmployee] };
    const updated = { ...mockEmployee, name: '田中次郎' };
    const action = updateEmployee.fulfilled(updated, '', updated);
    const state = employeeReducer(stateWithEmployee, action);
    expect(state.employees[0].name).toBe('田中次郎');
  });

  it('deleteEmployee fulfilled: 対象社員が削除される', () => {
    const stateWithEmployee = { ...initialState, employees: [mockEmployee] };
    const action = deleteEmployee.fulfilled('1', '', '1');
    const state = employeeReducer(stateWithEmployee, action);
    expect(state.employees).toHaveLength(0);
  });

  it('setSearchCondition: 部分的に条件が更新される', () => {
    const state = employeeReducer(initialState, setSearchCondition({ keyword: 'test' }));
    expect(state.searchCondition.keyword).toBe('test');
    expect(state.searchCondition.department).toBe('');
    expect(state.searchCondition.showRetired).toBe(false);
  });

  it('clearSearchCondition: 全条件がリセットされる', () => {
    const stateWithCondition = {
      ...initialState,
      searchCondition: { keyword: 'test', department: '開発部', status: 'active', skill: 'React', showRetired: true },
    };
    const state = employeeReducer(stateWithCondition, clearSearchCondition());
    expect(state.searchCondition).toEqual({
      keyword: '',
      department: '',
      status: '',
      skill: '',
      showRetired: false,
    });
  });
});
