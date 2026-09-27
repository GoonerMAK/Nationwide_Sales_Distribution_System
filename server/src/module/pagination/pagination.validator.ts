import { z } from 'zod';

/** Deep offsets make Postgres read and discard every skipped row. */
const MAX_OFFSET = 10_000;

/** Reusable pagination fields for query schemas. */
export const paginationSchema = z.object({
  offset: z
    .string()
    .default('0')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0 && val <= MAX_OFFSET, {
      message: `Offset must be between 0 and ${MAX_OFFSET}`,
    })
    .optional(),
  limit: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    })
    .optional(),
});

/**
 * Merges a filter schema with the standard pagination fields.
 * Usage: const myQuerySchema = withPagination(myFilterSchema);
 */
export function withPagination<T extends z.ZodRawShape>(filterSchema: z.ZodObject<T>) {
  return filterSchema.merge(paginationSchema);
}

export const paginationQuerySchema = paginationSchema;

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
