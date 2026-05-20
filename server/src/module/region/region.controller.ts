import type { Request, Response } from 'express';
import * as regionService from './region.service.js';
import type { RegionParams, RegionCreate, RegionUpdate, RegionQuery } from './region.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /region — Create a new region. */
export const createRegion = async (
  req: Request<unknown, unknown, RegionCreate, unknown>,
  res: Response,
) => {
  const { name } = req.body;
  const newRegion = await regionService.createRegion(name);

  await invalidateCache('/regions*');
  await invalidateCache('/region/*');

  sendCreated(res, newRegion);
};

/** PUT /region/:id — Update a region. */
export const updateRegion = async (
  req: Request<RegionParams, unknown, RegionUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedRegion = await regionService.updateRegion(id, updates);

  await invalidateCache('/regions*');
  await invalidateCache(`/region/${id}`);

  sendSuccess(res, updatedRegion);
};

/** DELETE /region/:id — Delete a region. */
export const deleteRegion = async (
  req: Request<RegionParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await regionService.deleteRegion(id);

  await invalidateCache('/regions*');
  await invalidateCache(`/region/${id}`);

  sendDeleted(res, 'Region deleted successfully');
};

/** GET /regions — List regions with pagination and filters. */
export const getRegions = async (
  req: Request<unknown, unknown, unknown, RegionQuery>,
  res: Response,
) => {
  const { offset, limit, name } = req.query;
  const filters = { name };
  const result = await regionService.getRegions(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /region/:id — Get a single region by ID. */
export const getRegionById = async (
  req: Request<RegionParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const region = await regionService.getRegionById(id);

  sendSuccess(res, region);
};
