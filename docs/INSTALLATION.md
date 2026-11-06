# CyberSage Installation Guide

**Version:** 1.0  
**Target Platforms:** Windows 11, Linux (Ubuntu 22.04+)  
**Last Updated:** 2026-11-06

## Prerequisites

### All Platforms
- Python 3.11 or higher
- Node.js 18 or higher
- Git
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### Windows-Specific
- Windows 10 or Windows 11
- PowerShell 5.1 or higher
- Windows Terminal (recommended)

### Linux-Specific
- Ubuntu 22.04 LTS or equivalent
- sudo access
- Build essentials (`build-essential`, `python3-dev`)

---

## Quick Start (Local Development)

### Windows Installation

**1. Clone Repository**
```powershell
cd C:\
git clone https://github.com/your-org/cybersage.git
cd cybersage
```

**2. Backend Setup**
```powershell
cd Backend

# Create virtual environment
py -3.12 -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Configure environment
Copy-Item .env.example .env
# Edit .env and add your Gemini API key

# Run database migrations
python -m alembic upgrade head

# Start backend (in separate terminal)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**3. Frontend Setup (New Terminal)**
```powershell
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**4. Verify Installation**

Open browser: http://127.0.0.1:5173

Check API health: http://127.0.0.1:8000/api/v1/health

### Linux Installation

**1. Install System Dependencies**
```bash
# Update package manager
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt install -y build-essential python3-dev python3-pip python3-venv nodejs npm git

# Verify versions
python3 --version  # Should be 3.11+
node --version     # Should be 18+
```

**2. Clone Repository**
```bash
cd /opt
sudo git clone https://github.com/your-org/cybersage.git
sudo chown -R $USER:$USER cybersage
cd cybersage
```

**3. Backend Setup**
```bash
cd Backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your favorite editor
nano .env  # or vim .env

# Run database migrations
python -m alembic upgrade head

# Start backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**4. Frontend Setup (New Terminal)**
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**5. Verify Installation**

```bash
# Check API health
curl http://127.0.0.1:8000/api/v1/health

# Open browser
xdg-open http://127.0.0.1:5173
```

---

## Database Configuration

### SQLite (Development - Default)

No additional setup required. CyberSage creates `cybersage.db` automatically.

**Configuration:**
```env
DATABASE_URL=sqlite:///./cybersage.db
```

### PostgreSQL (Recommended for Production)

**Windows Installation:**
1. Download PostgreSQL 15+ from https://www.postgresql.org/download/windows/
2. Run installer and follow wizard
3. Remember postgres password

**Linux Installation:**
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE USER cybersage WITH PASSWORD 'your_secure_password';
CREATE DATABASE cybersage OWNER cybersage;
GRANT ALL PRIVILEGES ON DATABASE cybersage TO cybersage;
\q
EOF
```

**Configure CyberSage:**

Edit `Backend/.env`:
```env
DATABASE_URL=postgresql+psycopg://cybersage:your_secure_password@127.0.0.1:5432/cybersage
```

**Run Migrations:**
```bash
cd Backend
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1 on Windows
python -m alembic upgrade head
```

---

## Optional Integrations

### Neo4j (Graph Database)

**Why Install:** Enables attack path visualization and graph-based analysis.

**Windows Installation:**
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Install and create a new database
3. Start database and note credentials

**Linux Installation:**
```bash
# Add Neo4j repository
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list

# Install Neo4j
sudo apt update
sudo apt install -y neo4j

# Start Neo4j
sudo systemctl start neo4j
sudo systemctl enable neo4j

# Set initial password (default user: neo4j, password: neo4j)
cypher-shell -u neo4j -p neo4j "ALTER USER neo4j SET PASSWORD 'your_secure_password'"
```

**Configure CyberSage:**

Edit `Backend/.env`:
```env
NEO4J_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password
NEO4J_DATABASE=neo4j
```

**Verify Connection:**
```bash
curl http://127.0.0.1:8000/api/v1/graph/status
```

### Nuclei (Vulnerability Scanner)

**Why Install:** Enables automated vulnerability scanning.

**Windows Installation:**
```powershell
# Download from GitHub releases
# Visit: https://github.com/projectdiscovery/nuclei/releases
# Download nuclei_windows_amd64.zip
# Extract nuclei.exe to C:\Windows or add to PATH

# Verify installation
nuclei -version

# Update templates
nuclei -update-templates
```

**Linux Installation:**
```bash
# Download and install
wget https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_linux_amd64.zip
unzip nuclei_linux_amd64.zip
sudo mv nuclei /usr/local/bin/
sudo chmod +x /usr/local/bin/nuclei

# Verify installation
nuclei -version

# Update templates
nuclei -update-templates
```

**Configure CyberSage:**

No configuration needed. CyberSage auto-detects Nuclei if it's on PATH.

**Verify Detection:**
```bash
curl http://127.0.0.1:8000/api/v1/scanners
# Should show nuclei as "available"
```

### Gemini API (AI Features)

**Why Install:** Enables AI-powered investigation and analysis.

**Setup:**
1. Visit https://aistudio.google.com/
2. Sign in with Google account
3. Create API key
4. Copy API key

**Configure CyberSage:**

Edit `Backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=gemini
```

**Verify Configuration:**
```bash
curl http://127.0.0.1:8000/api/v1/ai/provider/status
# Should show "configured": true
```

---

## Production Deployment

### System Service (Linux)

**Create systemd service:**

`/etc/systemd/system/cybersage-backend.service`:
```ini
[Unit]
Description=CyberSage Backend API
After=network.target postgresql.service neo4j.service

[Service]
Type=simple
User=cybersage
Group=cybersage
WorkingDirectory=/opt/cybersage/Backend
Environment="PATH=/opt/cybersage/Backend/.venv/bin"
ExecStart=/opt/cybersage/Backend/.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable cybersage-backend
sudo systemctl start cybersage-backend
sudo systemctl status cybersage-backend
```

### Frontend Production Build

```bash
cd Frontend
npm run build

# Serve with static file server (nginx, Caddy, or Python http.server)
# Example with Python:
cd dist
python -m http.server 5173
```

### Nginx Reverse Proxy (Optional)

**Install Nginx:**
```bash
sudo apt install -y nginx
```

**Configure:**

`/etc/nginx/sites-available/cybersage`:
```nginx
server {
    listen 80;
    server_name cybersage.local;

    # Frontend
    location / {
        root /opt/cybersage/Frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/cybersage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Troubleshooting

### Backend Won't Start

**Error: "ModuleNotFoundError"**
```bash
# Ensure virtual environment is activated
# Windows:
.\.venv\Scripts\Activate.ps1

# Linux:
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Database connection failed"**
```bash
# Check PostgreSQL is running
# Linux:
sudo systemctl status postgresql

# Windows: Check Services app

# Verify connection string in .env
# Test connection:
psql -h 127.0.0.1 -U cybersage -d cybersage
```

**Error: "Port 8000 already in use"**
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux:
lsof -i :8000
kill -9 <pid>
```

### Frontend Won't Start

**Error: "EADDRINUSE: Port 5173 already in use"**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <pid> /F

# Linux:
lsof -i :5173
kill -9 <pid>
```

**Error: "Failed to fetch" in browser**
```bash
# Ensure backend is running
curl http://127.0.0.1:8000/api/v1/health

# Check CORS configuration in Backend/.env
# Verify FRONTEND_ORIGIN matches frontend URL
```

### Migration Errors

**Error: "Target database is not up to date"**
```bash
cd Backend
source .venv/bin/activate
python -m alembic upgrade head
```

**Error: "Can't locate revision"**
```bash
# Check migration history
python -m alembic current
python -m alembic history

# Reset to clean state (DESTRUCTIVE - use with caution)
python -m alembic downgrade base
python -m alembic upgrade head
```

### Scanner Not Detected

**Nuclei not found:**
```bash
# Check if Nuclei is on PATH
nuclei -version

# If not found, add to PATH or reinstall
```

### Neo4j Connection Issues

**Error: "ServiceUnavailable"**
```bash
# Check Neo4j is running
# Linux:
sudo systemctl status neo4j

# Windows: Check Neo4j Desktop

# Verify connection details in .env
# Test connection:
cypher-shell -u neo4j -p your_password "RETURN 1;"
```

---

## Security Checklist

### Before First Use
- [ ] Change default database passwords
- [ ] Set strong Gemini API key
- [ ] Review `.env` file (no secrets in Git)
- [ ] Configure firewall (block external access)
- [ ] Review CORS origins in settings
- [ ] Test with authorized local target first

### Regular Maintenance
- [ ] Keep dependencies updated
- [ ] Update Nuclei templates monthly
- [ ] Review logs for errors
- [ ] Backup database weekly
- [ ] Rotate API keys quarterly

---

## Next Steps

1. **Register your first target** (http://127.0.0.1:5173)
2. **Configure authorization scope**
3. **Run a local assessment** against OWASP Juice Shop
4. **Review findings and evidence**
5. **Generate security report**

---

## Support

- **Documentation:** `docs/` directory
- **Architecture:** `docs/ARCHITECTURE.md`
- **API Reference:** `docs/API_DOCUMENTATION.md`
- **Security Guide:** `docs/SECURITY.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`

---

**Installation Guide Version:** 1.0  
**Last Updated:** 2026-11-06
