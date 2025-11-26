Build API Server (Windows) - README

This repository uses a dedicated PowerShell script to build the API server in Windows (`./scripts/build-api-server-win.ps1`).

Why this script exists
- The original `build:api-server` npm script was a long inline command that executed TypeScript compilation and copied production-only files, including `.env`.
- Copying `.env` into a build artifact is not recommended for security reasons and may conflict with how Plesk manages environment variables.
- Having a separate script makes it easier to review, edit and run the build locally.

How to run
- Default (no .env copy):
  powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/build-api-server-win.ps1

- To also copy the local `.env` file into the generated `api-server/.env` (only for local testing and NOT recommended for production):
  powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/build-api-server-win.ps1 -CopyEnv

What the script does
- Removes any existing `./api-server` folder
- Runs `npx tsc --project tsconfig.api-server.json` to compile the API TS files
- Creates `./api-server` and copies `api-server-package.json`, `start-api-server.sh`, `start-api-server.bat` into it
- Optionally copies `.env` if `-CopyEnv` is provided

Notes
- For production on Plesk, avoid copying `.env`. Instead, configure Plesk's Custom environment variables and restart the app via Plesk so Passenger picks the variables up.
- The script uses `npx tsc` to ensure the local TypeScript compiler is used.

If you want a Unix alternative, create `scripts/build-api-server.sh` and update `package.json` to call it conditionally based on platform.
