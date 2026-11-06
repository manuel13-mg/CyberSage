from types import SimpleNamespace

import pytest

from app.simulations.engine import apply_actions, compare_paths
from app.simulations.remediation_catalog import validate_action


def path(*finding_ids: str) -> dict:
    return {
        "node_ids": ["target", "endpoint", *finding_ids],
        "finding_ids": list(finding_ids),
        "evidence_ids": ["evidence"],
        "relationship_data": [{"relationship_class": "OBSERVED"}],
    }


def test_patch_disrupts_only_path_using_selected_finding() -> None:
    simulated, classification, changes, _ = apply_actions(
        path("finding-a"), [{"action_type": "patch_vulnerability", "entity_id": "finding-a", "configuration": {}}],
    )

    assert simulated is None
    assert classification == "DISRUPTED"
    assert changes[0]["provenance"] == "HYPOTHETICAL"


def test_endpoint_restriction_requires_explicit_effectiveness() -> None:
    simulated, classification, _, assumptions = apply_actions(
        path("finding-a"), [{"action_type": "restrict_endpoint", "entity_id": "endpoint", "configuration": {"access_restriction": "private"}}],
    )

    assert simulated is not None
    assert classification == "UNCHANGED_DUE_TO_INSUFFICIENT_INFORMATION"
    assert assumptions


def test_multiple_simulations_are_pure_and_baseline_is_unchanged() -> None:
    baseline = SimpleNamespace(
        id="path-id", node_ids=["target", "endpoint", "finding-a"], finding_ids=["finding-a"],
        evidence_ids=["evidence"], relationship_data=[{"relationship_class": "OBSERVED"}],
        risk_score=40,
    )
    actions = [{"action_type": "patch_vulnerability", "entity_id": "finding-a", "configuration": {}}]
    comparison = compare_paths([baseline], actions, [{"id": "finding-a", "severity": "high", "verification_status": "verified"}])

    assert comparison["results"][0]["classification"] == "DISRUPTED"
    assert baseline.node_ids == ["target", "endpoint", "finding-a"]
    assert baseline.finding_ids == ["finding-a"]


def test_catalog_rejects_unsupported_or_incomplete_actions() -> None:
    assert validate_action("not_supported", "entity", {}) == ["Unsupported remediation action"]
    assert validate_action("restrict_endpoint", "endpoint", {}) == ["access_restriction is required"]
