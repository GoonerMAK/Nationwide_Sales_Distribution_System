import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import type { AuthLogin, AuthSignup } from './auth.validator.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../utils/errors.js';

const COOKIE_MAX_AGE = 3 * 24 * 60 * 60 * 1000; // 3 days

export const signUp = async (
  req: Request<unknown, unknown, AuthSignup, unknown>,
  res: Response,
) => {
  const { email, password } = req.body;
  const result = await authService.signUp(email, password);
  sendCreated(res, result);
};

export const logIn = async (
  req: Request<unknown, unknown, AuthLogin, unknown>,
  res: Response,
) => {
  const { email, password } = req.body;
  const { user, token } = await authService.logIn(email, password);

  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'strict',
    secure: env.isProd,
  });

  sendSuccess(res, { user, token });
};

export const getAuthenticatedUser = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new UnauthorizedError('Not authenticated');
  }

  const user = await authService.getAuthenticatedUser(req.user.id as string);
  sendSuccess(res, { user });
};

export const logOut = async (_req: Request, res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.isProd,
  });

  sendSuccess(res, { message: 'Logged out successfully' });
};
