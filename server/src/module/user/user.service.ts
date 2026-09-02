import prisma from '../../prisma.js';
import bcrypt from 'bcrypt';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

const SALT_ROUNDS = 10;


export const createUser = async (
    password: string,
    email: string,
) => {
    const existingEmail = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingEmail) { throw new ConflictError('Email already exists'); }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await prisma.user.create({
        data: {
            password: hashedPassword,
            email,
        },
        omit: { password: true },
    });
};


export const updateUser = async (
    id: string,
    updates: {
        password?: string,
        email?: string,
    }
) => {    
    const existingUser = await prisma.user.findUnique({
        where: { id },
    });

    if (!existingUser) {
        throw new NotFoundError('User');
    }

    // Checking if the new email is already in use by another user
    if (updates.email) {
        const emailExists = await prisma.user.findFirst({
            where: {
                email: updates.email,
                NOT: { id },
            },
        });

        if (emailExists) {
            throw new ConflictError(`Email "${updates.email}" is already in use`);
        }
    }

    if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    return await prisma.user.update({
        where: { id },
        data: updates,
        omit: { password: true },
    });
};


export const deleteUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    return prisma.user.delete({ where: { id }, omit: { password: true } });
};


export const getAllUsers = async (offset: number, limit: number) => {
    const [users, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
        },
      }),
      prisma.user.count(),
    ]);

    const paginatedUsers = {
        data: users,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };

    return paginatedUsers;
};


export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
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
}
