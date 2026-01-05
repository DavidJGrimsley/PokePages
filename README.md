# PokePages
This is a Pokemon companion app.

## Project Structure

This project consists of two main components:

1. **Expo App** - React Native mobile/web application (TypeScript)
2. **API Server** - Express backend server (TypeScript)

## Build Process

### IMPORTANT: Never Edit JS Files Directly

**We NEVER edit `.js` files in this project.** All JS files are compiled output from TypeScript sources.

- Source files: `src/**/*.ts` and `src/**/*.tsx`
- Compiled output: `api-server/**/*.js` (generated, do not edit)

### Build Scripts

```bash
# Build API server from TypeScript
npm run build:api-server

# Build for production (includes sitemap generation)
npm run build:production

# Export Expo app for web
npm run deploy:build
```

### Development

```bash
# Start Expo app
npm start

# Start API server with hot reload
npm run server:dev
```

## External Dependencies

- **MCP Server**: Strategy guides fetched from `https://davidjgrimsley.com/mcp/mrdj-pokemon-mcp`
- **PokeAPI**: Pokemon data via `pokenode-ts`
- **OpenAI**: AI chat functionality