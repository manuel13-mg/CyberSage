"""Security tests for authorization and scope enforcement."""
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Target, Assessment


class TestAuthorizationEnforcement:
    """Test suite for authorization requirement enforcement."""

    def test_cannot_create_assessment_without_authorization(
        self, client: TestClient, unauthorized_target: Target
    ):
        """Test that assessments cannot be created for unauthorized targets."""
        response = client.post(
            "/api/v1/assessments",
            json={
                "name": "Unauthorized Assessment",
                "description": "Should fail",
                "target_id": str(unauthorized_target.id),
                "purpose": "Testing",
            },
        )
        assert response.status_code == 422
        assert "authorization" in response.json()["detail"].lower()

    def test_can_create_assessment_with_authorization(
        self, client: TestClient, authorized_target: Target
    ):
        """Test that assessments can be created for authorized targets."""
        response = client.post(
            "/api/v1/assessments",
            json={
                "name": "Authorized Assessment",
                "description": "Should succeed",
                "target_id": str(authorized_target.id),
                "purpose": "Security testing",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Authorized Assessment"
        assert data["target_id"] == str(authorized_target.id)

    def test_cannot_run_job_without_authorization_confirmation(
        self, client: TestClient, draft_assessment: Assessment
    ):
        """Test that scanner jobs require explicit authorization confirmation."""
        response = client.post(
            f"/api/v1/assessments/{draft_assessment.id}/run",
            json={
                "confirm_authorization": False,  # Not confirmed
                "scanner_type": "nuclei",
            },
        )
        assert response.status_code == 422
        assert "authorization" in response.json()["detail"].lower()

    def test_scope_confirmation_requires_explicit_flag(
        self, client: TestClient, unauthorized_target: Target
    ):
        """Test that scope confirmation requires explicit authorization flag."""
        response = client.put(
            f"/api/v1/targets/{unauthorized_target.id}/scope",
            json={
                "allowed_domains": ["example.com"],
                "included_paths": ["/*"],
                "excluded_paths": [],
                "authorization_confirmed": False,  # Not confirming
                "authorization_notes": "Test",
            },
        )
        assert response.status_code == 422
        assert "authorization" in response.json()["detail"].lower()


class TestScopeEnforcement:
    """Test suite for URL scope validation and enforcement."""

    def test_rejects_urls_with_credentials(self, client: TestClient, authorized_target: Target):
        """Test that URLs with embedded credentials are rejected."""
        from app.scanners.scope import validate_url_in_scope
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(authorized_target, "http://user:pass@127.0.0.1:3000/")

        assert exc_info.value.status_code == 422
        assert "credential" in exc_info.value.detail.lower()

    def test_rejects_non_http_schemes(self, client: TestClient, authorized_target: Target):
        """Test that non-HTTP/HTTPS schemes are rejected."""
        from app.scanners.scope import validate_url_in_scope
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(authorized_target, "ftp://127.0.0.1:3000/")

        assert exc_info.value.status_code == 422

    def test_rejects_out_of_scope_domain(self, client: TestClient, authorized_target: Target):
        """Test that URLs outside allowed domains are rejected."""
        from app.scanners.scope import validate_url_in_scope
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(authorized_target, "http://evil.com/")

        assert exc_info.value.status_code == 422
        assert "domain scope" in exc_info.value.detail.lower()

    def test_rejects_excluded_path(self, client: TestClient, db_session: Session):
        """Test that excluded paths are rejected."""
        from app.scanners.scope import validate_url_in_scope
        from fastapi import HTTPException

        target = Target(
            id=uuid4(),
            name="Path Test Target",
            base_url="http://127.0.0.1:3000",
            environment="local_lab",
            enabled=True,
        )
        db_session.add(target)
        db_session.flush()

        from app.models import TargetScope
        scope = TargetScope(
            id=uuid4(),
            target_id=target.id,
            allowed_domains=["127.0.0.1"],
            included_paths=["/*"],
            excluded_paths=["/admin/*"],
            authorization_confirmed=True,
        )
        target.scope = scope
        db_session.add(scope)
        db_session.commit()

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(target, "http://127.0.0.1:3000/admin/users")

        assert exc_info.value.status_code == 422
        assert "excluded" in exc_info.value.detail.lower()

    def test_accepts_in_scope_url(self, client: TestClient, authorized_target: Target):
        """Test that valid in-scope URLs are accepted."""
        from app.scanners.scope import validate_url_in_scope

        result = validate_url_in_scope(authorized_target, "http://127.0.0.1:3000/login")
        assert result == "http://127.0.0.1:3000/login"


class TestIDORPrevention:
    """Test suite for Insecure Direct Object Reference (IDOR) prevention.

    Note: CyberSage is single-user, but these tests verify that ID manipulation
    cannot expose data from other assessments/targets."""

    def test_cannot_access_nonexistent_assessment(self, client: TestClient):
        """Test that non-existent assessment IDs return 404."""
        fake_id = uuid4()
        response = client.get(f"/api/v1/assessments/{fake_id}")
        assert response.status_code == 404

    def test_cannot_access_nonexistent_target(self, client: TestClient):
        """Test that non-existent target IDs return 404."""
        fake_id = uuid4()
        response = client.get(f"/api/v1/targets/{fake_id}")
        assert response.status_code == 404

    def test_cannot_modify_nonexistent_assessment(self, client: TestClient):
        """Test that updates to non-existent assessments fail."""
        fake_id = uuid4()
        response = client.put(
            f"/api/v1/assessments/{fake_id}",
            json={"name": "Hacked", "description": "Should fail"},
        )
        assert response.status_code == 404


class TestPrivateIPProtection:
    """Test suite for private IP address protection."""

    def test_blocks_private_ips_for_production_targets(self, client: TestClient, db_session: Session):
        """Test that private IPs are blocked for non-local_lab environments."""
        target = Target(
            id=uuid4(),
            name="Production Target",
            base_url="https://example.com",
            environment="production",  # Not local_lab
            enabled=True,
        )
        db_session.add(target)
        db_session.flush()

        from app.models import TargetScope
        scope = TargetScope(
            id=uuid4(),
            target_id=target.id,
            allowed_domains=["example.com", "192.168.1.1"],  # Private IP in scope
            authorization_confirmed=True,
        )
        target.scope = scope
        db_session.add(scope)
        db_session.commit()

        from app.scanners.scope import validate_url_in_scope
        from fastapi import HTTPException

        # Should reject private IP for production target
        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(target, "http://192.168.1.1/")

        assert exc_info.value.status_code == 422
        assert "private" in exc_info.value.detail.lower() or "local_lab" in exc_info.value.detail.lower()

    def test_allows_private_ips_for_local_lab(self, client: TestClient, authorized_target: Target):
        """Test that private IPs are allowed for local_lab environment."""
        from app.scanners.scope import validate_url_in_scope

        # authorized_target is local_lab, so private IPs should be allowed
        result = validate_url_in_scope(authorized_target, "http://127.0.0.1:3000/")
        assert result == "http://127.0.0.1:3000/"


class TestInputValidation:
    """Test suite for input validation and injection prevention."""

    def test_rejects_oversized_target_name(self, client: TestClient):
        """Test that oversized inputs are rejected."""
        response = client.post(
            "/api/v1/targets",
            json={
                "name": "A" * 200,  # Exceeds 160 char limit
                "base_url": "http://127.0.0.1:3000",
                "environment": "local_lab",
                "scope": {
                    "allowed_domains": ["127.0.0.1"],
                    "authorization_confirmed": True,
                    "authorization_notes": "Test",
                },
            },
        )
        assert response.status_code == 422

    def test_validates_environment_enum(self, client: TestClient):
        """Test that invalid enum values are rejected."""
        response = client.post(
            "/api/v1/targets",
            json={
                "name": "Test",
                "base_url": "http://127.0.0.1:3000",
                "environment": "invalid_environment",  # Invalid
                "scope": {
                    "allowed_domains": ["127.0.0.1"],
                    "authorization_confirmed": True,
                    "authorization_notes": "Test",
                },
            },
        )
        assert response.status_code == 422

    def test_requires_valid_url_format(self, client: TestClient):
        """Test that malformed URLs are rejected."""
        response = client.post(
            "/api/v1/targets",
            json={
                "name": "Test",
                "base_url": "not-a-valid-url",
                "environment": "local_lab",
                "scope": {
                    "allowed_domains": ["127.0.0.1"],
                    "authorization_confirmed": True,
                    "authorization_notes": "Test",
                },
            },
        )
        assert response.status_code == 422
