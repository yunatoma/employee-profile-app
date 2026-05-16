export type UserRole = 'admin' | 'user';

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
};
