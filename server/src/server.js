"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const events_1 = __importDefault(require("./routes/events"));
const AI_1 = __importDefault(require("./routes/AI"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.json({
        message: '🎮 PokePages Drizzle API Server',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/events', events_1.default);
app.use('/api/ai', AI_1.default);
app.use('/api/profiles', profiles_1.default);
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'DJ server error'
    });
});
app.listen(port, () => {
    console.log(`🚀 PokePages Drizzle API server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}`);
    console.log(`🎮 API endpoints:`);
    console.log(`   Events: http://localhost:${port}/api/events`);
    console.log(`   AI: http://localhost:${port}/api/ai`);
    console.log(`   Profiles: http://localhost:${port}/api/profiles`);
});
