import { Request, Response, NextFunction } from 'express';

export function roleMiddleware(requiredRole: 'admin') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.uid) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '認証情報がありません' } });
      return;
    }

    // ロールはカスタムクレーム（authMiddleware / orgMiddleware が設定）から取得
    const role = req.user.role;

    if (role !== requiredRole) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'この操作には管理者権限が必要です' } });
      return;
    }

    next();
  };
}
