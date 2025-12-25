import prisma from '../../prisma.js';

export const createDistributor = async (name: string) => {
    const existingDistributor = await prisma.distributor.findUnique({
        where: { name },
    });
    
    if (existingDistributor) {
        throw new Error('Distributor name already exists');
    }

    return await prisma.distributor.create({
        data: { name },
    });
};

export const updateDistributor = async (
    id: string,
    updates: { name?: string }
) => {
    const existingDistributor = await prisma.distributor.findUnique({
        where: { id },
    });

    if (!existingDistributor) {
        throw new Error(`Distributor with id ${id} not found`);
    }

    if (updates.name) {
        const nameExists = await prisma.distributor.findFirst({
            where: {
                name: updates.name,
                NOT: { id },
            },
        });

        if (nameExists) {
            throw new Error(`Distributor name "${updates.name}" is already in use`);
        }
    }

    return await prisma.distributor.update({
        where: { id },
        data: updates,
    });
};

export const deleteDistributor = async (id: string) => {
    const distributor = await prisma.distributor.findUnique({ where: { id } });
    if (!distributor) throw new Error('Distributor not found');

    return prisma.distributor.delete({ where: { id } });
};

export const getDistributors = async (
    offset: number,
    limit: number,
    filters?: { name?: string }
) => {
    const where: any = {};
    
    if (filters?.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
    }

    const [distributors, totalCount] = await prisma.$transaction([
        prisma.distributor.findMany({
            where,
            skip: offset,
            take: limit,
            select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
            },
        }),
        prisma.distributor.count({ where }),
    ]);

    return {
        data: distributors,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getDistributorById = async (id: string) => {
    const distributor = await prisma.distributor.findUnique({
        where: { id },
    });

    if (!distributor) {
        throw new Error(`Distributor with id ${id} not found`);
    }
    
    return distributor;
};