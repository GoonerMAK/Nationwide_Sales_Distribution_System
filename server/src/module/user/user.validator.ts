import { z } from 'zod';

export const USER_ROLES = ['user', 'admin'] as const;

// Better Auth rejects passwords over 128 characters, so fail early with a clear message.
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(128, { message: 'Password must be at most 128 characters long' });

export const userParamsSchema = z.object({
  id: z.uuid({ message: 'Invalid ID format. Must be a UUID.' }),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }),
  email: z.email({ message: 'Invalid email address' }),
  password: passwordSchema,
  role: z.enum(USER_ROLES).optional(),
});

export const updateUserSchema = z.object({
  data: z
    .object({
      name: z.string().trim().min(1, { message: 'Name cannot be empty' }).optional(),
      email: z.email({ message: 'Invalid email address' }).optional(),
      password: passwordSchema.optional(),
      role: z.enum(USER_ROLES).optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: "At least one of 'name', 'email', 'password' or 'role' must be provided",
    }),
});

export type UserParams = z.infer<typeof userParamsSchema>;
export type UserCreate = z.infer<typeof createUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;
