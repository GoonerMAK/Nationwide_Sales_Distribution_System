import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/http-status.js';

/** Sets security-related HTTP response headers. */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (env.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory IP-based rate limiter.
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param maxRequests - Max requests per window (default: 100)
 */
export function rateLimiter(windowMs = 60000, maxRequests = 100) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup every 5 minutes
  const cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now > entry.resetAt) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  // Allow garbage collection of the interval
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = store.get(ip);

    let current: RateLimitEntry;
    if (!entry || now > entry.resetAt) {
      current = { count: 1, resetAt: now + windowMs };
      store.set(ip, current);
    } else {
      entry.count += 1;
      current = entry;
    }

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - current.count)));

    if (current.count > maxRequests) {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
      return;
    }

    next();
  };
}
