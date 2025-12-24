import { z } from "zod";

export const userParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createUserSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    email: z.email({ message: "Invalid email address" }),
});

export const updateUserSchema = z.object({
    id: z.uuid({ message: "Invalid user ID" }).optional(),
    data: z.object({
        password: z.string().optional(),
        email: z.email({ message: "Invalid email address" }).optional(),
    }),
});


export type UserParams = z.infer<typeof userParamsSchema>
export type UserCreate = z.infer<typeof createUserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>