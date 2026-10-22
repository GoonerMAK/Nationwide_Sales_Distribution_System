import prisma from '../../prisma.js';
import { paginate } from '../../utils/pagination.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import { changedFields, hasChanges } from '../../utils/changed-fields.js';
import { orNotFound } from '../../utils/prisma-errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const createSalesRepresentative = async (
  user_id: string,
  username?: string,
  name?: string,
  phone?: string,
  region_id?: string,
  area_id?: string,
  territory_id?: string,
) => {
  const [userExists, existingSalesRep, usernameExists, regionExists, areaExists, territoryExists] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: user_id } }),
      prisma.salesRepresentative.findUnique({ where: { user_id } }),
      username ? prisma.salesRepresentative.findUnique({ where: { username } }) : null,
      region_id ? prisma.region.findUnique({ where: { id: region_id } }) : null,
      area_id ? prisma.area.findUnique({ where: { id: area_id } }) : null,
      territory_id ? prisma.territory.findUnique({ where: { id: territory_id } }) : null,
    ]);

  if (!userExists) throw new NotFoundError('User');
  if (existingSalesRep) {
    throw new ConflictError('Sales representative already exists for this user');
  }
  if (username && usernameExists) {
    throw new ConflictError('Username already exists');
  }
  if (region_id && !regionExists) throw new NotFoundError('Region');
  if (area_id && !areaExists) throw new NotFoundError('Area');
  if (territory_id && !territoryExists) throw new NotFoundError('Territory');

  return await prisma.salesRepresentative.create({
    data: {
      user_id,
      username,
      name,
      phone,
      region_id,
      area_id,
      territory_id,
    },
  });
};

export const updateSalesRepresentative = async (
  id: string,
  updates: {
    username?: string;
    name?: string;
    phone?: string;
    region_id?: string;
    area_id?: string;
    territory_id?: string;
  },
) => {
  const existingSalesRep = await prisma.salesRepresentative.findUnique({
    where: { id },
  });

  if (!existingSalesRep) {
    throw new NotFoundError('Sales representative');
  }

  const changes = changedFields(existingSalesRep, updates);

  if (!hasChanges(changes)) {
    return existingSalesRep;
  }

  const [usernameExists, regionExists, areaExists, territoryExists] = await Promise.all([
    changes.username
      ? prisma.salesRepresentative.findFirst({ where: { username: changes.username, NOT: { id } } })
      : null,
    changes.region_id ? prisma.region.findUnique({ where: { id: changes.region_id } }) : null,
    changes.area_id ? prisma.area.findUnique({ where: { id: changes.area_id } }) : null,
    changes.territory_id
      ? prisma.territory.findUnique({ where: { id: changes.territory_id } })
      : null,
  ]);

  if (changes.username && usernameExists) {
    throw new ConflictError(`Username "${changes.username}" is already in use`);
  }
  if (changes.region_id && !regionExists) throw new NotFoundError('Region');
  if (changes.area_id && !areaExists) throw new NotFoundError('Area');
  if (changes.territory_id && !territoryExists) throw new NotFoundError('Territory');

  return await prisma.salesRepresentative.update({
    where: { id },
    data: changes,
  });
};

export const deleteSalesRepresentative = async (id: string) =>
  orNotFound('Sales representative', () => prisma.salesRepresentative.delete({ where: { id } }));

export const getSalesRepresentatives = async (
  offset: number,
  limit: number,
  filters?: {
    username?: string;
    name?: string;
    phone?: string;
    region_id?: string;
    area_id?: string;
    territory_id?: string;
  },
) => {
  const where: Prisma.SalesRepresentativeWhereInput = {};

  if (filters?.username) {
    where.username = { contains: filters.username, mode: 'insensitive' };
  }
  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters?.phone) {
    where.phone = { contains: filters.phone };
  }
  if (filters?.region_id) {
    where.region_id = filters.region_id;
  }
  if (filters?.area_id) {
    where.area_id = filters.area_id;
  }
  if (filters?.territory_id) {
    where.territory_id = filters.territory_id;
  }

  const fetchPageRows = (take: number) =>
    prisma.salesRepresentative.findMany({
      where,
      skip: offset,
      take,
      orderBy: { id: 'asc' }, // PK index: stable pages, no extra sort
      select: {
        id: true,
        user_id: true,
        username: true,
        name: true,
        phone: true,
        region_id: true,
        area_id: true,
        territory_id: true,
        created_at: true,
        updated_at: true,
      },
    });

  return paginate(offset, limit, fetchPageRows);
};

export const getSalesRepresentativeById = async (id: string) => {
  const salesRep = await prisma.salesRepresentative.findUnique({
    where: { id },
  });

  if (!salesRep) {
    throw new NotFoundError('Sales representative');
  }

  return salesRep;
};
