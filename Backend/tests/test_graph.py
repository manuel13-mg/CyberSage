from app.graph.ingestion import UPSERT_ENDPOINT
from app.graph.schema import SCHEMA_QUERIES


def test_graph_schema_uses_unique_stable_ids() -> None:
    assert any("REQUIRE n.id IS UNIQUE" in query for query in SCHEMA_QUERIES)


def test_graph_queries_are_parameterized() -> None:
    assert "$assessment_id" in UPSERT_ENDPOINT
    assert "' + " not in UPSERT_ENDPOINT
