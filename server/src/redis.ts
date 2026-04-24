import { createClient } from 'redis';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('error', (err) => logger.error('Redis client error', { error: String(err) }));
redisClient.on('connect', () => logger.info('Redis client connected'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;
