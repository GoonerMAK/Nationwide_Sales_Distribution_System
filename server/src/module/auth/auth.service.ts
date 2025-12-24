import prisma from '../../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;

export const signUp = async (
    email: string,
    password: string,
) => {
    const existingEmail = await prisma.user.findUnique({
        where: { email },
    });

    if (existingEmail) {
        throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        },
    });

    return { user };
};


export const logIn = async (
    email: string,
    password: string,
) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Email doesn't exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Wrong password');
    }

    const token = jwt.sign(
        { id: user.id },
        process.env.SECRET!,
        { expiresIn: '3d' }
    );

    return { user, token };
};


export const getAuthenticatedUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};