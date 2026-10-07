import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';

const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';
const EXPOSED_HEADERS = 'X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining';
const PREFLIGHT_MAX_AGE_SECONDS = 600;

/** CORS middleware that only allows exact-match origins from the allowlist. */
export function corsMiddleware(allowedOrigins: readonly string[]) {
  const allowed = new Set(allowedOrigins);

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    const isAllowed = origin !== undefined && allowed.has(origin);

    res.vary('Origin');

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', EXPOSED_HEADERS);
    }

    if (req.method === 'OPTIONS') {
      if (!isAllowed) {
        res.status(HTTP_STATUS.FORBIDDEN).end();
        return;
      }

      res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
      res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
      res.setHeader('Access-Control-Max-Age', String(PREFLIGHT_MAX_AGE_SECONDS));
      res.status(HTTP_STATUS.NO_CONTENT).end();
      return;
    }

    next();
  };
}
