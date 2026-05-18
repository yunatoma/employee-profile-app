import { apiClient } from '../../auth/api/apiClient';
import type { Organization } from '../types/organization';

export type CreateOrgResponse = {
  organization: Organization;
  forceTokenRefresh: boolean;
};

export const organizationRepository = {
  async create(data: { name: string; logoUrl?: string; creatorName?: string }): Promise<CreateOrgResponse> {
    return apiClient.post<CreateOrgResponse>('/organizations', data);
  },

  async getById(orgId: string): Promise<Organization> {
    return apiClient.get<Organization>(`/organizations/${orgId}`);
  },

  async update(orgId: string, data: { name?: string; logoUrl?: string }): Promise<Organization> {
    return apiClient.put<Organization>(`/organizations/${orgId}`, data);
  },
};
