import { z } from "zod";

export const areaParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createAreaSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    region_id: z.uuid({ message: "Invalid region ID format" }),
});

export const updateAreaSchema = z.object({
    data: z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(),
        region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
    }),
});

export const areaQuerySchema = z.object({
    name: z.string().optional(),
    region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
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

export type AreaParams = z.infer<typeof areaParamsSchema>;
export type AreaCreate = z.infer<typeof createAreaSchema>;
export type AreaUpdate = z.infer<typeof updateAreaSchema>;
export type AreaQuery = z.infer<typeof areaQuerySchema>;