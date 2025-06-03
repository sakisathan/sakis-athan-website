#!/bin/bash

# Keep-Alive Script for Sakis AI Chatbot Backend
# This script ensures the backend server stays running continuously

LOG_FILE="/home/ubuntu/sakis-athan-website/logs/keep-alive.log"
API_URL="https://3001-irufp8x2q57bpem5rfd6w-8e2afb88.manusvm.computer/api/chat"

# Create logs directory if it doesn't exist
mkdir -p /home/ubuntu/sakis-athan-website/logs

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if server is responding
check_server() {
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d '{"message": "health check"}' \
        --max-time 10)
    
    if [ "$response" = "200" ]; then
        return 0  # Server is responding
    else
        return 1  # Server is not responding
    fi
}

# Function to restart server if needed
restart_server() {
    log_message "Server not responding, attempting restart..."
    
    # Stop the current process
    pm2 stop sakis-ai-chatbot >> "$LOG_FILE" 2>&1
    
    # Wait a moment
    sleep 5
    
    # Start the server again
    pm2 start sakis-ai-chatbot >> "$LOG_FILE" 2>&1
    
    # Wait for startup
    sleep 10
    
    # Check if restart was successful
    if check_server; then
        log_message "Server restart successful"
    else
        log_message "Server restart failed, trying full restart..."
        
        # Full restart with ecosystem file
        cd /home/ubuntu/sakis-athan-website
        pm2 delete sakis-ai-chatbot >> "$LOG_FILE" 2>&1
        pm2 start ecosystem.config.js >> "$LOG_FILE" 2>&1
        
        sleep 10
        
        if check_server; then
            log_message "Full server restart successful"
        else
            log_message "CRITICAL: Server restart failed completely"
        fi
    fi
}

# Main monitoring loop
log_message "Keep-alive script started"

while true; do
    if check_server; then
        log_message "Server health check: OK"
    else
        log_message "Server health check: FAILED"
        restart_server
    fi
    
    # Check every 5 minutes
    sleep 300
done

