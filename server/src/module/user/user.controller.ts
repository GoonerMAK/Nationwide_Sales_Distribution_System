import type { Request, Response } from 'express';
import * as userService from '../user/user.service.js';
import type { UserParams, UserCreate, UserUpdate } from '../user/user.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';


export const createUser = async (
    req: Request<unknown, unknown, UserCreate, unknown>,
    res: Response
) => {
    const { password, email } = req.body;
    
    try {
        const newUser = await userService.createUser(
            password,
            email
        );
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create user' });
    }
};


export const updateUser = async (
    req: Request<UserParams, unknown, UserUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedUser = await userService.updateUser(id, updates);
        res.status(200).json(updatedUser);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update user' });
        }
    }
};


export const deleteUser = async (
    req: Request<UserParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedUser = await userService.deleteUser(id);
        res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete user' });
        }
    }
};


export const getAllUsers = async (
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response
) => {
    try {
        const { offset, limit } = req.query;
        const users = await userService.getAllUsers(Number(offset), Number(limit));
        res.status(200).json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch users' });
    }
};


export const getUserById = async (
    req: Request<UserParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const user = await userService.getUserById(id);
        res.status(200).json(user);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch user' });
        }
    }
};
