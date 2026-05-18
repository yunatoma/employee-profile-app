import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';
import { db, auth } from '../lib/firebase';
import { FirestoreOrganizationRepository, type Organization } from '../repositories/FirestoreOrganizationRepository';
import { type Employee } from '../repositories/FirestoreEmployeeRepository';

export class OrganizationService {
  private orgRepo = new FirestoreOrganizationRepository();

  async create(
    name: string,
    creatorUid: string,
    creatorEmail: string,
    creatorName: string,
    logoUrl?: string,
  ): Promise<{ organization: Organization; forceTokenRefresh: boolean }> {
    const now = new Date().toISOString();
    const orgId = randomUUID();
    const employeeId = randomUUID();

    const organization: Organization = {
      id: orgId,
      name: name.trim(),
      ownerId: creatorUid,
      createdAt: now,
      updatedAt: now,
      ...(logoUrl ? { logoUrl } : {}),
    };

    const adminEmployee: Employee = {
      id: employeeId,
      name: creatorName,
      email: creatorEmail,
      department: '',
      position: '',
      employmentType: 'full-time',
      status: 'active',
      joinedAt: now.slice(0, 10),
      skills: [],
      profile: '',
      uid: creatorUid,
      organizationId: orgId,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
      createdBy: creatorUid,
    };

    await db.runTransaction(async (tx) => {
      tx.set(db.collection('organizations').doc(orgId), organization);
      tx.set(db.collection('employees').doc(employeeId), adminEmployee);
    });

    await auth.setCustomUserClaims(creatorUid, { organizationId: orgId, role: 'admin' });

    return { organization, forceTokenRefresh: true };
  }

  async getById(orgId: string, requestingOrgId: string): Promise<Organization> {
    if (orgId !== requestingOrgId) {
      throw Object.assign(new Error('アクセス権限がありません'), { statusCode: 403, code: 'FORBIDDEN' });
    }
    const org = await this.orgRepo.getById(orgId);
    if (!org) throw Object.assign(new Error('組織が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    return org;
  }

  async update(
    orgId: string,
    data: { name?: string; logoUrl?: string },
    requestingOrgId: string,
    requestingRole: string,
  ): Promise<Organization> {
    if (orgId !== requestingOrgId) {
      throw Object.assign(new Error('アクセス権限がありません'), { statusCode: 403, code: 'FORBIDDEN' });
    }
    if (requestingRole !== 'admin') {
      throw Object.assign(new Error('管理者権限が必要です'), { statusCode: 403, code: 'FORBIDDEN' });
    }
    if ('organizationId' in data) {
      throw Object.assign(new Error('organizationId は変更できません'), { statusCode: 400, code: 'VALIDATION_ERROR' });
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;

    return this.orgRepo.update(orgId, updateData as Parameters<typeof this.orgRepo.update>[1]);
  }
}
