export type ChatRole = 'user' | 'model';

export type EmployeeSuggestion = {
  employeeId: string;
  name: string;
  department: string;
  skills: string[];
  status: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  suggestions?: EmployeeSuggestion[];
  timestamp: string;
  isError?: boolean;
};

export type GeminiResponse = {
  text: string;
  suggestions: EmployeeSuggestion[];
};
