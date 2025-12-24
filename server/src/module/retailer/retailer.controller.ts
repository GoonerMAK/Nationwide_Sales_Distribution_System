import type { Request, Response } from 'express';
import * as retailerService from '../retailer/retailer.service.js';
import type { RetailerParams, RetailerCreate, RetailerUpdate } from '../retailer/retailer.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';

export const createRetailer = async (
    req: Request<unknown, unknown, RetailerCreate, unknown>,
    res: Response
) => {
    const {
        name,
        phone,
        region_id,
        area_id,
        distributor_id,
        territory_id,
        sales_representative_id,
        points,
        routes
    } = req.body;
    
    try {
        const newRetailer = await retailerService.createRetailer(
            name,
            region_id,
            area_id,
            distributor_id,
            territory_id,
            points,
            phone,
            sales_representative_id,
            routes
        );
        res.status(201).json(newRetailer);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create retailer' });
    }
};

export const updateRetailer = async (
    req: Request<RetailerParams, unknown, RetailerUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedRetailer = await retailerService.updateRetailer(id, updates);
        res.status(200).json(updatedRetailer);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update retailer' });
        }
    }
};

export const deleteRetailer = async (
    req: Request<RetailerParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedRetailer = await retailerService.deleteRetailer(id);
        res.status(200).json({ message: 'Retailer deleted successfully', retailer: deletedRetailer });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete retailer' });
        }
    }
};

export const getAllRetailers = async (
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response
) => {
    try {
        const { offset, limit } = req.query;
        const retailers = await retailerService.getAllRetailers(Number(offset), Number(limit));
        res.status(200).json(retailers);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch retailers' });
    }
};

export const getRetailerById = async (
    req: Request<RetailerParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const retailer = await retailerService.getRetailerById(id);
        res.status(200).json(retailer);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch retailer' });
        }
    }
};