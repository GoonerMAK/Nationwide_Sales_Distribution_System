import prisma from '../../prisma.js';

export const createRegion = async (name: string) => {
    const existingRegion = await prisma.region.findUnique({
        where: { name },
    });
    
    if (existingRegion) {
        throw new Error('Region name already exists');
    }

    return await prisma.region.create({
        data: { name },
    });
};

export const updateRegion = async (
    id: string,
    updates: { name?: string }
) => {
    const existingRegion = await prisma.region.findUnique({
        where: { id },
    });

    if (!existingRegion) {
        throw new Error(`Region with id ${id} not found`);
    }

    if (updates.name) {
        const nameExists = await prisma.region.findFirst({
            where: {
                name: updates.name,
                NOT: { id },
            },
        });

        if (nameExists) {
            throw new Error(`Region name "${updates.name}" is already in use`);
        }
    }

    return await prisma.region.update({
        where: { id },
        data: updates,
    });
};

export const deleteRegion = async (id: string) => {
    const region = await prisma.region.findUnique({ where: { id } });
    if (!region) throw new Error('Region not found');

    return prisma.region.delete({ where: { id } });
};

export const getRegions = async (
    offset: number, 
    limit: number,
    filters?: { name?: string }
) => {
    const where: any = {};
    
    if (filters?.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
    }

    const [regions, totalCount] = await prisma.$transaction([
        prisma.region.findMany({
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
        prisma.region.count({ where }),
    ]);

    return {
        data: regions,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getRegionById = async (id: string) => {
    const region = await prisma.region.findUnique({
        where: { id },
    });

    if (!region) {
        throw new Error(`Region with id ${id} not found`);
    }
    
    return region;
};