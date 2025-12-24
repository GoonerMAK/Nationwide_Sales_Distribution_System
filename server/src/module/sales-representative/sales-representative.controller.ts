import type { Request, Response } from 'express';
import * as salesRepresentativeService from './sales-representative.service.js';
import type { SalesRepresentativeParams, SalesRepresentativeCreate, SalesRepresentativeUpdate } from './sales-representative.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';

export const createSalesRepresentative = async (
    req: Request<unknown, unknown, SalesRepresentativeCreate, unknown>,
    res: Response
) => {
    const {
        user_id,
        username,
        name,
        phone,
        region_id,
        area_id,
        territory_id
    } = req.body;
    
    try {
        const newSalesRepresentative = await salesRepresentativeService.createSalesRepresentative(
            user_id,
            username,
            name,
            phone,
            region_id,
            area_id,
            territory_id
        );
        res.status(201).json(newSalesRepresentative);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create sales representative' });
    }
};

export const updateSalesRepresentative = async (
    req: Request<SalesRepresentativeParams, unknown, SalesRepresentativeUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedSalesRepresentative = await salesRepresentativeService.updateSalesRepresentative(id, updates);
        res.status(200).json(updatedSalesRepresentative);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update sales representative' });
        }
    }
};

export const deleteSalesRepresentative = async (
    req: Request<SalesRepresentativeParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedSalesRepresentative = await salesRepresentativeService.deleteSalesRepresentative(id);
        res.status(200).json({ message: 'Sales representative deleted successfully', salesRepresentative: deletedSalesRepresentative });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete sales representative' });
        }
    }
};

export const getAllSalesRepresentatives = async (
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response
) => {
    try {
        const { offset, limit } = req.query;
        const salesRepresentatives = await salesRepresentativeService.getAllSalesRepresentatives(Number(offset), Number(limit));
        res.status(200).json(salesRepresentatives);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch sales representatives' });
    }
};

export const getSalesRepresentativeById = async (
    req: Request<SalesRepresentativeParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const salesRepresentative = await salesRepresentativeService.getSalesRepresentativeById(id);
        res.status(200).json(salesRepresentative);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch sales representative' });
        }
    }
};