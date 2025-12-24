import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodTypeAny) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = await schema.parseAsync(req.body);
        req.body = parsedBody;
        next();
    } catch (error: any) {
        res.status(400).json({ message: error.errors[0].message });
    }
};
