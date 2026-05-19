import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  details?: string;
}

function isQuotaExceeded(err: AppError): boolean {
  // Firestore gRPC RESOURCE_EXHAUSTED = code 8
  return err.code === 8 || (typeof err.details === 'string' && err.details.includes('Quota exceeded'));
}

export function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);

  if (isQuotaExceeded(err)) {
    return res.status(503).json({
      error: {
        code: 'QUOTA_EXCEEDED',
        message: 'ただいまサービスの利用上限に達しています。明日午前9時以降に再度お試しください。',
      },
    });
  }

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal server error';

  res.status(statusCode).json({ error: { code, message } });
}
