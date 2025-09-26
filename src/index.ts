import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { 
  getEventCounters, 
  getEventCounter, 
  incrementEventCounter,
  getUserParticipation,
  getEventStats
} from '~/db/queries';

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
app.get('/api/events', async (req, res) => {
  try {
    const events = await getEventCounters();
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/api/events/:eventKey', async (req, res) => {
  try {
    const { eventKey } = req.params;
    const event = await getEventCounter(eventKey);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        error: 'Event not found' 
      });
    }
    
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.post('/api/events/:eventKey/increment', async (req, res) => {
  try {
    const { eventKey } = req.params;
    const { userId, anonymousId } = req.body;

    if (!userId && !anonymousId) {
      return res.status(400).json({
        success: false,
        error: 'Either userId or anonymousId is required'
      });
    }

    const result = await incrementEventCounter(eventKey, userId, anonymousId);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error incrementing counter:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/api/events/:eventKey/participation/:userId', async (req, res) => {
  try {
    const { eventKey, userId } = req.params;
    const participation = await getUserParticipation(eventKey, userId);
    
    res.json({ success: true, data: participation });
  } catch (error) {
    console.error('Error fetching participation:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/api/events/:eventKey/stats', async (req, res) => {
  try {
    const { eventKey } = req.params;
    const stats = await getEventStats(eventKey);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

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
  console.log(`🎮 API endpoints: http://localhost:${port}/api/events`);
});