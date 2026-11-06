from app.evaluation.dataset import validate_record
from app.evaluation.metrics import classification_metrics, ranking_metrics, summary_statistics


def test_classification_metrics_do_not_fabricate_false_positive_rate() -> None:
    metrics = classification_metrics({"a", "b"}, {"a", "c"})

    assert metrics["true_positives"] == 1
    assert metrics["precision"] == 0.5
    assert metrics["recall"] == 0.5
    assert metrics["false_positive_rate"] is None


def test_ranking_metrics_are_reproducible() -> None:
    metrics = ranking_metrics({"doc-a", "doc-c"}, ["doc-b", "doc-c", "doc-a"], 3)

    assert metrics["precision_at_k"] == 2 / 3
    assert metrics["mrr"] == 0.5
    assert metrics["ndcg_at_k"] is not None


def test_summary_statistics_reports_percentiles_for_measured_runs() -> None:
    stats = summary_statistics([10.0, 20.0, 30.0])

    assert stats["count"] == 3
    assert stats["median"] == 20.0
    assert stats["p95"] == 30.0


def test_dataset_validation_rejects_unclear_labels() -> None:
    assert "label_status is invalid" in validate_record({"record_key": "x", "category": "sql", "label_status": "GUESS"})
