import logging
import socket
from urllib.parse import urlparse
from datetime import datetime, timezone
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .db import Base, engine, get_db
from .models import Assessment, AssessmentConfiguration, Target, TargetScope
from .schemas import (
    AssessmentCreate, AssessmentResponse, AssessmentUpdate, DashboardSummary,
    Page, ScopeInput, ScopeResponse, TargetCreate, TargetResponse, TargetUpdate,
)
from .validation import normalize_url, validate_scope

settings = get_settings()
logger = logging.getLogger("cybersage.api")
app = FastAPI(title="CyberSage API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.exception("Database request failed: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=503, content={"detail": "Database service is unavailable"})


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    logger.info("Core API health check succeeded")
    return {"status": "ok", "service": "cybersage-api", "environment": settings.app_env}


@app.get("/api/v1/config/status")
def config_status() -> dict[str, str | bool]:
    return {
        "gemini_configured": bool(settings.gemini_api_key),
        "gemini_model": settings.gemini_model,
    }


def _database_status(name: str, url: str) -> dict[str, str]:
    if not url:
        return {"status": "not_configured"}

    parsed = urlparse(url)
    if not parsed.hostname:
        logger.error("%s configuration is invalid: hostname is missing", name)
        return {"status": "error", "detail": "Configured URL has no hostname"}

    default_port = 5432 if name == "postgresql" else 7687
    try:
        with socket.create_connection((parsed.hostname, parsed.port or default_port), timeout=0.5):
            return {"status": "connected"}
    except OSError:
        logger.exception("%s connectivity check failed", name)
        return {"status": "error", "detail": "Configured service is unreachable"}


def _postgresql_status() -> dict[str, str]:
    if not settings.database_url.startswith(("postgresql://", "postgresql+psycopg://")):
        return {"status": "not_configured"}
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "connected"}
    except SQLAlchemyError:
        logger.exception("PostgreSQL connectivity check failed")
        return {"status": "error", "detail": "Configured database is unavailable"}


@app.get("/api/v1/components/status")
def component_status() -> dict[str, dict[str, str]]:
    try:
        return {
            "gemini": {"status": "configured" if settings.gemini_api_key else "not_configured"},
            "postgresql": _postgresql_status(),
            "neo4j": _database_status("neo4j", settings.neo4j_url),
        }
    except Exception:
        logger.exception("Component health check failed unexpectedly")
        raise


def _target_response(target: Target) -> TargetResponse:
    return TargetResponse.model_validate(target).model_copy(update={"assessment_count": len(target.assessments)})


def _assessment_response(assessment: Assessment) -> AssessmentResponse:
    return AssessmentResponse.from_model(assessment)


@app.get("/api/v1/targets", response_model=Page)
def list_targets(
    db: Session = Depends(get_db),
    search: str = "",
    environment: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> Page:
    query = select(Target).options(joinedload(Target.scope), joinedload(Target.assessments)).where(Target.deleted_at.is_(None))
    if search:
        query = query.where(Target.name.ilike(f"%{search}%"))
    if environment:
        query = query.where(Target.environment == environment)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    targets = db.scalars(query.order_by(Target.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).unique().all()
    return Page(items=[_target_response(target) for target in targets], total=total, page=page, page_size=page_size)


@app.post("/api/v1/targets", response_model=TargetResponse, status_code=status.HTTP_201_CREATED)
def create_target(payload: TargetCreate, db: Session = Depends(get_db)) -> TargetResponse:
    local_lab = payload.environment.value == "local_lab"
    base_url = normalize_url(str(payload.base_url), local_lab=local_lab)
    allowed_domains = validate_scope(base_url, payload.scope.allowed_domains, payload.scope.allow_subdomains)
    duplicate = db.scalar(select(Target).where(Target.base_url == base_url, Target.deleted_at.is_(None)))
    if duplicate:
        raise HTTPException(status_code=409, detail="A target with this base URL already exists")
    if not payload.scope.authorization_confirmed:
        raise HTTPException(status_code=422, detail="Explicit authorization confirmation is required")
    target = Target(
        name=payload.name, base_url=base_url, description=payload.description,
        environment=payload.environment.value, owner=payload.owner, enabled=payload.enabled,
    )
    target.scope = TargetScope(
        allowed_domains=allowed_domains, included_paths=payload.scope.included_paths,
        excluded_paths=payload.scope.excluded_paths, excluded_endpoints=payload.scope.excluded_endpoints,
        allow_subdomains=payload.scope.allow_subdomains, testing_restrictions=payload.scope.testing_restrictions,
        authorization_confirmed=True, authorization_confirmed_at=datetime.now(timezone.utc),
        authorization_notes=payload.scope.authorization_notes,
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    return _target_response(target)


@app.get("/api/v1/targets/{target_id}", response_model=TargetResponse)
def get_target(target_id: UUID, db: Session = Depends(get_db)) -> TargetResponse:
    target = db.scalar(select(Target).options(joinedload(Target.scope), joinedload(Target.assessments)).where(Target.id == target_id, Target.deleted_at.is_(None)))
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return _target_response(target)


@app.put("/api/v1/targets/{target_id}", response_model=TargetResponse)
def update_target(target_id: UUID, payload: TargetUpdate, db: Session = Depends(get_db)) -> TargetResponse:
    target = db.scalar(select(Target).options(joinedload(Target.scope), joinedload(Target.assessments)).where(Target.id == target_id, Target.deleted_at.is_(None)))
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    changes = payload.model_dump(exclude_unset=True)
    if "base_url" in changes:
        target.base_url = normalize_url(str(changes["base_url"]), local_lab=target.environment == "local_lab")
    if "environment" in changes:
        target.environment = changes["environment"].value
    for key in ("name", "description", "owner", "enabled"):
        if key in changes:
            setattr(target, key, changes[key])
    db.commit()
    db.refresh(target)
    return _target_response(target)


@app.delete("/api/v1/targets/{target_id}", status_code=status.HTTP_204_NO_CONTENT)
def archive_target(target_id: UUID, db: Session = Depends(get_db)) -> None:
    target = db.get(Target, target_id)
    if not target or target.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Target not found")
    target.deleted_at = datetime.now(timezone.utc)
    target.enabled = False
    db.commit()


@app.get("/api/v1/targets/{target_id}/scope", response_model=ScopeResponse)
def get_scope(target_id: UUID, db: Session = Depends(get_db)) -> TargetScope:
    scope = db.scalar(select(TargetScope).where(TargetScope.target_id == target_id))
    if not scope:
        raise HTTPException(status_code=404, detail="Target scope not found")
    return scope


@app.put("/api/v1/targets/{target_id}/scope", response_model=ScopeResponse)
def update_scope(target_id: UUID, payload: ScopeInput, db: Session = Depends(get_db)) -> TargetScope:
    target = db.scalar(select(Target).where(Target.id == target_id, Target.deleted_at.is_(None)))
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    allowed_domains = validate_scope(target.base_url, payload.allowed_domains, payload.allow_subdomains)
    if not payload.authorization_confirmed:
        raise HTTPException(status_code=422, detail="Explicit authorization confirmation is required")
    scope = db.scalar(select(TargetScope).where(TargetScope.target_id == target_id))
    if not scope:
        scope = TargetScope(target_id=target_id)
        db.add(scope)
    for key in ("included_paths", "excluded_paths", "excluded_endpoints", "allow_subdomains", "testing_restrictions", "authorization_notes"):
        setattr(scope, key, getattr(payload, key))
    scope.allowed_domains = allowed_domains
    scope.authorization_confirmed = True
    scope.authorization_confirmed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(scope)
    return scope


@app.get("/api/v1/assessments", response_model=Page)
def list_assessments(
    db: Session = Depends(get_db),
    search: str = "",
    assessment_status: str | None = Query(None, alias="status"),
    target_id: UUID | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> Page:
    query = select(Assessment).options(joinedload(Assessment.target), joinedload(Assessment.configuration))
    if search:
        query = query.where(Assessment.name.ilike(f"%{search}%"))
    if assessment_status:
        query = query.where(Assessment.status == assessment_status)
    if target_id:
        query = query.where(Assessment.target_id == target_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Assessment.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).unique().all()
    return Page(items=[_assessment_response(row) for row in rows], total=total, page=page, page_size=page_size)


@app.post("/api/v1/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db)) -> AssessmentResponse:
    target = db.scalar(select(Target).options(joinedload(Target.scope)).where(Target.id == payload.target_id, Target.deleted_at.is_(None)))
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    if not target.enabled or not target.scope or not target.scope.authorization_confirmed:
        raise HTTPException(status_code=422, detail="An enabled target with confirmed authorization is required")
    assessment = Assessment(name=payload.name, description=payload.description, target_id=target.id, purpose=payload.purpose, status="draft")
    assessment.configuration = AssessmentConfiguration(**payload.configuration.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return _assessment_response(assessment)


@app.get("/api/v1/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: UUID, db: Session = Depends(get_db)) -> AssessmentResponse:
    assessment = db.scalar(select(Assessment).options(joinedload(Assessment.target), joinedload(Assessment.configuration)).where(Assessment.id == assessment_id))
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return _assessment_response(assessment)


@app.put("/api/v1/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(assessment_id: UUID, payload: AssessmentUpdate, db: Session = Depends(get_db)) -> AssessmentResponse:
    assessment = db.scalar(select(Assessment).options(joinedload(Assessment.target), joinedload(Assessment.configuration)).where(Assessment.id == assessment_id))
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    changes = payload.model_dump(exclude_unset=True)
    if "status" in changes and changes["status"] not in {"draft", "queued", "running", "completed", "failed", "cancelled"}:
        raise HTTPException(status_code=422, detail="Invalid assessment status")
    configuration = changes.pop("configuration", None)
    for key, value in changes.items():
        setattr(assessment, key, value)
    if configuration:
        for key, value in configuration.items():
            setattr(assessment.configuration, key, value)
    db.commit()
    db.refresh(assessment)
    return _assessment_response(assessment)


@app.delete("/api/v1/assessments/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assessment(assessment_id: UUID, db: Session = Depends(get_db)) -> None:
    assessment = db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()


@app.get("/api/v1/targets/{target_id}/assessments", response_model=Page)
def target_assessments(target_id: UUID, db: Session = Depends(get_db), page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)) -> Page:
    return list_assessments(db=db, target_id=target_id, page=page, page_size=page_size)


@app.get("/api/v1/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    total_targets = db.scalar(select(func.count(Target.id)).where(Target.deleted_at.is_(None))) or 0
    active_assessments = db.scalar(select(func.count(Assessment.id)).where(Assessment.status.in_(["queued", "running"]))) or 0
    open_findings = db.scalar(select(func.coalesce(func.sum(Assessment.findings_count), 0))) or 0
    latest = db.scalar(select(Assessment).options(joinedload(Assessment.target), joinedload(Assessment.configuration)).order_by(Assessment.created_at.desc()).limit(1))
    return DashboardSummary(
        total_targets=total_targets, active_assessments=active_assessments,
        open_findings=open_findings, critical_exposure=0,
        latest_assessment=_assessment_response(latest) if latest else None,
    )
