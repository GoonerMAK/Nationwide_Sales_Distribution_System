import { z } from "zod";
import type { retailerQuerySchema } from "../retailer/retailer.validator.js";

export const regionParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createRegionSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
});

export const updateRegionSchema = z.object({
    data: z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(),
    }),
});

export const regionQuerySchema = z.object({
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
    
export type RegionParams = z.infer<typeof regionParamsSchema>;
export type RegionCreate = z.infer<typeof createRegionSchema>;
export type RegionUpdate = z.infer<typeof updateRegionSchema>;
export type RegionQuery = z.infer<typeof regionQuerySchema>;