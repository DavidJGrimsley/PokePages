# Plesk Deployment

_Disclaimer: Plesk is serving the **static web export** of the Expo app, not running the Expo app/SSR. Expo Router SSR has not been made to work on Plesk yet._

## Static Web (primary pokepages.app)
- Build: `npx expo export -p web` (produces `dist/`).
- Deploy: drag-and-drop contents of `dist/` into `/httpdocs` in Plesk File Manager (or `rsync`/SFTP if preferred).
- Keep `sitemap.xml`, `robots.txt`, `service-worker.js` in `/httpdocs` with the static site.
- Cache busting: exports include hashed assets; no extra step needed. If you see stale assets, clear the Plesk caching layer/CDN if enabled.
- Rollback: keep dated `dist` zips; re-upload prior archive if needed.

## API / Node.js (subdomain api.pokepages.app)
- Host path: `/server` on the subdomain.
- Runtime: Node 22.x (per Plesk UI); package manager `npm`.
- Start file: `api-server.js`; start scripts also available (`start-api-server.bat/.sh`).
- Deploy flow:
  1) Run `./scripts/build-api-server-win.ps1` locally (or your preferred build) to produce the `api-server/` folder.
  2) Upload the built `api-server/` contents (package.json, start scripts, compiled JS, env) into `/server`.
  3) In Plesk Node.js screen: set Document Root `/server`, Application Root `/server`, Startup File `api-server.js`.
  4) Install prod deps: use **NPM install** in Plesk (or upload `node_modules` from CI if faster/locked-down).
  5) Restart app from the Plesk Node.js dashboard.
- Env: keep `.env` or `api-server.env` alongside the server files; Plesk custom environment variables can override.
- Logs: `/logs` for Plesk domain logs; app-level logs can be emitted to stdout/stderr (visible in Plesk) or to `/server/logs`.
- Backups: dated zip archives live in `/server` (e.g., `December15_2025.zip`) for quick rollback.

## Python APIs on Plesk (pattern reference)
- Host path: `/home/deployer/[repo-name]` (outside `httpdocs`).
- Service: run Python app there; expose via its local port (e.g., gunicorn/uvicorn/flask dev server).
- NGINX mapping: proxy requests like `domain.com/api/[api-name]/...` to that local port.
- Examples to mirror:
  - DavidsPortfolio: https://github.com/DavidJGrimsley/DavidsPortfolio
  - quantum-jam-2025-choose-your-own-adventure: https://github.com/ReneJSchwartz/quantum-jam-2025-choose-your-own-adventure
- Steps (summary):
  1) Deploy code to `/home/deployer/[repo]`, create venv, install deps.
  2) Run the Python server with systemd/supervisor (ensure it listens on localhost-only port).
  3) In Plesk/NGINX config, add a location block `location /api/[api-name]/ { proxy_pass http://127.0.0.1:PORT; }`.
  4) Reload/restart NGINX. Keep static site untouched in `/httpdocs`.

### NGINX Configuration Example (Flask/FastAPI)
Add this in **Plesk → Domains → [Your Domain] → Apache & nginx Settings → Additional nginx directives**:

```nginx
# USE THIS AS A TEMPLATE FOR WHAT TO COPY INTO PLESK "Additional nginx directives" FIELD
# For domain: YourDomain.com
# Location: Domains → YourDomain.com → Apache & nginx Settings → Additional nginx directives

# NOTE: /api and /api/quantum pages are served by your frontend website (Expo/React)
# Only proxy specific API endpoints and docs to the Flask/Python app

# Proxy API endpoints to the Flask app running locally
location ~ ^/api/quantum/(quantum_text|quantum_gate|quantum_echo_types|health)$ {
	proxy_pass http://127.0.0.1:8000;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
	proxy_set_header X-Forwarded-Port $server_port;
	# CORS is handled by Flask - don't add duplicate headers here
}

# Proxy Swagger UI to Flask app (exact match for priority)
location = /api/quantum/docs {
	proxy_pass http://127.0.0.1:8000/api/quantum/docs;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
}

# Proxy OpenAPI spec to Flask app (exact match for priority)
location = /api/quantum/openapi.yaml {
	proxy_pass http://127.0.0.1:8000/api/quantum/openapi.yaml;
	proxy_set_header Host $host;
	add_header Content-Type application/x-yaml;
}
```

**Key Points:**
- Use regex `location ~` for multiple endpoints under same path prefix
- Use exact match `location =` for specific resources (docs, openapi.yaml) to ensure priority
- Let the Python app handle CORS headers; don't duplicate in NGINX
- Replace `8000` with your actual local port
- Replace `/api/quantum/` pattern with your API namespace

## Operational Notes
- Static vs API separation: static site lives in `/httpdocs`; API runtime lives in `/server` (subdomain). Avoid mixing.
- SSR status: not supported yet on this Plesk setup; treat web as exported static.
- Deploy cadence: keep dated archives for both static exports and API builds for quick rollback.
- Health checks: ensure `/health` and `/health/test-db` stay reachable on the API; add simple uptime monitor hitting the subdomain.
  `   