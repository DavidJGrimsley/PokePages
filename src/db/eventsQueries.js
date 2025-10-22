"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventCounters = getEventCounters;
exports.getEventCounter = getEventCounter;
exports.incrementEventCounter = incrementEventCounter;
exports.getUserParticipation = getUserParticipation;
exports.getAnonymousParticipation = getAnonymousParticipation;
exports.getEventStats = getEventStats;
var drizzle_orm_1 = require("drizzle-orm");
var index_js_1 = require("./index.js");
var eventsSchema_js_1 = require("./eventsSchema.js");
var profilesSchema_js_1 = require("./profilesSchema.js");
// Get all event counters
function getEventCounters() {
    return __awaiter(this, void 0, void 0, function () {
        var events, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db.select().from(eventsSchema_js_1.eventCounters).orderBy(eventsSchema_js_1.eventCounters.createdAt)];
                case 1:
                    events = _a.sent();
                    return [2 /*return*/, events];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching event counters:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Get a specific event counter by eventKey
function getEventCounter(eventKey) {
    return __awaiter(this, void 0, void 0, function () {
        var event_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(eventsSchema_js_1.eventCounters)
                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.eventCounters.eventKey, eventKey))];
                case 1:
                    event_1 = (_a.sent())[0];
                    return [2 /*return*/, event_1 || null];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching event counter:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Increment event counter and track user/anonymous participation
function incrementEventCounter(eventKey, userId, anonymousId) {
    return __awaiter(this, void 0, void 0, function () {
        var event_2, userContribution_1, result, error_3;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getEventCounter(eventKey)];
                case 1:
                    event_2 = _b.sent();
                    if (!event_2) {
                        throw new Error("Event not found: ".concat(eventKey));
                    }
                    userContribution_1 = 0;
                    return [4 /*yield*/, index_js_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var updatedEvent, existingParticipation, updated, created, existingAnonymous, updated, created;
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .update(eventsSchema_js_1.eventCounters)
                                            .set({
                                            totalCount: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), eventsSchema_js_1.eventCounters.totalCount),
                                            updatedAt: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["NOW()"], ["NOW()"])))
                                        })
                                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.eventCounters.eventKey, eventKey))
                                            .returning()];
                                    case 1:
                                        updatedEvent = (_e.sent())[0];
                                        if (!userId) return [3 /*break*/, 7];
                                        return [4 /*yield*/, tx
                                                .select()
                                                .from(eventsSchema_js_1.userEventParticipation)
                                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.eventId, event_2.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.userId, userId)))];
                                    case 2:
                                        existingParticipation = (_e.sent())[0];
                                        if (!existingParticipation) return [3 /*break*/, 4];
                                        return [4 /*yield*/, tx
                                                .update(eventsSchema_js_1.userEventParticipation)
                                                .set({
                                                contributionCount: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), eventsSchema_js_1.userEventParticipation.contributionCount),
                                                lastContributedAt: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["NOW()"], ["NOW()"]))),
                                                updatedAt: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["NOW()"], ["NOW()"])))
                                            })
                                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.eventId, event_2.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.userId, userId)))
                                                .returning()];
                                    case 3:
                                        updated = (_e.sent())[0];
                                        userContribution_1 = (_a = updated.contributionCount) !== null && _a !== void 0 ? _a : 0;
                                        return [3 /*break*/, 6];
                                    case 4: return [4 /*yield*/, tx
                                            .insert(eventsSchema_js_1.userEventParticipation)
                                            .values({
                                            eventId: event_2.id,
                                            userId: userId,
                                            contributionCount: 1,
                                            lastContributedAt: (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["NOW()"], ["NOW()"]))),
                                        })
                                            .returning()];
                                    case 5:
                                        created = (_e.sent())[0];
                                        userContribution_1 = (_b = created.contributionCount) !== null && _b !== void 0 ? _b : 1;
                                        _e.label = 6;
                                    case 6: return [3 /*break*/, 12];
                                    case 7:
                                        if (!anonymousId) return [3 /*break*/, 12];
                                        return [4 /*yield*/, tx
                                                .select()
                                                .from(eventsSchema_js_1.anonymousEventParticipation)
                                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.eventId, event_2.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.anonymousId, anonymousId)))];
                                    case 8:
                                        existingAnonymous = (_e.sent())[0];
                                        if (!existingAnonymous) return [3 /*break*/, 10];
                                        return [4 /*yield*/, tx
                                                .update(eventsSchema_js_1.anonymousEventParticipation)
                                                .set({
                                                contributionCount: (0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", " + 1"], ["", " + 1"])), eventsSchema_js_1.anonymousEventParticipation.contributionCount),
                                                lastContributedAt: (0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["NOW()"], ["NOW()"]))),
                                                updatedAt: (0, drizzle_orm_1.sql)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["NOW()"], ["NOW()"])))
                                            })
                                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.eventId, event_2.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.anonymousId, anonymousId)))
                                                .returning()];
                                    case 9:
                                        updated = (_e.sent())[0];
                                        userContribution_1 = (_c = updated.contributionCount) !== null && _c !== void 0 ? _c : 0;
                                        return [3 /*break*/, 12];
                                    case 10: return [4 /*yield*/, tx
                                            .insert(eventsSchema_js_1.anonymousEventParticipation)
                                            .values({
                                            eventId: event_2.id,
                                            anonymousId: anonymousId,
                                            contributionCount: 1,
                                            lastContributedAt: (0, drizzle_orm_1.sql)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["NOW()"], ["NOW()"]))),
                                        })
                                            .returning()];
                                    case 11:
                                        created = (_e.sent())[0];
                                        userContribution_1 = (_d = created.contributionCount) !== null && _d !== void 0 ? _d : 1;
                                        _e.label = 12;
                                    case 12: return [2 /*return*/, { updatedEvent: updatedEvent, userContribution: userContribution_1 }];
                                }
                            });
                        }); })];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, {
                            event: result.updatedEvent,
                            userContribution: result.userContribution,
                            totalContributions: (_a = result.updatedEvent.totalCount) !== null && _a !== void 0 ? _a : 0
                        }];
                case 3:
                    error_3 = _b.sent();
                    console.error('Error incrementing event counter:', error_3);
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get user participation for a specific event
function getUserParticipation(eventKey, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var event_3, participation, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getEventCounter(eventKey)];
                case 1:
                    event_3 = _a.sent();
                    if (!event_3) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(eventsSchema_js_1.userEventParticipation)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.eventId, event_3.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.userId, userId)))];
                case 2:
                    participation = (_a.sent())[0];
                    return [2 /*return*/, participation || null];
                case 3:
                    error_4 = _a.sent();
                    console.error('Error fetching user participation:', error_4);
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get anonymous participation for a specific event
function getAnonymousParticipation(eventKey, anonymousId) {
    return __awaiter(this, void 0, void 0, function () {
        var event_4, participation, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getEventCounter(eventKey)];
                case 1:
                    event_4 = _a.sent();
                    if (!event_4) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(eventsSchema_js_1.anonymousEventParticipation)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.eventId, event_4.id), (0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.anonymousId, anonymousId)))];
                case 2:
                    participation = (_a.sent())[0];
                    return [2 /*return*/, participation || null];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error fetching anonymous participation:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get comprehensive stats for an event
function getEventStats(eventKey) {
    return __awaiter(this, void 0, void 0, function () {
        var event_5, userCount, anonCount, topUsers, topAnonymous, topContributors, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, getEventCounter(eventKey)];
                case 1:
                    event_5 = _a.sent();
                    if (!event_5) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, index_js_1.db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(eventsSchema_js_1.userEventParticipation)
                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.eventId, event_5.id))];
                case 2:
                    userCount = (_a.sent())[0];
                    return [4 /*yield*/, index_js_1.db
                            .select({ count: (0, drizzle_orm_1.sql)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(eventsSchema_js_1.anonymousEventParticipation)
                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.eventId, event_5.id))];
                case 3:
                    anonCount = (_a.sent())[0];
                    return [4 /*yield*/, index_js_1.db
                            .select({
                            userId: eventsSchema_js_1.userEventParticipation.userId,
                            username: profilesSchema_js_1.profiles.username,
                            contributionCount: eventsSchema_js_1.userEventParticipation.contributionCount,
                        })
                            .from(eventsSchema_js_1.userEventParticipation)
                            .leftJoin(profilesSchema_js_1.profiles, (0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.userId, profilesSchema_js_1.profiles.id))
                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.userEventParticipation.eventId, event_5.id))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), eventsSchema_js_1.userEventParticipation.contributionCount))
                            .limit(10)];
                case 4:
                    topUsers = _a.sent();
                    return [4 /*yield*/, index_js_1.db
                            .select({
                            anonymousId: eventsSchema_js_1.anonymousEventParticipation.anonymousId,
                            contributionCount: eventsSchema_js_1.anonymousEventParticipation.contributionCount,
                        })
                            .from(eventsSchema_js_1.anonymousEventParticipation)
                            .where((0, drizzle_orm_1.eq)(eventsSchema_js_1.anonymousEventParticipation.eventId, event_5.id))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), eventsSchema_js_1.anonymousEventParticipation.contributionCount))
                            .limit(5)];
                case 5:
                    topAnonymous = _a.sent();
                    topContributors = __spreadArray(__spreadArray([], topUsers.map(function (user) {
                        var _a, _b;
                        return ({
                            userId: user.userId,
                            username: (_a = user.username) !== null && _a !== void 0 ? _a : undefined,
                            contributionCount: (_b = user.contributionCount) !== null && _b !== void 0 ? _b : 0,
                            isAnonymous: false
                        });
                    }), true), topAnonymous.map(function (anon) {
                        var _a;
                        return ({
                            anonymousId: anon.anonymousId,
                            contributionCount: (_a = anon.contributionCount) !== null && _a !== void 0 ? _a : 0,
                            isAnonymous: true
                        });
                    }), true).sort(function (a, b) { var _a, _b; return ((_a = b.contributionCount) !== null && _a !== void 0 ? _a : 0) - ((_b = a.contributionCount) !== null && _b !== void 0 ? _b : 0); }).slice(0, 10);
                    return [2 /*return*/, {
                            event: event_5,
                            totalParticipants: ((userCount === null || userCount === void 0 ? void 0 : userCount.count) || 0) + ((anonCount === null || anonCount === void 0 ? void 0 : anonCount.count) || 0),
                            registeredUsers: (userCount === null || userCount === void 0 ? void 0 : userCount.count) || 0,
                            anonymousUsers: (anonCount === null || anonCount === void 0 ? void 0 : anonCount.count) || 0,
                            topContributors: topContributors
                        }];
                case 6:
                    error_6 = _a.sent();
                    console.error('Error fetching event stats:', error_6);
                    throw error_6;
                case 7: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14;
