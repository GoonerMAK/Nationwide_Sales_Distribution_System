import prisma from '../../prisma.js';

export const createSalesRepresentative = async (
    user_id: string,
    username?: string,
    name?: string,
    phone?: string,
    region_id?: string,
    area_id?: string,
    territory_id?: string
) => {
    const userExists = await prisma.user.findUnique({
        where: { id: user_id },
    });
    if (!userExists) throw new Error('User not found');

    const existingSalesRep = await prisma.salesRepresentative.findUnique({
        where: { user_id },
    });
    if (existingSalesRep) {
        throw new Error('Sales representative already exists for this user');
    }

    if (username) {
        const usernameExists = await prisma.salesRepresentative.findUnique({
            where: { username },
        });
        if (usernameExists) {
            throw new Error('Username already exists');
        }
    }

    if (region_id) {
        const regionExists = await prisma.region.findUnique({
            where: { id: region_id },
        });
        if (!regionExists) throw new Error('Region not found');
    }

    if (area_id) {
        const areaExists = await prisma.area.findUnique({
            where: { id: area_id },
        });
        if (!areaExists) throw new Error('Area not found');
    }

    if (territory_id) {
        const territoryExists = await prisma.territory.findUnique({
            where: { id: territory_id },
        });
        if (!territoryExists) throw new Error('Territory not found');
    }

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
    }
) => {
    const existingSalesRep = await prisma.salesRepresentative.findUnique({
        where: { id },
    });

    if (!existingSalesRep) {
        throw new Error(`Sales representative with id ${id} not found`);
    }

    if (updates.username) {
        const usernameExists = await prisma.salesRepresentative.findFirst({
            where: {
                username: updates.username,
                NOT: { id },
            },
        });
        if (usernameExists) {
            throw new Error(`Username "${updates.username}" is already in use`);
        }
    }

    if (updates.region_id) {
        const regionExists = await prisma.region.findUnique({
            where: { id: updates.region_id },
        });
        if (!regionExists) throw new Error('Region not found');
    }

    if (updates.area_id) {
        const areaExists = await prisma.area.findUnique({
            where: { id: updates.area_id },
        });
        if (!areaExists) throw new Error('Area not found');
    }

    if (updates.territory_id) {
        const territoryExists = await prisma.territory.findUnique({
            where: { id: updates.territory_id },
        });
        if (!territoryExists) throw new Error('Territory not found');
    }

    return await prisma.salesRepresentative.update({
        where: { id },
        data: updates,
    });
};

export const deleteSalesRepresentative = async (id: string) => {
    const salesRep = await prisma.salesRepresentative.findUnique({ where: { id } });
    if (!salesRep) throw new Error('Sales representative not found');

    return prisma.salesRepresentative.delete({ where: { id } });
};

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
    }
) => {
    const where: any = {};
    
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

    const [salesReps, totalCount] = await prisma.$transaction([
        prisma.salesRepresentative.findMany({
            where,
            skip: offset,
            take: limit,
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
        }),
        prisma.salesRepresentative.count({ where }),
    ]);

    return {
        data: salesReps,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getSalesRepresentativeById = async (id: string) => {
    const salesRep = await prisma.salesRepresentative.findUnique({
        where: { id },
    });

    if (!salesRep) {
        throw new Error(`Sales representative with id ${id} not found`);
    }
    
    return salesRep;
};