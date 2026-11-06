# CyberSage Quick Start Guide

**Goal:** Get CyberSage fully operational with all features working  
**Time Required:** 30-60 minutes (depending on optional integrations)  
**Last Updated:** 2026-11-06

---

## Overview: What You Need

CyberSage has **required** and **optional** components. Here's what each one does:

### ✅ Required (Core Functionality)
1. **Python 3.11+** - Backend API
2. **Node.js 18+** - Frontend interface
3. **Backend dependencies** - FastAPI, SQLAlchemy, etc.
4. **Frontend dependencies** - React, Vite, etc.

### 🟡 Optional (Enhanced Features)
5. **PostgreSQL** - Production database (SQLite works for development)
6. **Neo4j** - Graph visualization and attack paths
7. **Nuclei** - Automated vulnerability scanning
8. **Gemini API Key** - AI-powered analysis and investigations
9. **ChromaDB** - Knowledge base (automatically initialized)

---

## Step-by-Step Setup

### Step 1: Install Required Software ✅

#### Windows
```powershell
# Check if Python 3.11+ is installed
python --version
# Should show Python 3.11.x or 3.12.x

# Check if Node.js 18+ is installed
node --version
# Should show v18.x.x or higher

# If not installed:
# Download Python: https://www.python.org/downloads/
# Download Node.js: https://nodejs.org/
```

#### Linux (Ubuntu/Debian)
```bash
# Update package manager
sudo apt update

# Install Python 3.11+
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
python3 --version
node --version
```

---

### Step 2: Clone and Set Up Repository ✅

```bash
# Clone the repository
git clone https://github.com/manuel13-mg/CyberSage.git
cd CyberSage
```

---

### Step 3: Set Up Backend (Required) ✅

#### Windows
```powershell
cd Backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
Copy-Item .env.example .env

# Edit .env file (we'll configure this in Step 4)
notepad .env

# Run database migrations
python -m alembic upgrade head

# Go back to root
cd ..
```

#### Linux
```bash
cd Backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env file (we'll configure this in Step 4)
nano .env  # or vim .env

# Run database migrations
python -m alembic upgrade head

# Go back to root
cd ..
```

---

### Step 4: Configure Backend Environment ✅

Edit `Backend/.env` with your settings:

```env
# Environment
APP_ENV=development

# Database (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite:///./cybersage.db
# For PostgreSQL: DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/cybersage

# AI Provider (Optional - for investigations and analysis)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
AI_PROVIDER=gemini
GEMINI_TIMEOUT_SECONDS=45
AI_MAX_STEPS=8

# Knowledge Base (Automatically initialized)
KNOWLEDGE_STORE_PATH=./knowledge_store
KNOWLEDGE_EMBEDDING_PROVIDER=local_hash
KNOWLEDGE_EMBEDDING_MODEL=local-hash-v1

# Frontend
FRONTEND_ORIGIN=http://127.0.0.1:5173

# Neo4j (Optional - for graph visualization)
NEO4J_URL=
NEO4J_USERNAME=
NEO4J_PASSWORD=
NEO4J_DATABASE=neo4j
```

**What you MUST configure NOW:**
- Nothing! SQLite works out of the box for development.

**What you SHOULD configure for full features:**
- `GEMINI_API_KEY` - Get from https://aistudio.google.com/ (see below)

**What you CAN configure later:**
- PostgreSQL database
- Neo4j graph database

---

### Step 5: Set Up Frontend (Required) ✅

```bash
cd Frontend

# Install dependencies
npm install

# Go back to root
cd ..
```

---

### Step 6: Start CyberSage (Required) ✅

#### Option A: Using Deployment Scripts (Recommended)

**Windows:**
```powershell
.\deployment\scripts\start-cybersage.ps1
```

**Linux:**
```bash
./deployment/scripts/start-cybersage.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Run database migrations
- ✅ Start backend API on http://127.0.0.1:8000
- ✅ Start frontend on http://127.0.0.1:5173
- ✅ Validate health

#### Option B: Manual Start (Alternative)

**Terminal 1 - Backend:**
```bash
cd Backend
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

---

### Step 7: Verify Installation ✅

Open your browser and visit:

1. **Frontend:** http://127.0.0.1:5173
   - You should see the CyberSage dashboard

2. **Backend Health:** http://127.0.0.1:8000/api/v1/health
   - Should return: `{"status":"ok","service":"cybersage-api"}`

3. **API Documentation:** http://127.0.0.1:8000/docs
   - Interactive API documentation

4. **Component Status:** http://127.0.0.1:8000/api/v1/components/status
   - Shows which integrations are working

---

## Optional Integrations (For Full Features)

### Option 1: Gemini API (AI Features) 🤖

**What it enables:**
- AI-powered vulnerability analysis
- Security investigation assistance
- Automated finding interpretation
- Natural language security queries

**How to set up:**

1. **Get API Key:**
   - Visit https://aistudio.google.com/
   - Sign in with Google account
   - Click "Get API Key"
   - Create API key
   - Copy the key (starts with "AIza...")

2. **Configure:**
   ```bash
   # Edit Backend/.env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```

3. **Restart backend**

4. **Test:**
   ```bash
   curl http://127.0.0.1:8000/api/v1/ai/provider/status
   # Should show "configured": true
   ```

**Cost:** Free tier available (60 requests/minute)

---

### Option 2: PostgreSQL (Production Database) 🗄️

**What it enables:**
- Better performance for large assessments
- Concurrent access support
- Production-ready persistence

**When to use:** For serious testing or production deployment

**How to set up:**

#### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run installer (default settings work)
3. Remember the password you set for `postgres` user

```powershell
# Create database
psql -U postgres
CREATE DATABASE cybersage;
CREATE USER cybersage WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cybersage TO cybersage;
\q
```

#### Linux
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE cybersage;
CREATE USER cybersage WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE cybersage TO cybersage;
\q
```

**Configure:**
```bash
# Edit Backend/.env
DATABASE_URL=postgresql+psycopg://cybersage:your_secure_password@localhost:5432/cybersage
```

**Run migrations:**
```bash
cd Backend
source .venv/bin/activate
python -m alembic upgrade head
```

---

### Option 3: Neo4j (Graph Visualization) 🕸️

**What it enables:**
- Visual attack path graphs
- Relationship mapping
- Graph-based vulnerability analysis

**When to use:** For advanced attack path visualization

**How to set up:**

#### Windows
1. Download Neo4j Desktop: https://neo4j.com/download/
2. Install and create a new database
3. Start the database
4. Note the connection details

#### Linux
```bash
# Add Neo4j repository
wget -O - https://debian.neo4j.com/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.com stable latest' | sudo tee /etc/apt/sources.list.d/neo4j.list

# Install
sudo apt update
sudo apt install neo4j

# Start service
sudo systemctl start neo4j
sudo systemctl enable neo4j

# Set password (default user: neo4j, password: neo4j)
cypher-shell -u neo4j -p neo4j
ALTER USER neo4j SET PASSWORD 'your_secure_password';
:exit
```

**Configure:**
```bash
# Edit Backend/.env
NEO4J_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_secure_password
NEO4J_DATABASE=neo4j
```

**Test:**
```bash
curl http://127.0.0.1:8000/api/v1/graph/status
# Should show "status": "connected"
```

---

### Option 4: Nuclei (Vulnerability Scanner) 🔍

**What it enables:**
- Automated vulnerability scanning
- Template-based security testing
- Finding generation from real scans

**When to use:** Essential for actual security assessments

**How to set up:**

#### Windows
```powershell
# Download latest release from GitHub
# https://github.com/projectdiscovery/nuclei/releases

# Extract nuclei.exe to C:\Windows or add to PATH

# Verify installation
nuclei -version

# Update templates
nuclei -update-templates
```

#### Linux
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

**Test:**
```bash
curl http://127.0.0.1:8000/api/v1/scanners
# Should show nuclei as "available"
```

**No configuration needed** - CyberSage auto-detects Nuclei if on PATH

---

## First Use: Register a Target

Now that everything is connected, let's do your first security assessment:

### Option A: Test with OWASP Juice Shop (Recommended for Learning)

1. **Install OWASP Juice Shop:**
   ```bash
   # Using Docker (easiest)
   docker run --rm -p 3000:3000 bkimminich/juice-shop
   
   # Or using npm
   npm install -g juice-shop
   juice-shop
   ```

2. **Register in CyberSage:**
   - Open http://127.0.0.1:5173
   - Click "Targets" → "New Target"
   - Fill in:
     - Name: `OWASP Juice Shop`
     - Base URL: `http://127.0.0.1:3000`
     - Environment: `local_lab`
     - Allowed Domains: `127.0.0.1`
   - **Check the authorization confirmation box**
   - Add authorization notes: "Local test target for learning"
   - Click "Create Target"

3. **Create Assessment:**
   - Click "Assessments" → "New Assessment"
   - Select your target
   - Name: "Initial Security Assessment"
   - Click "Create"

4. **Run Scan (if Nuclei installed):**
   - Open the assessment
   - Click "Run Scan"
   - **Check authorization confirmation**
   - Wait for results

### Option B: Test Your Own Application

**⚠️ IMPORTANT: Authorization Required**

Only scan applications you:
- Own completely
- Have explicit written permission to test
- Are running in your own local environment

**Never scan:**
- Production websites without permission
- Third-party websites
- Public websites
- Any system you don't own

---

## Component Status Overview

Check what's working:

```bash
# Health check
curl http://127.0.0.1:8000/api/v1/health

# Component status
curl http://127.0.0.1:8000/api/v1/components/status

# Scanner status
curl http://127.0.0.1:8000/api/v1/scanners

# AI status
curl http://127.0.0.1:8000/api/v1/ai/provider/status

# Graph status
curl http://127.0.0.1:8000/api/v1/graph/status
```

Or use the health check script:
```bash
./deployment/scripts/health-check.sh  # Linux
```

---

## What Works Without Optional Components

### ✅ Without Gemini API
- Manual vulnerability analysis
- Finding management
- Target and assessment management
- Report generation (without AI insights)
- Workflow orchestration

### ✅ Without PostgreSQL
- Everything works with SQLite
- Single-user development
- Testing and learning

### ✅ Without Neo4j
- Everything except graph visualization
- Attack paths still analyzed (no visual graph)
- All other features work

### ✅ Without Nuclei
- Manual finding entry
- Import findings from other tools
- Investigation and reporting
- Everything except automated scanning

---

## Minimum Setup for Basic Use

**Absolutely minimum (30 minutes):**
1. ✅ Python 3.11+
2. ✅ Node.js 18+
3. ✅ Backend dependencies (`pip install -r requirements.txt`)
4. ✅ Frontend dependencies (`npm install`)
5. ✅ Start both services

**This gives you:**
- ✅ Complete web interface
- ✅ Target and assessment management
- ✅ Manual finding entry
- ✅ Report generation
- ✅ SQLite database

---

## Recommended Setup for Full Features

**For complete experience (60 minutes):**
1. ✅ All minimum setup above
2. 🤖 Gemini API key (5 minutes) - **Highly recommended**
3. 🔍 Nuclei scanner (5 minutes) - **Highly recommended**
4. 🗄️ PostgreSQL (15 minutes) - Optional
5. 🕸️ Neo4j (15 minutes) - Optional

**This gives you:**
- ✅ Everything from minimum
- 🤖 AI-powered analysis and investigations
- 🔍 Automated vulnerability scanning
- 🗄️ Production-ready database
- 🕸️ Graph-based attack path visualization

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Windows:
netstat -ano | findstr :8000

# Linux:
lsof -i :8000

# Kill the process if needed
```

### Frontend won't start
```bash
# Check if port 5173 is in use
# Windows:
netstat -ano | findstr :5173

# Linux:
lsof -i :5173

# Try: npm install again
cd Frontend
rm -rf node_modules package-lock.json
npm install
```

### "Module not found" errors
```bash
# Reinstall backend dependencies
cd Backend
source .venv/bin/activate
pip install -r requirements.txt

# Reinstall frontend dependencies
cd Frontend
rm -rf node_modules
npm install
```

### Database migration errors
```bash
cd Backend
source .venv/bin/activate

# Check current version
python -m alembic current

# Try upgrading
python -m alembic upgrade head

# If it fails, check DATABASE_URL in .env
```

---

## Summary: Connection Checklist

| Component | Required? | Setup Time | Gives You |
|-----------|-----------|------------|-----------|
| Python 3.11+ | ✅ Yes | 5 min | Backend runtime |
| Node.js 18+ | ✅ Yes | 5 min | Frontend runtime |
| Backend deps | ✅ Yes | 5 min | API functionality |
| Frontend deps | ✅ Yes | 5 min | Web interface |
| Gemini API | 🟡 Recommended | 5 min | AI analysis |
| Nuclei | 🟡 Recommended | 5 min | Auto scanning |
| PostgreSQL | ⚪ Optional | 15 min | Production DB |
| Neo4j | ⚪ Optional | 15 min | Graph viz |

---

## Quick Start Commands

**Fastest path to running CyberSage:**

```bash
# 1. Install prerequisites (Python 3.11+, Node.js 18+)

# 2. Clone and setup
git clone https://github.com/manuel13-mg/CyberSage.git
cd CyberSage

# 3. Backend setup
cd Backend
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
python -m alembic upgrade head
cd ..

# 4. Frontend setup
cd Frontend
npm install
cd ..

# 5. Start everything
./deployment/scripts/start-cybersage.sh  # Windows: .\deployment\scripts\start-cybersage.ps1

# 6. Open browser
# http://127.0.0.1:5173
```

That's it! You now have CyberSage running with basic features.

**Add Gemini for AI features:**
1. Get key from https://aistudio.google.com/
2. Edit `Backend/.env`: `GEMINI_API_KEY=your_key_here`
3. Restart backend

---

## Next Steps

1. **Read the User Guide** (when created)
2. **Try a scan** with OWASP Juice Shop
3. **Explore AI investigations** (if Gemini configured)
4. **Generate a security report**
5. **Set up automated backups** with `./deployment/scripts/backup.sh`

---

## Support

- 📖 Full Installation Guide: `docs/INSTALLATION.md`
- 🔒 Security Guide: `docs/SECURITY.md`
- 💾 Backup Guide: `docs/BACKUP_AND_RECOVERY.md`
- 📋 API Documentation: http://127.0.0.1:8000/docs (when running)

---

**Last Updated:** 2026-11-06  
**Version:** 1.0
