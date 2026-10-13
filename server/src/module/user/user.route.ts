import { Router } from 'express';
import * as userController from './user.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import {
  validateRequest,
  validateParams,
  validateQuery,
} from '../../middleware/validator.middleware.js';
import { createUserSchema, updateUserSchema, userParamsSchema } from './user.validator.js';
import { paginationQuerySchema } from '../pagination/pagination.validator.js';

export const userRouter = Router();

// User management is admin-only.
const adminOnly = [isAuthenticated, requireRole('admin')];

userRouter.post(
  '/user',
  ...adminOnly,
  validateRequest(createUserSchema),
  userController.createUser,
);
userRouter.put(
  '/user/:id',
  ...adminOnly,
  validateParams(userParamsSchema),
  validateRequest(updateUserSchema),
  userController.updateUser,
);
userRouter.delete(
  '/user/:id',
  ...adminOnly,
  validateParams(userParamsSchema),
  userController.deleteUser,
);
userRouter.get(
  '/users',
  ...adminOnly,
  validateQuery(paginationQuerySchema),
  userController.getAllUsers,
);
userRouter.get(
  '/user/:id',
  ...adminOnly,
  validateParams(userParamsSchema),
  userController.getUserById,
);
