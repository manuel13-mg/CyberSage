from app.attack_paths.discovery import discover_paths, score_path
from app.attack_paths.graph_queries import bounded_path_records
from app.attack_paths.validation import validate_path


def test_discovery_deduplicates_cycles_and_hypothetical_relationships() -> None:
    records = [
        {"node_ids": ["target", "endpoint", "finding"], "relationships": [{"type": "HAS_ENDPOINT"}, {"type": "HAS_VULNERABILITY"}]},
        {"node_ids": ["target", "endpoint", "finding"], "relationships": [{"type": "HAS_ENDPOINT"}, {"type": "HAS_VULNERABILITY"}]},
        {"node_ids": ["a", "b"], "relationships": [{"type": "RELATED", "relationship_class": "HYPOTHETICAL"}]},
        {"node_ids": ["a", "b", "a"], "relationships": [{"type": "R"}, {"type": "R"}]},
    ]

    paths = discover_paths(records, assessment_id="assessment", max_paths=10)

    assert len(paths) == 1
    assert paths[0]["node_ids"] == ["target", "endpoint", "finding"]


def test_validation_requires_evidence_and_excludes_repeated_nodes() -> None:
    path = {
        "node_ids": ["target", "finding"], "finding_ids": ["finding"], "evidence_ids": [],
        "relationship_data": [{"relationship_class": "OBSERVED"}],
    }

    assert validate_path(path, valid_node_ids={"target", "finding"}, valid_finding_ids={"finding"}, valid_evidence_ids=set()) == "PARTIALLY_SUPPORTED"


def test_risk_score_is_reproducible_and_separate_from_finding_severity() -> None:
    path = {"finding_ids": ["finding"], "evidence_ids": ["evidence"]}
    risk = score_path(path, [{"id": "finding", "severity": "high", "verification_status": "detected"}])

    assert risk["score"] == 40
    assert risk["category"] == "Medium"


def test_graph_query_clamps_depth_before_sending_cypher() -> None:
    class Driver:
        def execute_read(self, query: str, **parameters: object) -> list[dict]:
            assert "1..6" in query
            assert "$depth" not in query
            assert parameters["max_paths"] == 500
            return []

    assert bounded_path_records(Driver(), "assessment", 99, 999) == []
