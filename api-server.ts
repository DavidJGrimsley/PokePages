import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { envPresence, isDotEnvPresent, formatMemoryUsage, formatUptime } from './src/utils/diagnostics.js';
import eventRouter from './src/routes/events/index.js';
import eventClaimsRouter from './src/routes/eventClaims/index.js';
import aiRouter from './src/routes/AI/index.js';
import profileRouter from './src/routes/profiles/index.js';
import dexTrackerRouter from './src/routes/dexTracker/index.js';
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Track last unhandled exception for diagnostics
let lastUnhandledException: any = null;

// Early startup diagnostics (safe, non-secret)
try {
  console.log('📡 Startup diagnostics - Node:', process.version, 'PID:', process.pid);
  console.log('🔐 DATABASE_URL:', envPresence('DATABASE_URL'));
  console.log('🔐 SUPABASE_URL:', envPresence('SUPABASE_URL'));
  console.log('💾 .env file found:', isDotEnvPresent());
} catch (d) {
  console.warn('Error in startup diagnostics:', d);
}

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
app.use('/events', eventRouter);

// Event Claims Routes (for tera raids, mystery gifts, promo codes)
app.use('/event-claims', eventClaimsRouter);

// AI Routes
app.use('/ai', aiRouter);

// Profile Routes
app.use('/profiles', profileRouter);

// Dex Tracker Routes (multi-pokedex support)
app.use('/dex-tracker', dexTrackerRouter);

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
  console.log('[DEBUG] test-db route: Testing database connection...');
  try {
    const { getDbPing } = await import('./src/db/index.js');
    const result = await getDbPing();
    if (result.ok) {
      console.log('[DEBUG] test-db route: Database ping successful');
      res.json({ success: true, message: 'Database connection working!', result: result.result });
    } else {
      console.error('[ERROR] test-db route: Database ping failed:', result.error);
      res.status(500).json({ success: false, message: 'Database ping failed', error: result.error });
    }
  } catch (error) {
    console.error('[ERROR] test-db route: Exception caught:', error);
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
  console.log(`   Dex Tracker: ${apiBaseUrl}/dex-tracker?pokedex=lumiose`);
  console.log(`   Social: ${apiBaseUrl}/social`);
  console.log(`   Favorites: ${apiBaseUrl}/favorites`);
  console.log(`   Event Claims: ${apiBaseUrl}/event-claims`);
  console.log('dexTrackerRouter router loaded:', typeof dexTrackerRouter);
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
  lastUnhandledException = { type: 'uncaughtException', error: { message: error?.message, stack: error?.stack }, timestamp: new Date().toISOString() };
  console.error('UNCAUGHT EXCEPTION:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  lastUnhandledException = { type: 'unhandledRejection', reason, promise, timestamp: new Date().toISOString() };
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Keep basic 'warning' handler to log Node warnings (non-fatal)
process.on('warning', (warning) => {
  console.warn('NODE WARNING', { name: warning.name, message: warning.message, stack: warning.stack });
});

// 'exit' logs - note exit code
process.on('exit', (code) => {
  console.log('Process exit event with code:', code);
});

// Optional runtime metrics logging (enabled with ENABLE_RUNTIME_METRICS)
if (process.env.ENABLE_RUNTIME_METRICS === 'true') {
  const intervalMs = Number(process.env.RUNTIME_METRICS_INTERVAL_MS || 60000);
  setInterval(() => {
    try {
      console.log('Runtime Metrics:', { memory: formatMemoryUsage(), uptime: formatUptime() });
    } catch (e) {
      console.warn('Error logging runtime metrics:', e);
    }
  }, intervalMs);
}

// Debug status endpoint, opt-in via env var
if (process.env.ENABLE_DEBUG_ENDPOINT === 'true') {
  app.get('/debug/status', async (req, res) => {
    const mem = formatMemoryUsage();
    const uptime = formatUptime();
    let dbPing = { success: null as null | boolean, error: null as string | null };
    try {
      const { getDbPing } = await import('./src/db/index.js');
      const response = await getDbPing();
      dbPing = { success: response.ok === true, error: response.ok ? null : (response.error ?? null) };
    } catch (e: any) {
      dbPing = { success: false, error: e?.message || String(e) };
    }

    res.json({
      node: process.version,
      pid: process.pid,
      uptime,
      memory: mem,
      envs: {
        DATABASE_URL: envPresence('DATABASE_URL'),
        SUPABASE_URL: envPresence('SUPABASE_URL'),
      },
      dbPing,
      lastUnhandledException: lastUnhandledException ? String(lastUnhandledException) : undefined,
    });
  });
}