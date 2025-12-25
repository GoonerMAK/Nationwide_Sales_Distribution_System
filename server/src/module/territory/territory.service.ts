import prisma from '../../prisma.js';

export const createTerritory = async (name: string, area_id: string) => {
    const areaExists = await prisma.area.findUnique({
        where: { id: area_id },
    });

    if (!areaExists) {
        throw new Error('Area not found');
    }

    const existingTerritory = await prisma.territory.findUnique({
        where: {
            name_area_id: {
                name,
                area_id,
            },
        },
    });
    
    if (existingTerritory) {
        throw new Error('Territory name already exists in this area');
    }

    return await prisma.territory.create({
        data: {
            name,
            area_id,
        },
    });
};

export const updateTerritory = async (
    id: string,
    updates: {
        name?: string;
        area_id?: string;
    }
) => {
    const existingTerritory = await prisma.territory.findUnique({
        where: { id },
    });

    if (!existingTerritory) {
        throw new Error(`Territory with id ${id} not found`);
    }

    if (updates.area_id) {
        const areaExists = await prisma.area.findUnique({
            where: { id: updates.area_id },
        });

        if (!areaExists) {
            throw new Error('Area not found');
        }
    }

    const updatedName = updates.name ?? existingTerritory.name;
    const updatedAreaId = updates.area_id ?? existingTerritory.area_id;

    if (updates.name || updates.area_id) {
        const nameExists = await prisma.territory.findFirst({
            where: {
                name: updatedName,
                area_id: updatedAreaId,
                NOT: { id },
            },
        });

        if (nameExists) {
            throw new Error(`Territory name "${updatedName}" already exists in this area`);
        }
    }

    return await prisma.territory.update({
        where: { id },
        data: updates,
    });
};

export const deleteTerritory = async (id: string) => {
    const territory = await prisma.territory.findUnique({ where: { id } });
    if (!territory) throw new Error('Territory not found');

    return prisma.territory.delete({ where: { id } });
};

export const getTerritories = async (
    offset: number,
    limit: number,
    filters?: {
        name?: string;
        area_id?: string;
    }
) => {
    const where: any = {};
    
    if (filters?.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters?.area_id) {
        where.area_id = filters.area_id;
    }

    const [territories, totalCount] = await prisma.$transaction([
        prisma.territory.findMany({
            where,
            skip: offset,
            take: limit,
            select: {
                id: true,
                name: true,
                area_id: true,
                created_at: true,
                updated_at: true,
            },
        }),
        prisma.territory.count({ where }),
    ]);

    return {
        data: territories,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getTerritoryById = async (id: string) => {
    const territory = await prisma.territory.findUnique({
        where: { id },
    });

    if (!territory) {
        throw new Error(`Territory with id ${id} not found`);
    }
    
    return territory;
};