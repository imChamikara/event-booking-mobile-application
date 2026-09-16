import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: (error as any).errors[0].message
          }
        });
      }
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Validation failed' } });
    }
  };
};
