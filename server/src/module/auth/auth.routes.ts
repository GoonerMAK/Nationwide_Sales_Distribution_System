import { Router } from 'express';
import * as authController from './auth.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validator.middleware.js';
import { authLoginSchema, authSignUpSchema } from './auth.validator.js';

export const authRouter = Router();

authRouter.post('/signup', validateRequest(authSignUpSchema), authController.signUp);
authRouter.post('/login', validateRequest(authLoginSchema), authController.logIn);
authRouter.post('/logout', authController.logOut);
authRouter.get('/user', isAuthenticated, authController.getAuthenticatedUser);