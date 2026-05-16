import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/firebase';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証トークンがありません' } });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email ?? '' };
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証トークンが無効です' } });
  }
}
