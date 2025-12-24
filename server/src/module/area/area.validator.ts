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

export type AreaParams = z.infer<typeof areaParamsSchema>;
export type AreaCreate = z.infer<typeof createAreaSchema>;
export type AreaUpdate = z.infer<typeof updateAreaSchema>;