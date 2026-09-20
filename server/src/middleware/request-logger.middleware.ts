import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Logs each request after the response finishes. Logging runs on `res.on('finish')`
 * via setImmediate so it never delays the response or throws into the request path.
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    setImmediate(() => {
      try {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

        logger.http(`${req.method} ${req.originalUrl}`, {
          requestId: req.requestId,
          statusCode: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100,
          userId: req.user?.sub ?? req.user?.id,
          ip: req.ip,
        });
      } catch (err) {
        logger.error('request-logger failed', { err: err instanceof Error ? err.message : err });
      }
    });
  });

  next();
}
