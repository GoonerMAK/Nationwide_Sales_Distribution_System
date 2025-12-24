import {z} from "zod";

export const authLoginSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
});

export const authSignUpSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z.string()
});


export type AuthLogin = z.infer<typeof authLoginSchema>
export type AuthSignup = z.infer<typeof authSignUpSchema>