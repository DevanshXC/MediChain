import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[ErrorHandler] ${message}`, { stack: err.stack, details: err.details });

  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.details || err.stack : undefined,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
