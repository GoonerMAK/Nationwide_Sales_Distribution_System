import prisma from '../../prisma.js';
import { auth } from '../../auth.js';
import { paginate } from '../../utils/pagination.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { UserCreate } from './user.validator.js';

/** Better Auth stores email+password logins as an Account row with this provider id. */
const CREDENTIAL_PROVIDER_ID = 'credential';

/**
 * Creates a user with a credential account through Better Auth, so the password is hashed
 * with the same algorithm Better Auth verifies at sign-in.
 * Called without request headers: the route is already restricted to admins by requireRole.
 */
export const createUser = async ({ name, email, password, role }: UserCreate) => {
  const normalizedEmail = email.toLowerCase();
  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingEmail) {
    throw new ConflictError('Email already exists');
  }

  const { user } = await auth.api.createUser({
    body: { name, email: normalizedEmail, password, role: role ?? 'user' },
  });

  return user;
};

export const updateUser = async (
  id: string,
  updates: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  },
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new NotFoundError('User');
  }

  const { password, ...profile } = updates;
  if (profile.email) {
    profile.email = profile.email.toLowerCase();

    // Checking if the new email is already in use by another user
    const emailExists = await prisma.user.findFirst({
      where: {
        email: profile.email,
        NOT: { id },
      },
    });

    if (emailExists) {
      throw new ConflictError(`Email "${profile.email}" is already in use`);
    }
  }

  const passwordHash = password ? await (await auth.$context).password.hash(password) : undefined;

  return prisma.$transaction(async (tx) => {
    if (passwordHash) {
      const credential = await tx.account.findFirst({
        where: { user_id: id, provider_id: CREDENTIAL_PROVIDER_ID },
      });

      // Users migrated from the old JWT auth have no credential account yet.
      if (credential) {
        await tx.account.update({ where: { id: credential.id }, data: { password: passwordHash } });
      } else {
        await tx.account.create({
          data: {
            user_id: id,
            account_id: id,
            provider_id: CREDENTIAL_PROVIDER_ID,
            password: passwordHash,
          },
        });
      }

      // A password change signs the user out everywhere.
      await tx.session.deleteMany({ where: { user_id: id } });
    }

    return tx.user.update({
      where: { id },
      data: profile,
    });
  });
};

export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  // Sessions and accounts are removed by the ON DELETE CASCADE foreign keys.
  return prisma.user.delete({ where: { id } });
};

export const getAllUsers = async (offset: number, limit: number) => {
  const fetchPageRows = (take: number) =>
    prisma.user.findMany({
      skip: offset,
      take,
      orderBy: { id: 'asc' }, // PK index: stable pages, no extra sort
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

  return paginate(offset, limit, fetchPageRows);
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
};

export const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};
