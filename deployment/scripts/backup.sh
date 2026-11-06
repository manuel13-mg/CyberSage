#!/bin/bash
set -e

# CyberSage Backup Script
# Creates a complete backup of PostgreSQL, Neo4j, ChromaDB, and configuration

BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

echo ""
echo "CyberSage Backup"
echo "================"
echo "Timestamp: $TIMESTAMP"
echo "Destination: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup PostgreSQL
log_info "Backing up PostgreSQL..."
if [ -f "Backend/.env" ]; then
    db_url=$(grep "^DATABASE_URL=" Backend/.env | cut -d'=' -f2- | xargs)

    if [[ "$db_url" =~ ^postgresql ]]; then
        # Extract connection details
        if command -v pg_dump &> /dev/null; then
            if pg_dump "$db_url" -F c -f "$BACKUP_DIR/postgresql.dump" 2>/dev/null; then
                log_success "PostgreSQL backup complete"
            else
                log_error "PostgreSQL backup failed"
            fi
        else
            log_error "pg_dump not found, skipping PostgreSQL backup"
        fi
    elif [[ "$db_url" =~ ^sqlite ]]; then
        db_file=$(echo "$db_url" | sed 's/sqlite:\/\/\///')
        if [ -f "Backend/$db_file" ]; then
            cp "Backend/$db_file" "$BACKUP_DIR/sqlite.db"
            log_success "SQLite database backed up"
        fi
    fi
else
    log_error ".env file not found"
fi

# 2. Backup Neo4j (if configured)
log_info "Backing up Neo4j..."
if [ -f "Backend/.env" ] && grep -q "^NEO4J_URL=" Backend/.env; then
    neo4j_url=$(grep "^NEO4J_URL=" Backend/.env | cut -d'=' -f2- | xargs)

    if [ -n "$neo4j_url" ] && [ "$neo4j_url" != "bolt://localhost:7687" ]; then
        log_info "  Neo4j configured, attempting backup..."

        # Try neo4j-admin dump (requires Neo4j installed)
        if command -v neo4j-admin &> /dev/null; then
            if neo4j-admin database dump neo4j --to="$BACKUP_DIR/neo4j.dump" 2>/dev/null; then
                log_success "Neo4j backup complete"
            else
                log_error "Neo4j backup failed (database may be running)"
            fi
        else
            log_info "  neo4j-admin not found, skipping Neo4j backup"
        fi
    else
        log_info "  Neo4j not configured or using default, skipping"
    fi
else
    log_info "  Neo4j not configured, skipping"
fi

# 3. Backup ChromaDB
log_info "Backing up ChromaDB..."
if [ -d "./knowledge_store" ]; then
    tar -czf "$BACKUP_DIR/chromadb.tar.gz" ./knowledge_store 2>/dev/null
    log_success "ChromaDB backup complete"
elif [ -d "Backend/knowledge_store" ]; then
    tar -czf "$BACKUP_DIR/chromadb.tar.gz" -C Backend ./knowledge_store 2>/dev/null
    log_success "ChromaDB backup complete"
else
    log_info "  ChromaDB directory not found, skipping"
fi

# 4. Backup Configuration (encrypted)
log_info "Backing up configuration..."
if [ -f "Backend/.env" ]; then
    # Check if GPG is available
    if command -v gpg &> /dev/null; then
        # Use passphrase from file if available, otherwise prompt
        if [ -f "/secure/gpg_passphrase" ]; then
            gpg --batch --yes --passphrase-file /secure/gpg_passphrase \
                --symmetric --cipher-algo AES256 \
                --output "$BACKUP_DIR/env.gpg" Backend/.env 2>/dev/null
        else
            gpg --symmetric --cipher-algo AES256 \
                --output "$BACKUP_DIR/env.gpg" Backend/.env 2>/dev/null
        fi
        log_success "Configuration backed up (encrypted)"
    else
        # Fallback: copy without encryption (with warning)
        cp Backend/.env "$BACKUP_DIR/.env"
        log_error "Configuration copied WITHOUT encryption (gpg not available)"
        echo -e "${YELLOW}  WARNING: .env contains sensitive data!${NC}"
    fi
else
    log_error ".env file not found"
fi

# 5. Create manifest
cat > "$BACKUP_DIR/manifest.txt" << EOF
CyberSage Backup Manifest
========================
Timestamp: $TIMESTAMP
Date: $(date)
Hostname: $(hostname)

Components:
EOF

if [ -f "$BACKUP_DIR/postgresql.dump" ]; then
    echo "- PostgreSQL: postgresql.dump ($(du -h "$BACKUP_DIR/postgresql.dump" | cut -f1))" >> "$BACKUP_DIR/manifest.txt"
fi

if [ -f "$BACKUP_DIR/sqlite.db" ]; then
    echo "- SQLite: sqlite.db ($(du -h "$BACKUP_DIR/sqlite.db" | cut -f1))" >> "$BACKUP_DIR/manifest.txt"
fi

if [ -f "$BACKUP_DIR/neo4j.dump" ]; then
    echo "- Neo4j: neo4j.dump ($(du -h "$BACKUP_DIR/neo4j.dump" | cut -f1))" >> "$BACKUP_DIR/manifest.txt"
fi

if [ -f "$BACKUP_DIR/chromadb.tar.gz" ]; then
    echo "- ChromaDB: chromadb.tar.gz ($(du -h "$BACKUP_DIR/chromadb.tar.gz" | cut -f1))" >> "$BACKUP_DIR/manifest.txt"
fi

if [ -f "$BACKUP_DIR/env.gpg" ]; then
    echo "- Configuration: env.gpg (encrypted)" >> "$BACKUP_DIR/manifest.txt"
elif [ -f "$BACKUP_DIR/.env" ]; then
    echo "- Configuration: .env (UNENCRYPTED - secure this file!)" >> "$BACKUP_DIR/manifest.txt"
fi

cat >> "$BACKUP_DIR/manifest.txt" << EOF

Restoration Order:
1. Configuration (.env)
2. Database (PostgreSQL or SQLite)
3. ChromaDB (optional, can be rebuilt)
4. Neo4j (optional, can be rebuilt from database)

Restoration Commands:
- PostgreSQL: pg_restore -d cybersage postgresql.dump
- SQLite: cp sqlite.db Backend/cybersage.db
- ChromaDB: tar -xzf chromadb.tar.gz
- Neo4j: neo4j-admin database load neo4j --from=neo4j.dump
- Configuration: gpg --decrypt env.gpg > Backend/.env
EOF

log_success "Backup manifest created"

# 6. Compress backup
log_info "Compressing backup..."
cd "$BACKUP_ROOT"
tar -czf "cybersage_backup_$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

backup_size=$(du -h "cybersage_backup_$TIMESTAMP.tar.gz" | cut -f1)
log_success "Backup compressed: cybersage_backup_$TIMESTAMP.tar.gz ($backup_size)"

# 7. Clean old backups
log_info "Cleaning old backups (retention: $RETENTION_DAYS days)..."
find "$BACKUP_ROOT" -name "cybersage_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
log_success "Old backups cleaned"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Backup completed successfully!         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "Backup file: $BACKUP_ROOT/cybersage_backup_$TIMESTAMP.tar.gz"
echo "Size: $backup_size"
echo ""
