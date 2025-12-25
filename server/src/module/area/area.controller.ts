import type { Request, Response } from 'express';
import * as areaService from '../area/area.service.js';
import type { AreaParams, AreaCreate, AreaUpdate, AreaQuery } from '../area/area.validator.js';

export const createArea = async (
    req: Request<unknown, unknown, AreaCreate, unknown>,
    res: Response
) => {
    const { name, region_id } = req.body;
    
    try {
        const newArea = await areaService.createArea(name, region_id);
        res.status(201).json(newArea);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create area' });
    }
};

export const updateArea = async (
    req: Request<AreaParams, unknown, AreaUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedArea = await areaService.updateArea(id, updates);
        res.status(200).json(updatedArea);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update area' });
        }
    }
};

export const deleteArea = async (
    req: Request<AreaParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedArea = await areaService.deleteArea(id);
        res.status(200).json({ message: 'Area deleted successfully', area: deletedArea });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete area' });
        }
    }
};

export const getAreas = async (
    req: Request<unknown, unknown, unknown, AreaQuery>,
    res: Response
) => {
    try {
        const { offset, limit, name, region_id } = req.query;
        const filters = { name, region_id };
        const areas = await areaService.getAreas(Number(offset), Number(limit), filters);
        res.status(200).json(areas);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch areas' });
    }
};

export const getAreaById = async (
    req: Request<AreaParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const area = await areaService.getAreaById(id);
        res.status(200).json(area);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch area' });
        }
    }
};