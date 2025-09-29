import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';

// Extend Express Request interface (local augmentation) to hold validated data
declare module 'express-serve-static-core' {
  interface Request {
    validated?: unknown; // you can narrow this per-route when you use the middleware generically
  }
}

export type ValidationTarget = 'body' | 'query' | 'params';

interface ValidateOptions {
  target?: ValidationTarget; // default 'body'
  attach?: boolean;          // attach parsed data to req.validated (default true)
  statusCode?: number;       // default 400
  stripUnknown?: boolean;    // if true, force stripping extra keys (object schemas only)
  transform?: boolean;       // if the schema includes transforms, allow returning transformed data
}

/**
 * Generic validation middleware.
 * - Uses safeParse (never throws)
 * - Sends structured error details (path, message, code)
 * - Optionally attaches the parsed data at `req.validated`
 * - Can validate body/query/params
 */
export function validateData<T extends ZodTypeAny>(schema: T, options: ValidateOptions = {}) {
  const {
    target = 'body',
    attach = true,
    statusCode = 400,
    stripUnknown = false,
  } = options;

  // If explicit strip requested and schema is object-like, apply .strip()
  const effectiveSchema = stripUnknown && schema instanceof z.ZodObject
    ? (schema.strip() as unknown as T)
    : schema;

  return (req: Request, res: Response, next: NextFunction) => {
    const input = ((): unknown => {
      switch (target) {
        case 'query': return req.query;
        case 'params': return req.params;
        default: return req.body;
      }
    })();
    const result = effectiveSchema.safeParse(input);

    if (!result.success) {
      // ZodError
      const zerr: ZodError = result.error;
      const details = zerr.issues.map(issue => ({
        path: issue.path.join('.') || '(root)',
        code: issue.code,
        message: issue.message
      }));
      return res.status(statusCode).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }

    if (attach) {
      req.validated = result.data; // caller can cast if needed
    }
    return next();
  };
}

// Convenience helpers for the most common case: body validation
export const validateBody = <T extends ZodTypeAny>(schema: T, opts?: Omit<ValidateOptions, 'target'>) =>
  validateData(schema, { ...opts, target: 'body' });

export const validateQuery = <T extends ZodTypeAny>(schema: T, opts?: Omit<ValidateOptions, 'target'>) =>
  validateData(schema, { ...opts, target: 'query' });

export const validateParams = <T extends ZodTypeAny>(schema: T, opts?: Omit<ValidateOptions, 'target'>) =>
  validateData(schema, { ...opts, target: 'params' });
