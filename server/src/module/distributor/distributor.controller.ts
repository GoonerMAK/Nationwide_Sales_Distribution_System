import type { Request, Response } from 'express';
import * as distributorService from '../distributor/distributor.service.js';
import type { DistributorParams, DistributorCreate, DistributorUpdate, DistributorQuery } from '../distributor/distributor.validator.js';

export const createDistributor = async (
    req: Request<unknown, unknown, DistributorCreate, unknown>,
    res: Response
) => {
    const { name } = req.body;
    
    try {
        const newDistributor = await distributorService.createDistributor(name);
        res.status(201).json(newDistributor);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create distributor' });
    }
};

export const updateDistributor = async (
    req: Request<DistributorParams, unknown, DistributorUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedDistributor = await distributorService.updateDistributor(id, updates);
        res.status(200).json(updatedDistributor);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update distributor' });
        }
    }
};

export const deleteDistributor = async (
    req: Request<DistributorParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedDistributor = await distributorService.deleteDistributor(id);
        res.status(200).json({ message: 'Distributor deleted successfully', distributor: deletedDistributor });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete distributor' });
        }
    }
};

export const getDistributors = async (
    req: Request<unknown, unknown, unknown, DistributorQuery>,
    res: Response
) => {
    try {
        const { offset, limit, name } = req.query;
        const filters = { name };
        const distributors = await distributorService.getDistributors(Number(offset), Number(limit), filters);
        res.status(200).json(distributors);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch distributors' });
    }
};

export const getDistributorById = async (
    req: Request<DistributorParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const distributor = await distributorService.getDistributorById(id);
        res.status(200).json(distributor);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch distributor' });
        }
    }
};