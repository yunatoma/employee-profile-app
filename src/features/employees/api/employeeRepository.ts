import { apiClient } from '../../auth/api/apiClient';
import type { Employee } from '../types/employee';

export const employeeRepository = {
  async findAll(): Promise<Employee[]> {
    return apiClient.get<Employee[]>('/employees');
  },

  async findById(id: string): Promise<Employee | undefined> {
    try {
      return await apiClient.get<Employee>(`/employees/${id}`);
    } catch {
      return undefined;
    }
  },

  async create(employee: Employee): Promise<Employee> {
    const { id, createdAt, updatedAt, createdBy, ...input } = employee;
    void id; void createdAt; void updatedAt; void createdBy;
    return apiClient.post<Employee>('/employees', input);
  },

  async update(employee: Employee): Promise<Employee> {
    const { id, createdAt, updatedAt, createdBy, ...input } = employee;
    void createdAt; void updatedAt; void createdBy;
    // managerId が undefined の場合は null を明示送信してサーバー側で Firestore フィールド削除を行う
    const body = { ...input, managerId: employee.managerId ?? null };
    return apiClient.put<Employee>(`/employees/${id}`, body);
  },

  async retire(id: string): Promise<Employee> {
    return apiClient.patch<Employee>(`/employees/${id}/retire`);
  },

  async delete(id: string): Promise<string> {
    await apiClient.delete(`/employees/${id}`);
    return id;
  },

  async linkUid(email: string, uid: string): Promise<{ employee: unknown; forceTokenRefresh: boolean }> {
    return apiClient.post('/employees/link-uid', { email, uid });
  },
};
