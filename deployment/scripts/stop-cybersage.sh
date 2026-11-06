#!/bin/bash

# CyberSage Stop Script for Linux
# Stops backend API and frontend server

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${CYAN}==> $1${NC}"
}

log_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
}

log_error() {
    echo -e "${RED}  ✗ $1${NC}"
}

log_info "Stopping CyberSage services..."

# Stop backend
if [ -f logs/backend.pid ]; then
    backend_pid=$(cat logs/backend.pid)
    if kill -0 $backend_pid 2>/dev/null; then
        kill $backend_pid
        log_success "Backend stopped (PID: $backend_pid)"
    else
        log_info "Backend not running"
    fi
    rm logs/backend.pid
else
    log_info "Backend PID file not found"
fi

# Stop frontend
if [ -f logs/frontend.pid ]; then
    frontend_pid=$(cat logs/frontend.pid)
    if kill -0 $frontend_pid 2>/dev/null; then
        kill $frontend_pid
        log_success "Frontend stopped (PID: $frontend_pid)"
    else
        log_info "Frontend not running"
    fi
    rm logs/frontend.pid
else
    log_info "Frontend PID file not found"
fi

# Kill any remaining uvicorn or node processes (fallback)
pkill -f "uvicorn app.main:app" 2>/dev/null && log_info "Killed remaining uvicorn processes"
pkill -f "npm run dev" 2>/dev/null && log_info "Killed remaining npm processes"

echo ""
log_success "All CyberSage services stopped"
