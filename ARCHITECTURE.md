# CyberSage architecture

The local-first application has a Vite React/TypeScript frontend and a FastAPI backend. The frontend calls the versioned `/api/v1` API through the Vite development proxy. Secrets, URL validation, authorization records, and persistence remain backend responsibilities.

Phase 2 persistence uses SQLAlchemy models in `Backend/app/models.py`. PostgreSQL is selected with `DATABASE_URL`; development defaults to SQLite for a self-contained local setup and tests. Production schema changes must use Alembic migrations.

Assessment creation persists configuration with `draft` status. No scanner process, shell command, HTTP crawl, or Gemini request is started in Phase 2.
