import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

/**
 * Custom error class for operational errors (expected errors)
 */
export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 *
 * Handles different error types:
 * - AppError: Operational errors (400, 404, etc.)
 * - ZodError: Validation errors
 * - Error: Unexpected errors (500)
 */
export function errorHandler(err: Error | AppError | ZodError, req: Request, res: Response, _next: NextFunction): void {
  // Don't log if headers already sent (streaming in progress)
  if (res.headersSent) {
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    logger.warn("Validation error", {
      path: req.path,
      method: req.method,
      errors: validationErrors,
    });

    res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
    return;
  }

  // Handle operational errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    logger.warn("Operational error", {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      message: err.message,
    });

    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle unexpected errors (programmer errors)
  logger.error("Unexpected error", err, {
    path: req.path,
    method: req.method,
    body: req.body,
  });

  // Don't show error details in production
  const isDevelopment = process.env.NODE_ENV !== "production";
  res.status(500).json({
    error: "Internal server error",
    ...(isDevelopment && { details: err.message, stack: err.stack }),
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
