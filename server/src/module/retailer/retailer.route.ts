import { Router } from 'express';
import * as retailerController from './retailer.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createRetailerSchema, updateRetailerSchema, retailerParamsSchema, retailerQuerySchema } from './retailer.validator.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

export const retailerRouter = Router();

retailerRouter.post('/retailer', isAuthenticated, validateRequest(createRetailerSchema), retailerController.createRetailer);
retailerRouter.put('/retailer/:id', isAuthenticated, validateParams(retailerParamsSchema), validateRequest(updateRetailerSchema), retailerController.updateRetailer);
retailerRouter.delete('/retailer/:id', isAuthenticated, validateParams(retailerParamsSchema), retailerController.deleteRetailer);
retailerRouter.get('/retailers', isAuthenticated, cacheMiddleware(300), validateQuery(retailerQuerySchema), retailerController.getRetailers);
retailerRouter.get('/retailer/:id', isAuthenticated, cacheMiddleware(300), validateParams(retailerParamsSchema), retailerController.getRetailerById);