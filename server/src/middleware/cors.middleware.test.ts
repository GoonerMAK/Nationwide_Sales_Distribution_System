import { describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { corsMiddleware } from './cors.middleware.js';

const ALLOWED = 'http://localhost:3000';

function run(method: string, origin?: string) {
  const headers = new Map<string, string>();
  const res = {
    statusCode: 200,
    setHeader: jest.fn((name: string, value: string) => headers.set(name, value)),
    vary: jest.fn((field: string) => headers.set('Vary', field)),
    status: jest.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    end: jest.fn(),
  };
  const req = { method, headers: origin === undefined ? {} : { origin } };
  const next = jest.fn();

  corsMiddleware([ALLOWED])(req as Request, res as unknown as Response, next);

  return { headers, res, next };
}

describe('corsMiddleware', () => {
  it('echoes an allowed origin with credentials', () => {
    const { headers, next } = run('GET', ALLOWED);

    expect(headers.get('Access-Control-Allow-Origin')).toBe(ALLOWED);
    expect(headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(headers.get('Vary')).toBe('Origin');
    expect(next).toHaveBeenCalled();
  });

  it('sends no CORS headers for an unknown origin', () => {
    const { headers, next } = run('GET', 'https://evil.example');

    expect(headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(headers.has('Access-Control-Allow-Credentials')).toBe(false);
    expect(headers.get('Vary')).toBe('Origin');
    expect(next).toHaveBeenCalled();
  });

  it('answers an allowed preflight with 204 and a cacheable max age', () => {
    const { headers, res, next } = run('OPTIONS', ALLOWED);

    expect(res.statusCode).toBe(204);
    expect(headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    expect(headers.get('Access-Control-Max-Age')).toBe('600');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a preflight from an unknown origin with 403', () => {
    const { headers, res, next } = run('OPTIONS', 'https://evil.example');

    expect(res.statusCode).toBe(403);
    expect(headers.has('Access-Control-Allow-Methods')).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes through requests without an Origin header untouched', () => {
    const { headers, next } = run('GET');

    expect(headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(next).toHaveBeenCalled();
  });
});
