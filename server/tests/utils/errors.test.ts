import { describe, expect, it } from '@jest/globals';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../src/utils/errors.js';

describe('AppError', () => {
  it('stores status code and defaults to operational', () => {
    const error = new AppError('boom', 500);

    expect(error.message).toBe('boom');
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it('allows marking an error as non-operational', () => {
    expect(new AppError('boom', 500, false).isOperational).toBe(false);
  });
});

describe('error subclasses', () => {
  it.each([
    ['NotFoundError', new NotFoundError(), 404, 'Resource not found'],
    ['NotFoundError with resource', new NotFoundError('Retailer'), 404, 'Retailer not found'],
    ['ConflictError', new ConflictError(), 409, 'Resource already exists'],
    ['ConflictError with message', new ConflictError('Email taken'), 409, 'Email taken'],
    ['UnauthorizedError', new UnauthorizedError(), 401, 'Access denied. Authentication required.'],
    ['ForbiddenError', new ForbiddenError(), 403, 'Access denied. Insufficient permissions.'],
  ])('%s has the right status and message', (_name, error, statusCode, message) => {
    expect(error.statusCode).toBe(statusCode);
    expect(error.message).toBe(message);
    expect(error.isOperational).toBe(true);
  });

  it('keeps instanceof working for the whole chain', () => {
    const error = new NotFoundError('Area');

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('wraps a single message into an array', () => {
    const error = new ValidationError('name is required');

    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(['name is required']);
    expect(error.message).toBe('name is required');
  });

  it('joins multiple messages and keeps them as a list', () => {
    const error = new ValidationError(['name is required', 'phone is invalid']);

    expect(error.errors).toEqual(['name is required', 'phone is invalid']);
    expect(error.message).toBe('name is required, phone is invalid');
  });
});
