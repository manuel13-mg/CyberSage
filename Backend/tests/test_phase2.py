from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_target_requires_authorization_confirmation() -> None:
    response = client.post(
        "/api/v1/targets",
        json={
            "name": f"Unauthorized {uuid4()}",
            "base_url": "https://example.com",
            "environment": "testing",
            "scope": {"allowed_domains": ["example.com"]},
        },
    )

    assert response.status_code == 422
    assert "authorization" in response.json()["detail"].lower()


def test_remote_private_target_is_rejected() -> None:
    response = client.post(
        "/api/v1/targets",
        json={
            "name": f"Private {uuid4()}",
            "base_url": "http://127.0.0.1:8080",
            "environment": "testing",
            "scope": {"allowed_domains": ["127.0.0.1"], "authorization_confirmed": True},
        },
    )

    assert response.status_code == 422
    assert "local_lab" in response.json()["detail"]


def test_scope_cannot_expand_to_unrelated_domain() -> None:
    response = client.post(
        "/api/v1/targets",
        json={
            "name": f"Scope boundary {uuid4()}",
            "base_url": "https://example.com",
            "environment": "testing",
            "scope": {
                "allowed_domains": ["example.com", "attacker.example.net"],
                "allow_subdomains": True,
                "authorization_confirmed": True,
            },
        },
    )

    assert response.status_code == 422
    assert "belong" in response.json()["detail"]


def test_authorized_local_target_can_create_draft_assessment() -> None:
    port = 3000 + uuid4().int % 1000
    target = client.post(
        "/api/v1/targets",
        json={
            "name": f"Local target {uuid4()}",
            "base_url": f"http://127.0.0.1:{port}",
            "environment": "local_lab",
            "scope": {"allowed_domains": ["127.0.0.1"], "authorization_confirmed": True},
        },
    )
    assert target.status_code == 201

    assessment = client.post(
        "/api/v1/assessments",
        json={"name": "Configuration draft", "target_id": target.json()["id"]},
    )
    assert assessment.status_code == 201
    assert assessment.json()["status"] == "draft"
