"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
exports.getProfile = getProfile;
exports.getProfileByUsername = getProfileByUsername;
exports.createProfile = createProfile;
exports.updateProfile = updateProfile;
exports.upsertProfile = upsertProfile;
exports.deleteProfile = deleteProfile;
exports.searchProfilesByUsername = searchProfilesByUsername;
exports.getAllProfiles = getAllProfiles;
var drizzle_orm_1 = require("drizzle-orm");
var index_js_1 = require("./index.js");
var profilesSchema_js_1 = require("./profilesSchema.js");
// Get profile by user ID
function getProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(profilesSchema_js_1.profiles)
                            .where((0, drizzle_orm_1.eq)(profilesSchema_js_1.profiles.id, userId))];
                case 1:
                    profile = (_a.sent())[0];
                    return [2 /*return*/, profile || null];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching profile:', error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Get profile by username
function getProfileByUsername(username) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(profilesSchema_js_1.profiles)
                            .where((0, drizzle_orm_1.eq)(profilesSchema_js_1.profiles.username, username))];
                case 1:
                    profile = (_a.sent())[0];
                    return [2 /*return*/, profile || null];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching profile by username:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Create a new profile
function createProfile(profileData) {
    return __awaiter(this, void 0, void 0, function () {
        var newProfile, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .insert(profilesSchema_js_1.profiles)
                            .values(__assign(__assign({}, profileData), { updatedAt: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["NOW()"], ["NOW()"]))), createdAt: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["NOW()"], ["NOW()"]))) }))
                            .returning()];
                case 1:
                    newProfile = (_a.sent())[0];
                    return [2 /*return*/, newProfile];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error creating profile:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Update profile
function updateProfile(userId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var updatedProfile, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .update(profilesSchema_js_1.profiles)
                            .set(__assign(__assign({}, updates), { updatedAt: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["NOW()"], ["NOW()"]))) }))
                            .where((0, drizzle_orm_1.eq)(profilesSchema_js_1.profiles.id, userId))
                            .returning()];
                case 1:
                    updatedProfile = (_a.sent())[0];
                    return [2 /*return*/, updatedProfile || null];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error updating profile:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Upsert profile (insert or update)
function upsertProfile(profileData) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .insert(profilesSchema_js_1.profiles)
                            .values(__assign(__assign({}, profileData), { updatedAt: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["NOW()"], ["NOW()"]))), createdAt: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["NOW()"], ["NOW()"]))) }))
                            .onConflictDoUpdate({
                            target: profilesSchema_js_1.profiles.id,
                            set: {
                                username: profileData.username,
                                birthdate: profileData.birthdate,
                                avatarUrl: profileData.avatarUrl,
                                bio: profileData.bio,
                                updatedAt: (0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["NOW()"], ["NOW()"]))),
                            },
                        })
                            .returning()];
                case 1:
                    profile = (_a.sent())[0];
                    return [2 /*return*/, profile];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error upserting profile:', error_5);
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Delete profile
function deleteProfile(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .delete(profilesSchema_js_1.profiles)
                            .where((0, drizzle_orm_1.eq)(profilesSchema_js_1.profiles.id, userId))
                            .returning()];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.length > 0];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error deleting profile:', error_6);
                    throw error_6;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Search profiles by username (for user discovery)
function searchProfilesByUsername(query_1) {
    return __awaiter(this, arguments, void 0, function (query, limit) {
        var searchResults, error_7;
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(profilesSchema_js_1.profiles)
                            .where((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", " ILIKE ", ""], ["", " ILIKE ", ""])), profilesSchema_js_1.profiles.username, '%' + query + '%'))
                            .limit(limit)];
                case 1:
                    searchResults = _a.sent();
                    return [2 /*return*/, searchResults];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error searching profiles:', error_7);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Get all profiles (for admin purposes - use with caution)
function getAllProfiles() {
    return __awaiter(this, arguments, void 0, function (limit, offset) {
        var allProfiles, error_8;
        if (limit === void 0) { limit = 100; }
        if (offset === void 0) { offset = 0; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, index_js_1.db
                            .select()
                            .from(profilesSchema_js_1.profiles)
                            .limit(limit)
                            .offset(offset)
                            .orderBy(profilesSchema_js_1.profiles.createdAt)];
                case 1:
                    allProfiles = _a.sent();
                    return [2 /*return*/, allProfiles];
                case 2:
                    error_8 = _a.sent();
                    console.error('Error fetching all profiles:', error_8);
                    throw error_8;
                case 3: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
