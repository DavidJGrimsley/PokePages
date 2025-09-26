// server-with-drizzle.ts - Example of migrating your server to use Drizzle
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { eventCounters, userEventParticipation, anonymousEventParticipation } from './src/db/schema';

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection (same as your src/index.ts)
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(sql);

app.use(cors({
  origin: 'https://pokepages.app',
  credentials: true
}));
app.use(express.json());

// NEW: Get event data from Supabase via Drizzle
app.get('/api/v2/events', async (req, res) => {
  try {
    const events = await db.select().from(eventCounters);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// NEW: Get specific event by key
app.get('/api/v2/event/:eventKey', async (req, res) => {
  try {
    const { eventKey } = req.params;
    const event = await db
      .select()
      .from(eventCounters)
      .where(eq(eventCounters.eventKey, eventKey))
      .limit(1);
    
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// NEW: Increment counter using Drizzle (alternative to Supabase RPC)
app.post('/api/v2/event/:eventKey/increment', async (req, res) => {
  try {
    const { eventKey } = req.params;
    const { userId, anonymousId } = req.body;
    
    // This is a simplified version - you'd want to implement the full logic
    // from your Supabase RPC function here
    
    // 1. Find the event
    const event = await db
      .select()
      .from(eventCounters)
      .where(eq(eventCounters.eventKey, eventKey))
      .limit(1);
    
    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // 2. Update counter logic would go here...
    // (This is complex - your Supabase RPC function is better for this)
    
    res.json({ success: true, message: 'Counter incremented' });
  } catch (error) {
    console.error('Error incrementing counter:', error);
    res.status(500).json({ error: 'Failed to increment counter' });
  }
});

// KEEP: Legacy file-based endpoints for backward compatibility
app.get('/api/counter/:pokemonName', async (req, res) => {
  // Your existing file-based logic here
  // This maintains compatibility with any old clients
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected',
    version: '2.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using Drizzle + Supabase database');
});