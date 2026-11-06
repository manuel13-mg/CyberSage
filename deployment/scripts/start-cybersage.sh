#!/bin/bash
set -e

# CyberSage Startup Script for Linux
# Starts backend API and frontend development server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}==> $1${NC}"
}

log_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}  ✗ $1${NC}"
}

print_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           CyberSage Startup Script            ║${NC}"
    echo -e "${CYAN}║     AI-Powered Security Assessment Platform    ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    local errors=0

    # Check Python
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version | awk '{print $2}')
        if [[ "$python_version" =~ ^3\.(11|12|13) ]]; then
            log_success "Python: $python_version"
        else
            log_error "Python 3.11+ required, found: $python_version"
            ((errors++))
        fi
    else
        log_error "Python 3 not found in PATH"
        ((errors++))
    fi

    # Check Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        if [[ "$node_version" =~ ^v(1[89]|2[0-9]) ]]; then
            log_success "Node.js: $node_version"
        else
            log_error "Node.js 18+ required, found: $node_version"
            ((errors++))
        fi
    else
        log_error "Node.js not found in PATH"
        ((errors++))
    fi

    # Check backend virtual environment
    if [ -d "Backend/.venv" ]; then
        log_success "Backend virtual environment exists"
    else
        log_error "Backend virtual environment not found. Run: cd Backend && python3 -m venv .venv"
        ((errors++))
    fi

    # Check backend dependencies
    if [ -d "Backend/.venv/lib/python3"*/site-packages/fastapi ]; then
        log_success "Backend dependencies installed"
    else
        log_error "Backend dependencies missing. Run: cd Backend && source .venv/bin/activate && pip install -r requirements.txt"
        ((errors++))
    fi

    # Check .env file
    if [ -f "Backend/.env" ]; then
        log_success "Backend configuration exists"
    else
        log_warning "Backend .env not found. Copying from .env.example..."
        cp Backend/.env.example Backend/.env
        log_info "Please edit Backend/.env to configure API keys and database"
    fi

    # Check frontend dependencies
    if [ -d "Frontend/node_modules" ]; then
        log_success "Frontend dependencies installed"
    else
        log_error "Frontend dependencies missing. Run: cd Frontend && npm install"
        ((errors++))
    fi

    if [ $errors -gt 0 ]; then
        echo ""
        log_error "Prerequisite checks failed with $errors error(s)"
        exit 1
    fi

    echo ""
    log_success "All prerequisite checks passed"
    echo ""
}

# Check database connection
check_database() {
    log_info "Checking database connection..."

    if [ -f "Backend/.env" ]; then
        local db_url=$(grep "^DATABASE_URL=" Backend/.env | cut -d'=' -f2-)

        if [[ "$db_url" =~ ^postgresql ]]; then
            log_info "PostgreSQL database configured"
            log_success "Database configuration found"
        elif [[ "$db_url" =~ ^sqlite ]]; then
            log_info "SQLite database configured (development mode)"
            log_success "Database configuration found"
        else
            log_warning "Unknown database type: $db_url"
        fi
    else
        log_warning "DATABASE_URL not found in .env, using default"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."

    cd Backend
    if source .venv/bin/activate && python -m alembic upgrade head > /dev/null 2>&1; then
        log_success "Database migrations complete"
    else
        log_warning "Migration warnings (check logs)"
    fi
    cd ..
}

# Start backend API
start_backend() {
    log_info "Starting backend API..."

    cd Backend
    source .venv/bin/activate
    nohup python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 > ../logs/backend.log 2>&1 &
    local backend_pid=$!
    echo $backend_pid > ../logs/backend.pid
    cd ..

    # Wait for backend to be ready
    log_info "Waiting for backend to start..."
    local max_attempts=30
    local attempt=0
    local backend_ready=false

    while [ $attempt -lt $max_attempts ]; do
        sleep 1
        ((attempt++))

        if curl -s http://127.0.0.1:8000/api/v1/health > /dev/null 2>&1; then
            backend_ready=true
            break
        fi

        # Check if process is still running
        if ! kill -0 $backend_pid 2>/dev/null; then
            log_error "Backend process died unexpectedly"
            exit 1
        fi
    done

    if [ "$backend_ready" = true ]; then
        log_success "Backend API is running at http://127.0.0.1:8000"
        log_info "API Documentation: http://127.0.0.1:8000/docs"
    else
        log_error "Backend failed to start within $max_attempts seconds"
        log_info "Check logs/backend.log for details"
        exit 1
    fi
}

# Start frontend development server
start_frontend() {
    log_info "Starting frontend development server..."

    cd Frontend
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > ../logs/frontend.pid
    cd ..

    # Wait for frontend to be ready
    log_info "Waiting for frontend to start..."
    sleep 5

    if curl -s http://127.0.0.1:5173 > /dev/null 2>&1; then
        log_success "Frontend development server running at http://127.0.0.1:5173"
    else
        log_warning "Frontend may still be starting (check http://127.0.0.1:5173 in browser)"
    fi
}

# Build and serve production frontend
build_frontend() {
    log_info "Building frontend for production..."

    cd Frontend
    if npm run build; then
        log_success "Frontend build complete"
        log_info "Serving production build..."

        cd dist
        nohup python3 -m http.server 5173 > ../../logs/frontend.log 2>&1 &
        local frontend_pid=$!
        echo $frontend_pid > ../../logs/frontend.pid
        cd ../..

        sleep 2
        log_success "Frontend available at http://127.0.0.1:5173"
    else
        log_error "Frontend build failed"
        exit 1
    fi
}

# Show service status
show_status() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          CyberSage is now running!            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  🌐 Frontend:  ${CYAN}http://127.0.0.1:5173${NC}"
    echo -e "  🔧 Backend:   ${CYAN}http://127.0.0.1:8000${NC}"
    echo -e "  📚 API Docs:  ${CYAN}http://127.0.0.1:8000/docs${NC}"
    echo ""
    echo -e "Logs directory: ${CYAN}./logs/${NC}"
    echo -e "  - backend.log"
    echo -e "  - frontend.log"
    echo ""
    echo -e "To stop services: ${YELLOW}./deployment/scripts/stop-cybersage.sh${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    echo ""
    log_info "Shutting down services..."

    if [ -f logs/backend.pid ]; then
        local backend_pid=$(cat logs/backend.pid)
        if kill -0 $backend_pid 2>/dev/null; then
            kill $backend_pid
            log_success "Backend stopped"
        fi
        rm logs/backend.pid
    fi

    if [ -f logs/frontend.pid ]; then
        local frontend_pid=$(cat logs/frontend.pid)
        if kill -0 $frontend_pid 2>/dev/null; then
            kill $frontend_pid
            log_success "Frontend stopped"
        fi
        rm logs/frontend.pid
    fi
}

# Trap Ctrl+C
trap cleanup EXIT INT TERM

# Main execution
main() {
    local skip_checks=false
    local production=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-checks)
                skip_checks=true
                shift
                ;;
            --production)
                production=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-checks    Skip prerequisite checks"
                echo "  --production     Build and serve production frontend"
                echo "  --help          Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                echo "Run with --help for usage information"
                exit 1
                ;;
        esac
    done

    print_banner

    # Create logs directory
    mkdir -p logs

    if [ "$skip_checks" = false ]; then
        check_prerequisites
        check_database
        run_migrations
    fi

    start_backend

    if [ "$production" = true ]; then
        build_frontend
    else
        start_frontend
    fi

    show_status

    # Keep script running
    log_info "Press Ctrl+C to stop all services"
    while true; do
        sleep 1

        # Check if processes are still running
        if [ -f logs/backend.pid ]; then
            local backend_pid=$(cat logs/backend.pid)
            if ! kill -0 $backend_pid 2>/dev/null; then
                log_error "Backend has stopped unexpectedly"
                break
            fi
        fi

        if [ -f logs/frontend.pid ]; then
            local frontend_pid=$(cat logs/frontend.pid)
            if ! kill -0 $frontend_pid 2>/dev/null; then
                log_error "Frontend has stopped unexpectedly"
                break
            fi
        fi
    done
}

# Run main function
main "$@"
