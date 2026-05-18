# Functional Design - Domain Entities (Unit AI-1)

## ChatMessage

```typescript
type ChatRole = 'user' | 'model';

type EmployeeSuggestion = {
  employeeId: string;
  name: string;
  department: string;
  skills: string[];
  status: string;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  suggestions?: EmployeeSuggestion[];
  timestamp: Date;
  isError?: boolean;
};
```

## AIChatState (Redux)

```typescript
type AIChatState = {
  messages: ChatMessage[];
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  sessionId: string;
};
```

## GeminiResponse (Gemini JSON structured output)

```typescript
type GeminiResponse = {
  text: string;
  suggestions: EmployeeSuggestion[];
};
```

## Firestore: chatHistory

```
chatHistory/{userId}/sessions/{sessionId}/messages/{messageId}
  - role: 'user' | 'model'
  - content: string
  - suggestions?: EmployeeSuggestion[]
  - timestamp: Timestamp
```
