import { NotFoundError } from './errors.js';

const RECORD_NOT_FOUND = 'P2025';

/** Runs a Prisma write that targets one row and turns "record not found" into a 404 for that resource. */
export async function orNotFound<T>(resource: string, query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if ((error as { code?: string }).code === RECORD_NOT_FOUND) {
      throw new NotFoundError(resource);
    }
    throw error;
  }
}
