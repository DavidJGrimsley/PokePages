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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPokemonTrackerData = getUserPokemonTrackerData;
exports.getUserPokemonRecord = getUserPokemonRecord;
exports.upsertPokemonRecord = upsertPokemonRecord;
exports.updatePokemonForm = updatePokemonForm;
exports.batchUpdatePokemonRecords = batchUpdatePokemonRecords;
exports.deletePokemonRecord = deletePokemonRecord;
exports.getUserPokemonStats = getUserPokemonStats;
var drizzle_orm_1 = require("drizzle-orm");
var index_js_1 = require("./index.js");
var legendsZATrackerSchema_js_1 = require("./legendsZATrackerSchema.js");
/**
 * Get all Pokemon tracker records for a user
 */
function getUserPokemonTrackerData(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(legendsZATrackerSchema_js_1.legendsZATracker)
                            .where((0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.userId, userId))];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching user Pokemon tracker data:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get specific Pokemon tracker record for a user
 */
function getUserPokemonRecord(userId, pokemonId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(legendsZATrackerSchema_js_1.legendsZATracker)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.userId, userId), (0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.pokemonId, pokemonId)))
                            .limit(1)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result[0] || null];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching Pokemon record:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Upsert Pokemon tracker record (insert or update)
 */
function upsertPokemonRecord(userId, pokemonId, formData) {
    return __awaiter(this, void 0, void 0, function () {
        var existingRecord, result, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getUserPokemonRecord(userId, pokemonId)];
                case 1:
                    existingRecord = _a.sent();
                    if (!existingRecord) return [3 /*break*/, 3];
                    return [4 /*yield*/, index_js_1.db
                            .update(legendsZATrackerSchema_js_1.legendsZATracker)
                            .set(__assign(__assign({}, formData), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.userId, userId), (0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.pokemonId, pokemonId)))
                            .returning()];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result[0]];
                case 3: return [4 /*yield*/, index_js_1.db
                        .insert(legendsZATrackerSchema_js_1.legendsZATracker)
                        .values(__assign({ userId: userId, pokemonId: pokemonId }, formData))
                        .returning()];
                case 4:
                    result = _a.sent();
                    return [2 /*return*/, result[0]];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error upserting Pokemon record:', error_3);
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update specific form for a Pokemon
 */
function updatePokemonForm(userId, pokemonId, formType, value) {
    return __awaiter(this, void 0, void 0, function () {
        var currentRecord, defaultFormData, updatedFormData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getUserPokemonRecord(userId, pokemonId)];
                case 1:
                    currentRecord = _a.sent();
                    if (!!currentRecord) return [3 /*break*/, 3];
                    defaultFormData = {
                        normal: false,
                        shiny: false,
                        alpha: false,
                        alphaShiny: false,
                    };
                    defaultFormData[formType] = value;
                    return [4 /*yield*/, upsertPokemonRecord(userId, pokemonId, defaultFormData)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    updatedFormData = {
                        normal: currentRecord.normal,
                        shiny: currentRecord.shiny,
                        alpha: currentRecord.alpha,
                        alphaShiny: currentRecord.alphaShiny,
                    };
                    updatedFormData[formType] = value;
                    // Apply auto-registration logic: if any special form is true, set normal to true
                    if (formType !== 'normal' && value === true) {
                        updatedFormData.normal = true;
                    }
                    return [4 /*yield*/, upsertPokemonRecord(userId, pokemonId, updatedFormData)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    error_4 = _a.sent();
                    console.error('Error updating Pokemon form:', error_4);
                    throw error_4;
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Batch update multiple Pokemon records
 */
function batchUpdatePokemonRecords(userId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var results, _i, updates_1, update, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    results = [];
                    _i = 0, updates_1 = updates;
                    _a.label = 1;
                case 1:
                    if (!(_i < updates_1.length)) return [3 /*break*/, 4];
                    update = updates_1[_i];
                    return [4 /*yield*/, upsertPokemonRecord(userId, update.pokemonId, update.formData)];
                case 2:
                    result = _a.sent();
                    results.push(result);
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, results];
                case 5:
                    error_5 = _a.sent();
                    console.error('Error batch updating Pokemon records:', error_5);
                    throw error_5;
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Delete specific Pokemon tracker record
 */
function deletePokemonRecord(userId, pokemonId) {
    return __awaiter(this, void 0, void 0, function () {
        var error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .delete(legendsZATrackerSchema_js_1.legendsZATracker)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.userId, userId), (0, drizzle_orm_1.eq)(legendsZATrackerSchema_js_1.legendsZATracker.pokemonId, pokemonId)))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error deleting Pokemon record:', error_6);
                    throw error_6;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get Pokemon tracker statistics for a user
 */
function getUserPokemonStats(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var records, stats_1, totalPokemon, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getUserPokemonTrackerData(userId)];
                case 1:
                    records = _a.sent();
                    stats_1 = {
                        totalRegistered: 0,
                        totalShiny: 0,
                        totalAlpha: 0,
                        totalAlphaShiny: 0,
                        totalUnique: records.length,
                        registeredPercent: 0,
                        shinyPercent: 0,
                        alphaPercent: 0,
                        alphaShinyPercent: 0,
                    };
                    records.forEach(function (record) {
                        if (record.normal)
                            stats_1.totalRegistered++;
                        if (record.shiny)
                            stats_1.totalShiny++;
                        if (record.alpha)
                            stats_1.totalAlpha++;
                        if (record.alphaShiny)
                            stats_1.totalAlphaShiny++;
                    });
                    totalPokemon = 235;
                    stats_1.registeredPercent = Math.round((stats_1.totalRegistered / totalPokemon) * 100);
                    stats_1.shinyPercent = Math.round((stats_1.totalShiny / totalPokemon) * 100);
                    stats_1.alphaPercent = Math.round((stats_1.totalAlpha / totalPokemon) * 100);
                    stats_1.alphaShinyPercent = Math.round((stats_1.totalAlphaShiny / totalPokemon) * 100);
                    return [2 /*return*/, stats_1];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error getting Pokemon stats:', error_7);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    });
}
