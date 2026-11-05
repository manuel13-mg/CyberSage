from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint_returns_service_status() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "cybersage-api"


def test_config_status_does_not_expose_api_key() -> None:
    response = client.get("/api/v1/config/status")

    assert response.status_code == 200
    assert "gemini_api_key" not in response.json()


def test_vite_origins_are_allowed() -> None:
    response = client.get(
        "/api/v1/health",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_core_health_is_independent_of_optional_services() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_unconfigured_components_are_reported_without_secrets() -> None:
    response = client.get("/api/v1/components/status")

    assert response.status_code == 200
    assert response.json() == {
        "gemini": {"status": "not_configured"},
        "postgresql": {"status": "not_configured"},
        "neo4j": {"status": "not_configured"},
    }


def test_health_does_not_depend_on_database_configuration() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200


def test_phase2_cors_allows_write_methods() -> None:
    response = client.options(
        "/api/v1/targets",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert "POST" in response.headers["access-control-allow-methods"]
