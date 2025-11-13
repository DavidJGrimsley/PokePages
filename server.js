// PokePages SSR Server for VPS Deployment
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist/client folder
app.use('/_expo', express.static(path.join(process.cwd(), 'dist/client/_expo')));
app.use('/assets', express.static(path.join(process.cwd(), 'dist/client/assets')));

// For all other routes, use the SSR handler
const { createRequestHandler } = require('./dist/server/_expo/functions/[...slug]+api');

app.all('*', createRequestHandler());

app.listen(PORT, () => {
  console.log(`🚀 PokePages SSR server running on http://localhost:${PORT}`);
  console.log(`📍 Visit https://pokepages.app to see it live`);
});
