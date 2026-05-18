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
