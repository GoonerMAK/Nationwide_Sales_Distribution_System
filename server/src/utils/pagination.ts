import type { PaginationMeta } from '../types/common.js';

/** Fetches one extra row to detect a next page, so no COUNT(*) is needed, e.g. limit 10, 11 rows → hasMore. */
export async function paginate<Row>(
  offset: number,
  limit: number,
  fetchRows: (take: number) => Promise<Row[]>,
): Promise<{ data: Row[]; pagination: PaginationMeta }> {
  const rows = await fetchRows(limit + 1);
  const hasMore = rows.length > limit;

  return {
    data: hasMore ? rows.slice(0, limit) : rows,
    pagination: { offset, limit, hasMore },
  };
}
