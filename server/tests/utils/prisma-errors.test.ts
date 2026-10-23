import { describe, expect, it, jest } from '@jest/globals';
import { orNotFound } from '../../src/utils/prisma-errors.js';
import { NotFoundError } from '../../src/utils/errors.js';

describe('orNotFound', () => {
  it('returns the query result when it succeeds', async () => {
    const query = jest.fn(() => Promise.resolve({ id: '1' }));

    await expect(orNotFound('Area', query)).resolves.toEqual({ id: '1' });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('turns Prisma P2025 into a NotFoundError for the resource', async () => {
    const query = () => Promise.reject(Object.assign(new Error('missing'), { code: 'P2025' }));

    const error = await orNotFound('Retailer', query).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).message).toBe('Retailer not found');
    expect((error as NotFoundError).statusCode).toBe(404);
  });

  it('rethrows other Prisma errors untouched', async () => {
    const original = Object.assign(new Error('unique'), { code: 'P2002' });

    await expect(orNotFound('Area', () => Promise.reject(original))).rejects.toBe(original);
  });

  it('rethrows errors without a code', async () => {
    const original = new Error('network down');

    await expect(orNotFound('Area', () => Promise.reject(original))).rejects.toBe(original);
  });
});
