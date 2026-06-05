import prisma from '../../prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

/** Creates a new territory within an area. Validates area exists and name is unique within area. */
export const createTerritory = async (name: string, area_id: string) => {
  const areaExists = await prisma.area.findUnique({ where: { id: area_id } });

  if (!areaExists) {
    throw new NotFoundError('Area');
  }

  const existingTerritory = await prisma.territory.findUnique({
    where: { name_area_id: { name, area_id } },
  });

  if (existingTerritory) {
    throw new ConflictError('Territory name already exists in this area');
  }

  return prisma.territory.create({ data: { name, area_id } });
};

/** Updates a territory by ID. Validates area exists and name uniqueness within area. */
export const updateTerritory = async (
  id: string,
  updates: { name?: string; area_id?: string },
) => {
  const existing = await prisma.territory.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Territory');
  }

  if (updates.area_id) {
    const areaExists = await prisma.area.findUnique({ where: { id: updates.area_id } });

    if (!areaExists) {
      throw new NotFoundError('Area');
    }
  }

  const updatedName = updates.name ?? existing.name;
  const updatedAreaId = updates.area_id ?? existing.area_id;

  if (updates.name || updates.area_id) {
    const nameExists = await prisma.territory.findFirst({
      where: { name: updatedName, area_id: updatedAreaId, NOT: { id } },
    });

    if (nameExists) {
      throw new ConflictError(`Territory name "${updatedName}" already exists in this area`);
    }
  }

  return prisma.territory.update({ where: { id }, data: updates });
};

/** Deletes a territory by ID. */
export const deleteTerritory = async (id: string) => {
  const territory = await prisma.territory.findUnique({ where: { id } });

  if (!territory) {
    throw new NotFoundError('Territory');
  }

  return prisma.territory.delete({ where: { id } });
};

/** Fetches paginated territories with optional name and area_id filters. */
export const getTerritories = async (
  offset: number,
  limit: number,
  filters?: { name?: string; area_id?: string },
) => {
  const where: Prisma.TerritoryWhereInput = {};

  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters?.area_id) {
    where.area_id = filters.area_id;
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.territory.findMany({
      where,
      skip: offset,
      take: limit,
      select: { id: true, name: true, area_id: true, created_at: true, updated_at: true },
    }),
    prisma.territory.count({ where }),
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

/** Fetches a single territory by ID. */
export const getTerritoryById = async (id: string) => {
  const territory = await prisma.territory.findUnique({ where: { id } });

  if (!territory) {
    throw new NotFoundError('Territory');
  }

  return territory;
};
