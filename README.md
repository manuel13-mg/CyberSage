# CyberSage

CyberSage is a local-first security intelligence workspace. Phase 2 adds authorized target management, scope configuration, persisted assessment drafts, and database-backed dashboard counts. It intentionally does not run scans or invent findings.

## Requirements

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ for shared persistence (SQLite is the default local development database)

## Windows setup

Open two PowerShell windows from the repository root.

### 1. Start the API

```powershell
cd Backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API health check is available at http://127.0.0.1:8000/api/v1/health.

### 2. Start the frontend

```powershell
cd Frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173. Vite proxies `/api/v1` requests to the local FastAPI server. Start the backend before loading the dashboard; when port 8000 is unavailable, Vite reports proxy requests as HTTP 500. Set `VITE_API_BASE_URL` in `Frontend/.env` only when using a different API origin.

## Verification

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
python -m pytest

cd ..\Frontend
npm run build
```

## Configuration and security

Gemini credentials are read only by the backend from `Backend/.env`; never place them in frontend environment variables or commit `.env`. Set `DATABASE_URL` to a PostgreSQL SQLAlchemy URL for shared persistence. Run `python -m alembic upgrade head` before starting the API; the application does not silently create PostgreSQL schemas.

Phase 2 provides target and assessment configuration only. It never starts a scanner, creates findings, or reports fabricated progress. Alembic is the schema authority; the API does not silently create or modify schemas at startup.
