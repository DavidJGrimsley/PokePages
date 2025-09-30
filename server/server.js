import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import eventRouter from './src/routes/events/index.js';
import aiRouter from './src/routes/AI/index.js';
import profileRouter from './src/routes/profiles/index.js';
const app = express();
const port = Number(process.env.PORT) || 3001;
app.use(cors({
    origin: ['https://pokepages.app', 'http://localhost:8081', 'http://localhost:19006'],
    credentials: true
}));
app.use(express.json());
app.get('/', (req, res) => {
    res.json({
        message: '🎮 PokePages Drizzle API Server',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
app.use('/events', eventRouter);
app.use('/ai', aiRouter);
app.use('/profiles', profileRouter);
app.get('/test', (req, res) => {
    res.json({ message: 'API is working!' });
});
app.get('/test-db', async (req, res) => {
    try {
        const { db } = await import('./src/db/index.js');
        const result = await db.execute('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Database connection working!',
            result: result
        });
    }
    catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            type: error instanceof Error ? error.constructor.name : 'Unknown'
        });
    }
});
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'DJ server error'
    });
});
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 PokePages Drizzle API server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}`);
    console.log(`🎮 API endpoints:`);
    console.log(`   Events: http://localhost:${port}/events`);
    console.log(`   AI: http://localhost:${port}/ai`);
    console.log(`   Profiles: http://localhost:${port}/profiles`);
});
