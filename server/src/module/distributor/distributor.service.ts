import prisma from '../../prisma.js';
import { paginate } from '../../utils/pagination.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const createDistributor = async (name: string) => {
  const existingDistributor = await prisma.distributor.findUnique({
    where: { name },
  });

  if (existingDistributor) {
    throw new ConflictError('Distributor name already exists');
  }

  return await prisma.distributor.create({
    data: { name },
  });
};

export const updateDistributor = async (id: string, updates: { name?: string }) => {
  const existingDistributor = await prisma.distributor.findUnique({
    where: { id },
  });

  if (!existingDistributor) {
    throw new NotFoundError('Distributor');
  }

  if (updates.name) {
    const nameExists = await prisma.distributor.findFirst({
      where: {
        name: updates.name,
        NOT: { id },
      },
    });

    if (nameExists) {
      throw new ConflictError(`Distributor name "${updates.name}" is already in use`);
    }
  }

  return await prisma.distributor.update({
    where: { id },
    data: updates,
  });
};

export const deleteDistributor = async (id: string) => {
  const distributor = await prisma.distributor.findUnique({ where: { id } });
  if (!distributor) throw new NotFoundError('Distributor');

  return prisma.distributor.delete({ where: { id } });
};

export const getDistributors = async (
  offset: number,
  limit: number,
  filters?: { name?: string },
) => {
  const where: Prisma.DistributorWhereInput = {};

  if (filters?.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }

  const fetchPageRows = (take: number) =>
    prisma.distributor.findMany({
      where,
      skip: offset,
      take,
      orderBy: { id: 'asc' }, // PK index: stable pages, no extra sort
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });

  return paginate(offset, limit, fetchPageRows);
};

export const getDistributorById = async (id: string) => {
  const distributor = await prisma.distributor.findUnique({
    where: { id },
  });

  if (!distributor) {
    throw new NotFoundError('Distributor');
  }

  return distributor;
};
