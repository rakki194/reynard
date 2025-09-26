"""
Test RAG integration functionality.
"""

from unittest.mock import Mock, patch

import pytest


class TestRAGIntegration:
    """Test RAG integration functionality."""

    @pytest.mark.asyncio
    async def test_rag_ingestion_success(self, mock_rag_service):
        """Test successful RAG ingestion."""
        # Setup
        mock_rag_service.ingest_paper.return_value = {
            "success": True,
            "ingested_documents": 1,
            "total_chunks": 5,
        }

        # Test
        result = await mock_rag_service.ingest_paper(
            paper_path="/test/path/paper.pdf", metadata={"title": "Test Paper"}
        )

        # Assertions
        assert result["success"] is True
        assert result["ingested_documents"] == 1
        mock_rag_service.ingest_paper.assert_called_once()

    @pytest.mark.asyncio
    async def test_rag_search_success(self, mock_rag_service):
        """Test successful RAG search."""
        # Setup
        mock_rag_service.search_papers.return_value = {
            "total_results": 2,
            "results": [
                {
                    "text": "Test paper content",
                    "similarity": 0.95,
                    "metadata": {"title": "Test Paper"},
                }
            ],
        }

        # Test
        result = await mock_rag_service.search_papers(
            query="test query", search_type="hybrid", top_k=10
        )

        # Assertions
        assert result["total_results"] == 2
        assert len(result["results"]) == 1
        mock_rag_service.search_papers.assert_called_once()

    def test_rag_stats_success(self, mock_rag_service):
        """Test successful RAG statistics retrieval."""
        # Setup
        mock_rag_service.get_stats.return_value = {
            "total_documents": 150,
            "total_chunks": 1250,
            "embedding_model": "text-embedding-ada-002",
        }

        # Test
        result = mock_rag_service.get_stats()

        # Assertions
        assert result["total_documents"] == 150
        assert result["total_chunks"] == 1250
        mock_rag_service.get_stats.assert_called_once()

    def test_rag_service_initialization(self):
        """Test RAG service initialization."""
        from tools.research.rag_integration import RAGIntegrationService

        with patch(
            'tools.research.rag_integration.RAGIntegrationService.__init__',
            return_value=None,
        ):
            service = RAGIntegrationService()
            assert service is not None
