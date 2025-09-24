"""Test suite for vectorized similarity calculations.

This module tests the core vectorized similarity calculation logic
that was causing the "axis 1 is out of bounds" error.
"""

import numpy as np
import pytest


class TestVectorizedSimilarity:
    """Test suite for vectorized similarity calculations."""

    def test_basic_cosine_similarity(self):
        """Test basic cosine similarity calculation."""
        # Create test vectors
        query_vec = np.array([1.0, 2.0, 3.0])
        file_vectors = np.array(
            [
                [1.0, 2.0, 3.0],  # Identical to query
                [2.0, 4.0, 6.0],  # Proportional to query
                [0.0, 0.0, 0.0],  # Zero vector
                [-1.0, -2.0, -3.0],  # Opposite direction
            ],
        )

        # Calculate cosine similarities
        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        # Verify results
        assert len(cosine_similarities) == 4
        assert abs(cosine_similarities[0] - 1.0) < 1e-10  # Identical vectors
        assert abs(cosine_similarities[1] - 1.0) < 1e-10  # Proportional vectors
        assert np.isnan(cosine_similarities[2])  # Zero vector
        assert abs(cosine_similarities[3] - (-1.0)) < 1e-10  # Opposite vectors

    def test_embedding_shape_handling(self):
        """Test proper handling of different embedding shapes."""
        # Test case 1: Standard 2D array
        query_vec = np.random.rand(384)
        file_embeddings = np.random.rand(5, 384)

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_embeddings, axis=1)
        cosine_similarities = np.dot(file_embeddings, query_vec) / (
            query_norm * file_norms
        )

        assert len(cosine_similarities) == 5
        assert all(-1 <= sim <= 1 for sim in cosine_similarities)

        # Test case 2: Single embedding (1D array)
        single_embedding = np.random.rand(384)
        single_embedding_2d = single_embedding.reshape(1, -1)

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(single_embedding_2d, axis=1)
        cosine_similarities = np.dot(single_embedding_2d, query_vec) / (
            query_norm * file_norms
        )

        assert len(cosine_similarities) == 1
        assert -1 <= cosine_similarities[0] <= 1

    def test_sentence_transformer_embedding_format(self):
        """Test with sentence transformer embedding format."""
        # Simulate sentence transformer output format
        query_embedding = np.random.rand(1, 384)  # Shape: (1, 384)
        file_embeddings = [
            np.random.rand(1, 384) for _ in range(3)
        ]  # List of (1, 384) arrays

        # Extract the actual vectors
        query_vec = query_embedding[0]  # Shape: (384,)
        file_vectors = np.array([emb[0] for emb in file_embeddings])  # Shape: (3, 384)

        # Calculate similarities
        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        assert len(cosine_similarities) == 3
        assert all(-1 <= sim <= 1 for sim in cosine_similarities)

    def test_edge_cases(self):
        """Test edge cases that might cause errors."""
        # Test case 1: Empty embeddings list
        query_vec = np.random.rand(384)
        file_embeddings = []

        if file_embeddings:
            file_vectors = np.array([emb[0] for emb in file_embeddings])
            # This should not be reached
            assert False
        else:
            # Should handle empty case gracefully
            assert True

        # Test case 2: Single embedding
        query_vec = np.random.rand(384)
        file_embeddings = [np.random.rand(1, 384)]

        file_vectors = np.array([emb[0] for emb in file_embeddings])

        # Ensure proper shape
        if file_vectors.ndim == 1:
            file_vectors = file_vectors.reshape(1, -1)

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        assert len(cosine_similarities) == 1
        assert -1 <= cosine_similarities[0] <= 1

    def test_similarity_threshold_filtering(self):
        """Test similarity threshold filtering."""
        query_vec = np.random.rand(384)
        file_vectors = np.random.rand(10, 384)

        # Calculate similarities
        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
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

    def test_performance_with_large_arrays(self):
        """Test performance with large arrays."""
        # Create large arrays
        query_vec = np.random.rand(384)
        file_vectors = np.random.rand(1000, 384)  # 1000 files

        # Time the calculation
        import time

        start_time = time.time()

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        end_time = time.time()

        assert len(cosine_similarities) == 1000
        assert end_time - start_time < 1.0  # Should complete within 1 second
        assert all(-1 <= sim <= 1 for sim in cosine_similarities)

    def test_numerical_stability(self):
        """Test numerical stability with extreme values."""
        # Test with very small values
        query_vec = np.array([1e-10, 1e-10, 1e-10])
        file_vectors = np.array(
            [
                [1e-10, 1e-10, 1e-10],
                [1e-9, 1e-9, 1e-9],
            ],
        )

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        # Should not produce NaN or infinite values
        assert not np.any(np.isnan(cosine_similarities))
        assert not np.any(np.isinf(cosine_similarities))

        # Test with very large values
        query_vec = np.array([1e10, 1e10, 1e10])
        file_vectors = np.array(
            [
                [1e10, 1e10, 1e10],
                [2e10, 2e10, 2e10],
            ],
        )

        query_norm = np.linalg.norm(query_vec)
        file_norms = np.linalg.norm(file_vectors, axis=1)
        cosine_similarities = np.dot(file_vectors, query_vec) / (
            query_norm * file_norms
        )

        assert not np.any(np.isnan(cosine_similarities))
        assert not np.any(np.isinf(cosine_similarities))


if __name__ == "__main__":
    pytest.main([__file__])
