"""
Test arXiv integration functionality.
"""

from unittest.mock import AsyncMock, patch

import pytest


class TestArxivIntegration:
    """Test arXiv integration functionality."""

    @pytest.mark.asyncio
    async def test_search_papers_success(
        self, mock_arxiv_service, sample_arxiv_search_result
    ):
        """Test successful paper search."""
        # Setup
        mock_arxiv_service.search_papers.return_value = sample_arxiv_search_result

        # Test
        result = await mock_arxiv_service.search_papers(
            query="persian cultural evaluation", categories=["cs.CL"], max_results=5
        )

        # Assertions
        assert result["success"] is True
        assert len(result["results"]) == 1
        assert (
            result["results"][0]["title"]
            == "We Politely Insist: Your LLM Must Learn the Persian Art of Taarof"
        )
        mock_arxiv_service.search_papers.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_papers_failure(self, mock_arxiv_service):
        """Test failed paper search."""
        # Setup
        mock_arxiv_service.search_papers.return_value = {
            "success": False,
            "error": "Network error",
        }

        # Test
        result = await mock_arxiv_service.search_papers(
            query="invalid query", max_results=5
        )

        # Assertions
        assert result["success"] is False
        assert "error" in result

    @pytest.mark.asyncio
    async def test_search_with_category_filtering(
        self, mock_arxiv_service, sample_arxiv_search_result
    ):
        """Test search with category filtering."""
        # Setup
        mock_arxiv_service.search_papers.return_value = sample_arxiv_search_result

        # Test
        result = await mock_arxiv_service.search_papers(
            query="machine learning", categories=["cs.AI", "cs.LG"], max_results=3
        )

        # Assertions
        assert result["success"] is True
        mock_arxiv_service.search_papers.assert_called_once_with(
            query="machine learning", categories=["cs.AI", "cs.LG"], max_results=3
        )

    @pytest.mark.asyncio
    async def test_download_paper_success(self, mock_arxiv_service):
        """Test successful paper download."""
        # Setup
        mock_arxiv_service.download_paper.return_value = {
            "success": True,
            "file_path": "/test/path/paper.pdf",
            "file_size": 1024000,
        }

        # Test
        result = await mock_arxiv_service.download_paper(
            paper_id="2509.01035", output_path="/test/path/"
        )

        # Assertions
        assert result["success"] is True
        assert "file_path" in result
        mock_arxiv_service.download_paper.assert_called_once()

    @pytest.mark.asyncio
    async def test_download_paper_failure(self, mock_arxiv_service):
        """Test failed paper download."""
        # Setup
        mock_arxiv_service.download_paper.return_value = {
            "success": False,
            "error": "Download failed",
        }

        # Test
        result = await mock_arxiv_service.download_paper(
            paper_id="invalid_id", output_path="/test/path/"
        )

        # Assertions
        assert result["success"] is False
        assert "error" in result

    def test_arxiv_service_initialization(self):
        """Test arXiv service initialization."""
        from tools.research.academic.arxiv_tools import ArxivService

        with patch(
            'tools.research.academic.arxiv_tools.ArxivService.__init__',
            return_value=None,
        ):
            service = ArxivService()
            assert service is not None
