import { Router } from 'express';
import * as distributorController from './distributor.controller.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js'; 
import { validateRequest, validateParams, validateQuery } from '../../middleware/validator.middleware.js';
import { createDistributorSchema, updateDistributorSchema, distributorParamsSchema, distributorQuerySchema } from './distributor.validator.js';

export const distributorRouter = Router();

distributorRouter.post('/distributor', isAuthenticated, validateRequest(createDistributorSchema), distributorController.createDistributor);
distributorRouter.put('/distributor/:id', isAuthenticated, validateParams(distributorParamsSchema), validateRequest(updateDistributorSchema), distributorController.updateDistributor);
distributorRouter.delete('/distributor/:id', isAuthenticated, validateParams(distributorParamsSchema), distributorController.deleteDistributor);
distributorRouter.get('/distributors', isAuthenticated, validateQuery(distributorQuerySchema), distributorController.getDistributors);
distributorRouter.get('/distributor/:id', isAuthenticated, validateParams(distributorParamsSchema), distributorController.getDistributorById);