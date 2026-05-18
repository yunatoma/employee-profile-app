import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/firebase';

export async function orgMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証トークンがありません' } });
    return;
  }

  // authMiddleware が設定したカスタムクレーム（organizationId）があればそれを使用
  if (req.user.organizationId) {
    next();
    return;
  }

  // フォールバック: Firestore で uid から organizationId を解決（クレームが未設定の場合）
  try {
    const snapshot = await db.collection('employees')
      .where('uid', '==', req.user.uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: '組織に所属していません' } });
      return;
    }

    const employee = snapshot.docs[0].data();
    req.user.organizationId = employee.organizationId as string;
    req.user.role = employee.role as string;
    next();
  } catch (err) {
    console.error('orgMiddleware error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } });
  }
}
