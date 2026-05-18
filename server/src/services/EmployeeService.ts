import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';
import { FirestoreEmployeeRepository, Employee } from '../repositories/FirestoreEmployeeRepository';
import { db, auth } from '../lib/firebase';

type EmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

interface RequestingUser {
  uid: string;
  email: string;
  role?: string;
  organizationId?: string;
}

export class EmployeeService {
  private repo = new FirestoreEmployeeRepository();

  async getAll(organizationId: string): Promise<Employee[]> {
    return this.repo.findAll(organizationId);
  }

  async getById(id: string, organizationId: string): Promise<Employee> {
    const employee = await this.repo.findById(id);
    if (!employee) throw Object.assign(new Error('社員が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    if (employee.organizationId !== organizationId) {
      throw Object.assign(new Error('アクセス権限がありません'), { statusCode: 403, code: 'FORBIDDEN' });
    }
    return employee;
  }

  async create(data: EmployeeInput, requestingUser: RequestingUser): Promise<Employee> {
    const orgId = requestingUser.organizationId;
    if (!orgId) throw Object.assign(new Error('組織情報がありません'), { statusCode: 403, code: 'FORBIDDEN' });

    // 組織内メール重複チェック
    const snapshot = await db.collection('employees')
      .where('organizationId', '==', orgId)
      .where('email', '==', data.email)
      .limit(1)
      .get();
    if (!snapshot.empty) {
      throw Object.assign(new Error('このメールアドレスはすでに登録されています'), { statusCode: 400, code: 'VALIDATION_ERROR' });
    }

    const now = new Date().toISOString();
    const employee: Employee = {
      ...data,
      uid: data.uid ?? null,       // undefined は Firestore 非対応のため null に統一
      role: data.role ?? 'member', // 未指定は member
      id: randomUUID(),
      organizationId: orgId,
      createdAt: now,
      updatedAt: now,
      createdBy: requestingUser.uid,
    };
    return this.repo.create(employee);
  }

  async update(id: string, data: Partial<EmployeeInput>, requestingUser: RequestingUser): Promise<Employee> {
    const orgId = requestingUser.organizationId;
    if (!orgId) throw Object.assign(new Error('組織情報がありません'), { statusCode: 403, code: 'FORBIDDEN' });

    const existing = await this.getById(id, orgId);

    if (requestingUser.role !== 'admin' && existing.email !== requestingUser.email) {
      throw Object.assign(new Error('このプロフィールを編集する権限がありません'), { statusCode: 403, code: 'FORBIDDEN' });
    }

    // organizationId の変更を禁止
    const { organizationId: _orgId, ...safeData } = data as Record<string, unknown>;
    void _orgId;

    return this.repo.update(id, { ...safeData, updatedAt: new Date().toISOString() } as Partial<Employee>);
  }

  async retire(id: string, organizationId: string): Promise<Employee> {
    await this.getById(id, organizationId);
    return this.repo.update(id, { status: 'retired', updatedAt: new Date().toISOString() });
  }

  async delete(id: string, organizationId: string, requestingUser: RequestingUser): Promise<void> {
    const employee = await this.getById(id, organizationId);

    // admin 最低1名保証チェック
    if (employee.role === 'admin') {
      const adminSnapshot = await db.collection('employees')
        .where('organizationId', '==', organizationId)
        .where('role', '==', 'admin')
        .get();
      if (adminSnapshot.size <= 1) {
        throw Object.assign(new Error('組織には最低1名の管理者が必要です'), { statusCode: 403, code: 'FORBIDDEN' });
      }
    }

    return this.repo.delete(id);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.repo.findByEmail(email);
  }

  async linkUid(
    email: string,
    uid: string,
  ): Promise<{ employee: Employee; forceTokenRefresh: boolean }> {
    let linkedEmployee: Employee | null = null;

    await db.runTransaction(async (tx) => {
      // email で employee を検索
      const emailSnapshot = await tx.get(
        db.collection('employees').where('email', '==', email).limit(1) as admin.firestore.Query,
      );
      if (emailSnapshot.empty) {
        throw Object.assign(new Error('メールアドレスに対応する社員が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
      }

      const employeeDoc = emailSnapshot.docs[0];
      const employeeData = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;

      // 既に別の uid で紐付済みの場合は拒否
      if (employeeData.uid !== null && employeeData.uid !== uid) {
        throw Object.assign(new Error('このメールアドレスは既に別のアカウントで使用されています'), { statusCode: 409, code: 'CONFLICT' });
      }

      // 同じ uid で既に紐付済みの場合は冪等で成功
      if (employeeData.uid === uid) {
        linkedEmployee = employeeData;
        return;
      }

      // uid の一意性チェック
      const uidSnapshot = await tx.get(
        db.collection('employees').where('uid', '==', uid).limit(1) as admin.firestore.Query,
      );
      if (!uidSnapshot.empty) {
        throw Object.assign(new Error('このアカウントは既に別の社員に紐付いています'), { statusCode: 409, code: 'CONFLICT' });
      }

      // uid 紐付け・status 更新
      const now = new Date().toISOString();
      tx.update(employeeDoc.ref, { uid, status: 'active', updatedAt: now });

      linkedEmployee = { ...employeeData, uid, status: 'active', updatedAt: now };
    });

    if (!linkedEmployee) throw Object.assign(new Error('uid 紐付けに失敗しました'), { statusCode: 500, code: 'INTERNAL_ERROR' });

    // カスタムクレーム設定
    await auth.setCustomUserClaims(uid, {
      organizationId: (linkedEmployee as Employee).organizationId,
      role: (linkedEmployee as Employee).role,
    });

    return { employee: linkedEmployee as Employee, forceTokenRefresh: true };
  }
}
