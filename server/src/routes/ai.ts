import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-lite';

const responseSchema = {
  type: 'OBJECT',
  properties: {
    text: { type: 'STRING' },
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          employeeId: { type: 'STRING' },
          name: { type: 'STRING' },
          department: { type: 'STRING' },
          skills: { type: 'ARRAY', items: { type: 'STRING' } },
          status: { type: 'STRING' },
        },
        required: ['employeeId', 'name', 'department', 'skills', 'status'],
      },
    },
  },
  required: ['text', 'suggestions'],
};

// POST /api/v1/ai/chat
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!GEMINI_API_KEY) {
      res.status(503).json({
        error: { code: 'AI_UNAVAILABLE', message: 'AI service is not configured' },
      });
      return;
    }

    const { systemPrompt, userMessage, historyText } = req.body as {
      systemPrompt: string;
      userMessage: string;
      historyText: string;
    };

    const prompt = historyText
      ? `${historyText}\nUser: ${userMessage}`
      : `User: ${userMessage}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('[AI] Gemini API error', geminiRes.status, errBody);
      if (geminiRes.status === 429 || geminiRes.status === 503) {
        res.status(503).json({
          error: {
            code: 'AI_UNAVAILABLE',
            message: 'リクエストが集中しています。少し待ってからもう一度お試しください。',
          },
        });
        return;
      }
      if (geminiRes.status === 404) {
        res.status(503).json({
          error: {
            code: 'AI_UNAVAILABLE',
            message: 'AIモデルが利用できません。管理者に連絡してください。',
          },
        });
        return;
      }
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = JSON.parse(text) as { text?: string; suggestions?: unknown[] };

    res.json({ text: parsed.text ?? text, suggestions: parsed.suggestions ?? [] });
  } catch (err) {
    next(err);
  }
});

export const aiRouter = router;
