import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import eventRouter from './src/routes/events/index.js';
import aiRouter from './src/routes/AI/index.js';
import profileRouter from './src/routes/profiles/index.js';
import legendsZARouter from './src/routes/legends-za/index.js';
import socialRouter from './src/routes/social/index.js';
import favoritesRouter from './src/routes/favorites/index.js';

const app = express();
const port = Number(process.env.PORT) || 3001;
// For display purposes
const apiBaseUrl = `http://localhost:${port}`;

// Track server instance for graceful shutdown
let server: any;

// Ensure trailing slashes do not cause different routing
// (Express default is non-strict, but set explicitly for clarity)
app.set('strict routing', false);

// Middleware to convert path to lowercase (preserve query params)
app.use((req, res, next) => {
  const [path, query] = req.url.split('?');
  req.url = query ? `${path.toLowerCase()}?${query}` : path.toLowerCase();
  next();
});

// Middleware to remove trailing slashes
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const newPath = req.path.slice(0, -1);
    req.url = newPath + req.url.substring(req.path.length);
  }
  next();
});

// Middleware
app.use(cors({
  origin: [
    'https://pokepages.app',
    'http://localhost:8081',
    'http://localhost:3000',
    'http://localhost:8082',
    'http://localhost:19006',
    'http://10.0.2.2:8081', // Android emulator
    'http://10.0.2.2:19006', // Android emulator
  ],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    message: '🎮 PokePages Drizzle API Server',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Event Counter Routes
app.use('/events', (req, res, next) => {
  console.log(`[EVENTS DEBUG] ${req.method} ${req.originalUrl} | Path: ${req.path} | BaseUrl: ${req.baseUrl}`);
  next();
});

// Event Counter Routes
app.use('/events', eventRouter);

// AI Routes
app.use('/ai', aiRouter);

// Profile Routes
app.use('/profiles', profileRouter);

// Legends Z-A Dex & Form Tracker Routes
app.use('/legends-za', legendsZARouter);

// Social Routes
app.use('/social', socialRouter);

// Favorite Features Routes
app.use('/favorites', favoritesRouter);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Database connection test
app.get('/test-db', async (req, res) => {
  try {
    const { db } = await import('./src/db/index.js');
    const result = await db.execute('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection working!',
      result: result,
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
    });
  }
});

// Error handling middleware (must be after all routes)
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      error: 'Poké Pages Server error occurred',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Start server
server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 PokePages Drizzle API server running on port ${port}`);
  console.log(`📊 Health check: ${apiBaseUrl}/test`);
  console.log(`📊 DB Connection Health check: ${apiBaseUrl}/test-db`);
  console.log(`🎮 API endpoints:`);
  console.log(`   Events: ${apiBaseUrl}/events`);
  console.log(`   AI: ${apiBaseUrl}/ai`);
  console.log(`   Profiles: ${apiBaseUrl}/profiles`);
  console.log(`   Legends Z-A Tracker: ${apiBaseUrl}/legends-za`);
  console.log(`   Social: ${apiBaseUrl}/social`);
  console.log('legendsZARouter router loaded:', typeof legendsZARouter);
  console.log('socialRouter router loaded:', typeof socialRouter);
});

// ====== GRACEFUL SHUTDOWN HANDLERS ======
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // Close database connections
      const { client } = await import('./src/db/index.js');
      await client.end({ timeout: 5 });
      console.log('Database connections closed');
      
      console.log('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});