import { apiClient, ApiError } from '../../auth/api/apiClient';
import type { GeminiResponse } from '../types/aiChat';

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  historyText: string,
): Promise<GeminiResponse> {
  try {
    return await apiClient.post<GeminiResponse>('/ai/chat', {
      systemPrompt,
      userMessage,
      historyText,
    });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : undefined;
    const message = (err as { message?: string })?.message ?? '';
    console.error('[AI Chat] API エラー status:', status, 'message:', message);
    if (status === 429 || status === 503) {
      return {
        text: 'リクエストが集中しています。少し待ってからもう一度お試しください。',
        suggestions: [],
      };
    }
    throw err;
  }
}
