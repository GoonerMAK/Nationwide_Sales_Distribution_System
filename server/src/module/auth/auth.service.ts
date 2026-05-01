import prisma from '../../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';

const SALT_ROUNDS = 10;

/** Registers a new user with hashed password. */
export const signUp = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ConflictError('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return { user };
};

/** Authenticates a user and returns a signed JWT. */
export const logIn = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '3d' });

  return { user, token };
};

/** Fetches the currently authenticated user by ID. */
export const getAuthenticatedUser = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};
