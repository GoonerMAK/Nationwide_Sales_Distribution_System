import type { Request, Response } from 'express';
import * as territoryService from '../territory/territory.service.js';
import type { TerritoryParams, TerritoryCreate, TerritoryUpdate, TerritoryQuery } from '../territory/territory.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /territory — Create a new territory. */
export const createTerritory = async (
  req: Request<unknown, unknown, TerritoryCreate, unknown>,
  res: Response,
) => {
  const { name, area_id } = req.body;
  const newTerritory = await territoryService.createTerritory(name, area_id);

  await invalidateCache('/territories*');
  await invalidateCache('/territory/*');

  sendCreated(res, newTerritory);
};

/** PUT /territory/:id — Update a territory. */
export const updateTerritory = async (
  req: Request<TerritoryParams, unknown, TerritoryUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedTerritory = await territoryService.updateTerritory(id, updates);

  await invalidateCache('/territories*');
  await invalidateCache(`/territory/${id}`);

  sendSuccess(res, updatedTerritory);
};

/** DELETE /territory/:id — Delete a territory. */
export const deleteTerritory = async (
  req: Request<TerritoryParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await territoryService.deleteTerritory(id);

  await invalidateCache('/territories*');
  await invalidateCache(`/territory/${id}`);

  sendDeleted(res, 'Territory deleted successfully');
};

/** GET /territories — List territories with pagination and filters. */
export const getTerritories = async (
  req: Request<unknown, unknown, unknown, TerritoryQuery>,
  res: Response,
) => {
  const { offset, limit, name, area_id } = req.query;
  const filters = { name, area_id };
  const result = await territoryService.getTerritories(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /territory/:id — Get a single territory by ID. */
export const getTerritoryById = async (
  req: Request<TerritoryParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const territory = await territoryService.getTerritoryById(id);

  sendSuccess(res, territory);
};
