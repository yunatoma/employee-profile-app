import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/firebase';

export function roleMiddleware(requiredRole: 'admin' | 'user') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const uid = req.user?.uid;

    if (!uid) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証情報がありません' } });
      return;
    }

    try {
      const userDoc = await db.collection('users').doc(uid).get();

      if (!userDoc.exists) {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'ユーザー情報が見つかりません' } });
        return;
      }

      const role = userDoc.data()?.role as string;

      if (requiredRole === 'admin' && role !== 'admin') {
        res.status(403).json({ error: { code: 'FORBIDDEN', message: 'この操作には管理者権限が必要です' } });
        return;
      }

      req.user = { ...req.user!, role };
      next();
    } catch (err) {
      console.error('Role check failed:', err);
      next(err);
    }
  };
}
