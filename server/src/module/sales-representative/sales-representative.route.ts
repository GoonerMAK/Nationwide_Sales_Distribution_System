import { Router } from 'express';
import * as salesRepresentativeController from './sales-representative.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createSalesRepresentativeSchema, updateSalesRepresentativeSchema, salesRepresentativeParamsSchema, salesRepresentativeQuerySchema } from './sales-representative.validator.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

export const salesRepresentativeRouter = Router();

salesRepresentativeRouter.post('/sales-representative', isAuthenticated, validateRequest(createSalesRepresentativeSchema), salesRepresentativeController.createSalesRepresentative);
salesRepresentativeRouter.put('/sales-representative/:id', isAuthenticated, validateParams(salesRepresentativeParamsSchema), validateRequest(updateSalesRepresentativeSchema), salesRepresentativeController.updateSalesRepresentative);
salesRepresentativeRouter.delete('/sales-representative/:id', isAuthenticated, validateParams(salesRepresentativeParamsSchema), salesRepresentativeController.deleteSalesRepresentative);
salesRepresentativeRouter.get('/sales-representatives', isAuthenticated, cacheMiddleware(300), validateQuery(salesRepresentativeQuerySchema), salesRepresentativeController.getSalesRepresentatives);
salesRepresentativeRouter.get('/sales-representative/:id', isAuthenticated, cacheMiddleware(300), validateParams(salesRepresentativeParamsSchema), salesRepresentativeController.getSalesRepresentativeById);