"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
exports.validateData = validateData;
var zod_1 = require("zod");
/**
 * Generic validation middleware.
 * - Uses safeParse (never throws)
 * - Sends structured error details (path, message, code)
 * - Optionally attaches the parsed data at `req.validated`
 * - Can validate body/query/params
 */
function validateData(schema, options) {
    if (options === void 0) { options = {}; }
    var _a = options.target, target = _a === void 0 ? 'body' : _a, _b = options.attach, attach = _b === void 0 ? true : _b, _c = options.statusCode, statusCode = _c === void 0 ? 400 : _c, _d = options.stripUnknown, stripUnknown = _d === void 0 ? false : _d;
    // If explicit strip requested and schema is object-like, apply .strip()
    var effectiveSchema = stripUnknown && schema instanceof zod_1.z.ZodObject
        ? schema.strip()
        : schema;
    return function (req, res, next) {
        var input = (function () {
            switch (target) {
                case 'query': return req.query;
                case 'params': return req.params;
                default: return req.body;
            }
        })();
        var result = effectiveSchema.safeParse(input);
        if (!result.success) {
            // ZodError
            var zerr = result.error;
            var details = zerr.issues.map(function (issue) { return ({
                path: issue.path.join('.') || '(root)',
                code: issue.code,
                message: issue.message
            }); });
            return res.status(statusCode).json({
                success: false,
                error: 'Validation failed',
                details: details
            });
        }
        if (attach) {
            req.validated = result.data; // caller can cast if needed
        }
        return next();
    };
}
// Convenience helpers for the most common case: body validation
var validateBody = function (schema, opts) {
    return validateData(schema, __assign(__assign({}, opts), { target: 'body' }));
};
exports.validateBody = validateBody;
var validateQuery = function (schema, opts) {
    return validateData(schema, __assign(__assign({}, opts), { target: 'query' }));
};
exports.validateQuery = validateQuery;
var validateParams = function (schema, opts) {
    return validateData(schema, __assign(__assign({}, opts), { target: 'params' }));
};
exports.validateParams = validateParams;
