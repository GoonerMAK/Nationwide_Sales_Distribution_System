import type { Request, Response } from 'express';
import * as salesRepresentativeService from './sales-representative.service.js';
import type { SalesRepresentativeParams, SalesRepresentativeCreate, SalesRepresentativeUpdate, SalesRepresentativeQuery } from './sales-representative.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /sales-representative — Create a new sales representative. */
export const createSalesRepresentative = async (
  req: Request<unknown, unknown, SalesRepresentativeCreate, unknown>,
  res: Response,
) => {
  const {
    user_id,
    username,
    name,
    phone,
    region_id,
    area_id,
    territory_id,
  } = req.body;

  const newSalesRepresentative = await salesRepresentativeService.createSalesRepresentative(
    user_id,
    username,
    name,
    phone,
    region_id,
    area_id,
    territory_id,
  );

  await invalidateCache('/sales-representatives*');
  await invalidateCache('/sales-representative/*');

  sendCreated(res, newSalesRepresentative);
};

/** PUT /sales-representative/:id — Update a sales representative. */
export const updateSalesRepresentative = async (
  req: Request<SalesRepresentativeParams, unknown, SalesRepresentativeUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedSalesRepresentative = await salesRepresentativeService.updateSalesRepresentative(id, updates);

  await invalidateCache('/sales-representatives*');
  await invalidateCache(`/sales-representative/${id}`);

  sendSuccess(res, updatedSalesRepresentative);
};

/** DELETE /sales-representative/:id — Delete a sales representative. */
export const deleteSalesRepresentative = async (
  req: Request<SalesRepresentativeParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await salesRepresentativeService.deleteSalesRepresentative(id);

  await invalidateCache('/sales-representatives*');
  await invalidateCache(`/sales-representative/${id}`);

  sendDeleted(res, 'Sales representative deleted successfully');
};

/** GET /sales-representatives — List sales representatives with pagination and filters. */
export const getSalesRepresentatives = async (
  req: Request<unknown, unknown, unknown, SalesRepresentativeQuery>,
  res: Response,
) => {
  const { offset, limit, username, name, phone, region_id, area_id, territory_id } = req.query;
  const filters = { username, name, phone, region_id, area_id, territory_id };
  const result = await salesRepresentativeService.getSalesRepresentatives(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /sales-representative/:id — Get a single sales representative by ID. */
export const getSalesRepresentativeById = async (
  req: Request<SalesRepresentativeParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const salesRepresentative = await salesRepresentativeService.getSalesRepresentativeById(id);

  sendSuccess(res, salesRepresentative);
};
