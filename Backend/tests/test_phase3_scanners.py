import json

import pytest

from app.scanners.evidence import redact
from app.scanners.nuclei.adapter import NucleiAdapter
from app.scanners.nuclei.parser import parse_jsonl


def test_nuclei_parser_normalizes_jsonl_without_inventing_metadata() -> None:
    output = json.dumps({
        "template-id": "demo-header",
        "matched-at": "http://127.0.0.1:3000/",
        "info": {"name": "Missing header", "severity": "medium", "classification": {"cwe-id": "CWE-693"}},
        "extracted-results": ["value"],
    }) + "\nnot-json\n"

    findings = parse_jsonl(output, scanner_version="3.3.0")

    assert findings[0]["title"] == "Missing header"
    assert findings[0]["severity"] == "medium"
    assert findings[0]["cwe_id"] == "CWE-693"
    assert findings[0]["cve_id"] is None
    assert findings[0]["scanner_version"] == "3.3.0"
    assert len(findings) == 1


def test_nuclei_command_is_argument_based_and_safe() -> None:
    adapter = NucleiAdapter(executable="nuclei.exe")

    command = adapter.build_command("http://127.0.0.1:3000", {
        "severities": ["low", "medium"],
        "rate_limit": 20,
        "concurrency": 4,
        "timeout": 10,
        "templates": ["headers"],
        "excluded_templates": ["intrusive-check"],
    })

    assert command[0] == "nuclei.exe"
    assert "-u" in command
    assert "http://127.0.0.1:3000" in command
    assert "headers" in command
    assert "intrusive-check" in command


def test_nuclei_configuration_rejects_invalid_values() -> None:
    with pytest.raises(ValueError):
        NucleiAdapter(executable="nuclei").validate_configuration({"severities": ["exploit"]})


def test_evidence_redacts_credentials_and_limits_nested_values() -> None:
    evidence = redact({"headers": {"Authorization": "secret", "Cookie": "session=secret"}, "body": "safe"})

    assert evidence["headers"]["Authorization"] == "[REDACTED]"
    assert evidence["headers"]["Cookie"] == "[REDACTED]"
    assert evidence["body"] == "safe"
