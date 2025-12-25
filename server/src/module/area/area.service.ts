import prisma from '../../prisma.js';

export const createArea = async (name: string, region_id: string) => {
    const regionExists = await prisma.region.findUnique({
        where: { id: region_id },
    });

    if (!regionExists) {
        throw new Error('Region not found');
    }

    const existingArea = await prisma.area.findUnique({
        where: {
            name_region_id: {
                name,
                region_id,
            },
        },
    });
    
    if (existingArea) {
        throw new Error('Area name already exists in this region');
    }

    return await prisma.area.create({
        data: {
            name,
            region_id,
        },
    });
};

export const updateArea = async (
    id: string,
    updates: {
        name?: string;
        region_id?: string;
    }
) => {
    const existingArea = await prisma.area.findUnique({
        where: { id },
    });

    if (!existingArea) {
        throw new Error(`Area with id ${id} not found`);
    }

    if (updates.region_id) {
        const regionExists = await prisma.region.findUnique({
            where: { id: updates.region_id },
        });

        if (!regionExists) {
            throw new Error('Region not found');
        }
    }

    const updatedName = updates.name ?? existingArea.name;
    const updatedRegionId = updates.region_id ?? existingArea.region_id;

    if (updates.name || updates.region_id) {
        const nameExists = await prisma.area.findFirst({
            where: {
                name: updatedName,
                region_id: updatedRegionId,
                NOT: { id },
            },
        });

        if (nameExists) {
            throw new Error(`Area name "${updatedName}" already exists in this region`);
        }
    }

    return await prisma.area.update({
        where: { id },
        data: updates,
    });
};

export const deleteArea = async (id: string) => {
    const area = await prisma.area.findUnique({ where: { id } });
    if (!area) throw new Error('Area not found');

    return prisma.area.delete({ where: { id } });
};

export const getAreas = async (
    offset: number,
    limit: number,
    filters?: {
        name?: string;
        region_id?: string;
    }
) => {
    const where: any = {};
    
    if (filters?.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters?.region_id) {
        where.region_id = filters.region_id;
    }

    const [areas, totalCount] = await prisma.$transaction([
        prisma.area.findMany({
            where,
            skip: offset,
            take: limit,
            select: {
                id: true,
                name: true,
                region_id: true,
                created_at: true,
                updated_at: true,
            },
        }),
        prisma.area.count({ where }),
    ]);

    return {
        data: areas,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getAreaById = async (id: string) => {
    const area = await prisma.area.findUnique({
        where: { id },
    });

    if (!area) {
        throw new Error(`Area with id ${id} not found`);
    }
    
    return area;
};