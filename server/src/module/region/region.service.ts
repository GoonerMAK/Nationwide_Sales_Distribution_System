import prisma from '../../prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

/** Creates a new region with a unique name. */
export const createRegion = async (name: string) => {
  const existing = await prisma.region.findUnique({ where: { name } });

  if (existing) {
    throw new ConflictError('Region name already exists');
  }

  return prisma.region.create({ data: { name } });
};

/** Updates a region by ID. Validates name uniqueness if changed. */
export const updateRegion = async (id: string, updates: { name?: string }) => {
  const existing = await prisma.region.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Region');
  }

  if (updates.name) {
    const nameExists = await prisma.region.findFirst({
      where: { name: updates.name, NOT: { id } },
    });

    if (nameExists) {
      throw new ConflictError(`Region name "${updates.name}" is already in use`);
    }
  }

  return prisma.region.update({ where: { id }, data: updates });
};

/** Deletes a region by ID. */
export const deleteRegion = async (id: string) => {
  const region = await prisma.region.findUnique({ where: { id } });

  if (!region) {
    throw new NotFoundError('Region');
  }

  return prisma.region.delete({ where: { id } });
};

/** Fetches paginated regions with optional name filter. */
export const getRegions = async (
  offset: number,
  limit: number,
  filters?: { name?: string },
) => {
  const where: Prisma.RegionWhereInput = {};

  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.region.findMany({
      where,
      skip: offset,
      take: limit,
      select: { id: true, name: true, created_at: true, updated_at: true },
    }),
    prisma.region.count({ where }),
  ]);

  return {
    data,
    pagination: {
      offset,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasMore: offset + limit < totalItems,
    },
  };
};

/** Fetches a single region by ID. */
export const getRegionById = async (id: string) => {
  const region = await prisma.region.findUnique({ where: { id } });

  if (!region) {
    throw new NotFoundError('Region');
  }

  return region;
};
