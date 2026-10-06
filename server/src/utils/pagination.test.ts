import { describe, expect, it, jest } from '@jest/globals';
import { paginate } from './pagination.js';

describe('paginate', () => {
  it('requests one extra row to detect the next page', async () => {
    const fetchRows = jest.fn((take: number) =>
      Promise.resolve(Array.from({ length: take }, (_, i) => i)),
    );

    const result = await paginate(0, 10, fetchRows);

    expect(fetchRows).toHaveBeenCalledWith(11);
    expect(result.data).toHaveLength(10);
    expect(result.pagination).toEqual({ offset: 0, limit: 10, hasMore: true });
  });

  it('reports no more pages when fewer rows than the limit come back', async () => {
    const result = await paginate(20, 10, () => Promise.resolve([1, 2, 3]));

    expect(result.data).toEqual([1, 2, 3]);
    expect(result.pagination).toEqual({ offset: 20, limit: 10, hasMore: false });
  });
});
