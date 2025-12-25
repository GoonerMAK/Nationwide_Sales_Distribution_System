import { Router } from 'express';
import * as territoryController from './territory.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createTerritorySchema, updateTerritorySchema, territoryParamsSchema, territoryQuerySchema } from './territory.validator.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

export const territoryRouter = Router();

territoryRouter.post('/territory', isAuthenticated, validateRequest(createTerritorySchema), territoryController.createTerritory);
territoryRouter.put('/territory/:id', isAuthenticated, validateParams(territoryParamsSchema), validateRequest(updateTerritorySchema), territoryController.updateTerritory);
territoryRouter.delete('/territory/:id', isAuthenticated, validateParams(territoryParamsSchema), territoryController.deleteTerritory);
territoryRouter.get('/territories', isAuthenticated, cacheMiddleware(300), validateQuery(territoryQuerySchema), territoryController.getTerritories);
territoryRouter.get('/territory/:id', isAuthenticated, cacheMiddleware(300), validateParams(territoryParamsSchema), territoryController.getTerritoryById);