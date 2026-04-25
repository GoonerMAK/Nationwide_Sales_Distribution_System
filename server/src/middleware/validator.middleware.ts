import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidationSource = 'body' | 'params' | 'query';

/** Unified validation: validates req[source] against a Zod schema. */
function validate(source: ValidationSource, schema: z.ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);

      if (source === 'body') {
        req.body = parsed;
      } else if (source === 'params') {
        req.params = parsed as Record<string, string>;
      } else {
        req.query = parsed as Record<string, string>;
      }

      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new ValidationError(messages);
      }
      throw error;
    }
  };
}

/** Validates req.body against the given schema. */
export const validateRequest = (schema: z.ZodTypeAny) => validate('body', schema);

/** Validates req.params against the given schema. */
export const validateParams = (schema: z.ZodTypeAny) => validate('params', schema);

/** Validates req.query against the given schema. */
export const validateQuery = (schema: z.ZodTypeAny) => validate('query', schema);
