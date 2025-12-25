import type { Request, Response, NextFunction } from 'express';
import redisClient from '../redis.js';

export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                console.log(`Cache HIT: ${cacheKey}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            console.log(`Cache MISS: ${cacheKey}`);

            const originalJson = res.json.bind(res);

            res.json = (body: any) => {
                redisClient.setEx(cacheKey, ttl, JSON.stringify(body))
                    .catch(err => console.error('Redis cache error:', err));

                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error('Redis middleware error:', error);
            next(); 
        }
    };
};

export const invalidateCache = async (pattern: string) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};