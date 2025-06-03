#!/bin/bash

# Sakis AI Chatbot Auto-Startup Script
# This script ensures the server starts automatically

SCRIPT_DIR="/home/ubuntu/sakis-athan-website"
PROCESS_NAME="sakis-ai-chatbot"

cd "$SCRIPT_DIR"

# Check if PM2 is running
if ! pgrep -f "PM2" > /dev/null; then
    echo "Starting PM2 daemon..."
    pm2 ping
fi

# Check if our process is already running
if pm2 list | grep -q "$PROCESS_NAME.*online"; then
    echo "Process $PROCESS_NAME is already running"
    pm2 list | grep "$PROCESS_NAME"
else
    echo "Starting $PROCESS_NAME..."
    pm2 start server.js --name "$PROCESS_NAME" --restart-delay=5000 --max-restarts=10
    
    # Wait a moment and check status
    sleep 3
    pm2 list | grep "$PROCESS_NAME"
fi

# Set up PM2 to save current processes
pm2 save

echo "Server startup complete!"
echo "Use 'pm2 list' to check status"
echo "Use 'pm2 logs sakis-ai-chatbot' to view logs"
echo "Use 'pm2 restart sakis-ai-chatbot' to restart"

