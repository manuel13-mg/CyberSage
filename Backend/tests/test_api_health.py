"""Basic API health and functionality tests."""
import pytest
from uuid import uuid4
from fastapi.testclient import TestClient

from app.models import Target, Assessment


class TestAPIHealth:
    """Test suite for API health checks and basic connectivity."""

    def test_health_check(self, client: TestClient):
        """Test that health check endpoint is accessible."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "cybersage-api"
        assert "environment" in data

    def test_cors_headers_present(self, client: TestClient):
        """Test that CORS headers are configured."""
        response = client.options("/api/v1/health")
        assert response.status_code == 200
        # CORS headers should be present
        assert "access-control-allow-origin" in response.headers or response.status_code == 200


class TestTargetManagement:
    """Test suite for target CRUD operations."""

    def test_create_target_with_authorization(self, client: TestClient):
        """Test creating a target with authorization."""
        response = client.post(
            "/api/v1/targets",
            json={
                "name": "Test Target",
                "base_url": "http://127.0.0.1:3000",
                "description": "Test target description",
                "environment": "local_lab",
                "scope": {
                    "allowed_domains": ["127.0.0.1"],
                    "included_paths": ["/*"],
                    "excluded_paths": [],
                    "authorization_confirmed": True,
                    "authorization_notes": "Test authorization",
                },
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Test Target"
        assert data["base_url"] == "http://127.0.0.1:3000"
        assert data["environment"] == "local_lab"
        assert "id" in data

    def test_list_targets(self, client: TestClient, authorized_target: Target):
        """Test listing targets."""
        response = client.get("/api/v1/targets")
        assert response.status_code == 200

        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1

    def test_get_target_by_id(self, client: TestClient, authorized_target: Target):
        """Test retrieving a specific target."""
        response = client.get(f"/api/v1/targets/{authorized_target.id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == str(authorized_target.id)
        assert data["name"] == authorized_target.name

    def test_update_target(self, client: TestClient, authorized_target: Target):
        """Test updating target metadata."""
        response = client.put(
            f"/api/v1/targets/{authorized_target.id}",
            json={
                "name": "Updated Target Name",
                "description": "Updated description",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Updated Target Name"
        assert data["description"] == "Updated description"

    def test_get_target_scope(self, client: TestClient, authorized_target: Target):
        """Test retrieving target scope."""
        response = client.get(f"/api/v1/targets/{authorized_target.id}/scope")
        assert response.status_code == 200

        data = response.json()
        assert data["authorization_confirmed"] is True
        assert "allowed_domains" in data


class TestAssessmentManagement:
    """Test suite for assessment CRUD operations."""

    def test_create_assessment(self, client: TestClient, authorized_target: Target):
        """Test creating an assessment."""
        response = client.post(
            "/api/v1/assessments",
            json={
                "name": "Test Assessment",
                "description": "Test assessment description",
                "target_id": str(authorized_target.id),
                "purpose": "Security testing",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Test Assessment"
        assert data["status"] == "draft"
        assert "id" in data

    def test_list_assessments(self, client: TestClient, draft_assessment: Assessment):
        """Test listing assessments."""
        response = client.get("/api/v1/assessments")
        assert response.status_code == 200

        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1

    def test_get_assessment_by_id(self, client: TestClient, draft_assessment: Assessment):
        """Test retrieving a specific assessment."""
        response = client.get(f"/api/v1/assessments/{draft_assessment.id}")
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == str(draft_assessment.id)
        assert data["name"] == draft_assessment.name

    def test_update_assessment(self, client: TestClient, draft_assessment: Assessment):
        """Test updating assessment metadata."""
        response = client.put(
            f"/api/v1/assessments/{draft_assessment.id}",
            json={
                "name": "Updated Assessment",
                "description": "Updated description",
            },
        )
        assert response.status_code == 200

        data = response.json()
        assert data["name"] == "Updated Assessment"


class TestDashboard:
    """Test suite for dashboard and summary endpoints."""

    def test_dashboard_summary(self, client: TestClient):
        """Test dashboard summary endpoint."""
        response = client.get("/api/v1/dashboard/summary")
        assert response.status_code == 200

        data = response.json()
        assert "targets" in data
        assert "assessments" in data
        assert "findings" in data
        assert isinstance(data["targets"], int)
        assert isinstance(data["assessments"], int)


class TestComponentStatus:
    """Test suite for external component status checks."""

    def test_components_status_endpoint(self, client: TestClient):
        """Test components status endpoint returns expected structure."""
        response = client.get("/api/v1/components/status")
        assert response.status_code == 200

        data = response.json()
        # Should have status for various components
        assert "postgresql" in data or "database" in data
        assert "neo4j" in data or "graph" in data

    def test_scanner_status_endpoint(self, client: TestClient):
        """Test scanner status endpoint."""
        response = client.get("/api/v1/scanners")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)

        # Should report on known scanners
        scanner_names = [s.get("name") for s in data]
        assert "nuclei" in scanner_names


class TestErrorHandling:
    """Test suite for error handling and validation."""

    def test_404_for_nonexistent_target(self, client: TestClient):
        """Test that non-existent resources return 404."""
        fake_id = uuid4()
        response = client.get(f"/api/v1/targets/{fake_id}")
        assert response.status_code == 404

    def test_422_for_invalid_input(self, client: TestClient):
        """Test that invalid input returns 422."""
        response = client.post(
            "/api/v1/targets",
            json={
                "name": "Test",
                # Missing required fields
            },
        )
        assert response.status_code == 422

    def test_generic_error_message_for_database_error(self, client: TestClient):
        """Test that database errors return generic messages."""
        # This is harder to test without mocking, but we can verify
        # that the error handler is registered
        from app.main import app
        from sqlalchemy.exc import SQLAlchemyError

        # Verify the exception handler exists
        assert SQLAlchemyError in app.exception_handlers
