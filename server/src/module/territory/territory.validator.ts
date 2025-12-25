import { z } from "zod";

export const territoryParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createTerritorySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    area_id: z.uuid({ message: "Invalid area ID format" }),
});

export const updateTerritorySchema = z.object({
    data: z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(),
        area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
    }),
});

export const territoryQuerySchema = z.object({
    name: z.string().optional(),
    area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
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

export type TerritoryParams = z.infer<typeof territoryParamsSchema>;
export type TerritoryCreate = z.infer<typeof createTerritorySchema>;
export type TerritoryUpdate = z.infer<typeof updateTerritorySchema>;
export type TerritoryQuery = z.infer<typeof territoryQuerySchema>;