import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import eventRouter from '~/routes/events';
import aiRouter from '~/routes/AI'; 

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 PokePages Drizzle API Server',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Event Counter Routes
app.use('/api/events', eventRouter);

// AI Routes
app.use('/api/ai', aiRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

app.listen(port, () => {
  console.log(`🚀 PokePages Drizzle API server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}`);
  console.log(`🎮 API endpoints:`);
  console.log(`   Events: http://localhost:${port}/api/events`);
  console.log(`   AI: http://localhost:${port}/api/ai`);
});