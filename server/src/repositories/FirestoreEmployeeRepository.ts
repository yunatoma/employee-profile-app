import { db } from '../lib/firebase';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'leave' | 'retired';
  joinedAt: string;
  skills: string[];
  profile: string;
  avatarUrl?: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const COLLECTION = 'employees';

export class FirestoreEmployeeRepository {
  async findAll(): Promise<Employee[]> {
    const snapshot = await db.collection(COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee));
  }

  async findById(id: string): Promise<Employee | null> {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Employee;
  }

  async create(employee: Employee): Promise<Employee> {
    await db.collection(COLLECTION).doc(employee.id).set(employee);
    return employee;
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    await db.collection(COLLECTION).doc(id).update(data);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('社員が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).delete();
  }
}
