import { z } from 'zod';
import { withPagination } from '../pagination/pagination.validator.js';

export const regionParamsSchema = z.object({
  id: z.uuid({ message: 'Invalid ID format. Must be a UUID.' }),
});

export const createRegionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
});

export const updateRegionSchema = z.object({
  data: z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
  }),
});

const regionFilterSchema = z.object({
  name: z.string().optional(),
});

export const regionQuerySchema = withPagination(regionFilterSchema);

export type RegionParams = z.infer<typeof regionParamsSchema>;
export type RegionCreate = z.infer<typeof createRegionSchema>;
export type RegionUpdate = z.infer<typeof updateRegionSchema>;
export type RegionQuery = z.infer<typeof regionQuerySchema>;
