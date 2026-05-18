export type UserRole = 'admin' | 'member';

export type OrgStatus = 'loading' | 'member' | 'no-org';

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
};
