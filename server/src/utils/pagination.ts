import type { PaginationMeta } from '../types/common.js';

/** Pagination metadata, e.g. `(10, 10, 25)` → `{ totalPages: 3, hasMore: true, ... }`. */
export function buildPagination(offset: number, limit: number, totalItems: number): PaginationMeta {
  return {
    offset,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    hasMore: offset + limit < totalItems,
  };
}

/** Fetches a page; skips COUNT(*) when a partial page reveals the total, e.g. offset 0, limit 10, 4 rows → 4. */
export async function paginate<Row>(
  offset: number,
  limit: number,
  fetchPageRows: () => Promise<Row[]>,
  countMatchingRows: () => Promise<number>,
): Promise<{ data: Row[]; pagination: PaginationMeta }> {
  const pageRows = await fetchPageRows();
  const isLastPage = pageRows.length < limit && (pageRows.length > 0 || offset === 0);
  const totalItems = isLastPage ? offset + pageRows.length : await countMatchingRows();

  return { data: pageRows, pagination: buildPagination(offset, limit, totalItems) };
}
