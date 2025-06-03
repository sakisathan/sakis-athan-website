#!/bin/bash

# Ultimate Backend Startup Script
# This script ensures the Sakis AI Chatbot backend starts and stays running

echo "=== Sakis AI Chatbot Backend Startup ==="
echo "Starting at: $(date)"

# Navigate to project directory
cd /home/ubuntu/sakis-athan-website

# Check if PM2 is running
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
fi

# Stop any existing processes
echo "Stopping existing processes..."
pm2 stop sakis-ai-chatbot 2>/dev/null || true
pm2 stop sakis-keepalive 2>/dev/null || true

# Wait a moment
sleep 3

# Start the main chatbot server
echo "Starting AI Chatbot server..."
pm2 start ecosystem.config.js

# Wait for server to initialize
sleep 10

# Start the keep-alive monitor
echo "Starting keep-alive monitor..."
pm2 start keep-alive.sh --name "sakis-keepalive" --restart-delay=10000

# Save PM2 process list
echo "Saving PM2 configuration..."
pm2 save

# Show status
echo "Current PM2 status:"
pm2 list

# Test the API
echo "Testing API endpoint..."
sleep 5

API_URL="https://3001-irufp8x2q57bpem5rfd6w-8e2afb88.manusvm.computer/api/chat"
response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' \
    --max-time 15)

if [[ $response == *"response"* ]]; then
    echo "✅ API test successful!"
    echo "Backend is running and responding correctly."
else
    echo "❌ API test failed. Response: $response"
fi

echo "=== Startup Complete ==="
echo "Backend server is now running continuously with monitoring."
echo "Logs available at: /home/ubuntu/sakis-athan-website/logs/"

