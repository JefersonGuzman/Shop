import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      next(error);
    }
  };
}

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const before = JSON.stringify(req.body);
      const parsed = schema.parse(req.body);
      const after = JSON.stringify(parsed);
      console.log('🧪 [Validation] body before:', before);
      console.log('🧪 [Validation] body after:', after);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('⚠️ [Validation] failed:', JSON.stringify(error.errors));
        return res.status(400).json({ error: 'Validation failed', details: error.errors });
      }
      next(error);
    }
  };
}


