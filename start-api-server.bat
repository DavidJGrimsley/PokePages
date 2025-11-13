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
echo 🚀 Starting API server...
if exist api-server\api-server.js (
    node api-server\api-server.js
) else (
    npx tsx api-server.ts
)