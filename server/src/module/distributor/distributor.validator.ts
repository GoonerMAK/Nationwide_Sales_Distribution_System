import { z } from "zod";

export const distributorParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createDistributorSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export const updateDistributorSchema = z.object({
    data: z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(),
    }),
});

export const distributorQuerySchema = z.object({
    name: z.string().optional(),
    offset: z.string()
        .default('0')
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val >= 0, { message: "Offset must be a non-negative number" })
        .optional(),
    limit: z.string()
        .default('10')
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val > 0 && val <= 100, { 
            message: "Limit must be between 1 and 100" 
        })
        .optional(),
});

export type DistributorParams = z.infer<typeof distributorParamsSchema>;
export type DistributorCreate = z.infer<typeof createDistributorSchema>;
export type DistributorUpdate = z.infer<typeof updateDistributorSchema>;
export type DistributorQuery = z.infer<typeof distributorQuerySchema>;