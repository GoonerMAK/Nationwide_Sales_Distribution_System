import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

/** Better Auth's admin plugin stores multiple roles as a comma-separated string, e.g. "admin,user". */
export function parseRoles(role: string | null | undefined): string[] {
  return (role ?? 'user')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
}

/** Allows the request only if the authenticated user has at least one of the given roles. Use after isAuthenticated. */
export function requireRole(...allowed: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const roles = parseRoles(req.user.role);
    if (!roles.some((role) => allowed.includes(role))) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
}
