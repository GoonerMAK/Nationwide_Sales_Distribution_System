import prisma from '../../prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

/** Creates a new area within a region. Validates region exists and name is unique within region. */
export const createArea = async (name: string, region_id: string) => {
  const regionExists = await prisma.region.findUnique({ where: { id: region_id } });

  if (!regionExists) {
    throw new NotFoundError('Region');
  }

  const existingArea = await prisma.area.findUnique({
    where: { name_region_id: { name, region_id } },
  });

  if (existingArea) {
    throw new ConflictError('Area name already exists in this region');
  }

  return prisma.area.create({ data: { name, region_id } });
};

/** Updates an area by ID. Validates region exists and name uniqueness within region. */
export const updateArea = async (
  id: string,
  updates: { name?: string; region_id?: string },
) => {
  const existing = await prisma.area.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Area');
  }

  if (updates.region_id) {
    const regionExists = await prisma.region.findUnique({ where: { id: updates.region_id } });

    if (!regionExists) {
      throw new NotFoundError('Region');
    }
  }

  const updatedName = updates.name ?? existing.name;
  const updatedRegionId = updates.region_id ?? existing.region_id;

  if (updates.name || updates.region_id) {
    const nameExists = await prisma.area.findFirst({
      where: { name: updatedName, region_id: updatedRegionId, NOT: { id } },
    });

    if (nameExists) {
      throw new ConflictError(`Area name "${updatedName}" already exists in this region`);
    }
  }

  return prisma.area.update({ where: { id }, data: updates });
};

/** Deletes an area by ID. */
export const deleteArea = async (id: string) => {
  const area = await prisma.area.findUnique({ where: { id } });

  if (!area) {
    throw new NotFoundError('Area');
  }

  return prisma.area.delete({ where: { id } });
};

/** Fetches paginated areas with optional name and region_id filters. */
export const getAreas = async (
  offset: number,
  limit: number,
  filters?: { name?: string; region_id?: string },
) => {
  const where: Prisma.AreaWhereInput = {};

  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters?.region_id) {
    where.region_id = filters.region_id;
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.area.findMany({
      where,
      skip: offset,
      take: limit,
      select: { id: true, name: true, region_id: true, created_at: true, updated_at: true },
    }),
    prisma.area.count({ where }),
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

/** Fetches a single area by ID. */
export const getAreaById = async (id: string) => {
  const area = await prisma.area.findUnique({ where: { id } });

  if (!area) {
    throw new NotFoundError('Area');
  }

  return area;
};
