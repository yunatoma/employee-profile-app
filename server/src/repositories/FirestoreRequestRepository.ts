import { db } from '../lib/firebase';

export type MasterRequestType = 'skill' | 'project';
export type MasterRequestStatus = 'pending' | 'approved' | 'rejected';

export type MasterRequest = {
  id: string;
  type: MasterRequestType;
  value: string;
  category?: string;
  reason?: string;
  requestedBy: string;
  requestedByName: string;
  status: MasterRequestStatus;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

const COLLECTION = 'requests';

export const requestRepository = {
  async create(data: {
    type: MasterRequestType;
    value: string;
    category?: string;
    reason?: string;
    requestedBy: string;
    requestedByName: string;
    organizationId: string;
  }): Promise<MasterRequest> {
    const now = new Date().toISOString();
    const ref = db.collection(COLLECTION).doc();
    const request: MasterRequest = {
      id: ref.id,
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(request);
    return request;
  },

  async listByOrg(organizationId: string, status?: MasterRequestStatus): Promise<MasterRequest[]> {
    let query = db.collection(COLLECTION).where('organizationId', '==', organizationId) as FirebaseFirestore.Query;
    if (status) {
      query = query.where('status', '==', status);
    }
    const snap = await query.get();
    const results = snap.docs.map((d) => d.data() as MasterRequest);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listByUser(organizationId: string, uid: string): Promise<MasterRequest[]> {
    const snap = await db
      .collection(COLLECTION)
      .where('organizationId', '==', organizationId)
      .where('requestedBy', '==', uid)
      .get();
    const results = snap.docs.map((d) => d.data() as MasterRequest);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateStatus(
    organizationId: string,
    requestId: string,
    status: MasterRequestStatus,
  ): Promise<MasterRequest | null> {
    const ref = db.collection(COLLECTION).doc(requestId);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const data = snap.data() as MasterRequest;
    if (data.organizationId !== organizationId) return null;
    const now = new Date().toISOString();
    await ref.update({ status, updatedAt: now });
    return { ...data, status, updatedAt: now };
  },
};
