"""Test suite for RAG Core Services.

Tests the core RAG functionality including embeddings, vector store, indexing, and search.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.services.rag.core import (
    DocumentIndexer,
    EmbeddingService,
    SearchEngine,
    VectorStoreService,
)


class TestEmbeddingService:
    """Test unified embedding service functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "embedding_model": "embeddinggemma:latest",
            "embedding_batch_size": 10,
            "embedding_cache_size": 1000,
        }

    @pytest.fixture
    def embedding_service(self, config):
        """Create embedding service instance."""
        return EmbeddingService(config)

    @pytest.mark.asyncio
    async def test_embedding_service_initialization(self, embedding_service):
        """Test embedding service initialization."""
        assert embedding_service is not None
        assert embedding_service.config is not None

    @pytest.mark.asyncio
    async def test_embed_text_single(self, embedding_service):
        """Test single text embedding."""
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.json.return_value = {
                "embedding": [0.1, 0.2, 0.3] * 100,
            }  # 300-dim embedding
            mock_post.return_value.__aenter__.return_value = mock_response

            result = await embedding_service.embed_text("Hello, world!")

            assert result is not None
            assert len(result) == 300
            assert all(isinstance(x, float) for x in result)

    @pytest.mark.asyncio
    async def test_embed_batch(self, embedding_service):
        """Test batch text embedding."""
        texts = ["Hello", "World", "Test"]

        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.json.return_value = {
                "embeddings": [[0.1, 0.2, 0.3] * 100 for _ in texts],
            }
            mock_post.return_value.__aenter__.return_value = mock_response

            results = await embedding_service.embed_batch(texts)

            assert len(results) == len(texts)
            assert all(len(embedding) == 300 for embedding in results)

    @pytest.mark.asyncio
    async def test_embedding_caching(self, embedding_service):
        """Test embedding caching functionality."""
        text = "Test caching"

        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_response = AsyncMock()
            mock_response.json.return_value = {"embedding": [0.1, 0.2, 0.3] * 100}
            mock_post.return_value.__aenter__.return_value = mock_response

            # First call should make HTTP request
            result1 = await embedding_service.embed_text(text)
            assert mock_post.call_count == 1

            # Second call should use cache
            result2 = await embedding_service.embed_text(text)
            assert mock_post.call_count == 1  # No additional HTTP call
            assert result1 == result2

    @pytest.mark.asyncio
    async def test_embedding_error_handling(self, embedding_service):
        """Test embedding error handling."""
        with patch("aiohttp.ClientSession.post") as mock_post:
            mock_post.side_effect = Exception("Network error")

            with pytest.raises(Exception):
                await embedding_service.embed_text("Test error")

    def test_get_embedding_stats(self, embedding_service):
        """Test embedding service statistics."""
        stats = embedding_service.get_embedding_stats()

        assert "enabled" in stats
        assert "model" in stats
        assert "cache_hit_rate" in stats
        assert "total_requests" in stats


class TestVectorStoreService:
    """Test vector store service functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "rag_migrations_enabled": False,
        }

    @pytest.fixture
    def vector_store_service(self, config):
        """Create vector store service instance."""
        return VectorStoreService(config)

    @pytest.mark.asyncio
    async def test_vector_store_initialization(self, vector_store_service):
        """Test vector store service initialization."""
        assert vector_store_service is not None
        assert vector_store_service.config is not None

    @pytest.mark.asyncio
    async def test_health_check(self, vector_store_service):
        """Test vector store health check."""
        with patch("sqlalchemy.create_engine") as mock_engine:
            mock_connection = AsyncMock()
            mock_connection.execute.return_value.fetchone.return_value = ["pgvector"]
            mock_engine.return_value.connect.return_value.__enter__.return_value = (
                mock_connection
            )

            health = await vector_store_service.health_check()

            assert health is not None
            assert "status" in health
            assert "pgvector_version" in health

    @pytest.mark.asyncio
    async def test_similarity_search(self, vector_store_service):
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

            results = await vector_store_service.similarity_search(
                query_embedding, limit,
            )

            assert len(results) == 2
            assert all("text" in result for result in results)
            assert all("similarity" in result for result in results)

    @pytest.mark.asyncio
    async def test_insert_document_embeddings(self, vector_store_service):
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

            result = await vector_store_service.insert_document_embeddings(
                embedding_data,
            )

            assert result is not None
            assert "inserted" in result

    def test_get_vector_store_stats(self, vector_store_service):
        """Test vector store statistics."""
        stats = vector_store_service.get_vector_store_stats()

        assert "enabled" in stats
        assert "connection_status" in stats
        assert "total_embeddings" in stats


class TestDocumentIndexer:
    """Test document indexer functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_indexing_enabled": True,
            "rag_indexing_workers": 2,
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
        }

    @pytest.fixture
    def document_indexer(self, config):
        """Create document indexer instance."""
        return DocumentIndexer(config)

    @pytest.mark.asyncio
    async def test_document_indexer_initialization(self, document_indexer):
        """Test document indexer initialization."""
        assert document_indexer is not None
        assert document_indexer.config is not None
        assert document_indexer.ast_chunker is not None

    def test_ast_chunker_integration(self, document_indexer):
        """Test AST chunker integration."""
        python_code = """
def test_function():
    return "Hello, World!"

class TestClass:
    def __init__(self):
        self.value = 42
"""

        chunks, symbol_map = document_indexer.ast_chunker.chunk_code_ast_aware(
            python_code, "python",
        )

        assert len(chunks) > 0
        assert len(symbol_map) > 0
        assert "test_function" in symbol_map
        assert "TestClass" in symbol_map

    @pytest.mark.asyncio
    async def test_index_documents(self, document_indexer):
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

            result = await document_indexer.index_documents(documents)

            assert result is not None
            assert "status" in result

    def test_language_detection(self, document_indexer):
        """Test language detection from file paths."""
        test_cases = [
            ("test.py", "python"),
            ("test.ts", "typescript"),
            ("test.js", "javascript"),
            ("test.java", "java"),
            ("test.cpp", "cpp"),
            ("test.txt", "generic"),
        ]

        for file_path, expected_language in test_cases:
            detected = document_indexer._detect_language(file_path, "text")
            assert detected == expected_language

    def test_get_metrics(self, document_indexer):
        """Test document indexer metrics."""
        metrics = document_indexer.get_metrics()

        assert "enabled" in metrics
        assert "is_running" in metrics
        assert "queue_depth" in metrics
        assert "active_workers" in metrics
        assert "metrics" in metrics


class TestSearchEngine:
    """Test search engine functionality."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_search_enabled": True,
            "rag_search_semantic_weight": 0.7,
            "rag_search_keyword_weight": 0.3,
            "rag_search_rrf_k": 60,
        }

    @pytest.fixture
    def search_engine(self, config):
        """Create search engine instance."""
        return SearchEngine(config)

    @pytest.mark.asyncio
    async def test_search_engine_initialization(self, search_engine):
        """Test search engine initialization."""
        assert search_engine is not None
        assert search_engine.config is not None

    @pytest.mark.asyncio
    async def test_semantic_search(self, search_engine):
        """Test semantic search functionality."""
        query = "machine learning algorithm"
        limit = 10

        with patch.object(search_engine, "_perform_semantic_search") as mock_semantic:
            mock_semantic.return_value = [
                {"id": 1, "text": "ML algorithm implementation", "score": 0.95},
                {"id": 2, "text": "Deep learning model", "score": 0.90},
            ]

            results = await search_engine.search(
                query, search_type="semantic", limit=limit,
            )

            assert len(results) == 2
            assert all("score" in result for result in results)

    @pytest.mark.asyncio
    async def test_keyword_search(self, search_engine):
        """Test keyword search functionality."""
        query = "python function"
        limit = 10

        with patch.object(search_engine, "_perform_keyword_search") as mock_keyword:
            mock_keyword.return_value = [
                {"id": 1, "text": "Python function definition", "score": 0.85},
                {"id": 2, "text": "Function in Python", "score": 0.80},
            ]

            results = await search_engine.search(
                query, search_type="keyword", limit=limit,
            )

            assert len(results) == 2
            assert all("score" in result for result in results)

    @pytest.mark.asyncio
    async def test_hybrid_search(self, search_engine):
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

            results = await search_engine.search(
                query, search_type="hybrid", limit=limit,
            )

            assert len(results) >= 1
            assert all("score" in result for result in results)

    def test_reciprocal_rank_fusion(self, search_engine):
        """Test reciprocal rank fusion algorithm."""
        semantic_results = [
            {"id": 1, "score": 0.95},
            {"id": 2, "score": 0.90},
            {"id": 3, "score": 0.85},
        ]
        keyword_results = [
            {"id": 2, "score": 0.88},
            {"id": 1, "score": 0.85},
            {"id": 4, "score": 0.80},
        ]

        fused_results = search_engine._reciprocal_rank_fusion(
            semantic_results, keyword_results,
        )

        assert len(fused_results) >= 3
        assert all("id" in result for result in fused_results)
        assert all("score" in result for result in fused_results)

    def test_get_search_stats(self, search_engine):
        """Test search engine statistics."""
        stats = search_engine.get_search_stats()

        assert "enabled" in stats
        assert "total_searches" in stats
        assert "avg_latency_ms" in stats
        assert "search_types" in stats


class TestRAGCoreIntegration:
    """Integration tests for RAG core services."""

    @pytest.fixture
    def config(self):
        """Test configuration."""
        return {
            "rag_enabled": True,
            "ollama_base_url": "http://localhost:11434",
            "pg_dsn": "postgresql://test:test@localhost:5432/test_db",
            "rag_indexing_enabled": True,
            "rag_search_enabled": True,
        }

    @pytest.mark.asyncio
    async def test_end_to_end_workflow(self, config):
        """Test complete RAG workflow from indexing to search."""
        # Initialize services
        embedding_service = EmbeddingService(config)
        vector_store_service = VectorStoreService(config)
        document_indexer = DocumentIndexer(config)
        search_engine = SearchEngine(config)

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

            # Test document indexing
            documents = [
                {
                    "file_id": "test_1",
                    "content": "def hello(): return 'world'",
                    "file_path": "test.py",
                    "language": "python",
                },
            ]

            index_result = await document_indexer.index_documents(documents)
            assert index_result["status"] == "completed"

            # Test search
            search_results = await search_engine.search("hello function", limit=5)
            assert isinstance(search_results, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
