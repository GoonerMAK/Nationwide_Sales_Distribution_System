import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  // Signs session cookies. Generate one: openssl rand -base64 32
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  // Public URL of this API server (scheme + host + port), used by Better Auth for callbacks and cookies.
  BETTER_AUTH_URL: z.url().default('http://localhost:4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173'];

const parsed = envSchema.parse(process.env);

const frontendUrls = parsed.FRONTEND_URL.split(',')
  .map((url) => url.trim())
  .filter(Boolean);

export const env = {
  PORT: parseInt(parsed.PORT, 10),
  DATABASE_URL: parsed.DATABASE_URL,
  REDIS_URL: parsed.REDIS_URL,
  BETTER_AUTH_SECRET: parsed.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: parsed.BETTER_AUTH_URL,
  NODE_ENV: parsed.NODE_ENV,
  isDev: parsed.NODE_ENV === 'development',
  isProd: parsed.NODE_ENV === 'production',
  CORS_ORIGINS:
    parsed.NODE_ENV === 'development' ? [...DEV_ORIGINS, ...frontendUrls] : frontendUrls,
};
