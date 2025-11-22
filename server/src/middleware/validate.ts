import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

/**
 * Validation middleware factory
 *
 * Validates request body against a Zod schema
 * Throws ZodError which is caught by error handler middleware
 */
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Parse and validate request body
      // This will throw ZodError if validation fails
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      // Pass to error handler middleware
      next(error);
    }
  };
}

/**
 * Validation middleware for query parameters
 */
export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validation middleware for route parameters
 */
export function validateParams(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
}
