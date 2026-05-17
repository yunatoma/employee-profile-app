import { randomUUID } from 'crypto';
import { FirestoreEmployeeRepository, Employee } from '../repositories/FirestoreEmployeeRepository';
import { db } from '../lib/firebase';

type EmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

interface RequestingUser {
  uid: string;
  email: string;
  role?: string;
}

export class EmployeeService {
  private repo = new FirestoreEmployeeRepository();

  async getAll(): Promise<Employee[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Employee> {
    const employee = await this.repo.findById(id);
    if (!employee) throw Object.assign(new Error('社員が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    return employee;
  }

  async create(data: EmployeeInput, requestingUser: RequestingUser): Promise<Employee> {
    const now = new Date().toISOString();
    const employee: Employee = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdBy: requestingUser.uid,
    };
    return this.repo.create(employee);
  }

  async update(id: string, data: Partial<EmployeeInput>, requestingUser: RequestingUser): Promise<Employee> {
    const existing = await this.getById(id);

    // roleMiddleware が適用されていない場合に備え、Firestore からロールを取得する
    let role = requestingUser.role;
    if (!role) {
      const userDoc = await db.collection('users').doc(requestingUser.uid).get();
      role = userDoc.data()?.role as string | undefined;
    }

    if (role !== 'admin' && existing.email !== requestingUser.email) {
      throw Object.assign(new Error('このプロフィールを編集する権限がありません'), { statusCode: 403, code: 'FORBIDDEN' });
    }

    return this.repo.update(id, { ...data, updatedAt: new Date().toISOString() });
  }

  async retire(id: string): Promise<Employee> {
    await this.getById(id);
    return this.repo.update(id, { status: 'retired', updatedAt: new Date().toISOString() });
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    return this.repo.delete(id);
  }
}
