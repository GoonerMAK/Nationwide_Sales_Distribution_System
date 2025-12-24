import type { Request, Response } from 'express';
import * as regionService from '../region/region.service.js';
import type { RegionParams, RegionCreate, RegionUpdate } from '../region/region.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';

export const createRegion = async (
    req: Request<unknown, unknown, RegionCreate, unknown>,
    res: Response
) => {
    const { name } = req.body;
    
    try {
        const newRegion = await regionService.createRegion(name);
        res.status(201).json(newRegion);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create region' });
    }
};

export const updateRegion = async (
    req: Request<RegionParams, unknown, RegionUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedRegion = await regionService.updateRegion(id, updates);
        res.status(200).json(updatedRegion);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update region' });
        }
    }
};

export const deleteRegion = async (
    req: Request<RegionParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedRegion = await regionService.deleteRegion(id);
        res.status(200).json({ message: 'Region deleted successfully', region: deletedRegion });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete region' });
        }
    }
};

export const getAllRegions = async (
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response
) => {
    try {
        const { offset, limit } = req.query;
        const regions = await regionService.getAllRegions(Number(offset), Number(limit));
        res.status(200).json(regions);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch regions' });
    }
};

export const getRegionById = async (
    req: Request<RegionParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const region = await regionService.getRegionById(id);
        res.status(200).json(region);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch region' });
        }
    }
};