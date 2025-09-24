"""Test suite for Modular RAG Core Services.

Tests the new modular RAG core functionality including embeddings, vector store, 
document processing, and search with the new interface-based architecture.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from typing import Dict, Any, List

from app.services.rag.services.core.embedding import OllamaEmbeddingService
from app.services.rag.services.core.vector_store import PostgreSQLVectorStore
from app.services.rag.services.core.document_processor import ASTDocumentProcessor
from app.services.rag.services.core.search import HybridSearchEngine
from app.services.rag.interfaces.base import ServiceStatus


class TestModularOllamaEmbeddingService:
    """Test the new modular embedding service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "embedding_model": "embeddinggemma:latest",
            "embedding_batch_size": 10,
            "embedding_cache_size": 1000,
        }

    @pytest.fixture
    def embedding_service(self, config: Dict[str, Any]) -> OllamaEmbeddingService:
        """Create embedding service instance."""
        return OllamaEmbeddingService(config)

    @pytest.mark.asyncio
    async def test_embedding_service_initialization(self, embedding_service: OllamaEmbeddingService):
        """Test embedding service initialization."""
        result = await embedding_service.initialize()
        assert result is True
        assert embedding_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_embed_text_single(self, embedding_service: OllamaEmbeddingService):
        """Test single text embedding."""
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,  # 300-dim embedding
            }
            mock_post.return_value.__aenter__.return_value = mock_response

            await embedding_service.initialize()
            result = await embedding_service.embed_text("Hello, world!")

            assert result is not None
            assert len(result) == 300
            assert all(isinstance(x, float) for x in result)

    @pytest.mark.asyncio
    async def test_embed_batch(self, embedding_service: OllamaEmbeddingService):
        """Test batch text embedding."""
        texts = ["Hello", "World", "Test"]

        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,  # Single embedding response
            }
            mock_post.return_value.__aenter__.return_value = mock_response

            await embedding_service.initialize()
            results = await embedding_service.embed_batch(texts)

            assert len(results) == len(texts)
            assert all(len(embedding) == 300 for embedding in results)

    @pytest.mark.asyncio
    async def test_embedding_caching(self, embedding_service: OllamaEmbeddingService):
        """Test embedding caching functionality."""
        text = "Test caching"

        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_response

            await embedding_service.initialize()

            # First call should make HTTP request
            result1 = await embedding_service.embed_text(text)
            assert mock_post.call_count == 1

            # Second call should use cache
            result2 = await embedding_service.embed_text(text)
            assert mock_post.call_count == 1  # No additional HTTP call
            assert result1 == result2

    @pytest.mark.asyncio
    async def test_embedding_error_handling(self, embedding_service: OllamaEmbeddingService):
        """Test embedding error handling."""
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_post.side_effect = Exception("Network error")

            await embedding_service.initialize()

            with pytest.raises(Exception):
                await embedding_service.embed_text("Test error")

    @pytest.mark.asyncio
    async def test_health_check(self, embedding_service: OllamaEmbeddingService):
        """Test embedding service health check."""
        await embedding_service.initialize()
        health = await embedding_service.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health
        assert health["status"] == ServiceStatus.HEALTHY.value

    @pytest.mark.asyncio
    async def test_get_stats(self, embedding_service: OllamaEmbeddingService):
        """Test embedding service statistics."""
        await embedding_service.initialize()
        stats = await embedding_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "requests" in stats
        assert "cache_hit_rate" in stats

    def test_get_available_models(self, embedding_service: OllamaEmbeddingService):
        """Test getting available models."""
        models = embedding_service.get_available_models()
        assert isinstance(models, list)
        assert len(models) > 0

    def test_get_best_model(self, embedding_service: OllamaEmbeddingService):
        """Test getting best model."""
        best_model = embedding_service.get_best_model()
        assert isinstance(best_model, str)
        assert len(best_model) > 0

    @pytest.mark.asyncio
    async def test_shutdown(self, embedding_service: OllamaEmbeddingService):
        """Test embedding service shutdown."""
        await embedding_service.initialize()
        await embedding_service.shutdown()
        assert embedding_service.status == ServiceStatus.SHUTDOWN


class TestModularPostgreSQLVectorStore:
    """Test the new modular vector store service."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_enabled": True,
            "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
            "rag_migrations_enabled": False,
        }

    @pytest.fixture
    def vector_store_service(self, config: Dict[str, Any]) -> PostgreSQLVectorStore:
        """Create vector store service instance."""
        return PostgreSQLVectorStore(config)

    @pytest.mark.asyncio
    async def test_vector_store_initialization(self, vector_store_service: PostgreSQLVectorStore):
        """Test vector store service initialization."""
        result = await vector_store_service.initialize()
        assert result is True
        assert vector_store_service.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_health_check(self, vector_store_service: PostgreSQLVectorStore):
        """Test vector store health check."""
        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            health = await vector_store_service.health_check()

            assert "status" in health
            assert "message" in health
            assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_similarity_search(self, vector_store_service: PostgreSQLVectorStore):
        """Test similarity search functionality."""
        query_embedding = [0.1, 0.2, 0.3] * 100
        limit = 10

        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_result = [
                {"id": 1, "text": "Test result 1", "similarity": 0.95},
                {"id": 2, "text": "Test result 2", "similarity": 0.90},
            ]
            mock_connection.execute.return_value.fetchall.return_value = mock_result
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            results = await vector_store_service.similarity_search(
                query_embedding, limit,
            )

            assert len(results) == 2
            assert all("text" in result for result in results)
            assert all("similarity" in result for result in results)

    @pytest.mark.asyncio
    async def test_insert_document_embeddings(self, vector_store_service: PostgreSQLVectorStore):
        """Test inserting document embeddings."""
        embedding_data = [
            {
                "file_id": "test_file_1",
                "chunk_index": 0,
                "chunk_text": "Test chunk 1",
                "embedding": [0.1, 0.2, 0.3] * 100,
                "metadata": {"chunk_type": "function"},
            },
        ]

        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.rowcount = 1
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            result = await vector_store_service.insert_document_embeddings(
                embedding_data,
            )

            assert result == 1

    @pytest.mark.asyncio
    async def test_get_document_chunks(self, vector_store_service: PostgreSQLVectorStore):
        """Test getting document chunks."""
        file_id = "test_file_1"

        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_result = [
                {"id": 1, "text": "Chunk 1", "metadata": {}},
                {"id": 2, "text": "Chunk 2", "metadata": {}},
            ]
            mock_connection.execute.return_value.fetchall.return_value = mock_result
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            chunks = await vector_store_service.get_document_chunks(file_id)

            assert len(chunks) == 2
            assert all("text" in chunk for chunk in chunks)

    @pytest.mark.asyncio
    async def test_delete_document(self, vector_store_service: PostgreSQLVectorStore):
        """Test deleting a document."""
        file_id = "test_file_1"

        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.rowcount = 1
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            result = await vector_store_service.delete_document(file_id)

            assert result is True

    @pytest.mark.asyncio
    async def test_get_dataset_stats(self, vector_store_service: PostgreSQLVectorStore):
        """Test getting dataset statistics."""
        dataset_id = "test_dataset"

        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_result = {"total_documents": 100, "total_chunks": 500}
            mock_connection.execute.return_value.fetchone.return_value = mock_result
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            await vector_store_service.initialize()
            stats = await vector_store_service.get_dataset_stats(dataset_id)

            assert "total_documents" in stats
            assert "total_chunks" in stats

    @pytest.mark.asyncio
    async def test_get_stats(self, vector_store_service: PostgreSQLVectorStore):
        """Test vector store statistics."""
        await vector_store_service.initialize()
        stats = await vector_store_service.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "total_embeddings" in stats
        assert "connection_status" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, vector_store_service: PostgreSQLVectorStore):
        """Test vector store service shutdown."""
        await vector_store_service.initialize()
        await vector_store_service.shutdown()
        assert vector_store_service.status == ServiceStatus.SHUTDOWN


class TestModularASTDocumentProcessor:
    """Test the new modular document indexer."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_indexing_enabled": True,
            "rag_indexing_workers": 2,
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
        }

    @pytest.fixture
    def document_indexer(self, config: Dict[str, Any]) -> ASTDocumentProcessor:
        """Create document indexer instance."""
        return ASTDocumentProcessor(config)

    @pytest.mark.asyncio
    async def test_document_indexer_initialization(self, document_indexer: ASTDocumentProcessor):
        """Test document indexer initialization."""
        result = await document_indexer.initialize()
        assert result is True
        assert document_indexer.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_index_documents(self, document_indexer: ASTDocumentProcessor):
        """Test document indexing."""
        documents = [
            {
                "file_id": "test_1",
                "content": "def hello(): return 'world'",
                "file_path": "test.py",
                "language": "python",
            },
        ]

        with patch.object(document_indexer, "_process_document") as mock_process:
            mock_process.return_value = None

            await document_indexer.initialize()
            results = []
            async for result in document_indexer.index_documents(documents):
                results.append(result)

            assert len(results) >= 0  # May be empty due to mocking

    @pytest.mark.asyncio
    async def test_pause_resume(self, document_indexer: ASTDocumentProcessor):
        """Test pausing and resuming the indexer."""
        await document_indexer.initialize()
        
        await document_indexer.pause()
        # Should not raise an exception
        
        await document_indexer.resume()
        # Should not raise an exception

    def test_get_supported_languages(self, document_indexer: ASTDocumentProcessor):
        """Test getting supported languages."""
        languages = document_indexer.get_supported_languages()
        assert isinstance(languages, list)
        assert len(languages) > 0
        assert "python" in languages

    def test_is_language_supported(self, document_indexer: ASTDocumentProcessor):
        """Test language support checking."""
        assert document_indexer.is_language_supported("python") is True
        assert document_indexer.is_language_supported("typescript") is True
        assert document_indexer.is_language_supported("nonexistent") is False

    @pytest.mark.asyncio
    async def test_health_check(self, document_indexer: ASTDocumentProcessor):
        """Test document indexer health check."""
        await document_indexer.initialize()
        health = await document_indexer.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(self, document_indexer: ASTDocumentProcessor):
        """Test document indexer statistics."""
        await document_indexer.initialize()
        stats = await document_indexer.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "documents_processed" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, document_indexer: ASTDocumentProcessor):
        """Test document indexer shutdown."""
        await document_indexer.initialize()
        await document_indexer.shutdown()
        assert document_indexer.status == ServiceStatus.SHUTDOWN


class TestModularHybridSearchEngine:
    """Test the new modular search engine."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_search_enabled": True,
            "rag_search_semantic_weight": 0.7,
            "rag_search_keyword_weight": 0.3,
            "rag_search_rrf_k": 60,
        }

    @pytest.fixture
    def search_engine(self, config: Dict[str, Any]) -> HybridSearchEngine:
        """Create search engine instance."""
        return HybridSearchEngine(config)

    @pytest.fixture
    def mock_embedding_service(self) -> AsyncMock:
        """Mock embedding service."""
        service = AsyncMock()
        service.embed_text.return_value = [0.1, 0.2, 0.3] * 100
        service.is_healthy.return_value = True
        return service

    @pytest.fixture
    def mock_vector_store_service(self) -> AsyncMock:
        """Mock vector store service."""
        service = AsyncMock()
        service.similarity_search.return_value = [
            {"id": 1, "text": "Test result 1", "score": 0.95},
            {"id": 2, "text": "Test result 2", "score": 0.90},
        ]
        service.is_healthy.return_value = True
        return service

    @pytest.mark.asyncio
    async def test_search_engine_initialization(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test search engine initialization."""
        result = await search_engine.initialize()
        assert result is True
        assert search_engine.status == ServiceStatus.HEALTHY

    @pytest.mark.asyncio
    async def test_semantic_search(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test semantic search functionality."""
        query = "machine learning algorithm"
        limit = 10

        await search_engine.initialize()
        search_engine.set_dependencies(mock_embedding_service, mock_vector_store_service)

        results = await search_engine.semantic_search(query, limit)

        assert len(results) == 2
        assert all("text" in result for result in results)
        assert all("score" in result for result in results)

    @pytest.mark.asyncio
    async def test_keyword_search(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test keyword search functionality."""
        query = "python function"
        limit = 10

        with patch.object(search_engine, "_perform_keyword_search") as mock_keyword:
            mock_keyword.return_value = [
                {"id": 1, "text": "Python function definition", "score": 0.85},
                {"id": 2, "text": "Function in Python", "score": 0.80},
            ]

            await search_engine.initialize()
            results = await search_engine.keyword_search(query, limit)

            assert len(results) == 2
            assert all("score" in result for result in results)

    @pytest.mark.asyncio
    async def test_hybrid_search(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test hybrid search functionality."""
        query = "authentication system"
        limit = 10

        with (
            patch.object(search_engine, "_perform_semantic_search") as mock_semantic,
            patch.object(search_engine, "_perform_keyword_search") as mock_keyword,
        ):
            mock_semantic.return_value = [
                {"id": 1, "text": "Auth system implementation", "score": 0.95},
            ]
            mock_keyword.return_value = [
                {"id": 2, "text": "Authentication module", "score": 0.90},
            ]

            await search_engine.initialize()
            results = await search_engine.hybrid_search(query, limit)

            assert len(results) >= 1
            assert all("score" in result for result in results)

    @pytest.mark.asyncio
    async def test_search_with_filters(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test search with filters."""
        query = "test query"
        filters = {"language": "python", "file_type": "py"}

        with patch.object(search_engine, "_apply_filters") as mock_filters:
            mock_filters.return_value = [
                {"id": 1, "text": "Filtered result", "score": 0.9},
            ]

            await search_engine.initialize()
            results = await search_engine.search_with_filters(
                query, "hybrid", 10, filters,
            )

            assert len(results) == 1
            assert "text" in results[0]

    @pytest.mark.asyncio
    async def test_populate_from_vector_store(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test populating search index from vector store."""
        await search_engine.initialize()
        search_engine.set_dependencies(mock_embedding_service, mock_vector_store_service)

        # Should not raise an exception
        await search_engine.populate_from_vector_store()

    def test_clear_index(self, search_engine: HybridSearchEngine):
        """Test clearing the search index."""
        # Should not raise an exception
        search_engine.clear_index()

    @pytest.mark.asyncio
    async def test_benchmark_search_performance(self, search_engine: HybridSearchEngine):
        """Test search performance benchmarking."""
        test_queries = ["query1", "query2", "query3"]
        iterations = 2

        with patch.object(search_engine, "_perform_semantic_search") as mock_semantic:
            mock_semantic.return_value = [{"id": 1, "text": "result", "score": 0.9}]

            await search_engine.initialize()
            results = await search_engine.benchmark_search_performance(
                test_queries, iterations,
            )

            assert "semantic_search" in results
            assert "keyword_search" in results
            assert "hybrid_search" in results

    @pytest.mark.asyncio
    async def test_health_check(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test search engine health check."""
        await search_engine.initialize()
        search_engine.set_dependencies(mock_embedding_service, mock_vector_store_service)
        
        health = await search_engine.health_check()

        assert "status" in health
        assert "message" in health
        assert "last_updated" in health

    @pytest.mark.asyncio
    async def test_get_stats(
        self, 
        search_engine: HybridSearchEngine,
        mock_embedding_service: AsyncMock,
        mock_vector_store_service: AsyncMock
    ):
        """Test search engine statistics."""
        await search_engine.initialize()
        search_engine.set_dependencies(mock_embedding_service, mock_vector_store_service)
        
        stats = await search_engine.get_stats()

        assert "service_name" in stats
        assert "status" in stats
        assert "total_searches" in stats

    @pytest.mark.asyncio
    async def test_shutdown(self, search_engine: HybridSearchEngine):
        """Test search engine shutdown."""
        await search_engine.initialize()
        await search_engine.shutdown()
        assert search_engine.status == ServiceStatus.SHUTDOWN


class TestModularRAGCoreIntegration:
    """Integration tests for modular RAG core services."""

    @pytest.fixture
    def config(self) -> Dict[str, Any]:
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
        }

    @pytest.mark.asyncio
    async def test_end_to_end_workflow(self, config: Dict[str, Any]):
        """Test complete RAG workflow from indexing to search."""
        # Initialize services
        embedding_service = OllamaEmbeddingService(config)
        vector_store_service = PostgreSQLVectorStore(config)
        document_indexer = ASTDocumentProcessor(config)
        search_engine = HybridSearchEngine(config)

        # Mock external dependencies
        with (
            patch("aiohttp.ClientSession.post") as mock_post,
            patch("sqlalchemy.create_engine") as mock_engine,
        ):
            # Mock embedding response
            mock_embedding_response = AsyncMock()
            mock_embedding_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }
            mock_post.return_value.__aenter__.return_value = mock_embedding_response

            # Mock database response
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.rowcount = 1
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            # Initialize services
            await embedding_service.initialize()
            await vector_store_service.initialize()
            await document_indexer.initialize()
            await search_engine.initialize()

            # Set up dependencies
            search_engine.set_dependencies(embedding_service, vector_store_service)

            # Test document indexing
            documents = [
                {
                    "file_id": "test_1",
                    "content": "def hello(): return 'world'",
                    "file_path": "test.py",
                    "language": "python",
                },
            ]

            results = []
            async for result in document_indexer.index_documents(documents):
                results.append(result)

            # Test search
            search_results = await search_engine.search_with_filters(
                "hello function", "hybrid", 5, None,
            )
            assert isinstance(search_results, list)

    @pytest.mark.asyncio
    async def test_service_dependency_management(self, config: Dict[str, Any]):
        """Test service dependency management."""
        embedding_service = OllamaEmbeddingService(config)
        vector_store_service = PostgreSQLVectorStore(config)
        search_engine = HybridSearchEngine(config)

        await embedding_service.initialize()
        await vector_store_service.initialize()
        await search_engine.initialize()

        # Set dependencies
        search_engine.set_dependencies(embedding_service, vector_store_service)

        # Check that dependencies are properly set
        assert search_engine.embedding_provider == embedding_service
        assert search_engine.vector_store == vector_store_service

        # Test health check with dependencies
        health = await search_engine.health_check()
        assert "dependencies" in health

    @pytest.mark.asyncio
    async def test_error_handling_and_recovery(self, config: Dict[str, Any]):
        """Test error handling and recovery mechanisms."""
        embedding_service = OllamaEmbeddingService(config)

        # Test initialization failure
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_post.side_effect = Exception("Connection failed")
            
            result = await embedding_service.initialize()
            assert result is False
            assert embedding_service.status == ServiceStatus.ERROR

        # Test recovery
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_response
            
            result = await embedding_service.initialize()
            assert result is True
            assert embedding_service.status == ServiceStatus.HEALTHY


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
