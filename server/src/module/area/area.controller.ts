import type { Request, Response } from 'express';
import * as areaService from './area.service.js';
import type { AreaParams, AreaCreate, AreaUpdate, AreaQuery } from './area.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /area — Create a new area. */
export const createArea = async (
  req: Request<unknown, unknown, AreaCreate, unknown>,
  res: Response,
) => {
  const { name, region_id } = req.body;
  const newArea = await areaService.createArea(name, region_id);

  await invalidateCache('/areas*');
  await invalidateCache('/area/*');

  sendCreated(res, newArea);
};

/** PUT /area/:id — Update an area. */
export const updateArea = async (
  req: Request<AreaParams, unknown, AreaUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedArea = await areaService.updateArea(id, updates);

  await invalidateCache('/areas*');
  await invalidateCache(`/area/${id}`);

  sendSuccess(res, updatedArea);
};

/** DELETE /area/:id — Delete an area. */
export const deleteArea = async (
  req: Request<AreaParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await areaService.deleteArea(id);

  await invalidateCache('/areas*');
  await invalidateCache(`/area/${id}`);

  sendDeleted(res, 'Area deleted successfully');
};

/** GET /areas — List areas with pagination and filters. */
export const getAreas = async (
  req: Request<unknown, unknown, unknown, AreaQuery>,
  res: Response,
) => {
  const { offset, limit, name, region_id } = req.query;
  const filters = { name, region_id };
  const result = await areaService.getAreas(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /area/:id — Get a single area by ID. */
export const getAreaById = async (
  req: Request<AreaParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const area = await areaService.getAreaById(id);

  sendSuccess(res, area);
};
