@echo off
echo 🔍 Checking for processes on port 3001...

for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001') do (
    echo ⚠️ Found process %%i using port 3001. Killing it...
    taskkill /PID %%i /F >nul 2>&1
    echo ✅ Process killed successfully.
    timeout /t 1 /nobreak >nul
    goto start_server
)

echo ✅ Port 3001 is available.

:start_server
echo 🚀 Starting API server with trace warnings and log redirection...
if not exist logs mkdir logs
if exist api-server\api-server.js (
    node --trace-warnings api-server\api-server.js >> logs\node.log 2>&1
) else (
    npx tsx api-server.ts >> logs\node.log 2>&1
)