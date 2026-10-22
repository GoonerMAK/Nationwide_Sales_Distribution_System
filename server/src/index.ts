import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { env } from './config/env.js';
import { connectRedis, disconnectRedis } from './redis.js';
import prisma from './prisma.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware.js';
import { securityHeaders } from './middleware/security.middleware.js';
import {
  apiRateLimiter,
  loginRateLimiter,
  LOGIN_PATH,
} from './middleware/rate-limit.middleware.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { HTTP_STATUS } from './constants/http-status.js';

import { userRouter } from './module/user/user.route.js';
import { territoryRouter } from './module/territory/territory.route.js';
import { regionRouter } from './module/region/region.route.js';
import { areaRouter } from './module/area/area.route.js';
import { distributorRouter } from './module/distributor/distributor.route.js';
import { retailerRouter } from './module/retailer/retailer.route.js';
import { salesRepresentativeRouter } from './module/sales-representative/sales-representative.route.js';

export const app = express();

// Health check (served at both /health and /api/health); mounted first so probes skip every middleware below
app.get(['/health', '/api/health'], (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { status: 'ok', uptime: process.uptime() },
  });
});

// Global middleware (order matters)
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(securityHeaders);
app.use(corsMiddleware(env.CORS_ORIGINS));
app.use(apiRateLimiter);

app.use(LOGIN_PATH, loginRateLimiter);

// Better Auth handles all /api/auth/* routes (sign-in, sign-out, get-session, admin/*).
// It must be mounted before express.json(), which would otherwise consume the request body.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

// Routes (all API routes live under /api; /health stays at the root for probes)
const API_PREFIX = '/api';

app.use(API_PREFIX, userRouter);
app.use(API_PREFIX, regionRouter);
app.use(API_PREFIX, territoryRouter);
app.use(API_PREFIX, areaRouter);
app.use(API_PREFIX, distributorRouter);
app.use(API_PREFIX, retailerRouter);
app.use(API_PREFIX, salesRepresentativeRouter);

// 404 handler
app.use((_req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Postgres connected successfully');

    await connectRedis();
    logger.info('Redis connected successfully');

    app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT}`, { env: env.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
};

startServer();

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  await disconnectRedis();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
