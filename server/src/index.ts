import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectRedis, disconnectRedis } from './redis.js';
import prisma from './prisma.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { securityHeaders, corsMiddleware, rateLimiter } from './middleware/security.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { HTTP_STATUS } from './constants/http-status.js';

import { authRouter } from './module/auth/auth.routes.js';
import { userRouter } from './module/user/user.route.js';
import { territoryRouter } from './module/territory/territory.route.js';
import { areaRouter } from './module/area/area.route.js';
import { distributorRouter } from './module/distributor/distributor.route.js';
import { retailerRouter } from './module/retailer/retailer.route.js';
import { salesRepresentativeRouter } from './module/sales-representative/sales-representative.route.js';

export const app = express();

// Global middleware (order matters)
app.use(requestIdMiddleware);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(rateLimiter());
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { status: 'ok', uptime: process.uptime() },
  });
});

// Routes
app.use('/auth', authRouter);
app.use('', userRouter);
app.use('', territoryRouter);
app.use('', areaRouter);
app.use('', distributorRouter);
app.use('', retailerRouter);
app.use('', salesRepresentativeRouter);

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
