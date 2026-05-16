export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';

export type EmployeeStatus = 'active' | 'leave' | 'retired';

export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinedAt: string;
  skills: string[];
  profile: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

export type EmployeeFormValues = {
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  joinedAt: string;
  skills: string[];
  profile: string;
};

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;