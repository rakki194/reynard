"""Test suite for Modular RAG Main Service.

Tests the main RAG service orchestrator that coordinates all the modular services.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from typing import Dict, Any, List

from app.services.rag.rag_service import RAGService
from app.services.rag.interfaces.base import ServiceStatus


class TestRAGServiceOrchestrator:
    """Test the main RAG service orchestrator."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
            "rag_monitoring_enabled": True,
            "rag_security_enabled": True,
            "rag_continuous_improvement_enabled": True,
            "rag_documentation_enabled": True,
            "rag_model_evaluation_enabled": True,
            "rag_continuous_indexing_enabled": True,
            "rag_initial_indexing_enabled": True,
        }

    @pytest.fixture
    def rag_service(self, config: Dict[str, Any]) -> RAGService:
        """Create RAG service instance."""
        return RAGService(config)

    @pytest.mark.asyncio
    async def test_rag_service_initialization(self, rag_service: RAGService):
        """Test RAG service initialization."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock embedding response
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            # Mock database response
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            # Mock file indexing service
            mock_file_indexing.return_value = True

            result = await rag_service.initialize()
            assert result is True
            assert rag_service.initialized is True
            assert rag_service.startup_time is not None

    @pytest.mark.asyncio
    async def test_rag_service_disabled(self):
        """Test RAG service when disabled."""
        config = {"rag_enabled": False}
        rag_service = RAGService(config)
        
        result = await rag_service.initialize()
        assert result is True
        assert rag_service.initialized is False

    @pytest.mark.asyncio
    async def test_embed_text(self, rag_service: RAGService):
        """Test text embedding through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()
            result = await rag_service.embed_text("Hello, world!")

            assert result is not None
            assert len(result) == 300
            assert all(isinstance(x, float) for x in result)

    @pytest.mark.asyncio
    async def test_embed_batch(self, rag_service: RAGService):
        """Test batch text embedding through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embeddings": [[0.1, 0.2, 0.3] * 100 for _ in range(3)],
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()
            texts = ["Hello", "World", "Test"]
            results = await rag_service.embed_batch(texts)

            assert len(results) == 3
            assert all(len(embedding) == 300 for embedding in results)

    @pytest.mark.asyncio
    async def test_search(self, rag_service: RAGService):
        """Test search through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock search engine
            with patch.object(rag_service.search_engine, "search_with_filters") as mock_search:
                mock_search.return_value = [
                    {"id": 1, "text": "Test result", "score": 0.95},
                ]

                results = await rag_service.search("test query", "hybrid", 10)

                assert len(results) == 1
                assert "text" in results[0]

    @pytest.mark.asyncio
    async def test_semantic_search(self, rag_service: RAGService):
        """Test semantic search through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock search engine
            with patch.object(rag_service.search_engine, "search_with_filters") as mock_search:
                mock_search.return_value = [
                    {"id": 1, "text": "Semantic result", "score": 0.95},
                ]

                results = await rag_service.semantic_search("test query", 10)

                assert len(results) == 1
                assert "text" in results[0]

    @pytest.mark.asyncio
    async def test_keyword_search(self, rag_service: RAGService):
        """Test keyword search through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock search engine
            with patch.object(rag_service.search_engine, "search_with_filters") as mock_search:
                mock_search.return_value = [
                    {"id": 1, "text": "Keyword result", "score": 0.85},
                ]

                results = await rag_service.keyword_search("test query", 10)

                assert len(results) == 1
                assert "text" in results[0]

    @pytest.mark.asyncio
    async def test_hybrid_search(self, rag_service: RAGService):
        """Test hybrid search through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock search engine
            with patch.object(rag_service.search_engine, "search_with_filters") as mock_search:
                mock_search.return_value = [
                    {"id": 1, "text": "Hybrid result", "score": 0.92},
                ]

                results = await rag_service.hybrid_search("test query", 10)

                assert len(results) == 1
                assert "text" in results[0]

    @pytest.mark.asyncio
    async def test_index_documents(self, rag_service: RAGService):
        """Test document indexing through main service."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock document indexer
            with patch.object(rag_service.document_indexer, "index_documents") as mock_index:
                mock_index.return_value = [
                    {"status": "success", "file_id": "test_1"},
                ]

                documents = [
                    {
                        "file_id": "test_1",
                        "content": "def hello(): return 'world'",
                        "file_path": "test.py",
                        "language": "python",
                    },
                ]

                result = await rag_service.index_documents(documents)

                assert "status" in result
                assert "documents_processed" in result
                assert result["documents_processed"] == 1

    @pytest.mark.asyncio
    async def test_get_system_health(self, rag_service: RAGService):
        """Test system health check."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock health checks
            with (
                patch.object(rag_service.embedding_service, "health_check") as mock_embedding_health,
                patch.object(rag_service.vector_store_service, "health_check") as mock_vector_health,
                patch.object(rag_service.document_indexer, "health_check") as mock_doc_health,
            ):
                mock_embedding_health.return_value = {"status": "healthy"}
                mock_vector_health.return_value = {"status": "healthy"}
                mock_doc_health.return_value = {"status": "healthy"}

                health = await rag_service.get_system_health()

                assert "status" in health
                assert "healthy" in health
                assert "services" in health
                assert "uptime_seconds" in health

    @pytest.mark.asyncio
    async def test_get_statistics(self, rag_service: RAGService):
        """Test getting system statistics."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock stats
            with (
                patch.object(rag_service.embedding_service, "get_stats") as mock_embedding_stats,
                patch.object(rag_service.vector_store_service, "get_stats") as mock_vector_stats,
                patch.object(rag_service.document_indexer, "get_stats") as mock_doc_stats,
                patch.object(rag_service.search_engine, "get_stats") as mock_search_stats,
            ):
                mock_embedding_stats.return_value = {"embedding_requests": 10}
                mock_vector_stats.return_value = {"total_embeddings": 100}
                mock_doc_stats.return_value = {"documents_processed": 5}
                mock_search_stats.return_value = {"total_searches": 20}

                stats = await rag_service.get_statistics()

                assert "service" in stats
                assert "requests" in stats
                assert "core_services" in stats
                assert "advanced_services" in stats

    @pytest.mark.asyncio
    async def test_generate_performance_report(self, rag_service: RAGService):
        """Test performance report generation."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock performance monitor
            with patch.object(rag_service.performance_monitor, "generate_report") as mock_report:
                mock_report.return_value = "Performance Report Content"

                report = await rag_service.generate_performance_report(24)

                assert isinstance(report, str)
                assert len(report) > 0

    @pytest.mark.asyncio
    async def test_evaluate_models(self, rag_service: RAGService):
        """Test model evaluation."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock model evaluator
            with patch.object(rag_service.model_evaluator, "evaluate_models") as mock_evaluate:
                mock_evaluate.return_value = {
                    "embeddinggemma:latest": {"accuracy": 0.95, "latency": 100}
                }

                results = await rag_service.evaluate_models()

                assert isinstance(results, dict)
                assert "embeddinggemma:latest" in results

    @pytest.mark.asyncio
    async def test_get_optimization_recommendations(self, rag_service: RAGService):
        """Test getting optimization recommendations."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock continuous improvement
            with patch.object(rag_service.continuous_improvement, "generate_optimization_recommendations") as mock_recommendations:
                mock_recommendations.return_value = [
                    {"type": "performance", "description": "Optimize embedding cache"},
                ]

                recommendations = await rag_service.get_optimization_recommendations()

                assert isinstance(recommendations, list)
                assert len(recommendations) > 0

    @pytest.mark.asyncio
    async def test_shutdown(self, rag_service: RAGService):
        """Test service shutdown."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Mock shutdown methods
            with (
                patch.object(rag_service.embedding_service, "shutdown") as mock_embedding_shutdown,
                patch.object(rag_service.vector_store_service, "shutdown") as mock_vector_shutdown,
                patch.object(rag_service.document_indexer, "shutdown") as mock_doc_shutdown,
            ):
                await rag_service.shutdown()

                assert rag_service.initialized is False
                mock_embedding_shutdown.assert_called_once()
                mock_vector_shutdown.assert_called_once()
                mock_doc_shutdown.assert_called_once()

    def test_is_initialized(self, rag_service: RAGService):
        """Test initialization status check."""
        assert rag_service.is_initialized() is False
        
        rag_service.initialized = True
        assert rag_service.is_initialized() is True

    def test_is_enabled(self, rag_service: RAGService):
        """Test enabled status check."""
        assert rag_service.is_enabled() is True

    def test_get_available_models(self, rag_service: RAGService):
        """Test getting available models."""
        with patch.object(rag_service.embedding_service, "get_available_models") as mock_models:
            mock_models.return_value = ["embeddinggemma:latest", "nomic-embed-text"]
            
            models = rag_service.get_available_models()
            assert models == ["embeddinggemma:latest", "nomic-embed-text"]

    def test_get_best_model(self, rag_service: RAGService):
        """Test getting best model."""
        with patch.object(rag_service.embedding_service, "get_best_model") as mock_best:
            mock_best.return_value = "embeddinggemma:latest"
            
            best_model = rag_service.get_best_model()
            assert best_model == "embeddinggemma:latest"

    @pytest.mark.asyncio
    async def test_error_handling_during_initialization(self, rag_service: RAGService):
        """Test error handling during initialization."""
        with patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing:
            mock_file_indexing.side_effect = Exception("File indexing failed")
            
            result = await rag_service.initialize()
            assert result is False
            assert rag_service.initialized is False

    @pytest.mark.asyncio
    async def test_error_handling_during_operation(self, rag_service: RAGService):
        """Test error handling during operations."""
        # Test operation on uninitialized service
        with pytest.raises(RuntimeError, match="RAG service not initialized"):
            await rag_service.embed_text("test")

    @pytest.mark.asyncio
    async def test_statistics_tracking(self, rag_service: RAGService):
        """Test statistics tracking."""
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
            patch.object(rag_service.file_indexing_service, "initialize") as mock_file_indexing,
        ):
            # Mock responses
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            mock_file_indexing.return_value = True

            await rag_service.initialize()

            # Perform operations to track statistics
            await rag_service.embed_text("test")
            await rag_service.search("test query")

            assert rag_service.stats["embedding_requests"] == 1
            assert rag_service.stats["search_requests"] == 1
            assert rag_service.stats["requests_total"] == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
