import type { Request, Response } from 'express';
import * as retailerService from '../retailer/retailer.service.js';
import type { RetailerParams, RetailerCreate, RetailerUpdate, RetailerQuery } from '../retailer/retailer.validator.js';
import { invalidateCache } from '../../middleware/cache.middleware.js';
import { sendSuccess, sendCreated, sendPaginated, sendDeleted } from '../../utils/response.js';

/** POST /retailer — Create a new retailer. */
export const createRetailer = async (
  req: Request<unknown, unknown, RetailerCreate, unknown>,
  res: Response,
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
    routes,
  } = req.body;

  const newRetailer = await retailerService.createRetailer(
    name,
    region_id,
    area_id,
    distributor_id,
    territory_id,
    points,
    phone,
    sales_representative_id,
    routes,
  );

  await invalidateCache('/retailers*');
  await invalidateCache('/retailer/*');

  sendCreated(res, newRetailer);
};

/** PUT /retailer/:id — Update a retailer. */
export const updateRetailer = async (
  req: Request<RetailerParams, unknown, RetailerUpdate, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const updates = req.body.data;
  const updatedRetailer = await retailerService.updateRetailer(id, updates);

  await invalidateCache('/retailers*');
  await invalidateCache(`/retailer/${id}`);

  sendSuccess(res, updatedRetailer);
};

/** DELETE /retailer/:id — Delete a retailer. */
export const deleteRetailer = async (
  req: Request<RetailerParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  await retailerService.deleteRetailer(id);

  await invalidateCache('/retailers*');
  await invalidateCache(`/retailer/${id}`);

  sendDeleted(res, 'Retailer deleted successfully');
};

/** GET /retailers — List retailers with pagination and filters. */
export const getRetailers = async (
  req: Request<unknown, unknown, unknown, RetailerQuery>,
  res: Response,
) => {
  const { offset, limit, name, phone, region_id, area_id, distributor_id, territory_id, sales_representative_id, assigned } = req.query;
  const filters = { name, phone, region_id, area_id, distributor_id, territory_id, sales_representative_id, assigned };
  const result = await retailerService.getRetailers(Number(offset), Number(limit), filters);

  sendPaginated(res, result.data, result.pagination);
};

/** GET /retailer/:id — Get a single retailer by ID. */
export const getRetailerById = async (
  req: Request<RetailerParams, unknown, unknown, unknown>,
  res: Response,
) => {
  const { id } = req.params;
  const retailer = await retailerService.getRetailerById(id);

  sendSuccess(res, retailer);
};
