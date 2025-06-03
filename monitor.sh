#!/bin/bash

# Sakis AI Chatbot Server Monitor Script
# This script monitors the PM2 process and ensures it stays running

LOG_FILE="/home/ubuntu/sakis-athan-website/logs/monitor.log"
PROCESS_NAME="sakis-ai-chatbot"

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if PM2 process is running
check_process() {
    pm2 list | grep -q "$PROCESS_NAME.*online"
    return $?
}

# Restart the process if it's not running
restart_process() {
    log_message "Process $PROCESS_NAME not running. Attempting restart..."
    cd /home/ubuntu/sakis-athan-website
    pm2 restart "$PROCESS_NAME" 2>&1 >> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        log_message "Process $PROCESS_NAME restarted successfully"
    else
        log_message "Failed to restart $PROCESS_NAME. Starting fresh..."
        pm2 start server.js --name "$PROCESS_NAME" --restart-delay=5000 --max-restarts=10 2>&1 >> "$LOG_FILE"
    fi
}

# Main monitoring logic
main() {
    log_message "Starting monitor check for $PROCESS_NAME"
    
    if check_process; then
        log_message "Process $PROCESS_NAME is running normally"
    else
        restart_process
    fi
    
    # Show current status
    pm2 list | grep "$PROCESS_NAME" >> "$LOG_FILE"
}

# Run the main function
main

