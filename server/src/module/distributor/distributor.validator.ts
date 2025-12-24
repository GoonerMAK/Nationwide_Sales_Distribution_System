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

export type DistributorParams = z.infer<typeof distributorParamsSchema>;
export type DistributorCreate = z.infer<typeof createDistributorSchema>;
export type DistributorUpdate = z.infer<typeof updateDistributorSchema>;