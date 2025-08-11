const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __dirname = path.dirname(require.main.filename);

app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Data directory for storing counter files
const DATA_DIR = path.join(__dirname, 'data');

// Initialize data directory
async function initializeDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (_error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created');
  }
}

// Get counter file path for a specific pokemon
function getCounterFilePath(pokemonName) {
  const sanitizedName = pokemonName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return path.join(DATA_DIR, `${sanitizedName}_counter.json`);
}

// Initialize counter file for a pokemon if it doesn't exist
async function initializePokemonCounter(pokemonName) {
  const counterFile = getCounterFilePath(pokemonName);
  try {
    await fs.access(counterFile);
  } catch (_error) {
    // File doesn't exist, create it
    const initialData = {
      pokemonName: pokemonName,
      count: 0,
      players: {},
      lastUpdated: new Date().toISOString(),
      created: new Date().toISOString()
    };
    await fs.writeFile(counterFile, JSON.stringify(initialData, null, 2));
    console.log(`Counter file initialized for ${pokemonName}`);
  }
}

// Get current count for a pokemon
app.get('/api/counter/:pokemonName', async (req, res) => {
  try {
    const { pokemonName } = req.params;
    await initializePokemonCounter(pokemonName);
    
    const counterFile = getCounterFilePath(pokemonName);
    const data = await fs.readFile(counterFile, 'utf8');
    const counter = JSON.parse(data);
    
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      pokemonName: counter.pokemonName
    });
  } catch (error) {
    console.error('Error reading counter:', error);
    res.json({ 
      count: 0, 
      lastUpdated: new Date().toISOString(),
      pokemonName: req.params.pokemonName 
    });
  }
});

// Also handle without /api prefix
app.get('/counter/:pokemonName', async (req, res) => {
  try {
    const { pokemonName } = req.params;
    await initializePokemonCounter(pokemonName);
    
    const counterFile = getCounterFilePath(pokemonName);
    const data = await fs.readFile(counterFile, 'utf8');
    const counter = JSON.parse(data);
    
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      pokemonName: counter.pokemonName
    });
  } catch (error) {
    console.error('Error reading counter:', error);
    res.json({ 
      count: 0, 
      lastUpdated: new Date().toISOString(),
      pokemonName: req.params.pokemonName 
    });
  }
});

// Increment counter for a specific pokemon
app.post('/api/counter/:pokemonName/increment', async (req, res) => {
  try {
    const { pokemonName } = req.params;
    const { playerId } = req.body;
    
    await initializePokemonCounter(pokemonName);
    const counterFile = getCounterFilePath(pokemonName);
    
    let data;
    try {
      data = await fs.readFile(counterFile, 'utf8');
    } catch {
      data = JSON.stringify({
        pokemonName: pokemonName,
        count: 0,
        players: {},
        created: new Date().toISOString()
      });
    }
    
    const counter = JSON.parse(data);
    counter.count += 1;
    counter.lastUpdated = new Date().toISOString();
    counter.pokemonName = pokemonName;
    
    // Track individual player contributions
    if (!counter.players) {
      counter.players = {};
    }
    
    if (playerId) {
      counter.players[playerId] = (counter.players[playerId] || 0) + 1;
    }
    
    await fs.writeFile(counterFile, JSON.stringify(counter, null, 2));
    console.log(`${pokemonName} counter incremented to: ${counter.count}${playerId ? ` (Player ${playerId}: ${counter.players[playerId]})` : ''}`);
    
    // Return both global and player-specific counts
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      playerCount: playerId ? counter.players[playerId] : 0,
      pokemonName: pokemonName
    });
  } catch (error) {
    console.error('Error incrementing counter:', error);
    res.status(500).json({ error: 'Failed to increment counter' });
  }
});

// Also handle without /api prefix
app.post('/counter/:pokemonName/increment', async (req, res) => {
  try {
    const { pokemonName } = req.params;
    const { playerId } = req.body;
    
    await initializePokemonCounter(pokemonName);
    const counterFile = getCounterFilePath(pokemonName);
    
    let data;
    try {
      data = await fs.readFile(counterFile, 'utf8');
    } catch {
      data = JSON.stringify({
        pokemonName: pokemonName,
        count: 0,
        players: {},
        created: new Date().toISOString()
      });
    }
    
    const counter = JSON.parse(data);
    counter.count += 1;
    counter.lastUpdated = new Date().toISOString();
    counter.pokemonName = pokemonName;
    
    // Track individual player contributions
    if (!counter.players) {
      counter.players = {};
    }
    
    if (playerId) {
      counter.players[playerId] = (counter.players[playerId] || 0) + 1;
    }
    
    await fs.writeFile(counterFile, JSON.stringify(counter, null, 2));
    console.log(`${pokemonName} counter incremented to: ${counter.count}${playerId ? ` (Player ${playerId}: ${counter.players[playerId]})` : ''}`);
    
    // Return both global and player-specific counts
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      playerCount: playerId ? counter.players[playerId] : 0,
      pokemonName: pokemonName
    });
  } catch (error) {
    console.error('Error incrementing counter:', error);
    res.status(500).json({ error: 'Failed to increment counter' });
  }
});

// Get player-specific count for a pokemon
app.get('/api/counter/:pokemonName/player/:playerId', async (req, res) => {
  try {
    const { pokemonName, playerId } = req.params;
    await initializePokemonCounter(pokemonName);
    
    const counterFile = getCounterFilePath(pokemonName);
    const data = await fs.readFile(counterFile, 'utf8');
    const counter = JSON.parse(data);
    
    const playerCount = counter.players && counter.players[playerId] ? counter.players[playerId] : 0;
    
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      playerCount: playerCount,
      playerId: playerId,
      pokemonName: pokemonName
    });
  } catch (error) {
    console.error('Error reading player counter:', error);
    res.json({ 
      count: 0, 
      lastUpdated: new Date().toISOString(), 
      playerCount: 0, 
      playerId: req.params.playerId,
      pokemonName: req.params.pokemonName 
    });
  }
});

// Also handle without /api prefix
app.get('/counter/:pokemonName/player/:playerId', async (req, res) => {
  try {
    const { pokemonName, playerId } = req.params;
    await initializePokemonCounter(pokemonName);
    
    const counterFile = getCounterFilePath(pokemonName);
    const data = await fs.readFile(counterFile, 'utf8');
    const counter = JSON.parse(data);
    
    const playerCount = counter.players && counter.players[playerId] ? counter.players[playerId] : 0;
    
    res.json({
      count: counter.count,
      lastUpdated: counter.lastUpdated,
      playerCount: playerCount,
      playerId: playerId,
      pokemonName: pokemonName
    });
  } catch (error) {
    console.error('Error reading player counter:', error);
    res.json({ 
      count: 0, 
      lastUpdated: new Date().toISOString(), 
      playerCount: 0, 
      playerId: req.params.playerId,
      pokemonName: req.params.pokemonName 
    });
  }
});

// Get all pokemon counters (for admin/overview)
app.get('/api/counters', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const counterFiles = files.filter(file => file.endsWith('_counter.json'));
    
    const counters = [];
    for (const file of counterFiles) {
      try {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        const counter = JSON.parse(data);
        counters.push({
          pokemonName: counter.pokemonName,
          count: counter.count,
          lastUpdated: counter.lastUpdated,
          playerCount: Object.keys(counter.players || {}).length
        });
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
    
    res.json(counters);
  } catch (error) {
    console.error('Error reading counters:', error);
    res.json([]);
  }
});

// Also handle without /api prefix
app.get('/counters', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const counterFiles = files.filter(file => file.endsWith('_counter.json'));
    
    const counters = [];
    for (const file of counterFiles) {
      try {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        const counter = JSON.parse(data);
        counters.push({
          pokemonName: counter.pokemonName,
          count: counter.count,
          lastUpdated: counter.lastUpdated,
          playerCount: Object.keys(counter.players || {}).length
        });
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }
    
    res.json(counters);
  } catch (error) {
    console.error('Error reading counters:', error);
    res.json([]);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Also handle without /api prefix
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({ 
    message: 'POKEMON EVENT COUNTER API IS WORKING!', 
    timestamp: new Date().toISOString(),
    server: 'Express.js Multi-Pokemon Counter API',
    endpoints: [
      'GET /counter/:pokemonName',
      'POST /counter/:pokemonName/increment',
      'GET /counter/:pokemonName/player/:playerId',
      'GET /counters',
      'GET /health'
    ]
  });
});

// Serve React app for all other routes (must be last!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize and start server
initializeDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`Pokemon Event Counter server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Debug endpoint: http://localhost:${PORT}/debug`);
    console.log(`Example endpoints:`);
    console.log(`  GET http://localhost:${PORT}/counter/wo-chien`);
    console.log(`  POST http://localhost:${PORT}/counter/wo-chien/increment`);
    console.log(`  GET http://localhost:${PORT}/counter/wo-chien/player/player123`);
    console.log(`  GET http://localhost:${PORT}/counters`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
});
