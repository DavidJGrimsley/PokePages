#!/bin/bash
# Bash script to kill any process on port 3001 and start the server

echo "🔍 Checking for processes on port 3001..."

# Find process using port 3001
PID=$(lsof -ti:3001)

if [ ! -z "$PID" ]; then
    echo "⚠️  Found process $PID using port 3001. Killing it..."
    kill -9 $PID
    sleep 1
    echo "✅ Process killed successfully."
else
    echo "✅ Port 3001 is available."
fi

echo "🚀 Starting API server..."
node api-server.js