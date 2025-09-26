"""
Pytest configuration and shared fixtures for research system tests.
"""

import json
import tempfile
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

import pytest


@pytest.fixture
def temp_dir():
    """Create a temporary directory for testing."""
    with tempfile.TemporaryDirectory(prefix="reynard_test_") as temp_dir:
        yield Path(temp_dir)


@pytest.fixture
def mock_papers_dir(temp_dir):
    """Create a mock papers directory structure."""
    papers_dir = temp_dir / "papers"
    papers_dir.mkdir(parents=True, exist_ok=True)

    # Create subdirectories
    (papers_dir / "arxiv" / "cs.CL").mkdir(parents=True, exist_ok=True)
    (papers_dir / "arxiv" / "cs.AI").mkdir(parents=True, exist_ok=True)
    (papers_dir / "metadata").mkdir(parents=True, exist_ok=True)
    (papers_dir / "cache").mkdir(parents=True, exist_ok=True)

    return papers_dir


@pytest.fixture
def sample_paper_metadata():
    """Sample paper metadata for testing."""
    return {
        "paper_id": "2509.01035",
        "title": "We Politely Insist: Your LLM Must Learn the Persian Art of Taarof",
        "authors": ["Gohari Sadr, Nikta", "Heidariasl, Sahar", "Megerdoomian, Karine"],
        "abstract": "This paper presents a comprehensive study of the Persian art of Taarof and its implications for large language model alignment.",
        "categories": ["cs.CL"],
        "published_date": "2025-09-01",
        "source": "arxiv",
        "download_date": "2024-01-15T10:30:00",
        "file_size": 1024000,
        "pdf_path": "/test/path/2509.01035.pdf",
    }


@pytest.fixture
def sample_arxiv_search_result():
    """Sample arXiv search result for testing."""
    return {
        "success": True,
        "results": [
            {
                "id": "2509.01035",
                "title": "We Politely Insist: Your LLM Must Learn the Persian Art of Taarof",
                "authors": [
                    "Gohari Sadr, Nikta",
                    "Heidariasl, Sahar",
                    "Megerdoomian, Karine",
                ],
                "summary": "This paper presents a comprehensive study of the Persian art of Taarof...",
                "published": "2025-09-01T00:00:00Z",
                "categories": ["cs.CL"],
                "pdf_url": "https://arxiv.org/pdf/2509.01035.pdf",
            }
        ],
    }


@pytest.fixture
def mock_arxiv_service():
    """Mock arXiv service for testing."""
    service = Mock()
    service.search_papers = AsyncMock()
    service.download_paper = AsyncMock()
    return service


@pytest.fixture
def mock_paper_management_service():
    """Mock paper management service for testing."""
    service = Mock()
    service.papers_dir = Path("/test/papers")
    service.arxiv_index = {}
    service.search_papers = Mock()
    service._save_index = Mock()
    service._load_index = Mock()
    return service


@pytest.fixture
def mock_rag_service():
    """Mock RAG service for testing."""
    service = Mock()
    service.ingest_paper = AsyncMock()
    service.search_papers = AsyncMock()
    service.get_stats = Mock()
    return service


@pytest.fixture
def mock_mcp_tool_response():
    """Mock MCP tool response for testing."""
    return {"content": [{"type": "text", "text": "Mock MCP tool response"}]}


@pytest.fixture(autouse=True)
def mock_backend_env():
    """Mock backend environment loading."""
    with patch('load_backend_env.load_backend_env'):
        yield


@pytest.fixture
def mock_pdf_file(temp_dir):
    """Create a mock PDF file for testing."""
    pdf_path = temp_dir / "test_paper.pdf"
    pdf_path.write_bytes(b"Mock PDF content for testing")
    return pdf_path


@pytest.fixture
def mock_markdown_file(temp_dir):
    """Create a mock markdown file for testing."""
    md_path = temp_dir / "test_paper.md"
    md_path.write_text("# Test Paper\n\nThis is a test paper in markdown format.")
    return md_path


@pytest.fixture
def mock_database_connection():
    """Mock database connection for testing."""
    with patch('sqlite3.connect') as mock_connect:
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.execute.return_value = mock_cursor
        mock_conn.commit.return_value = None
        mock_connect.return_value = mock_conn
        yield mock_conn


@pytest.fixture
def sample_rag_search_result():
    """Sample RAG search result for testing."""
    return {
        "total_results": 2,
        "results": [
            {
                "text": "This is a test paper about machine learning and computer vision applications.",
                "similarity": 0.95,
                "metadata": {
                    "title": "Machine Learning in Computer Vision",
                    "authors": ["Alice Johnson", "Bob Wilson"],
                    "source": "arxiv",
                    "paper_id": "2301.00001",
                },
            }
        ],
        "search_time": 0.123,
    }


@pytest.fixture
def sample_rag_stats():
    """Sample RAG statistics for testing."""
    return {
        "total_documents": 150,
        "total_chunks": 1250,
        "embedding_model": "text-embedding-ada-002",
        "vector_dimensions": 1536,
        "last_updated": "2024-01-15T10:30:00",
    }


@pytest.fixture(autouse=True)
def mock_logging():
    """Mock logging to avoid noise in tests."""
    with patch('logging.getLogger'):
        yield
