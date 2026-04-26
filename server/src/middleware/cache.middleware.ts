import type { Request, Response, NextFunction } from 'express';
import redisClient from '../redis.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/http-status.js';

const CACHE_PREFIX = 'cache:';

export function cacheMiddleware(ttl = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = CACHE_PREFIX + (req.originalUrl || req.url);

    try {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.debug('Cache HIT', { key: cacheKey });
        res.status(HTTP_STATUS.OK).json(JSON.parse(cachedData));
        return;
      }

      logger.debug('Cache MISS', { key: cacheKey });

      const originalJson = res.json.bind(res);

      res.json = (body: unknown) => {
        // Only cache successful responses
        if (res.statusCode === HTTP_STATUS.OK) {
          redisClient
            .setEx(cacheKey, ttl, JSON.stringify(body))
            .catch((err) => logger.error('Redis cache set error', { error: String(err) }));
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Redis middleware error', { error: String(error) });
      next();
    }
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const scanPattern = pattern.startsWith(CACHE_PREFIX) ? pattern : CACHE_PREFIX + pattern;

    // Use KEYS for pattern-based deletion (acceptable for bounded cache key sets)
    const keys = await redisClient.keys(scanPattern);

    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.debug('Cache invalidated', { pattern: scanPattern, count: keys.length });
    }
  } catch (error) {
    logger.error('Cache invalidation error', { error: String(error) });
  }
}
