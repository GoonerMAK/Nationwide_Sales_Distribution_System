import type { Request, Response } from 'express';
import * as authService from './auth.service.js';
import type { AuthLogin, AuthSignup } from './auth.validator.js';


export const signUp = async (
    req: Request<unknown, unknown, AuthSignup, unknown>,
    res: Response
) => {
    const { email, password } = req.body;

    try {
        const result = await authService.signUp(email, password);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message  || 'Failed to sign up' });
    }
};

export const logIn = async (
    req: Request<unknown, unknown, AuthLogin, unknown>,
    res: Response
) => {
    const { email, password } = req.body;

    try {
        const { user, token } = await authService.logIn(email, password);

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({ user, token });
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to log in' });
    }
};


export const getAuthenticatedUser = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await authService.getAuthenticatedUser(req.user.id);
        res.status(200).json({ user });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch user' });
    }
};


export const logOut = async (
    _req: Request,
    res: Response
) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};