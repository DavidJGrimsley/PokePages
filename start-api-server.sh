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

echo "🚀 Starting API server with trace warnings and log redirection..."
LOG_DIR="./logs"
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
fi
NODE_CMD="node --trace-warnings api-server.js >> $LOG_DIR/node.log 2>&1 &"
echo "Running: $NODE_CMD"
eval $NODE_CMD
echo "✅ API server started (check $LOG_DIR/node.log for logs)"