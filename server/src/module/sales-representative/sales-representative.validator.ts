import { z } from "zod";

export const salesRepresentativeParamsSchema = z.object({
    id: z.uuid({ message: "Invalid ID format. Must be a UUID." })
});

export const createSalesRepresentativeSchema = z.object({
    user_id: z.uuid({ message: "Invalid user ID format" }),
    username: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
    area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
    territory_id: z.uuid({ message: "Invalid territory ID format" }).optional(),
});

export const updateSalesRepresentativeSchema = z.object({
    data: z.object({
        username: z.string().optional(),
        name: z.string().optional(),
        phone: z.string().optional(),
        region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
        area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
        territory_id: z.uuid({ message: "Invalid territory ID format" }).optional(),
    }),
});

export const salesRepresentativeQuerySchema = z.object({
    username: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    region_id: z.uuid({ message: "Invalid region ID format" }).optional(),
    area_id: z.uuid({ message: "Invalid area ID format" }).optional(),
    territory_id: z.uuid({ message: "Invalid territory ID format" }).optional(),
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

export type SalesRepresentativeParams = z.infer<typeof salesRepresentativeParamsSchema>;
export type SalesRepresentativeCreate = z.infer<typeof createSalesRepresentativeSchema>;
export type SalesRepresentativeUpdate = z.infer<typeof updateSalesRepresentativeSchema>;
export type SalesRepresentativeQuery = z.infer<typeof salesRepresentativeQuerySchema>;