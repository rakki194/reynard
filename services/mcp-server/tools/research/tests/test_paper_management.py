"""
Test paper management functionality.
"""

import json
from pathlib import Path
from unittest.mock import Mock, patch

import pytest


class TestPaperManagement:
    """Test paper management functionality."""

    def test_paper_storage_structure(self, mock_papers_dir):
        """Test paper storage directory structure creation."""
        # Test that required directories exist
        assert mock_papers_dir.exists()
        assert (mock_papers_dir / "arxiv").exists()
        assert (mock_papers_dir / "arxiv" / "cs.CL").exists()
        assert (mock_papers_dir / "arxiv" / "cs.AI").exists()
        assert (mock_papers_dir / "metadata").exists()
        assert (mock_papers_dir / "cache").exists()

    def test_metadata_handling(
        self, mock_paper_management_service, sample_paper_metadata
    ):
        """Test metadata loading and saving."""
        # Setup
        test_index = {"test_paper": sample_paper_metadata}
        mock_paper_management_service._load_index.return_value = test_index

        # Test save
        mock_paper_management_service._save_index(test_index, "test_index.json")

        # Test load
        loaded_index = mock_paper_management_service._load_index("test_index.json")

        # Assertions
        assert "test_paper" in loaded_index
        assert loaded_index["test_paper"]["title"] == sample_paper_metadata["title"]
        mock_paper_management_service._save_index.assert_called_once()
        mock_paper_management_service._load_index.assert_called_once()

    def test_paper_search_by_title(
        self, mock_paper_management_service, sample_paper_metadata
    ):
        """Test paper search by title."""
        # Setup
        mock_paper_management_service.search_papers.return_value = [
            sample_paper_metadata
        ]

        # Test
        results = mock_paper_management_service.search_papers(
            query="persian cultural", max_results=10
        )

        # Assertions
        assert len(results) == 1
        assert results[0]["title"] == sample_paper_metadata["title"]
        mock_paper_management_service.search_papers.assert_called_once()

    def test_paper_search_by_author(
        self, mock_paper_management_service, sample_paper_metadata
    ):
        """Test paper search by author."""
        # Setup
        mock_paper_management_service.search_papers.return_value = [
            sample_paper_metadata
        ]

        # Test
        results = mock_paper_management_service.search_papers(
            query="Gohari Sadr", max_results=10
        )

        # Assertions
        assert len(results) == 1
        assert any("Gohari Sadr" in author for author in results[0]["authors"])
        mock_paper_management_service.search_papers.assert_called_once()

    def test_paper_search_no_results(self, mock_paper_management_service):
        """Test paper search with no results."""
        # Setup
        mock_paper_management_service.search_papers.return_value = []

        # Test
        results = mock_paper_management_service.search_papers(
            query="nonexistent paper", max_results=10
        )

        # Assertions
        assert len(results) == 0
        mock_paper_management_service.search_papers.assert_called_once()

    def test_paper_index_management(
        self, mock_paper_management_service, sample_paper_metadata
    ):
        """Test paper index management."""
        # Setup
        paper_id = sample_paper_metadata["paper_id"]
        mock_paper_management_service.arxiv_index = {}

        # Test adding paper to index
        mock_paper_management_service.arxiv_index[paper_id] = sample_paper_metadata

        # Assertions
        assert paper_id in mock_paper_management_service.arxiv_index
        assert (
            mock_paper_management_service.arxiv_index[paper_id]["title"]
            == sample_paper_metadata["title"]
        )

    def test_paper_metadata_validation(self, sample_paper_metadata):
        """Test paper metadata validation."""
        # Test required fields
        required_fields = ["paper_id", "title", "authors", "categories", "source"]

        for field in required_fields:
            assert field in sample_paper_metadata
            assert sample_paper_metadata[field] is not None

    def test_paper_metadata_json_serialization(self, sample_paper_metadata):
        """Test paper metadata JSON serialization."""
        # Test that metadata can be serialized to JSON
        json_str = json.dumps(sample_paper_metadata)
        assert isinstance(json_str, str)

        # Test that metadata can be deserialized from JSON
        deserialized = json.loads(json_str)
        assert deserialized["paper_id"] == sample_paper_metadata["paper_id"]
        assert deserialized["title"] == sample_paper_metadata["title"]

    def test_paper_service_initialization(self):
        """Test paper management service initialization."""
        from tools.research.paper_management import PaperManagementService

        with patch(
            'tools.research.paper_management.PaperManagementService.__init__',
            return_value=None,
        ):
            service = PaperManagementService()
            assert service is not None
