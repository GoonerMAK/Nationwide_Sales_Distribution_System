import type { Request, Response } from 'express';
import * as territoryService from '../territory/territory.service.js';
import type { TerritoryParams, TerritoryCreate, TerritoryUpdate } from '../territory/territory.validator.js';
import type { PaginationQuery } from '../pagination/pagination.validator.js';

export const createTerritory = async (
    req: Request<unknown, unknown, TerritoryCreate, unknown>,
    res: Response
) => {
    const { name, area_id } = req.body;
    
    try {
        const newTerritory = await territoryService.createTerritory(name, area_id);
        res.status(201).json(newTerritory);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Failed to create territory' });
    }
};

export const updateTerritory = async (
    req: Request<TerritoryParams, unknown, TerritoryUpdate, unknown>,
    res: Response
) => {
    const { id } = req.params;
    const updates = req.body.data;
    
    try {
        const updatedTerritory = await territoryService.updateTerritory(id, updates);
        res.status(200).json(updatedTerritory);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to update territory' });
        }
    }
};

export const deleteTerritory = async (
    req: Request<TerritoryParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const deletedTerritory = await territoryService.deleteTerritory(id);
        res.status(200).json({ message: 'Territory deleted successfully', territory: deletedTerritory });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message || 'Failed to delete territory' });
        }
    }
};

export const getAllTerritories = async (
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response
) => {
    try {
        const { offset, limit } = req.query;
        const territories = await territoryService.getAllTerritories(Number(offset), Number(limit));
        res.status(200).json(territories);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch territories' });
    }
};

export const getTerritoryById = async (
    req: Request<TerritoryParams, unknown, unknown, unknown>,
    res: Response
) => {
    const { id } = req.params;
    
    try {
        const territory = await territoryService.getTerritoryById(id);
        res.status(200).json(territory);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message || 'Failed to fetch territory' });
        }
    }
};