import { Router } from 'express';
import * as territoryController from './territory.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createTerritorySchema, updateTerritorySchema, territoryParamsSchema } from './territory.validator.js';
import { paginationQuerySchema } from '../pagination/pagination.validator.js';

export const territoryRouter = Router();

territoryRouter.post('/territory', isAuthenticated, validateRequest(createTerritorySchema), territoryController.createTerritory);
territoryRouter.put('/territory/:id', isAuthenticated, validateParams(territoryParamsSchema), validateRequest(updateTerritorySchema), territoryController.updateTerritory);
territoryRouter.delete('/territory/:id', isAuthenticated, validateParams(territoryParamsSchema), territoryController.deleteTerritory);
territoryRouter.get('/territories', isAuthenticated, validateQuery(paginationQuerySchema), territoryController.getAllTerritories);
territoryRouter.get('/territory/:id', isAuthenticated, validateParams(territoryParamsSchema), territoryController.getTerritoryById);