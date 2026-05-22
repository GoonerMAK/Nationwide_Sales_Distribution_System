import { z } from 'zod';
import { withPagination } from '../pagination/pagination.validator.js';

export const areaParamsSchema = z.object({
  id: z.uuid({ message: 'Invalid ID format. Must be a UUID.' }),
});

export const createAreaSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  region_id: z.uuid({ message: 'Invalid region ID format' }),
});

export const updateAreaSchema = z.object({
  data: z.object({
    name: z.string().min(1, { message: 'Name is required' }).optional(),
    region_id: z.uuid({ message: 'Invalid region ID format' }).optional(),
  }),
});

const areaFilterSchema = z.object({
  name: z.string().optional(),
  region_id: z.uuid({ message: 'Invalid region ID format' }).optional(),
});

export const areaQuerySchema = withPagination(areaFilterSchema);

export type AreaParams = z.infer<typeof areaParamsSchema>;
export type AreaCreate = z.infer<typeof createAreaSchema>;
export type AreaUpdate = z.infer<typeof updateAreaSchema>;
export type AreaQuery = z.infer<typeof areaQuerySchema>;
