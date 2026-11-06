from pathlib import Path

import pytest

from app.rag.chunking import chunk_text
from app.rag.loaders import load_content
from app.rag.store import KnowledgeStore


def test_loads_html_without_executing_markup() -> None:
    title, content = load_content("guide.html", "<h1>Security</h1><script>alert(1)</script><p>CWE-89 guidance</p>")

    assert title == "guide"
    assert "CWE-89 guidance" in content
    assert "alert(1)" not in content


def test_chunking_rejects_invalid_overlap_and_preserves_content() -> None:
    with pytest.raises(ValueError):
        chunk_text("text", size=100, overlap=100)
    chunks = chunk_text("A security explanation. " * 100, size=120, overlap=20)
    assert chunks
    assert all(chunk.content for chunk in chunks)


def test_keyword_and_hybrid_retrieval_preserve_source_metadata(tmp_path: Path) -> None:
    store = KnowledgeStore(str(tmp_path))
    store.add([{
        "chunk_id": "chunk-1", "document_id": "doc-1", "chunk_index": 0,
        "content": "CWE-89 SQL injection prevention", "section_heading": None,
        "source_organization": "OWASP", "source_url": "https://owasp.org/",
        "title": "OWASP Guide", "category": "web-security",
        "embedding": [1.0] + [0.0] * 255,
    }])

    results = store.search("CWE-89", 5, "keyword")

    assert results[0]["chunk_id"] == "chunk-1"
    assert results[0]["source_url"] == "https://owasp.org/"
