import { GoogleGenAI, Type } from '@google/genai';
import type { GeminiResponse } from '../types/aiChat';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
  console.info('[AI Chat] Gemini クライアント初期化完了');
} else {
  console.warn('[AI Chat] VITE_GEMINI_API_KEY が設定されていません。');
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          employeeId: { type: Type.STRING },
          name: { type: Type.STRING },
          department: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          status: { type: Type.STRING },
        },
        required: ['employeeId', 'name', 'department', 'skills', 'status'],
      },
    },
  },
  required: ['text', 'suggestions'],
};

export async function generateAIResponse(
  systemPrompt: string,
  userMessage: string,
  historyText: string,
): Promise<GeminiResponse> {
  if (!ai) {
    return {
      text: 'AI チャットを使用するには VITE_GEMINI_API_KEY の設定が必要です。開発サーバーを再起動してください。',
      suggestions: [],
    };
  }

  const prompt = historyText
    ? `${historyText}\nUser: ${userMessage}`
    : `User: ${userMessage}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = response.text ?? '';
    const parsed = JSON.parse(text) as GeminiResponse;
    return {
      text: parsed.text ?? text,
      suggestions: parsed.suggestions ?? [],
    };
  } catch (err) {
    const status = (err as { status?: number })?.status;
    const message = (err as { message?: string })?.message ?? '';
    console.error('[AI Chat] Gemini API エラー status:', status, 'message:', message);
    if (status === 429) {
      return {
        text: 'リクエストが集中しています。少し待ってからもう一度お試しください。',
        suggestions: [],
      };
    }
    throw err;
  }
}
