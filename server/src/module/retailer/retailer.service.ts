import prisma from '../../prisma.js';

export const createRetailer = async (
    name: string,
    region_id: string,
    area_id: string,
    distributor_id: string,
    territory_id: string,
    points?: number,
    phone?: string,
    sales_representative_id?: string,
    routes?: string
) => {
    const regionExists = await prisma.region.findUnique({
        where: { id: region_id },
    });
    if (!regionExists) throw new Error('Region not found');

    const areaExists = await prisma.area.findUnique({
        where: { id: area_id },
    });
    if (!areaExists) throw new Error('Area not found');

    const distributorExists = await prisma.distributor.findUnique({
        where: { id: distributor_id },
    });
    if (!distributorExists) throw new Error('Distributor not found');

    const territoryExists = await prisma.territory.findUnique({
        where: { id: territory_id },
    });
    if (!territoryExists) throw new Error('Territory not found');

    if (sales_representative_id) {
        const salesRepExists = await prisma.salesRepresentative.findUnique({
            where: { id: sales_representative_id },
        });
        if (!salesRepExists) throw new Error('Sales representative not found');
    }

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
    }
) => {
    const existingRetailer = await prisma.retailer.findUnique({
        where: { id },
    });

    if (!existingRetailer) {
        throw new Error(`Retailer with id ${id} not found`);
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

    if (updates.distributor_id) {
        const distributorExists = await prisma.distributor.findUnique({
            where: { id: updates.distributor_id },
        });
        if (!distributorExists) throw new Error('Distributor not found');
    }

    if (updates.territory_id) {
        const territoryExists = await prisma.territory.findUnique({
            where: { id: updates.territory_id },
        });
        if (!territoryExists) throw new Error('Territory not found');
    }

    if (updates.sales_representative_id) {
        const salesRepExists = await prisma.salesRepresentative.findUnique({
            where: { id: updates.sales_representative_id },
        });
        if (!salesRepExists) throw new Error('Sales representative not found');
    }

    return await prisma.retailer.update({
        where: { id },
        data: updates,
    });
};

export const deleteRetailer = async (id: string) => {
    const retailer = await prisma.retailer.findUnique({ where: { id } });
    if (!retailer) throw new Error('Retailer not found');

    return prisma.retailer.delete({ where: { id } });
};

export const getAllRetailers = async (offset: number, limit: number) => {
    const [retailers, totalCount] = await prisma.$transaction([
        prisma.retailer.findMany({
            skip: offset,
            take: limit,
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
        }),
        prisma.retailer.count(),
    ]);

    return {
        data: retailers,
        pagination: {
            offset,
            limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: (offset + limit) < totalCount,
        }
    };
};

export const getRetailerById = async (id: string) => {
    const retailer = await prisma.retailer.findUnique({
        where: { id },
    });

    if (!retailer) {
        throw new Error(`Retailer with id ${id} not found`);
    }
    
    return retailer;
};