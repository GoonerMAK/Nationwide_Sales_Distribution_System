import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { logger } from '../utils/logger.js';

const DATABASE_UNAVAILABLE_CODES = ['P1001', 'P1008', 'P2024', 'ECONNREFUSED', 'ETIMEDOUT'];

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: { success: boolean; message: string; errors?: string[] } = {
      success: false,
      message: err.message,
    };

    if (err instanceof ValidationError) {
      body.errors = err.errors;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  if (err.name === 'ZodError' && 'issues' in err) {
    const issues = (err as unknown as { issues: Array<{ message: string }> }).issues;
    const messages = issues.map((i) => i.message);

    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
    return;
  }

  const errWithType = err as Error & { type?: string };
  if (errWithType.type === 'entity.parse.failed') {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Malformed JSON body',
    });
    return;
  }
  if (errWithType.type === 'entity.too.large') {
    res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({
      success: false,
      message: 'Request body is too large',
    });
    return;
  }
  if (errWithType.type === 'charset.unsupported' || errWithType.type === 'encoding.unsupported') {
    res.status(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE).json({
      success: false,
      message: 'Unsupported request body encoding',
    });
    return;
  }

  const errWithCode = err as Error & { code?: string };
  if (typeof errWithCode.code === 'string') {
    if (errWithCode.code === 'P2002') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'A record with this value already exists',
      });
      return;
    }
    if (errWithCode.code === 'P2025') {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
    if (errWithCode.code === 'P2003') {
      res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'This record is linked to other records',
      });
      return;
    }
    if (DATABASE_UNAVAILABLE_CODES.includes(errWithCode.code)) {
      logger.error('Database unavailable', { code: errWithCode.code, path: req.path });
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Service temporarily unavailable',
      });
      return;
    }
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  });
}
