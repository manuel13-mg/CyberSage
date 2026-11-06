"""Pytest configuration and shared fixtures for CyberSage tests."""
import pytest
from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db import Base, get_db
from app.main import app
from app.models import Target, TargetScope, Assessment, AssessmentConfiguration


@pytest.fixture(scope="function")
def db_engine():
    """Create an in-memory SQLite database engine for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Enable foreign key constraints for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine):
    """Create a new database session for a test."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database session override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def authorized_target(db_session: Session) -> Target:
    """Create a target with confirmed authorization scope."""
    target = Target(
        id=uuid4(),
        name="OWASP Juice Shop",
        base_url="http://127.0.0.1:3000",
        description="Local test target",
        environment="local_lab",
        owner="test_user",
        enabled=True,
    )
    db_session.add(target)
    db_session.flush()

    scope = TargetScope(
        id=uuid4(),
        target_id=target.id,
        allowed_domains=["127.0.0.1"],
        included_paths=["/*"],
        excluded_paths=[],
        excluded_endpoints=[],
        allow_subdomains=False,
        testing_restrictions="Local testing only",
        authorization_confirmed=True,
        authorization_confirmed_at=datetime.now(timezone.utc),
        authorization_notes="Test target authorization",
    )
    db_session.add(scope)
    db_session.commit()
    db_session.refresh(target)
    return target


@pytest.fixture
def unauthorized_target(db_session: Session) -> Target:
    """Create a target WITHOUT confirmed authorization."""
    target = Target(
        id=uuid4(),
        name="Unauthorized Target",
        base_url="http://example.com",
        description="Target without authorization",
        environment="staging",
        owner="test_user",
        enabled=True,
    )
    db_session.add(target)
    db_session.flush()

    scope = TargetScope(
        id=uuid4(),
        target_id=target.id,
        allowed_domains=["example.com"],
        included_paths=["/*"],
        excluded_paths=[],
        excluded_endpoints=[],
        allow_subdomains=False,
        testing_restrictions="",
        authorization_confirmed=False,  # Not authorized
        authorization_confirmed_at=None,
        authorization_notes="",
    )
    db_session.add(scope)
    db_session.commit()
    db_session.refresh(target)
    return target


@pytest.fixture
def draft_assessment(db_session: Session, authorized_target: Target) -> Assessment:
    """Create a draft assessment for testing."""
    assessment = Assessment(
        id=uuid4(),
        name="Test Assessment",
        description="Test assessment for unit tests",
        target_id=authorized_target.id,
        purpose="Security testing",
        status="draft",
        findings_count=0,
    )
    db_session.add(assessment)
    db_session.flush()

    config = AssessmentConfiguration(
        id=uuid4(),
        assessment_id=assessment.id,
        reconnaissance_enabled=True,
        passive_testing_enabled=True,
        active_testing_enabled=False,
        browser_crawling_enabled=False,
        technology_discovery_enabled=True,
        configuration_json={},
    )
    db_session.add(config)
    db_session.commit()
    db_session.refresh(assessment)
    return assessment
