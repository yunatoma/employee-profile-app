import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'Internal server error';

  res.status(statusCode).json({ error: { code, message } });
}
