import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';

const exec = jest.fn<() => Promise<unknown[]>>();
const chain = {
  incr: jest.fn(() => chain),
  expire: jest.fn(() => chain),
  get: jest.fn(() => chain),
  exec,
};

jest.unstable_mockModule('../../src/redis.js', () => ({
  default: { multi: () => chain },
}));
jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  logger: { error: jest.fn() },
}));

const { estimateRequestCount, rateLimiter } =
  await import('../../src/middleware/rate-limit.middleware.js');

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

async function run(counts: { current: number; previous: number | null }) {
  exec.mockResolvedValueOnce([
    counts.current,
    1,
    counts.previous === null ? null : String(counts.previous),
  ]);

  const headers = new Map<string, string>();
  const res = {
    setHeader: jest.fn((name: string, value: string) => headers.set(name, value)),
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const req = { ip: '10.0.0.1' };
  const next = jest.fn();

  await rateLimiter({ name: 'test', windowMs: WINDOW_MS, maxRequests: MAX_REQUESTS })(
    req as Request,
    res as unknown as Response,
    next,
  );

  return { headers, res, next };
}

describe('estimateRequestCount', () => {
  it('weights the previous window by the share of it still inside the sliding window', () => {
    expect(estimateRequestCount(10, 100, 0.25)).toBe(85);
  });

  it('ignores the previous window once the current one has fully elapsed', () => {
    expect(estimateRequestCount(10, 100, 1)).toBe(10);
  });
});

describe('rateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(WINDOW_MS * 10 + 1_000);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows a request under the limit and reports the remaining quota', async () => {
    const { headers, next } = await run({ current: 5, previous: null });

    expect(next).toHaveBeenCalledTimes(1);
    expect(headers.get('X-RateLimit-Limit')).toBe('100');
    expect(headers.get('X-RateLimit-Remaining')).toBe('95');
  });

  it('blocks the window-boundary burst a fixed window would let through', async () => {
    const { res, next, headers } = await run({ current: 100, previous: 100 });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(headers.get('Retry-After')).toBe('59');
    expect(headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('allows the request that reaches the limit exactly', async () => {
    const { next } = await run({ current: 100, previous: null });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('fails open when Redis is unavailable', async () => {
    exec.mockRejectedValueOnce(new Error('connection refused'));
    const next = jest.fn();

    await rateLimiter({ name: 'test', windowMs: WINDOW_MS, maxRequests: MAX_REQUESTS })(
      { ip: '10.0.0.1' } as Request,
      {} as Response,
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
