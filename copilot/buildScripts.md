# Build & Export Scripts

## Sitemap Generation
- Entry: `scripts/generateSitemap.ts` (copied to [copilot/files/generateSitemap.ts](files/generateSitemap.ts)).
- Flow:
  - Runs `npx expo export -p web` (respects `dist/` output if present).
  - Reads `dist/server/app/+html.js` for Expo Router static paths, filters out dynamic or disabled routes, and applies optional extra routes.
  - Excludes patterns: `_sitemap`, `_not-found`, `_layout`, `/api/`, `/ai/`, `/dex-tracker/`, `/fave`, `/profile`, `/settings`, `/app-events`, `/map`.
  - Assigns `priority`/`changefreq` per route map, writes `public/sitemap.xml`, then copies to `dist/sitemap.xml` when `dist` exists.
- Run locally: `npx ts-node scripts/generateSitemap.ts` (ensure `expo export` available). After running, deploy `dist/` so the generated sitemap ships with the web build.

## API Server Build (Windows PowerShell)
- Entry: `scripts/build-api-server-win.ps1` (copied to [copilot/files/build-api-server-win.ps1](files/build-api-server-win.ps1)).
- Flow:
  - Cleans `api-server/` dir, recreates structure.
  - Runs `tsc -p tsconfig.api-server.json` into `api-server/`.
  - Copies `api-server/package.json`, `start-api-server.bat/.sh`, `api-server.ts`, and optional `.env`/`.env.prod` into `api-server/`.
- Run: `pwsh -File scripts/build-api-server-win.ps1` (from repo root). Add `-Env prod` to copy `.env.prod` instead of `.env`.
- Start built server: `cd api-server && npm install --omit=dev && npm run start`.

## Server Runtime Practices (api-server.ts highlights)
- Normalizes paths to lowercase and strips trailing slashes before routing.
- CORS with explicit allowlist; responds early on `OPTIONS`.
- Health endpoints: `/health` (static) and `/health/test-db` (DB connectivity check).
- Graceful shutdown on `SIGINT`/`SIGTERM` with HTTP server close.
- Optional debug endpoint guarded by env flag; logs include boot duration and request timing metrics.
