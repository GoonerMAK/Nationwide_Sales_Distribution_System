import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export function isAuthenticated(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies.jwt as string | undefined;

  if (!token) {
    throw new UnauthorizedError('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token.');
  }
}
