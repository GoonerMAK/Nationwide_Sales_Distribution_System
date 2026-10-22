import { describe, expect, it } from '@jest/globals';
import { changedFields, hasChanges } from '../../src/utils/changed-fields.js';

describe('changedFields', () => {
  const existing = { name: 'North', region_id: 'r1', phone: null };

  it('keeps only values that differ from the stored row', () => {
    expect(changedFields(existing, { name: 'North', region_id: 'r2' })).toEqual({
      region_id: 'r2',
    });
  });

  it('ignores undefined updates', () => {
    expect(changedFields(existing, { name: undefined })).toEqual({});
  });

  it('treats setting a null column to a value as a change', () => {
    expect(changedFields(existing, { phone: '555' })).toEqual({ phone: '555' });
  });
});

describe('hasChanges', () => {
  it('reports whether any field changed', () => {
    expect(hasChanges({})).toBe(false);
    expect(hasChanges({ name: 'x' })).toBe(true);
  });
});
