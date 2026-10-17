import { describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { parseRoles, requireRole } from '../../src/middleware/role.middleware.js';
import { ForbiddenError, UnauthorizedError } from '../../src/utils/errors.js';

function run(user: { role?: string | null } | undefined, ...allowed: string[]) {
  const req = { user } as unknown as Request;
  const next = jest.fn();

  requireRole(...allowed)(req, {} as Response, next);

  return { next };
}

describe('parseRoles', () => {
  it('defaults a missing role to user', () => {
    expect(parseRoles(null)).toEqual(['user']);
    expect(parseRoles(undefined)).toEqual(['user']);
  });

  it('splits comma-separated roles and trims them', () => {
    expect(parseRoles('admin, user')).toEqual(['admin', 'user']);
  });
});

describe('requireRole', () => {
  it('calls next when the user has an allowed role', () => {
    expect(run({ role: 'admin' }, 'admin').next).toHaveBeenCalledTimes(1);
  });

  it('accepts a match in a multi-role string', () => {
    expect(run({ role: 'user,admin' }, 'admin').next).toHaveBeenCalledTimes(1);
  });

  it('rejects a user without an allowed role', () => {
    expect(() => run({ role: 'user' }, 'admin')).toThrow(ForbiddenError);
  });

  it('treats a null role as user', () => {
    expect(() => run({ role: null }, 'admin')).toThrow(ForbiddenError);
    expect(run({ role: null }, 'user').next).toHaveBeenCalledTimes(1);
  });

  it('rejects an unauthenticated request', () => {
    expect(() => run(undefined, 'admin')).toThrow(UnauthorizedError);
  });
});
