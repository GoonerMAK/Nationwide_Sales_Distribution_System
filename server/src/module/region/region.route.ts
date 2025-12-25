import { Router } from 'express';
import * as regionController from './region.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createRegionSchema, updateRegionSchema, regionParamsSchema, regionQuerySchema } from './region.validator.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

export const regionRouter = Router();

regionRouter.post('/region', isAuthenticated, validateRequest(createRegionSchema), regionController.createRegion);
regionRouter.put('/region/:id', isAuthenticated, validateParams(regionParamsSchema), validateRequest(updateRegionSchema), regionController.updateRegion);
regionRouter.delete('/region/:id', isAuthenticated, validateParams(regionParamsSchema), regionController.deleteRegion);
regionRouter.get('/regions', isAuthenticated, cacheMiddleware(300), validateQuery(regionQuerySchema), regionController.getRegions);
regionRouter.get('/region/:id', isAuthenticated, cacheMiddleware(300), validateParams(regionParamsSchema), regionController.getRegionById);