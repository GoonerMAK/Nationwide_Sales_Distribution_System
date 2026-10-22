import prisma from '../../prisma.js';
import { paginate } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';
import { changedFields, hasChanges } from '../../utils/changed-fields.js';
import { orNotFound } from '../../utils/prisma-errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const createRetailer = async (
  name: string,
  region_id: string,
  area_id: string,
  distributor_id: string,
  territory_id: string,
  points?: number,
  phone?: string,
  sales_representative_id?: string,
  routes?: string,
) => {
  const [regionExists, areaExists, distributorExists, territoryExists, salesRepExists] =
    await Promise.all([
      prisma.region.findUnique({ where: { id: region_id } }),
      prisma.area.findUnique({ where: { id: area_id } }),
      prisma.distributor.findUnique({ where: { id: distributor_id } }),
      prisma.territory.findUnique({ where: { id: territory_id } }),
      sales_representative_id
        ? prisma.salesRepresentative.findUnique({ where: { id: sales_representative_id } })
        : null,
    ]);

  if (!regionExists) throw new NotFoundError('Region');
  if (!areaExists) throw new NotFoundError('Area');
  if (!distributorExists) throw new NotFoundError('Distributor');
  if (!territoryExists) throw new NotFoundError('Territory');
  if (sales_representative_id && !salesRepExists) throw new NotFoundError('Sales representative');

  return await prisma.retailer.create({
    data: {
      name,
      phone,
      region_id,
      area_id,
      distributor_id,
      territory_id,
      sales_representative_id,
      points,
      routes,
    },
  });
};

export const updateRetailer = async (
  id: string,
  updates: {
    name?: string;
    phone?: string;
    region_id?: string;
    area_id?: string;
    distributor_id?: string;
    territory_id?: string;
    sales_representative_id?: string;
    points?: number;
    routes?: string;
  },
) => {
  const existingRetailer = await prisma.retailer.findUnique({
    where: { id },
  });

  if (!existingRetailer) {
    throw new NotFoundError('Retailer');
  }

  const changes = changedFields(existingRetailer, updates);

  if (!hasChanges(changes)) {
    return existingRetailer;
  }

  const [regionExists, areaExists, distributorExists, territoryExists, salesRepExists] =
    await Promise.all([
      changes.region_id ? prisma.region.findUnique({ where: { id: changes.region_id } }) : null,
      changes.area_id ? prisma.area.findUnique({ where: { id: changes.area_id } }) : null,
      changes.distributor_id
        ? prisma.distributor.findUnique({ where: { id: changes.distributor_id } })
        : null,
      changes.territory_id
        ? prisma.territory.findUnique({ where: { id: changes.territory_id } })
        : null,
      changes.sales_representative_id
        ? prisma.salesRepresentative.findUnique({ where: { id: changes.sales_representative_id } })
        : null,
    ]);

  if (changes.region_id && !regionExists) throw new NotFoundError('Region');
  if (changes.area_id && !areaExists) throw new NotFoundError('Area');
  if (changes.distributor_id && !distributorExists) throw new NotFoundError('Distributor');
  if (changes.territory_id && !territoryExists) throw new NotFoundError('Territory');
  if (changes.sales_representative_id && !salesRepExists)
    throw new NotFoundError('Sales representative');

  return await prisma.retailer.update({
    where: { id },
    data: changes,
  });
};

export const deleteRetailer = async (id: string) =>
  orNotFound('Retailer', () => prisma.retailer.delete({ where: { id } }));

export const getRetailers = async (
  offset: number,
  limit: number,
  filters?: {
    name?: string;
    phone?: string;
    region_id?: string;
    area_id?: string;
    distributor_id?: string;
    territory_id?: string;
    sales_representative_id?: string;
    assigned?: boolean;
  },
) => {
  const where: Prisma.RetailerWhereInput = {};

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
  if (filters?.distributor_id) {
    where.distributor_id = filters.distributor_id;
  }
  if (filters?.territory_id) {
    where.territory_id = filters.territory_id;
  }
  if (filters?.sales_representative_id) {
    where.sales_representative_id = filters.sales_representative_id;
  } else if (filters?.assigned === true) {
    where.NOT = { sales_representative_id: null };
  } else if (filters?.assigned === false) {
    where.sales_representative_id = null;
  }

  const fetchPageRows = (take: number) =>
    prisma.retailer.findMany({
      where,
      skip: offset,
      take,
      orderBy: { id: 'asc' }, // PK index: stable pages, no extra sort
      select: {
        id: true,
        name: true,
        phone: true,
        region_id: true,
        area_id: true,
        distributor_id: true,
        territory_id: true,
        sales_representative_id: true,
        points: true,
        routes: true,
        created_at: true,
        updated_at: true,
      },
    });

  return paginate(offset, limit, fetchPageRows);
};

export const getRetailerById = async (id: string) => {
  const retailer = await prisma.retailer.findUnique({
    where: { id },
  });

  if (!retailer) {
    throw new NotFoundError('Retailer');
  }

  return retailer;
};
