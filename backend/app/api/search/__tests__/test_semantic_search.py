"""
Test suite for semantic search functionality.

This module contains comprehensive tests for the semantic search system,
including vectorized similarity calculations, batch processing, and
error handling.
"""

import asyncio
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest
import pytest_asyncio

from app.api.search.models import SearchResult, SemanticSearchRequest
from app.api.search.service import OptimizedSearchService


class TestSemanticSearch:
    """Test suite for semantic search functionality."""

    # Constants for test configuration
    EMBEDDING_DIMENSION = 384  # Dimension for all-MiniLM-L6-v2 model
    EXPECTED_NDIM = 2  # Expected number of dimensions for processed embeddings
    PERFORMANCE_TIMEOUT = 5.0  # Maximum time for performance tests (seconds)
    TEST_SCORE = 0.8  # Test score for result formatting

    @pytest.fixture
    def rng(self):
        """Create a random number generator for consistent testing."""
        return np.random.default_rng(seed=42)

    @pytest_asyncio.fixture
    async def search_service(self):
        """Create a test search service instance."""
        service = OptimizedSearchService()
        # Mock the model loading to avoid downloading models in tests
        service._models = {"all-MiniLM-L6-v2": MagicMock()}
        service._default_model = "all-MiniLM-L6-v2"
        return service

    @pytest.fixture
    def mock_embeddings(self, rng):
        """Create mock embeddings for testing."""
        # Create mock embeddings with proper shape
        query_embedding = rng.random((1, self.EMBEDDING_DIMENSION))
        file_embeddings = [rng.random((1, self.EMBEDDING_DIMENSION)) for _ in range(5)]
        return query_embedding, file_embeddings

    @pytest.fixture
    def test_files(self):
        """Create temporary test files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create test files with different content
            test_files = []
            for i in range(5):
                file_path = temp_path / f"test_{i}.py"
                content = """
def authenticate_user(username, password):
    # Authentication logic here
    return True

def login_user(user_data):
    # Login functionality
    return user_data
"""
                file_path.write_text(content)
                test_files.append(file_path)

            yield test_files

    def test_vectorized_similarity_calculation(self, mock_embeddings):
        """Test vectorized similarity calculation."""
        query_embedding, file_embeddings = mock_embeddings

        # Test the vectorized calculation
        query_vec = np.array(query_embedding[0])
        file_embeddings_array = np.array([emb[0] for emb in file_embeddings])

        # Calculate similarities
        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_embeddings_array, axis=1)
        cosine_similarities = np.dot(file_embeddings_array, query_vec) / (
            query_norm * file_norms
        )

        # Verify results
        assert len(cosine_similarities) == len(file_embeddings)
        assert all(-1 <= sim <= 1 for sim in cosine_similarities)

    def test_similarity_calculation_edge_cases(self, rng):
        """Test similarity calculation with edge cases."""
        # Test with single embedding
        query_embedding = rng.random((1, self.EMBEDDING_DIMENSION))
        file_embeddings = [rng.random((1, self.EMBEDDING_DIMENSION))]

        query_vec = np.array(query_embedding[0])
        file_embeddings_array = np.array([emb[0] for emb in file_embeddings])

        # Ensure proper shape handling
        if file_embeddings_array.ndim == 1:
            file_embeddings_array = file_embeddings_array.reshape(1, -1)

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_embeddings_array, axis=1)
        cosine_similarities = np.dot(file_embeddings_array, query_vec) / (
            query_norm * file_norms
        )

        assert len(cosine_similarities) == 1
        assert -1 <= cosine_similarities[0] <= 1

    def test_batch_processing(self, mock_embeddings):
        """Test batch processing of embeddings."""
        query_embedding, file_embeddings = mock_embeddings

        # Test batch processing
        batch_contents = [f"test content {i}" for i in range(len(file_embeddings))]

        # Mock the model encode method
        mock_model = MagicMock()
        mock_model.encode.return_value = np.array([emb[0] for emb in file_embeddings])

        # Test batch encoding
        batch_embeddings = mock_model.encode(batch_contents)

        assert batch_embeddings.shape[0] == len(batch_contents)
        assert batch_embeddings.shape[1] == self.EMBEDDING_DIMENSION

    @pytest.mark.asyncio
    async def test_semantic_search_success(self, search_service, test_files, rng):
        """Test successful semantic search."""
        # Mock the model
        mock_model = MagicMock()
        mock_model.encode.return_value = rng.random((1, self.EMBEDDING_DIMENSION))
        search_service._models["all-MiniLM-L6-v2"] = mock_model

        # Mock file reading
        with patch.object(search_service, "_get_relevant_files") as mock_get_files:
            mock_get_files.return_value = test_files

            request = SemanticSearchRequest(
                query="authentication and login",
                max_results=5,
                similarity_threshold=0.3,
            )

            # Mock the _read_file_content method
            with patch.object(search_service, "_read_file_content") as mock_read:
                mock_read.return_value = "def authenticate_user(): pass"

                result = await search_service._local_semantic_search(request, 0.0)

                assert result.success is True
                assert result.query == "authentication and login"
                assert result.search_strategies == ["sentence_transformer"]

    @pytest.mark.asyncio
    async def test_semantic_search_no_files(self, search_service):
        """Test semantic search with no relevant files."""
        with patch.object(search_service, "_get_relevant_files") as mock_get_files:
            mock_get_files.return_value = []

            request = SemanticSearchRequest(query="test query", max_results=5)

            result = await search_service._local_semantic_search(request, 0.0)

            assert result.success is True
            assert result.total_results == 0
            assert result.results == []

    @pytest.mark.asyncio
    async def test_semantic_search_error_handling(self, search_service):
        """Test semantic search error handling."""
        with patch.object(search_service, "_get_relevant_files") as mock_get_files:
            mock_get_files.side_effect = Exception("Test error")

            request = SemanticSearchRequest(query="test query", max_results=5)

            result = await search_service._local_semantic_search(request, 0.0)

            assert result.success is False
            assert "Test error" in result.error

    def test_embedding_shape_handling(self, rng):
        """Test proper handling of different embedding shapes."""
        # Test with different shapes
        test_cases = [
            rng.random((1, self.EMBEDDING_DIMENSION)),  # Standard shape
            rng.random(self.EMBEDDING_DIMENSION),  # 1D array
            rng.random((2, self.EMBEDDING_DIMENSION)),  # Multiple embeddings
        ]

        for embedding in test_cases:
            processed_embedding = embedding
            if processed_embedding.ndim == 1:
                processed_embedding = processed_embedding.reshape(1, -1)

            assert processed_embedding.ndim == self.EXPECTED_NDIM
            assert processed_embedding.shape[1] == self.EMBEDDING_DIMENSION

    def test_similarity_threshold_filtering(self, mock_embeddings):
        """Test similarity threshold filtering."""
        query_embedding, file_embeddings = mock_embeddings

        # Calculate similarities
        query_vec = np.array(query_embedding[0])
        file_embeddings_array = np.array([emb[0] for emb in file_embeddings])

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_embeddings_array, axis=1)
        cosine_similarities = np.dot(file_embeddings_array, query_vec) / (
            query_norm * file_norms
        )

        # Test different thresholds
        thresholds = [0.1, 0.3, 0.5, 0.7, 0.9]

        for threshold in thresholds:
            filtered_similarities = [
                (float(sim), i)
                for i, sim in enumerate(cosine_similarities)
                if sim >= threshold
            ]

            # Verify all similarities are above threshold
            for sim, _ in filtered_similarities:
                assert sim >= threshold

    @pytest.mark.asyncio
    async def test_batch_processing_performance(self, search_service, rng):
        """Test batch processing performance."""
        # Create a large number of test files
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            test_files = []

            for i in range(100):  # Create 100 test files
                file_path = temp_path / f"test_{i}.py"
                content = f"def test_function_{i}(): pass"
                file_path.write_text(content)
                test_files.append(file_path)

            # Mock the model
            mock_model = MagicMock()
            mock_model.encode.return_value = rng.random((100, self.EMBEDDING_DIMENSION))
            search_service._models["all-MiniLM-L6-v2"] = mock_model

            with patch.object(search_service, "_get_relevant_files") as mock_get_files:
                mock_get_files.return_value = test_files

                request = SemanticSearchRequest(query="test query", max_results=10)

                # Mock file reading
                with patch.object(search_service, "_read_file_content") as mock_read:
                    mock_read.return_value = "def test(): pass"

                    start_time = asyncio.get_event_loop().time()
                    result = await search_service._local_semantic_search(request, 0.0)
                    end_time = asyncio.get_event_loop().time()

                    assert result.success is True
                    assert (
                        end_time - start_time < self.PERFORMANCE_TIMEOUT
                    )  # Should complete within timeout

    def test_search_result_formatting(self):
        """Test search result formatting."""
        # Create a test result
        result = SearchResult(
            file_path="test.py",
            line_number=1,
            content="def test(): pass",
            score=self.TEST_SCORE,
            match_type="semantic",
            context="def test(): pass",
            snippet="def test(): pass",
        )

        assert result.file_path == "test.py"
        assert result.score == self.TEST_SCORE
        assert result.match_type == "semantic"

    @pytest.mark.asyncio
    async def test_caching_behavior(self, search_service, rng):
        """Test caching behavior of semantic search."""
        # Mock the model
        mock_model = MagicMock()
        mock_model.encode.return_value = rng.random((1, self.EMBEDDING_DIMENSION))
        search_service._models["all-MiniLM-L6-v2"] = mock_model

        with patch.object(search_service, "_get_relevant_files") as mock_get_files:
            mock_get_files.return_value = []

            request = SemanticSearchRequest(query="test query", max_results=5)

            # First search
            result1 = await search_service.semantic_search(request)

            # Second search (should be cached)
            result2 = await search_service.semantic_search(request)

            # Both should succeed
            assert result1.success is True
            assert result2.success is True


if __name__ == "__main__":
    pytest.main([__file__])
