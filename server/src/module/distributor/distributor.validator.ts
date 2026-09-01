import { z } from "zod";
import { withPagination } from '../pagination/pagination.validator.js';

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

const distributorFilterSchema = z.object({
    name: z.string().optional(),
});

export const distributorQuerySchema = withPagination(distributorFilterSchema);

export type DistributorParams = z.infer<typeof distributorParamsSchema>;
export type DistributorCreate = z.infer<typeof createDistributorSchema>;
export type DistributorUpdate = z.infer<typeof updateDistributorSchema>;
export type DistributorQuery = z.infer<typeof distributorQuerySchema>;