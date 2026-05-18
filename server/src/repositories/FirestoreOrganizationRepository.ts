import { db } from '../lib/firebase';

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const COLLECTION = 'organizations';

export class FirestoreOrganizationRepository {
  async create(org: Organization): Promise<Organization> {
    await db.collection(COLLECTION).doc(org.id).set(org);
    return org;
  }

  async getById(orgId: string): Promise<Organization | null> {
    const doc = await db.collection(COLLECTION).doc(orgId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Organization;
  }

  async update(orgId: string, data: Partial<Pick<Organization, 'name' | 'logoUrl' | 'updatedAt'>>): Promise<Organization> {
    await db.collection(COLLECTION).doc(orgId).update(data);
    const updated = await this.getById(orgId);
    if (!updated) throw Object.assign(new Error('組織が見つかりません'), { statusCode: 404, code: 'NOT_FOUND' });
    return updated;
  }
}
