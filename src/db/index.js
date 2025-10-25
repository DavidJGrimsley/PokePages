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
exports.db = exports.client = void 0;
require("dotenv/config");
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
var profilesSchema = require("./profilesSchema.js");
var eventsSchema = require("./eventsSchema.js");
var legends-zaTrackerSchema = require("./legends-zaTrackerSchema.js");
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}
var connectionString = process.env.DATABASE_URL;
// use prepare: false for Supabase pooler Transaction mode
exports.client = (0, postgres_1.default)(connectionString, {
    prepare: false,
    ssl: 'require'
});
// Merge schemas so drizzle has the full set of tables
exports.db = (0, postgres_js_1.drizzle)(exports.client, { schema: __assign(__assign(__assign({}, profilesSchema), eventsSchema), legends-zaTrackerSchema) });
