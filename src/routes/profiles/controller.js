"use strict";
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
exports.deleteProfile = deleteProfile;
exports.searchProfiles = searchProfiles;
exports.getAllProfiles = getAllProfiles;
var profilesQueries_js_1 = require("../../db/profilesQueries.js");
// Get profile by ID
function getProfile(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, profile, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.params.userId;
                    return [4 /*yield*/, (0, profilesQueries_js_1.getProfile)(userId)];
                case 1:
                    profile = _a.sent();
                    if (!profile) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                error: 'Profile not found',
                            })];
                    }
                    res.json({ success: true, data: profile });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching profile:', error_1);
                    res.status(500).json({
                        success: false,
                        error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Get profile by username
function getProfileByUsername(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var username, profile, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    username = req.params.username;
                    return [4 /*yield*/, (0, profilesQueries_js_1.getProfileByUsername)(username)];
                case 1:
                    profile = _a.sent();
                    if (!profile) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                error: 'Profile not found',
                            })];
                    }
                    res.json({ success: true, data: profile });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching profile by username:', error_2);
                    res.status(500).json({
                        success: false,
                        error: error_2 instanceof Error ? error_2.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Create a new profile
function createProfile(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var profileData, newProfile, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    profileData = req.validated;
                    return [4 /*yield*/, (0, profilesQueries_js_1.createProfile)(profileData)];
                case 1:
                    newProfile = _a.sent();
                    res.status(201).json({ success: true, data: newProfile });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error creating profile:', error_3);
                    res.status(500).json({
                        success: false,
                        error: error_3 instanceof Error ? error_3.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Update a profile
function updateProfile(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, updates, updatedProfile, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.params.userId;
                    updates = req.validated;
                    return [4 /*yield*/, (0, profilesQueries_js_1.updateProfile)(userId, updates)];
                case 1:
                    updatedProfile = _a.sent();
                    if (!updatedProfile) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                error: 'Profile not found',
                            })];
                    }
                    res.json({ success: true, data: updatedProfile });
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error updating profile:', error_4);
                    res.status(500).json({
                        success: false,
                        error: error_4 instanceof Error ? error_4.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Delete a profile
function deleteProfile(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, deleted, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userId = req.params.userId;
                    return [4 /*yield*/, (0, profilesQueries_js_1.deleteProfile)(userId)];
                case 1:
                    deleted = _a.sent();
                    if (!deleted) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                error: 'Profile not found',
                            })];
                    }
                    res.json({ success: true, message: 'Profile deleted successfully' });
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error deleting profile:', error_5);
                    res.status(500).json({
                        success: false,
                        error: error_5 instanceof Error ? error_5.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Search profiles by username
function searchProfiles(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, query, _b, limit, profiles, error_6;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    _a = req.query, query = _a.q, _b = _a.limit, limit = _b === void 0 ? '20' : _b;
                    if (!query || typeof query !== 'string') {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                error: 'Query parameter "q" is required',
                            })];
                    }
                    return [4 /*yield*/, (0, profilesQueries_js_1.searchProfilesByUsername)(query, parseInt(limit))];
                case 1:
                    profiles = _c.sent();
                    res.json({ success: true, data: profiles });
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _c.sent();
                    console.error('Error searching profiles:', error_6);
                    res.status(500).json({
                        success: false,
                        error: error_6 instanceof Error ? error_6.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Get all profiles (admin endpoint)
function getAllProfiles(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, limit, _c, offset, profiles, error_7;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    _a = req.query, _b = _a.limit, limit = _b === void 0 ? '100' : _b, _c = _a.offset, offset = _c === void 0 ? '0' : _c;
                    return [4 /*yield*/, (0, profilesQueries_js_1.getAllProfiles)(parseInt(limit), parseInt(offset))];
                case 1:
                    profiles = _d.sent();
                    res.json({ success: true, data: profiles });
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _d.sent();
                    console.error('Error fetching all profiles:', error_7);
                    res.status(500).json({
                        success: false,
                        error: error_7 instanceof Error ? error_7.message : 'Unknown error',
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
