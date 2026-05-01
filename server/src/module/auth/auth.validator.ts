import { z } from 'zod';

/** Schema for login request body. */
export const authLoginSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

/** Schema for signup request body. */
export const authSignUpSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' }),
});

export type AuthLogin = z.infer<typeof authLoginSchema>;
export type AuthSignup = z.infer<typeof authSignUpSchema>;
