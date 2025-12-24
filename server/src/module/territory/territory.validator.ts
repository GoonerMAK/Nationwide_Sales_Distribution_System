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

export type TerritoryParams = z.infer<typeof territoryParamsSchema>;
export type TerritoryCreate = z.infer<typeof createTerritorySchema>;
export type TerritoryUpdate = z.infer<typeof updateTerritorySchema>;