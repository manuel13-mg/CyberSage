#!/bin/bash

# CyberSage Health Check Script
# Checks the health of all CyberSage components

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_fail() {
    echo -e "${RED}✗ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo "CyberSage Health Check"
echo "======================"
echo ""

exit_code=0

# Check Backend API
echo -n "Backend API (http://127.0.0.1:8000/api/v1/health)... "
if response=$(curl -s -w "%{http_code}" http://127.0.0.1:8000/api/v1/health -o /dev/null); then
    if [ "$response" = "200" ]; then
        log_pass "HEALTHY"
    else
        log_fail "UNHEALTHY (HTTP $response)"
        exit_code=1
    fi
else
    log_fail "NOT REACHABLE"
    exit_code=1
fi

# Check Frontend
echo -n "Frontend (http://127.0.0.1:5173)... "
if response=$(curl -s -w "%{http_code}" http://127.0.0.1:5173 -o /dev/null); then
    if [ "$response" = "200" ]; then
        log_pass "AVAILABLE"
    else
        log_fail "UNAVAILABLE (HTTP $response)"
        exit_code=1
    fi
else
    log_fail "NOT REACHABLE"
    exit_code=1
fi

# Check Component Status
echo -n "Component Status... "
if response=$(curl -s http://127.0.0.1:8000/api/v1/components/status); then
    log_pass "RESPONDING"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "  (Cannot parse response)"
else
    log_fail "FAILED"
    exit_code=1
fi

# Check Scanner Status
echo ""
echo -n "Scanner Availability... "
if response=$(curl -s http://127.0.0.1:8000/api/v1/scanners); then
    log_pass "RESPONDING"
    nuclei_available=$(echo "$response" | grep -c '"name":"nuclei"' || true)
    if [ "$nuclei_available" -gt 0 ]; then
        echo "  ✓ Nuclei scanner detected"
    else
        log_warn "Nuclei scanner not available"
    fi
else
    log_fail "FAILED"
    exit_code=1
fi

# Check Database
echo ""
echo -n "Database Connection... "
if [ -f "Backend/.env" ]; then
    db_url=$(grep "^DATABASE_URL=" Backend/.env | cut -d'=' -f2-)
    if [[ "$db_url" =~ ^postgresql ]]; then
        echo "PostgreSQL"
        # Try to connect (requires psql)
        if command -v psql &> /dev/null; then
            if echo "SELECT 1;" | psql "$db_url" > /dev/null 2>&1; then
                log_pass "CONNECTED"
            else
                log_fail "CONNECTION FAILED"
                exit_code=1
            fi
        else
            log_warn "psql not available, cannot test connection"
        fi
    elif [[ "$db_url" =~ ^sqlite ]]; then
        echo "SQLite"
        db_file=$(echo "$db_url" | sed 's/sqlite:\/\/\///')
        if [ -f "Backend/$db_file" ]; then
            log_pass "DATABASE FILE EXISTS"
        else
            log_warn "Database file not found: $db_file"
        fi
    fi
else
    log_warn ".env file not found"
fi

echo ""
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}Overall Status: HEALTHY${NC}"
else
    echo -e "${RED}Overall Status: UNHEALTHY${NC}"
fi

exit $exit_code
