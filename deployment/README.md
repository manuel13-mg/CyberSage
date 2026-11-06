# CyberSage Deployment Scripts

This directory contains automation scripts for deploying, managing, and maintaining CyberSage.

## Directory Structure

```
deployment/
├── scripts/           # Deployment and management scripts
│   ├── start-cybersage.ps1      # Windows startup script
│   ├── start-cybersage.sh       # Linux startup script
│   ├── stop-cybersage.ps1       # Windows stop script
│   ├── stop-cybersage.sh        # Linux stop script
│   ├── health-check.sh          # System health check
│   └── backup.sh                # Automated backup script
├── configs/           # Configuration templates (TBD)
└── README.md          # This file
```

## Quick Start

### Windows

**Start CyberSage:**
```powershell
.\deployment\scripts\start-cybersage.ps1
```

**Stop CyberSage:**
```powershell
.\deployment\scripts\stop-cybersage.ps1
```

### Linux

**Start CyberSage:**
```bash
./deployment/scripts/start-cybersage.sh
```

**Stop CyberSage:**
```bash
./deployment/scripts/stop-cybersage.sh
```

**Check Health:**
```bash
./deployment/scripts/health-check.sh
```

**Run Backup:**
```bash
./deployment/scripts/backup.sh
```

## Script Details

### start-cybersage.ps1 / start-cybersage.sh

Starts the complete CyberSage application with prerequisites checking and health validation.

**Features:**
- Prerequisites validation (Python, Node.js, dependencies)
- Database migration execution
- Backend API startup with health check
- Frontend development server startup
- Service monitoring and automatic restart

**Options (PowerShell):**
```powershell
# Skip prerequisite checks
.\start-cybersage.ps1 -SkipChecks

# Build and serve production frontend
.\start-cybersage.ps1 -ProductionBuild
```

**Options (Bash):**
```bash
# Skip prerequisite checks
./start-cybersage.sh --skip-checks

# Build and serve production frontend
./start-cybersage.sh --production
```

### stop-cybersage.ps1 / stop-cybersage.sh

Gracefully stops all CyberSage services.

**Usage:**
```bash
./deployment/scripts/stop-cybersage.sh
```

### health-check.sh

Performs comprehensive health checks on all CyberSage components.

**Checks:**
- Backend API health endpoint
- Frontend availability
- Component status (PostgreSQL, Neo4j, Gemini)
- Scanner availability (Nuclei)
- Database connection

**Usage:**
```bash
./deployment/scripts/health-check.sh
```

**Exit Codes:**
- `0` - All checks passed (healthy)
- `1` - One or more checks failed (unhealthy)

### backup.sh

Creates a complete backup of CyberSage data and configuration.

**Includes:**
- PostgreSQL database dump
- SQLite database file (if used)
- Neo4j graph database (if configured)
- ChromaDB knowledge store
- Configuration files (encrypted with GPG if available)

**Usage:**
```bash
# Default backup (30-day retention)
./deployment/scripts/backup.sh

# Custom backup location and retention
BACKUP_ROOT=/mnt/backups RETENTION_DAYS=60 ./deployment/scripts/backup.sh
```

**Output:**
- Compressed backup archive: `backups/cybersage_backup_YYYYMMDD_HHMMSS.tar.gz`
- Backup manifest with restoration instructions

**Restoration:**
```bash
# Extract backup
tar -xzf cybersage_backup_20261106_143000.tar.gz
cd 20261106_143000

# View manifest
cat manifest.txt

# Restore configuration
gpg --decrypt env.gpg > Backend/.env

# Restore PostgreSQL
pg_restore -d cybersage postgresql.dump

# Restore ChromaDB
tar -xzf chromadb.tar.gz
```

## Environment Variables

### start-cybersage.sh

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8000` | Backend API port |
| `FRONTEND_PORT` | `5173` | Frontend port |

### backup.sh

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKUP_ROOT` | `./backups` | Backup directory |
| `RETENTION_DAYS` | `30` | Days to keep old backups |
| `GPG_PASSPHRASE_FILE` | `/secure/gpg_passphrase` | GPG passphrase file for encryption |

## Automated Backup (Linux)

To set up automated daily backups via cron:

**1. Make script executable:**
```bash
chmod +x deployment/scripts/backup.sh
```

**2. Add to crontab:**
```bash
crontab -e
```

**3. Add this line (daily at 2 AM):**
```
0 2 * * * cd /opt/cybersage && ./deployment/scripts/backup.sh >> /var/log/cybersage_backup.log 2>&1
```

## Systemd Service (Linux Production)

For production deployments, use systemd to manage CyberSage as a service.

**1. Create service file:** `/etc/systemd/system/cybersage.service`

```ini
[Unit]
Description=CyberSage Security Assessment Platform
After=network.target postgresql.service

[Service]
Type=forking
User=cybersage
Group=cybersage
WorkingDirectory=/opt/cybersage
ExecStart=/opt/cybersage/deployment/scripts/start-cybersage.sh --skip-checks
ExecStop=/opt/cybersage/deployment/scripts/stop-cybersage.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**2. Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable cybersage
sudo systemctl start cybersage
sudo systemctl status cybersage
```

## Monitoring

### Log Locations

**Linux:**
- Backend: `logs/backend.log`
- Frontend: `logs/frontend.log`
- Backup: `/var/log/cybersage_backup.log` (if using cron)

**Windows:**
- Logs are managed by PowerShell jobs
- View with: `Get-Job | Receive-Job`

### Health Check Monitoring

Set up periodic health checks with cron:

```bash
# Every 5 minutes
*/5 * * * * /opt/cybersage/deployment/scripts/health-check.sh > /dev/null 2>&1 || echo "CyberSage unhealthy" | mail -s "CyberSage Alert" admin@example.com
```

## Troubleshooting

### "Prerequisites check failed"

**Solution:** Install missing dependencies
```bash
# Install Python 3.11+
sudo apt install python3.11 python3.11-venv

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install backend dependencies
cd Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
cd ../Frontend
npm install
```

### "Backend failed to start"

**Check logs:**
```bash
tail -f logs/backend.log
```

**Common issues:**
- Port 8000 already in use: `lsof -i :8000` and kill the process
- Database connection failed: Check `Backend/.env` DATABASE_URL
- Missing dependencies: Reinstall with `pip install -r requirements.txt`

### "Frontend not accessible"

**Check logs:**
```bash
tail -f logs/frontend.log
```

**Common issues:**
- Port 5173 already in use: `lsof -i :5173` and kill the process
- Build failed: Check Node.js version (requires 18+)
- API connection failed: Ensure backend is running

### "Backup failed"

**Check permissions:**
```bash
# Ensure backup directory is writable
mkdir -p backups
chmod 755 backups

# Ensure GPG is installed for encryption
sudo apt install gnupg
```

**Database connection issues:**
```bash
# Test PostgreSQL connection
psql -h 127.0.0.1 -U cybersage -d cybersage -c "SELECT 1;"

# Check .env configuration
cat Backend/.env | grep DATABASE_URL
```

## Security Notes

### Backup Security

- Backups contain sensitive assessment data and credentials
- `.env` file is encrypted with GPG (if available)
- Store backups in secure, access-controlled locations
- Never commit backups to version control
- Test restoration procedures regularly

### Production Deployment

- Change default database passwords
- Use strong Gemini API keys
- Configure firewall to block external access
- Use HTTPS in production (reverse proxy)
- Rotate API keys quarterly
- Review security logs regularly

## Support

For additional help:
- Installation Guide: `docs/INSTALLATION.md`
- Backup Guide: `docs/BACKUP_AND_RECOVERY.md`
- Security Documentation: `docs/SECURITY.md`
- Troubleshooting Guide: `docs/TROUBLESHOOTING.md` (TBD)

---

**Version:** 1.0  
**Last Updated:** 2026-11-06
