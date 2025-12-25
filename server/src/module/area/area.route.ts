import { Router } from 'express';
import * as areaController from './area.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createAreaSchema, updateAreaSchema, areaParamsSchema, areaQuerySchema } from './area.validator.js';

export const areaRouter = Router();

areaRouter.post('/area', isAuthenticated, validateRequest(createAreaSchema), areaController.createArea);
areaRouter.put('/area/:id', isAuthenticated, validateParams(areaParamsSchema), validateRequest(updateAreaSchema), areaController.updateArea);
areaRouter.delete('/area/:id', isAuthenticated, validateParams(areaParamsSchema), areaController.deleteArea);
areaRouter.get('/areas', isAuthenticated, validateQuery(areaQuerySchema), areaController.getAreas);
areaRouter.get('/area/:id', isAuthenticated, validateParams(areaParamsSchema), areaController.getAreaById);