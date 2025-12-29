# Build script for API server (Windows PowerShell)
# Usage: ./scripts/build-api-server-win.ps1 [-CopyEnv]
param(
    [switch]$CopyEnv
)

Write-Output "Starting build:api-server (Windows)"

# Remove existing api-server dir
if (Test-Path api-server) {
    Write-Output "Removing existing api-server directory..."
    Remove-Item -Recurse -Force api-server
}

# Compile TypeScript project
Write-Output "Compiling TypeScript using tsconfig.api-server.json..."
$tsccmd = 'npx tsc --project tsconfig.api-server.json'
# invocation
Invoke-Expression $tsccmd

# Create api-server dir if not exists
if (!(Test-Path api-server)) {
    Write-Output "Creating api-server directory..."
    New-Item -ItemType Directory api-server | Out-Null
}

# Copy package.json, start scripts
Write-Output "Copying package.json and start scripts..."
Copy-Item api-server-package.json api-server/package.json -Force
if (Test-Path start-api-server.sh) { Copy-Item start-api-server.sh api-server/start-api-server.sh -Force }
if (Test-Path start-api-server.bat) { Copy-Item start-api-server.bat api-server/start-api-server.bat -Force }

# Copy .env file
if (Test-Path api-server.env) {
    Write-Output "Copying api-server.env to api-server/.env..."
    Copy-Item api-server.env api-server/.env -Force
} else {
    Write-Output "Warning: api-server.env file not found. Skipping copy."
}

# Optional copy of .env (should not be present by default in production)
if ($CopyEnv) {
    if (Test-Path .env) {
        Write-Output "Copying .env to api-server/.env (requested)..."
        Copy-Item .env api-server/.env -Force
    } else {
        Write-Output ".env not found. Skipping copy."
    }
}

Write-Output "Build complete. API server files are in ./api-server"
