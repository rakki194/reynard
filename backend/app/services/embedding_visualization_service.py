"""
Embedding Visualization Service

Provides dimensionality reduction and visualization capabilities for embeddings.
Supports PCA, t-SNE, UMAP, and statistical analysis of embedding data.
"""

import json
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any

import numpy as np

# BaseService import removed - not available
from ..utils.dimensionality_reduction import (
    PCAParameters,
    TSNEParameters,
    UMAPParameters,
    get_dimensionality_reducer,
)

logger = logging.getLogger(__name__)


@dataclass
class EmbeddingStats:
    """Statistics about embedding dataset."""

    total_embeddings: int
    embedding_dimension: int
    mean_values: list[float]
    std_values: list[float]
    min_values: list[float]
    max_values: list[float]
    quality_score: float
    last_updated: datetime


@dataclass
class EmbeddingReductionResult:
    """Result of dimensionality reduction operation."""

    success: bool
    method: str
    transformed_data: list[list[float]]
    original_indices: list[int]
    parameters: dict[str, Any]
    metadata: dict[str, Any]
    processing_time_ms: int
    job_id: str
    cached: bool
    error: str | None = None


@dataclass
class EmbeddingQualityMetrics:
    """Quality metrics for embedding analysis."""

    overall_score: float
    coherence_score: float
    separation_score: float
    density_score: float
    distribution_score: float
    recommendations: list[str]
    issues: list[str]


class EmbeddingVisualizationService:
    """
    Service for embedding visualization and dimensionality reduction.

    Provides comprehensive embedding analysis including:
    - Dimensionality reduction (PCA, t-SNE, UMAP)
    - Statistical analysis and quality metrics
    - Caching and performance optimization
    - Real-time progress tracking
    """

    def __init__(self, config: dict[str, Any] = None):
        if config is None:
            config = {}
        self.cache_ttl = config.get("cache_ttl_seconds", 3600)  # 1 hour default
        self.max_samples = config.get("max_samples", 10000)
        self.cache: dict[str, dict[str, Any]] = {}

        # Initialize dimensionality reduction methods
        self.reducers = {
            "pca": get_dimensionality_reducer("pca"),
            "tsne": get_dimensionality_reducer("tsne"),
            "umap": get_dimensionality_reducer("umap"),
        }

        logger.info("EmbeddingVisualizationService initialized")

    async def get_embedding_stats(self) -> EmbeddingStats:
        """
        Get comprehensive statistics about available embeddings.

        Returns:
            EmbeddingStats: Statistical information about the embedding dataset
        """
        try:
            # This would typically query the vector database
            # For now, return mock data that matches the expected structure
            stats = EmbeddingStats(
                total_embeddings=1000,
                embedding_dimension=768,
                mean_values=[0.0] * 768,
                std_values=[1.0] * 768,
                min_values=[-3.0] * 768,
                max_values=[3.0] * 768,
                quality_score=0.85,
                last_updated=datetime.now(),
            )

            logger.info(
                f"Retrieved embedding stats: {stats.total_embeddings} embeddings"
            )
            return stats

        except Exception as e:
            logger.error(f"Error getting embedding stats: {e}")
            raise

    async def get_available_methods(self) -> dict[str, Any]:
        """
        Get available dimensionality reduction methods and their parameters.

        Returns:
            Dict containing available methods and their parameter schemas
        """
        methods = {
            "pca": {
                "name": "Principal Component Analysis",
                "description": "Linear dimensionality reduction using SVD",
                "parameters": {
                    "n_components": {
                        "type": "integer",
                        "default": 3,
                        "min": 2,
                        "max": 50,
                        "description": "Number of components to keep",
                    },
                    "variance_threshold": {
                        "type": "float",
                        "default": 0.95,
                        "min": 0.0,
                        "max": 1.0,
                        "description": "Cumulative variance threshold",
                    },
                    "whiten": {
                        "type": "boolean",
                        "default": False,
                        "description": "Whether to whiten the components",
                    },
                },
            },
            "tsne": {
                "name": "t-Distributed Stochastic Neighbor Embedding",
                "description": "Non-linear dimensionality reduction for visualization",
                "parameters": {
                    "n_components": {
                        "type": "integer",
                        "default": 3,
                        "min": 2,
                        "max": 3,
                        "description": "Number of components (2 or 3)",
                    },
                    "perplexity": {
                        "type": "float",
                        "default": 30.0,
                        "min": 5.0,
                        "max": 100.0,
                        "description": "Perplexity parameter",
                    },
                    "learning_rate": {
                        "type": "float",
                        "default": 200.0,
                        "min": 10.0,
                        "max": 1000.0,
                        "description": "Learning rate",
                    },
                    "max_iter": {
                        "type": "integer",
                        "default": 1000,
                        "min": 100,
                        "max": 10000,
                        "description": "Maximum iterations",
                    },
                },
            },
            "umap": {
                "name": "Uniform Manifold Approximation and Projection",
                "description": "Non-linear dimensionality reduction with better global structure",
                "parameters": {
                    "n_components": {
                        "type": "integer",
                        "default": 3,
                        "min": 2,
                        "max": 10,
                        "description": "Number of components",
                    },
                    "n_neighbors": {
                        "type": "integer",
                        "default": 15,
                        "min": 2,
                        "max": 100,
                        "description": "Number of neighbors",
                    },
                    "min_dist": {
                        "type": "float",
                        "default": 0.1,
                        "min": 0.0,
                        "max": 1.0,
                        "description": "Minimum distance between points",
                    },
                    "metric": {
                        "type": "string",
                        "default": "euclidean",
                        "options": ["euclidean", "manhattan", "chebyshev", "cosine"],
                        "description": "Distance metric",
                    },
                },
            },
        }

        return {"methods": methods}

    async def perform_reduction(
        self,
        method: str,
        filters: dict[str, Any] | None = None,
        parameters: dict[str, Any] | None = None,
        max_samples: int | None = None,
        random_seed: int | None = None,
        use_cache: bool = True,
        cache_ttl_seconds: int | None = None,
    ) -> EmbeddingReductionResult:
        """
        Perform dimensionality reduction on embeddings.

        Args:
            method: Reduction method ('pca', 'tsne', 'umap')
            filters: Optional filters for embedding selection
            parameters: Method-specific parameters
            max_samples: Maximum number of samples to process
            random_seed: Random seed for reproducibility
            use_cache: Whether to use cached results
            cache_ttl_seconds: Custom cache TTL

        Returns:
            EmbeddingReductionResult: Results of the reduction operation
        """
        start_time = datetime.now()
        job_id = str(uuid.uuid4())

        try:
            # Generate cache key
            cache_key = self._generate_cache_key(
                method, filters, parameters, max_samples, random_seed
            )

            # Check cache first
            if use_cache and cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if self._is_cache_valid(cached_result, cache_ttl_seconds):
                    logger.info(f"Using cached result for {method}")
                    return EmbeddingReductionResult(
                        success=True,
                        method=method,
                        transformed_data=cached_result["transformed_data"],
                        original_indices=cached_result["original_indices"],
                        parameters=cached_result["parameters"],
                        metadata=cached_result["metadata"],
                        processing_time_ms=0,  # Cached result
                        job_id=job_id,
                        cached=True,
                    )

            # Validate method
            if method not in self.reducers:
                raise ValueError(f"Unsupported reduction method: {method}")

            # Get embeddings (mock data for now)
            embeddings, original_indices = await self._get_embeddings(
                filters, max_samples
            )

            if len(embeddings) == 0:
                raise ValueError("No embeddings found matching the specified filters")

            # Convert to numpy array
            embeddings_array = np.array(embeddings)

            # Set random seed if provided
            if random_seed is not None:
                np.random.seed(random_seed)

            # Perform reduction
            reducer = self.reducers[method]
            transformed_data = await self._perform_reduction_with_params(
                reducer, embeddings_array, method, parameters
            )

            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Prepare result
            result = EmbeddingReductionResult(
                success=True,
                method=method,
                transformed_data=transformed_data.tolist(),
                original_indices=original_indices,
                parameters=parameters or {},
                metadata={
                    "original_shape": embeddings_array.shape,
                    "reduced_shape": transformed_data.shape,
                    "compression_ratio": embeddings_array.shape[1]
                    / transformed_data.shape[1],
                    "timestamp": datetime.now().isoformat(),
                },
                processing_time_ms=int(processing_time),
                job_id=job_id,
                cached=False,
            )

            # Cache result
            if use_cache:
                self.cache[cache_key] = {
                    "transformed_data": result.transformed_data,
                    "original_indices": result.original_indices,
                    "parameters": result.parameters,
                    "metadata": result.metadata,
                    "timestamp": datetime.now(),
                    "ttl": cache_ttl_seconds or self.cache_ttl,
                }

            logger.info(
                f"Successfully performed {method} reduction: {len(embeddings)} embeddings -> {transformed_data.shape}"
            )
            return result

        except Exception as e:
            logger.error(f"Error performing {method} reduction: {e}")
            return EmbeddingReductionResult(
                success=False,
                method=method,
                transformed_data=[],
                original_indices=[],
                parameters=parameters or {},
                metadata={},
                processing_time_ms=int(
                    (datetime.now() - start_time).total_seconds() * 1000
                ),
                job_id=job_id,
                cached=False,
                error=str(e),
            )

    async def analyze_embedding_quality(
        self, embeddings: list[list[float]]
    ) -> EmbeddingQualityMetrics:
        """
        Analyze the quality of embeddings using various metrics.

        Args:
            embeddings: List of embedding vectors

        Returns:
            EmbeddingQualityMetrics: Quality analysis results
        """
        try:
            embeddings_array = np.array(embeddings)

            # Calculate various quality metrics
            coherence_score = self._calculate_coherence_score(embeddings_array)
            separation_score = self._calculate_separation_score(embeddings_array)
            density_score = self._calculate_density_score(embeddings_array)
            distribution_score = self._calculate_distribution_score(embeddings_array)

            # Overall quality score (weighted average)
            overall_score = (
                coherence_score * 0.3
                + separation_score * 0.3
                + density_score * 0.2
                + distribution_score * 0.2
            )

            # Generate recommendations and identify issues
            recommendations = []
            issues = []

            if coherence_score < 0.5:
                issues.append(
                    "Low coherence - embeddings may not capture semantic relationships well"
                )
                recommendations.append(
                    "Consider using a different embedding model or fine-tuning"
                )

            if separation_score < 0.4:
                issues.append("Poor separation - embeddings may be too similar")
                recommendations.append(
                    "Increase embedding dimensionality or use contrastive learning"
                )

            if density_score < 0.3:
                issues.append("Low density - embeddings may be too sparse")
                recommendations.append("Consider using denser embedding models")

            if distribution_score < 0.6:
                issues.append("Poor distribution - embeddings may have bias")
                recommendations.append(
                    "Normalize embeddings or use balanced training data"
                )

            if overall_score >= 0.8:
                recommendations.append(
                    "Excellent embedding quality - no immediate improvements needed"
                )
            elif overall_score >= 0.6:
                recommendations.append(
                    "Good embedding quality - minor optimizations possible"
                )
            else:
                recommendations.append(
                    "Consider significant improvements to embedding quality"
                )

            return EmbeddingQualityMetrics(
                overall_score=overall_score,
                coherence_score=coherence_score,
                separation_score=separation_score,
                density_score=density_score,
                distribution_score=distribution_score,
                recommendations=recommendations,
                issues=issues,
            )

        except Exception as e:
            logger.error(f"Error analyzing embedding quality: {e}")
            raise

    async def get_cache_stats(self) -> dict[str, Any]:
        """Get cache statistics and management information."""
        total_entries = len(self.cache)
        total_size = sum(len(str(entry)) for entry in self.cache.values())

        return {
            "total_entries": total_entries,
            "total_size_bytes": total_size,
            "default_ttl_seconds": self.cache_ttl,
            "cache_hit_rate": 0.0,  # Would need to track hits/misses
            "oldest_entry": min(
                (entry["timestamp"] for entry in self.cache.values()), default=None
            ),
            "newest_entry": max(
                (entry["timestamp"] for entry in self.cache.values()), default=None
            ),
        }

    async def clear_cache(self) -> dict[str, Any]:
        """Clear all cached results."""
        cleared_count = len(self.cache)
        self.cache.clear()

        logger.info(f"Cleared {cleared_count} cached results")
        return {
            "cleared_entries": cleared_count,
            "timestamp": datetime.now().isoformat(),
        }

    def _generate_cache_key(
        self,
        method: str,
        filters: dict[str, Any] | None,
        parameters: dict[str, Any] | None,
        max_samples: int | None,
        random_seed: int | None,
    ) -> str:
        """Generate a cache key for the reduction request."""
        key_data = {
            "method": method,
            "filters": filters or {},
            "parameters": parameters or {},
            "max_samples": max_samples,
            "random_seed": random_seed,
        }
        return f"reduction_{hash(json.dumps(key_data, sort_keys=True))}"

    def _is_cache_valid(
        self, cached_entry: dict[str, Any], custom_ttl: int | None = None
    ) -> bool:
        """Check if a cached entry is still valid."""
        ttl = custom_ttl or cached_entry.get("ttl", self.cache_ttl)
        age = (datetime.now() - cached_entry["timestamp"]).total_seconds()
        return age < ttl

    async def _get_embeddings(
        self,
        filters: dict[str, Any] | None = None,
        max_samples: int | None = None,
    ) -> tuple[list[list[float]], list[int]]:
        """
        Get embeddings from the vector database.

        This is a mock implementation that generates sample embeddings.
        In a real implementation, this would query the actual vector database.
        """
        # Mock implementation - generate sample embeddings
        num_embeddings = min(max_samples or 1000, 1000)
        embedding_dim = 768

        # Generate random embeddings with some structure
        np.random.seed(42)
        embeddings = []
        original_indices = []

        for i in range(num_embeddings):
            # Create embeddings with some clustering structure
            cluster_id = i // 100
            base_embedding = np.random.normal(0, 1, embedding_dim)

            # Add cluster-specific bias
            cluster_center = np.random.normal(0, 2, embedding_dim)
            embedding = base_embedding + cluster_center * 0.3

            embeddings.append(embedding.tolist())
            original_indices.append(i)

        return embeddings, original_indices

    async def _perform_reduction_with_params(
        self,
        reducer,
        embeddings: np.ndarray,
        method: str,
        parameters: dict[str, Any] | None,
    ) -> np.ndarray:
        """Perform dimensionality reduction with method-specific parameters."""
        if method == "pca":
            params = PCAParameters(
                n_components=parameters.get("n_components", 3),
                variance_threshold=parameters.get("variance_threshold", 0.95),
                whiten=parameters.get("whiten", False),
            )
            return await reducer.reduce(embeddings, params)

        if method == "tsne":
            params = TSNEParameters(
                n_components=parameters.get("n_components", 3),
                perplexity=parameters.get("perplexity", 30.0),
                learning_rate=parameters.get("learning_rate", 200.0),
                max_iter=parameters.get("max_iter", 1000),
            )
            return await reducer.reduce(embeddings, params)

        if method == "umap":
            params = UMAPParameters(
                n_components=parameters.get("n_components", 3),
                n_neighbors=parameters.get("n_neighbors", 15),
                min_dist=parameters.get("min_dist", 0.1),
                metric=parameters.get("metric", "euclidean"),
            )
            return await reducer.reduce(embeddings, params)

        raise ValueError(f"Unsupported method: {method}")

    def _calculate_coherence_score(self, embeddings: np.ndarray) -> float:
        """Calculate coherence score based on local neighborhood consistency."""
        # Simplified coherence calculation
        # In practice, this would use more sophisticated metrics
        distances = np.linalg.norm(embeddings[:, np.newaxis] - embeddings, axis=2)
        mean_distance = np.mean(distances)
        std_distance = np.std(distances)

        # Higher coherence when distances are more consistent
        coherence = 1.0 / (1.0 + std_distance / mean_distance)
        return min(1.0, max(0.0, coherence))

    def _calculate_separation_score(self, embeddings: np.ndarray) -> float:
        """Calculate separation score based on inter-cluster distances."""
        # Simplified separation calculation
        # Use k-means clustering to find clusters
        from sklearn.cluster import KMeans

        n_clusters = min(10, len(embeddings) // 10)
        if n_clusters < 2:
            return 0.5  # Default score for small datasets

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(embeddings)

        # Calculate average inter-cluster distance
        cluster_centers = kmeans.cluster_centers_
        inter_cluster_distances = []

        for i in range(len(cluster_centers)):
            for j in range(i + 1, len(cluster_centers)):
                dist = np.linalg.norm(cluster_centers[i] - cluster_centers[j])
                inter_cluster_distances.append(dist)

        if not inter_cluster_distances:
            return 0.5

        mean_inter_cluster = np.mean(inter_cluster_distances)
        # Normalize to 0-1 range (heuristic)
        separation = min(1.0, mean_inter_cluster / 5.0)
        return max(0.0, separation)

    def _calculate_density_score(self, embeddings: np.ndarray) -> float:
        """Calculate density score based on local point density."""
        # Calculate average distance to k-nearest neighbors
        k = min(10, len(embeddings) - 1)
        if k < 1:
            return 0.5

        distances = np.linalg.norm(embeddings[:, np.newaxis] - embeddings, axis=2)
        # Get k smallest distances for each point (excluding self)
        k_distances = np.partition(distances, k, axis=1)[:, 1 : k + 1]
        mean_k_distances = np.mean(k_distances, axis=1)
        overall_density = 1.0 / (1.0 + np.mean(mean_k_distances))

        return min(1.0, max(0.0, overall_density))

    def _calculate_distribution_score(self, embeddings: np.ndarray) -> float:
        """Calculate distribution score based on embedding distribution quality."""
        # Check for normal distribution properties
        mean_embedding = np.mean(embeddings, axis=0)
        centered_embeddings = embeddings - mean_embedding

        # Calculate variance in each dimension
        variances = np.var(centered_embeddings, axis=0)

        # Good distribution should have reasonable variance across dimensions
        # and not be too skewed
        mean_variance = np.mean(variances)
        variance_std = np.std(variances)

        # Score based on variance consistency
        distribution_score = 1.0 / (1.0 + variance_std / mean_variance)
        return min(1.0, max(0.0, distribution_score))
