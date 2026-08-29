import type { Request, Response } from 'express';
import * as userService from '../user/user.service.js';
import type { UserParams, UserCreate, UserUpdate } from '../user/user.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /user — Create a new user. */
export const createUser = async (
  req: Request<unknown, unknown, UserCreate, unknown>,
  res: Response,
) => {
  const { password, email } = req.body;
  const newUser = await userService.createUser(password, email);

  sendCreated(res, newUser);
};

/** PUT /user/:id — Update a user. */
export const updateUser = async (
  req: Request<UserParams, unknown, UserUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedUser = await userService.updateUser(id, updates);

  sendSuccess(res, updatedUser);
};

/** DELETE /user/:id — Delete a user. */
export const deleteUser = async (
  req: Request<UserParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await userService.deleteUser(id);

  sendDeleted(res, 'User deleted successfully');
};

/** GET /users — List users with pagination. */
export const getAllUsers = async (
  req: Request<unknown, unknown, unknown, PaginationQuery>,
  res: Response,
) => {
  const { offset, limit } = req.query;
  const result = await userService.getAllUsers(Number(offset), Number(limit));

  sendPaginated(res, result.data, result.pagination);
};

/** GET /user/:id — Get a single user by ID. */
export const getUserById = async (
  req: Request<UserParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  sendSuccess(res, user);
};
