import type { Request, Response } from 'express';
import * as distributorService from '../distributor/distributor.service.js';
import type { DistributorParams, DistributorCreate, DistributorUpdate, DistributorQuery } from '../distributor/distributor.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /distributor — Create a new distributor. */
export const createDistributor = async (
  req: Request<unknown, unknown, DistributorCreate, unknown>,
  res: Response,
) => {
  const { name } = req.body;
  const newDistributor = await distributorService.createDistributor(name);

  await invalidateCache('/distributors*');
  await invalidateCache('/distributor/*');

  sendCreated(res, newDistributor);
};

/** PUT /distributor/:id — Update a distributor. */
export const updateDistributor = async (
  req: Request<DistributorParams, unknown, DistributorUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedDistributor = await distributorService.updateDistributor(id, updates);

  await invalidateCache('/distributors*');
  await invalidateCache(`/distributor/${id}`);

  sendSuccess(res, updatedDistributor);
};

/** DELETE /distributor/:id — Delete a distributor. */
export const deleteDistributor = async (
  req: Request<DistributorParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await distributorService.deleteDistributor(id);

  await invalidateCache('/distributors*');
  await invalidateCache(`/distributor/${id}`);

  sendDeleted(res, 'Distributor deleted successfully');
};

/** GET /distributors — List distributors with pagination and filters. */
export const getDistributors = async (
  req: Request<unknown, unknown, unknown, DistributorQuery>,
  res: Response,
) => {
  const { offset, limit, name } = req.query;
  const filters = { name };
  const result = await distributorService.getDistributors(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /distributor/:id — Get a single distributor by ID. */
export const getDistributorById = async (
  req: Request<DistributorParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const distributor = await distributorService.getDistributorById(id);

  sendSuccess(res, distributor);
};
