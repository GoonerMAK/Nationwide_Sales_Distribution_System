import { z } from "zod";

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

export type RegionParams = z.infer<typeof regionParamsSchema>;
export type RegionCreate = z.infer<typeof createRegionSchema>;
export type RegionUpdate = z.infer<typeof updateRegionSchema>;