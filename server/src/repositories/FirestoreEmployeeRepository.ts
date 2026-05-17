import * as admin from 'firebase-admin';
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
  projects?: string[];
  profile: string;
  selfIntroduction?: string;
  strengths?: string;
  growthSkills?: string;
  interests?: string;
  hobbies?: string;
  personalMessage?: string;
  workLocation?: string;
  availability?: string;
  careerHistory?: string;
  certifications?: string;
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
    // null 値は Firestore フィールドの削除として扱う（managerId 削除などに使用）
    const firestoreData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      firestoreData[key] = value === null
        ? admin.firestore.FieldValue.delete()
        : value;
    }
    await db.collection(COLLECTION).doc(id).update(firestoreData);
    const updated = await this.findById(id);
    if (!updated) throw Object.assign(new Error('社員が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.collection(COLLECTION).doc(id).delete();
  }
}
