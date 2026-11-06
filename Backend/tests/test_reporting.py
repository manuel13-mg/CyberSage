from types import SimpleNamespace

from app.reporting.data import collect_report_data
from app.reporting.exporters import export_html, safe_filename
from app.reporting.generator import compare_assessments, generate_report


def assessment() -> SimpleNamespace:
    return SimpleNamespace(id="assessment", name="Assessment", target_id="target", purpose="review", status="completed", created_at=SimpleNamespace(isoformat=lambda: "2026-01-01T00:00:00"))


def test_report_generation_uses_real_source_ids_and_limitations() -> None:
    finding = SimpleNamespace(
        id="finding", title="Finding", severity="high", description="Observed issue",
        verification_status="detected", cwe_id="CWE-89", cve_id=None, affected_endpoint="/login",
        references=[], evidence=None,
    )
    data = collect_report_data(assessment(), [finding], [], None)
    report, limitations = generate_report(data, "technical")

    assert report["provenance"]["finding_ids"] == ["finding"]
    assert "No persisted attack-path analysis was available." in limitations


def test_html_export_escapes_untrusted_finding_content() -> None:
    report = {
        "assessment": {"name": "<unsafe>"},
        "report_type": "technical",
        "risk": {},
        "findings": [{"id": "1", "title": "<script>", "severity": "high", "verification_status": "detected"}],
        "limitations": [],
    }

    output = export_html(report)
    assert "<script>" not in output
    assert "&lt;script&gt;" in output
    assert safe_filename("../secret", "json") == "cybersage-report-secret.json"


def test_comparison_marks_absent_findings_indeterminate() -> None:
    left = {"assessment": {"target_id": "target"}, "findings": [{"id": "old"}], "paths": []}
    right = {"assessment": {"target_id": "target"}, "findings": [], "paths": []}

    result = compare_assessments(left, right)

    assert result["resolved_findings"] == []
    assert result["indeterminate_findings"] == ["old"]
