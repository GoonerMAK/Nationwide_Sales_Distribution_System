import { z } from "zod";

export const retailerParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createRetailerSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    phone: z.string().optional(),
    region_id: z.uuid({ message: "Invalid region ID format" }),
    area_id: z.uuid({ message: "Invalid area ID format" }),
    distributor_id: z.uuid({ message: "Invalid distributor ID format" }),
    territory_id: z.uuid({ message: "Invalid territory ID format" }),
    sales_representative_id: z.uuid({ message: "Invalid sales representative ID format" }).optional(),
    points: z.number().int({ message: "Points must be an integer" }).optional(),
    routes: z.string().optional(),
});

export const updateRetailerSchema = z.object({
    data: z.object({
        name: z.string().min(1, { message: "Name is required" }).optional(),
        phone: z.string().optional(),
        region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
        area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
        distributor_id: z.uuid({ message: "Invalid distributor ID format" }).optional(),
        territory_id: z.uuid({ message: "Invalid territory ID format" }).optional(),
        sales_representative_id: z.uuid({ message: "Invalid sales representative ID format" }).optional(),
        points: z.number().int({ message: "Points must be an integer" }).optional(),
        routes: z.string().optional(),
    }),
});

export const retailerQuerySchema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
    area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
    distributor_id: z.uuid({ message: "Invalid distributor ID format" }).optional(),
    territory_id: z.uuid({ message: "Invalid territory ID format" }).optional(),
    sales_representative_id: z.uuid({ message: "Invalid sales representative ID format" }).optional(),
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

export type RetailerParams = z.infer<typeof retailerParamsSchema>;
export type RetailerCreate = z.infer<typeof createRetailerSchema>;
export type RetailerUpdate = z.infer<typeof updateRetailerSchema>;
export type RetailerQuery = z.infer<typeof retailerQuerySchema>;