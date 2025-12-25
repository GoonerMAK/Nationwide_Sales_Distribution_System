import { Router } from 'express';
import * as areaController from './area.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createAreaSchema, updateAreaSchema, areaParamsSchema, areaQuerySchema } from './area.validator.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

export const areaRouter = Router();

areaRouter.post('/area', isAuthenticated, validateRequest(createAreaSchema), areaController.createArea);
areaRouter.put('/area/:id', isAuthenticated, validateParams(areaParamsSchema), validateRequest(updateAreaSchema), areaController.updateArea);
areaRouter.delete('/area/:id', isAuthenticated, validateParams(areaParamsSchema), areaController.deleteArea);
areaRouter.get('/areas', isAuthenticated, cacheMiddleware(300), validateQuery(areaQuerySchema), areaController.getAreas);
areaRouter.get('/area/:id', isAuthenticated, cacheMiddleware(300), validateParams(areaParamsSchema), areaController.getAreaById);