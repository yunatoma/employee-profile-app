import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../../../lib/firebase';
import type { Employee } from '../../employees/types/employee';
import type { ChatMessage, GeminiResponse } from '../types/aiChat';
import { generateAIResponse } from './geminiClient';

const SYSTEM_PROMPT = `あなたは社員管理システムの AI アシスタントです。
以下の社員データを参照し、ユーザーの質問に日本語で答えてください。

## 回答ルール
- 社員の推薦・検索・分析に関する質問に答えてください
- 候補社員がいる場合は suggestions に含めてください（最大5名）
- 候補がない場合は suggestions を空配列にしてください
- text は自然な日本語で、簡潔かつ有益な回答を書いてください
- 稼働状況: active=稼働中, leave=休暇中, retired=退職済み, pending=入社予定`;

export function filterEmployeesForQuery(
  question: string,
  employees: Employee[],
): Employee[] {
  // retired 以外を対象
  const candidates = employees.filter((e) => e.status !== 'retired');

  // 質問からキーワードを抽出して部分一致フィルタ
  const lower = question.toLowerCase();
  const scored = candidates.map((e) => {
    let score = 0;
    if (e.skills.some((s) => lower.includes(s.toLowerCase()))) score += 2;
    if (lower.includes(e.department.toLowerCase())) score += 2;
    if (e.status === 'active') score += 1;
    return { employee: e, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 20).map((s) => s.employee);
}

function buildEmployeeContext(employees: Employee[]): string {
  return JSON.stringify(
    employees.map((e) => ({
      id: e.id,
      name: e.name,
      department: e.department,
      position: e.position,
      skills: e.skills,
      status: e.status,
      availability: e.availability,
    })),
    null,
    2,
  );
}

function buildHistoryText(history: ChatMessage[]): string {
  return history
    .slice(-5)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
}

export async function queryAI(
  question: string,
  employees: Employee[],
  history: ChatMessage[],
): Promise<GeminiResponse> {
  const filtered = filterEmployeesForQuery(question, employees);
  const employeeContext = buildEmployeeContext(filtered);
  const systemPrompt = `${SYSTEM_PROMPT}\n\n## 社員データ\n${employeeContext}`;
  const historyText = buildHistoryText(history);

  return generateAIResponse(systemPrompt, question, historyText);
}

export function saveMessages(
  userId: string,
  sessionId: string,
  userContent: string,
  modelContent: string,
  suggestions: GeminiResponse['suggestions'],
): void {
  const ref = collection(
    firestore,
    'chatHistory',
    userId,
    'sessions',
    sessionId,
    'messages',
  );
  void addDoc(ref, {
    role: 'user',
    content: userContent,
    timestamp: serverTimestamp(),
  });
  void addDoc(ref, {
    role: 'model',
    content: modelContent,
    suggestions,
    timestamp: serverTimestamp(),
  });
}
