"""
Tests for RAG services.

This module tests the RAG service functionality for
embedding, indexing, and vector database operations.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import numpy as np
from typing import List, Dict, Any

from app.services.rag.embedding_service import EmbeddingService
from app.services.rag.indexing_service import EmbeddingIndexService
from app.services.rag.vector_db_service import VectorDBService


class TestEmbeddingService:
    """Test the embedding service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = EmbeddingService()

    def test_service_initialization(self):
        """Test service initialization."""
        assert self.service is not None
        assert hasattr(self.service, 'generate_embeddings')
        assert hasattr(self.service, 'get_embedding_model')

    @patch('app.services.rag.embedding_service.sentence_transformers.SentenceTransformer')
    async def test_generate_embeddings_success(self, mock_transformer_class):
        """Test successful embedding generation."""
        # Mock the transformer
        mock_transformer = MagicMock()
        mock_transformer_class.return_value = mock_transformer
        mock_transformer.encode.return_value = np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]])
        
        # Generate embeddings
        texts = ["Hello world", "Test text"]
        result = await self.service.generate_embeddings(texts)
        
        assert result is not None
        assert len(result) == 2
        assert len(result[0]) == 3
        assert result[0][0] == 0.1
        assert result[1][2] == 0.6

    @patch('app.services.rag.embedding_service.sentence_transformers.SentenceTransformer')
    async def test_generate_embeddings_empty_input(self, mock_transformer_class):
        """Test embedding generation with empty input."""
        # Mock the transformer
        mock_transformer = MagicMock()
        mock_transformer_class.return_value = mock_transformer
        
        # Generate embeddings
        texts = []
        result = await self.service.generate_embeddings(texts)
        
        assert result is not None
        assert len(result) == 0

    @patch('app.services.rag.embedding_service.sentence_transformers.SentenceTransformer')
    async def test_generate_embeddings_single_text(self, mock_transformer_class):
        """Test embedding generation with single text."""
        # Mock the transformer
        mock_transformer = MagicMock()
        mock_transformer_class.return_value = mock_transformer
        mock_transformer.encode.return_value = np.array([[0.1, 0.2, 0.3]])
        
        # Generate embeddings
        texts = ["Single text"]
        result = await self.service.generate_embeddings(texts)
        
        assert result is not None
        assert len(result) == 1
        assert len(result[0]) == 3
        assert result[0][0] == 0.1

    @patch('app.services.rag.embedding_service.sentence_transformers.SentenceTransformer')
    async def test_generate_embeddings_model_error(self, mock_transformer_class):
        """Test embedding generation with model error."""
        # Mock the transformer to raise an exception
        mock_transformer = MagicMock()
        mock_transformer_class.return_value = mock_transformer
        mock_transformer.encode.side_effect = Exception("Model error")
        
        # Generate embeddings
        texts = ["Test text"]
        with pytest.raises(Exception):
            await self.service.generate_embeddings(texts)

    @patch('app.services.rag.embedding_service.sentence_transformers.SentenceTransformer')
    async def test_generate_embeddings_invalid_input(self, mock_transformer_class):
        """Test embedding generation with invalid input."""
        # Mock the transformer
        mock_transformer = MagicMock()
        mock_transformer_class.return_value = mock_transformer
        
        # Generate embeddings with invalid input
        texts = [None, ""]
        with pytest.raises(Exception):
            await self.service.generate_embeddings(texts)


class TestIndexingService:
    """Test the indexing service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = EmbeddingIndexService()

    def test_service_initialization(self):
        """Test service initialization."""
        assert self.service is not None
        assert hasattr(self.service, 'index_documents')
        assert hasattr(self.service, 'search_documents')

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_index_documents_success(self, mock_embedding_service):
        """Test successful document indexing."""
        # Mock the embedding service
        mock_embedding_service.return_value.generate_embeddings.return_value = [
            [0.1, 0.2, 0.3], [0.4, 0.5, 0.6]
        ]
        
        # Index documents
        documents = [
            {"id": "doc1", "text": "Hello world"},
            {"id": "doc2", "text": "Test text"}
        ]
        result = await self.service.index_documents(documents)
        
        assert result is not None
        assert result["indexed_count"] == 2
        assert result["success"] is True

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_index_documents_empty(self, mock_embedding_service):
        """Test document indexing with empty documents."""
        # Mock the embedding service
        mock_embedding_service.return_value.generate_embeddings.return_value = []
        
        # Index documents
        documents = []
        result = await self.service.index_documents(documents)
        
        assert result is not None
        assert result["indexed_count"] == 0
        assert result["success"] is True

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_index_documents_error(self, mock_embedding_service):
        """Test document indexing with error."""
        # Mock the embedding service to raise an exception
        mock_embedding_service.return_value.generate_embeddings.side_effect = Exception("Embedding error")
        
        # Index documents
        documents = [{"id": "doc1", "text": "Hello world"}]
        with pytest.raises(Exception):
            await self.service.index_documents(documents)

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_search_documents_success(self, mock_embedding_service):
        """Test successful document search."""
        # Mock the embedding service
        mock_embedding_service.return_value.generate_embeddings.return_value = [[0.1, 0.2, 0.3]]
        
        # Search documents
        query = "test query"
        result = await self.service.search_documents(query, limit=5)
        
        assert result is not None
        assert "results" in result
        assert "query" in result
        assert result["query"] == query

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_search_documents_empty_query(self, mock_embedding_service):
        """Test document search with empty query."""
        # Mock the embedding service
        mock_embedding_service.return_value.generate_embeddings.return_value = [[0.1, 0.2, 0.3]]
        
        # Search documents
        query = ""
        result = await self.service.search_documents(query, limit=5)
        
        assert result is not None
        assert "results" in result
        assert "query" in result
        assert result["query"] == query

    @patch('app.services.rag.indexing_service.EmbeddingService')
    async def test_search_documents_error(self, mock_embedding_service):
        """Test document search with error."""
        # Mock the embedding service to raise an exception
        mock_embedding_service.return_value.generate_embeddings.side_effect = Exception("Embedding error")
        
        # Search documents
        query = "test query"
        with pytest.raises(Exception):
            await self.service.search_documents(query, limit=5)


class TestVectorDBService:
    """Test the vector database service."""

    def setup_method(self):
        """Set up test fixtures."""
        self.service = VectorDBService()

    def test_service_initialization(self):
        """Test service initialization."""
        assert self.service is not None
        assert hasattr(self.service, 'store_vectors')
        assert hasattr(self.service, 'search_vectors')

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_store_vectors_success(self, mock_pgvector):
        """Test successful vector storage."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.return_value = None
        
        # Store vectors
        vectors = [
            {"id": "vec1", "embedding": [0.1, 0.2, 0.3], "metadata": {"text": "Hello"}},
            {"id": "vec2", "embedding": [0.4, 0.5, 0.6], "metadata": {"text": "World"}}
        ]
        result = await self.service.store_vectors(vectors)
        
        assert result is not None
        assert result["stored_count"] == 2
        assert result["success"] is True

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_store_vectors_empty(self, mock_pgvector):
        """Test vector storage with empty vectors."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        
        # Store vectors
        vectors = []
        result = await self.service.store_vectors(vectors)
        
        assert result is not None
        assert result["stored_count"] == 0
        assert result["success"] is True

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_store_vectors_error(self, mock_pgvector):
        """Test vector storage with error."""
        # Mock the database connection to raise an exception
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.side_effect = Exception("Database error")
        
        # Store vectors
        vectors = [{"id": "vec1", "embedding": [0.1, 0.2, 0.3], "metadata": {"text": "Hello"}}]
        with pytest.raises(Exception):
            await self.service.store_vectors(vectors)

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_search_vectors_success(self, mock_pgvector):
        """Test successful vector search."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.fetchall.return_value = [
            {"id": "vec1", "distance": 0.1, "metadata": {"text": "Hello"}},
            {"id": "vec2", "distance": 0.2, "metadata": {"text": "World"}}
        ]
        
        # Search vectors
        query_vector = [0.1, 0.2, 0.3]
        result = await self.service.search_vectors(query_vector, limit=5)
        
        assert result is not None
        assert "results" in result
        assert len(result["results"]) == 2
        assert result["results"][0]["id"] == "vec1"
        assert result["results"][0]["distance"] == 0.1

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_search_vectors_empty_results(self, mock_pgvector):
        """Test vector search with empty results."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.fetchall.return_value = []
        
        # Search vectors
        query_vector = [0.1, 0.2, 0.3]
        result = await self.service.search_vectors(query_vector, limit=5)
        
        assert result is not None
        assert "results" in result
        assert len(result["results"]) == 0

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_search_vectors_error(self, mock_pgvector):
        """Test vector search with error."""
        # Mock the database connection to raise an exception
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.fetchall.side_effect = Exception("Database error")
        
        # Search vectors
        query_vector = [0.1, 0.2, 0.3]
        with pytest.raises(Exception):
            await self.service.search_vectors(query_vector, limit=5)

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_delete_vectors_success(self, mock_pgvector):
        """Test successful vector deletion."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.return_value = None
        
        # Delete vectors
        vector_ids = ["vec1", "vec2"]
        result = await self.service.delete_vectors(vector_ids)
        
        assert result is not None
        assert result["deleted_count"] == 2
        assert result["success"] is True

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_delete_vectors_empty(self, mock_pgvector):
        """Test vector deletion with empty IDs."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        
        # Delete vectors
        vector_ids = []
        result = await self.service.delete_vectors(vector_ids)
        
        assert result is not None
        assert result["deleted_count"] == 0
        assert result["success"] is True

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_delete_vectors_error(self, mock_pgvector):
        """Test vector deletion with error."""
        # Mock the database connection to raise an exception
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.side_effect = Exception("Database error")
        
        # Delete vectors
        vector_ids = ["vec1", "vec2"]
        with pytest.raises(Exception):
            await self.service.delete_vectors(vector_ids)

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_get_vector_count_success(self, mock_pgvector):
        """Test successful vector count retrieval."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.fetchone.return_value = {"count": 100}
        
        # Get vector count
        result = await self.service.get_vector_count()
        
        assert result is not None
        assert result["count"] == 100
        assert result["success"] is True

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_get_vector_count_error(self, mock_pgvector):
        """Test vector count retrieval with error."""
        # Mock the database connection to raise an exception
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.fetchone.side_effect = Exception("Database error")
        
        # Get vector count
        with pytest.raises(Exception):
            await self.service.get_vector_count()

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_clear_vectors_success(self, mock_pgvector):
        """Test successful vector clearing."""
        # Mock the database connection
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.return_value = None
        
        # Clear vectors
        result = await self.service.clear_vectors()
        
        assert result is not None
        assert result["success"] is True
        assert "cleared_count" in result

    @patch('app.services.rag.vector_db_service.pgvector')
    async def test_clear_vectors_error(self, mock_pgvector):
        """Test vector clearing with error."""
        # Mock the database connection to raise an exception
        mock_conn = AsyncMock()
        mock_pgvector.connect.return_value.__aenter__.return_value = mock_conn
        mock_conn.execute.side_effect = Exception("Database error")
        
        # Clear vectors
        with pytest.raises(Exception):
            await self.service.clear_vectors()
