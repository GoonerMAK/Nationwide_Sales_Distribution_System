import type { Request, Response, NextFunction } from 'express';
import redisClient from '../redis.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/http-status.js';

const RATE_LIMIT_PREFIX = 'rate-limit:';
const MS_PER_SECOND = 1000;

interface RateLimitOptions {
  name: string;
  windowMs: number;
  maxRequests: number;
}

/** Sliding window estimate: this window's count plus the unexpired share of the previous one. */
export function estimateRequestCount(
  current: number,
  previous: number,
  elapsedRatio: number,
): number {
  return current + previous * (1 - elapsedRatio);
}

/** Redis-backed sliding window counter per client IP; fails open if Redis is unavailable. */
export function rateLimiter({ name, windowMs, maxRequests }: RateLimitOptions) {
  const keyTtlSeconds = Math.ceil((windowMs * 2) / MS_PER_SECOND);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowIndex = Math.floor(now / windowMs);
    const windowElapsedMs = now % windowMs;
    const keyFor = (index: number) => `${RATE_LIMIT_PREFIX}${name}:${clientId}:${index}`;

    try {
      const [current, , previous] = await redisClient
        .multi()
        .incr(keyFor(windowIndex))
        .expire(keyFor(windowIndex), keyTtlSeconds)
        .get(keyFor(windowIndex - 1))
        .exec();

      const estimated = estimateRequestCount(
        Number(current),
        Number(previous ?? 0),
        windowElapsedMs / windowMs,
      );

      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader(
        'X-RateLimit-Remaining',
        String(Math.max(0, maxRequests - Math.ceil(estimated))),
      );

      if (estimated > maxRequests) {
        const retryAfterSeconds = Math.ceil((windowMs - windowElapsedMs) / MS_PER_SECOND);
        res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        });
        return;
      }
    } catch (error) {
      logger.error('Rate limiter error', { name, error: String(error) });
    }

    next();
  };
}

export const apiRateLimiter = rateLimiter({ name: 'api', windowMs: 60_000, maxRequests: 100 });

export const loginRateLimiter = rateLimiter({ name: 'login', windowMs: 60_000, maxRequests: 10 });
