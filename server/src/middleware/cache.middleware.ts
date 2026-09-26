import type { Request, Response, NextFunction } from 'express';
import redisClient from '../redis.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/http-status.js';

const CACHE_PREFIX = 'cache:';
const GEN_PREFIX = 'cache-gen:';

/** Stable query string from the validated query, e.g. `{ limit: 10, offset: 0 }` → `limit=10&offset=0`. */
function canonicalQuery(query: Record<string, unknown>): string {
  return Object.keys(query)
    .filter((key) => query[key] !== undefined)
    .sort()
    .map((key) => `${key}=${String(query[key])}`)
    .join('&');
}

/** Caches 200 GETs under a versioned key, e.g. `cache:area:3:/areas?limit=10&offset=0`; mount after validation. */
export function cacheMiddleware(resource: string, ttl = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    try {
      const generation = (await redisClient.get(GEN_PREFIX + resource)) ?? '0';
      const query = canonicalQuery(req.query as Record<string, unknown>);
      const cacheKey = `${CACHE_PREFIX}${resource}:${generation}:${req.path}?${query}`;

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

/** Invalidates every cached entry for the given resources in O(1) each. */
export async function invalidateCache(...resources: string[]): Promise<void> {
  try {
    await Promise.all(resources.map((resource) => redisClient.incr(GEN_PREFIX + resource)));
    logger.debug('Cache invalidated', { resources });
  } catch (error) {
    logger.error('Cache invalidation error', { error: String(error) });
  }
}
