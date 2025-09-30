import { z } from 'zod';
export function validateData(schema, options = {}) {
    const { target = 'body', attach = true, statusCode = 400, stripUnknown = false, } = options;
    const effectiveSchema = stripUnknown && schema instanceof z.ZodObject
        ? schema.strip()
        : schema;
    return (req, res, next) => {
        const input = (() => {
            switch (target) {
                case 'query': return req.query;
                case 'params': return req.params;
                default: return req.body;
            }
        })();
        const result = effectiveSchema.safeParse(input);
        if (!result.success) {
            const zerr = result.error;
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
            req.validated = result.data;
        }
        return next();
    };
}
export const validateBody = (schema, opts) => validateData(schema, { ...opts, target: 'body' });
export const validateQuery = (schema, opts) => validateData(schema, { ...opts, target: 'query' });
export const validateParams = (schema, opts) => validateData(schema, { ...opts, target: 'params' });
