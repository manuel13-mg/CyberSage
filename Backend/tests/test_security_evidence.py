"""Security tests for evidence redaction and sensitive data handling."""
import pytest


class TestEvidenceRedaction:
    """Test suite for credential and sensitive header redaction."""

    def test_redacts_authorization_header(self):
        """Test that Authorization headers are redacted."""
        from app.scanners.evidence import redact_headers

        headers = {
            "Authorization": "Bearer secret_token_12345",
            "Content-Type": "application/json",
        }

        redacted = redact_headers(headers)
        assert redacted["Authorization"] == "[REDACTED]"
        assert redacted["Content-Type"] == "application/json"

    def test_redacts_cookie_headers(self):
        """Test that Cookie headers are redacted."""
        from app.scanners.evidence import redact_headers

        headers = {
            "Cookie": "session=abc123; auth=xyz789",
            "Host": "example.com",
        }

        redacted = redact_headers(headers)
        assert redacted["Cookie"] == "[REDACTED]"
        assert redacted["Host"] == "example.com"

    def test_redacts_set_cookie_headers(self):
        """Test that Set-Cookie headers are redacted."""
        from app.scanners.evidence import redact_headers

        headers = {
            "Set-Cookie": "session=abc123; HttpOnly; Secure",
            "Content-Type": "text/html",
        }

        redacted = redact_headers(headers)
        assert redacted["Set-Cookie"] == "[REDACTED]"
        assert redacted["Content-Type"] == "text/html"

    def test_redacts_all_sensitive_headers(self):
        """Test that all defined sensitive headers are redacted."""
        from app.scanners.evidence import redact_headers, _SENSITIVE

        headers = {h: f"secret_{h}" for h in _SENSITIVE}
        headers["Safe-Header"] = "safe_value"

        redacted = redact_headers(headers)

        for header in _SENSITIVE:
            if header in headers:  # Case-sensitive check
                assert redacted[header] == "[REDACTED]", f"{header} should be redacted"

        assert redacted.get("Safe-Header") == "safe_value"

    def test_handles_empty_headers(self):
        """Test that empty headers dict is handled correctly."""
        from app.scanners.evidence import redact_headers

        redacted = redact_headers({})
        assert redacted == {}

    def test_preserves_non_sensitive_headers(self):
        """Test that non-sensitive headers are preserved."""
        from app.scanners.evidence import redact_headers

        headers = {
            "Content-Type": "application/json",
            "Content-Length": "1234",
            "User-Agent": "CyberSage/1.0",
            "Accept": "application/json",
        }

        redacted = redact_headers(headers)
        assert redacted == headers


class TestURLValidation:
    """Test suite for URL validation and normalization."""

    def test_rejects_urls_with_embedded_credentials(self):
        """Test that URLs with username:password are rejected."""
        from app.validation import normalize_url
        from fastapi import HTTPException

        with pytest.raises(HTTPException) as exc_info:
            normalize_url("http://admin:password@example.com/admin")

        assert exc_info.value.status_code == 422
        assert "credential" in exc_info.value.detail.lower()

    def test_rejects_non_http_schemes(self):
        """Test that non-HTTP/HTTPS schemes are rejected."""
        from app.validation import normalize_url
        from fastapi import HTTPException

        invalid_schemes = [
            "ftp://example.com/file",
            "file:///etc/passwd",
            "javascript:alert(1)",
            "data:text/html,<script>alert(1)</script>",
        ]

        for url in invalid_schemes:
            with pytest.raises(HTTPException) as exc_info:
                normalize_url(url)
            assert exc_info.value.status_code == 422

    def test_accepts_valid_http_urls(self):
        """Test that valid HTTP/HTTPS URLs are accepted."""
        from app.validation import normalize_url

        valid_urls = [
            "http://example.com",
            "https://example.com",
            "http://example.com:8080/path",
            "https://subdomain.example.com/path?query=1",
        ]

        for url in valid_urls:
            result = normalize_url(url)
            assert result.startswith("http")

    def test_removes_fragments(self):
        """Test that URL fragments are removed."""
        from app.validation import normalize_url

        result = normalize_url("http://example.com/page#section")
        assert "#section" not in result
        assert result == "http://example.com/page"


class TestSSRFPrevention:
    """Test suite for Server-Side Request Forgery (SSRF) prevention."""

    def test_blocks_localhost_for_non_local_targets(self):
        """Test that localhost is blocked for production targets."""
        from app.scanners.scope import validate_url_in_scope
        from app.models import Target, TargetScope
        from uuid import uuid4
        from fastapi import HTTPException
        import pytest

        # Create a non-local target
        target = Target(
            id=uuid4(),
            name="Production Target",
            base_url="https://example.com",
            environment="production",
            enabled=True,
        )
        target.scope = TargetScope(
            id=uuid4(),
            target_id=target.id,
            allowed_domains=["example.com", "localhost"],
            authorization_confirmed=True,
        )

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(target, "http://localhost:8080/admin")

        assert exc_info.value.status_code == 422

    def test_blocks_127_0_0_1_for_non_local_targets(self):
        """Test that 127.0.0.1 is blocked for production targets."""
        from app.scanners.scope import validate_url_in_scope
        from app.models import Target, TargetScope
        from uuid import uuid4
        from fastapi import HTTPException
        import pytest

        target = Target(
            id=uuid4(),
            name="Production Target",
            base_url="https://example.com",
            environment="production",
            enabled=True,
        )
        target.scope = TargetScope(
            id=uuid4(),
            target_id=target.id,
            allowed_domains=["example.com", "127.0.0.1"],
            authorization_confirmed=True,
        )

        with pytest.raises(HTTPException) as exc_info:
            validate_url_in_scope(target, "http://127.0.0.1:8080/admin")

        assert exc_info.value.status_code == 422


class TestSecretExposure:
    """Test suite to ensure secrets are not exposed in API responses."""

    def test_config_status_does_not_expose_api_key(self, client):
        """Test that API key values are not returned in config status."""
        response = client.get("/api/v1/config/status")
        assert response.status_code == 200

        data = response.json()
        # Should indicate whether configured, but not expose the key
        assert "gemini_configured" in data
        assert "gemini_api_key" not in data or data.get("gemini_api_key") is None

    def test_graph_status_does_not_expose_credentials(self, client):
        """Test that Neo4j credentials are not exposed."""
        response = client.get("/api/v1/graph/status")
        assert response.status_code == 200

        data = response.json()
        # Should not expose password or username
        assert "password" not in str(data).lower() or data.get("password") is None
        assert "neo4j_password" not in data

    def test_ai_provider_status_does_not_expose_key(self, client):
        """Test that AI provider status doesn't expose API keys."""
        response = client.get("/api/v1/ai/provider/status")

        # May return 503 if not configured, which is fine
        if response.status_code == 200:
            data = response.json()
            assert "api_key" not in data
            assert "gemini_api_key" not in data
