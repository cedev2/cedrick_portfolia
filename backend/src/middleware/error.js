import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

/**
 * Validates `req[source]` against a Zod schema and replaces it with the parsed result.
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source] ?? {});
    if (source === 'query') req.validatedQuery = parsed;
    else req[source] = parsed;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      return next(ApiError.unprocessable('Validation failed', errors));
    }
    return next(error);
  }
};

/**
 * 404 handler for unmatched routes.
 */
export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralised error handler.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  const payload = {
    success: false,
    message:
      status >= 500 && env.isProduction ? 'Internal server error' : message,
  };

  if (err.errors) payload.errors = err.errors;
  if (!env.isProduction && status >= 500) payload.stack = err.stack;

  res.status(status).json(payload);
};

export default errorHandler;
