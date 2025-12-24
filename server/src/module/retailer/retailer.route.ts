import { Router } from 'express';
import * as retailerController from './retailer.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createRetailerSchema, updateRetailerSchema, retailerParamsSchema } from './retailer.validator.js';
import { paginationQuerySchema } from '../pagination/pagination.validator.js';

export const retailerRouter = Router();

retailerRouter.post('/retailer', isAuthenticated, validateRequest(createRetailerSchema), retailerController.createRetailer);
retailerRouter.put('/retailer/:id', isAuthenticated, validateParams(retailerParamsSchema), validateRequest(updateRetailerSchema), retailerController.updateRetailer);
retailerRouter.delete('/retailer/:id', isAuthenticated, validateParams(retailerParamsSchema), retailerController.deleteRetailer);
retailerRouter.get('/retailers', isAuthenticated, validateQuery(paginationQuerySchema), retailerController.getAllRetailers);
retailerRouter.get('/retailer/:id', isAuthenticated, validateParams(retailerParamsSchema), retailerController.getRetailerById);