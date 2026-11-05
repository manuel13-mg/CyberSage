# Database schema

The Phase 2 migration `Backend/alembic/versions/0001_phase2_foundation.py` creates:

- `targets`: registered applications, environment, enabled state, and soft-deletion timestamp.
- `target_scopes`: allowed domains, paths, restrictions, and authorization audit timestamp.
- `assessments`: assessment metadata and lifecycle status.
- `assessment_configurations`: future assessment options stored as structured JSON plus typed flags.

Relationships use foreign keys and indexes support active target listing and target assessment history. API keys are not stored in these tables.

Apply migrations from `Backend`:

```powershell
.\.venv\Scripts\Activate.ps1
python -m alembic upgrade head
```
