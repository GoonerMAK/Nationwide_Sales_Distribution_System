import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * Resolves the Better Auth session from the request cookie and attaches it to req.
 * The session is looked up in the database on every request, so revoked sessions fail immediately.
 */
export async function isAuthenticated(req: Request, _res: Response, next: NextFunction) {
  const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (!result) {
    throw new UnauthorizedError('Not authenticated');
  }

  req.user = result.user;
  req.session = result.session;
  next();
}
