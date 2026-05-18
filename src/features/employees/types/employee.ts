export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';

export type EmployeeStatus = 'active' | 'leave' | 'retired' | 'pending';

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
  uid: string | null;
  organizationId: string;
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
};

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;
