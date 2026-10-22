/** Returns only the updates whose value differs from the stored row, ignoring undefined, e.g. to skip no-op checks and writes. */
export function changedFields<T extends object>(existing: object, updates: T): Partial<T> {
  const current = existing as Record<string, unknown>;

  return Object.fromEntries(
    Object.entries(updates).filter(([key, value]) => value !== undefined && current[key] !== value),
  ) as Partial<T>;
}

/** True when `changedFields` found at least one difference. */
export function hasChanges(changes: object): boolean {
  return Object.keys(changes).length > 0;
}
