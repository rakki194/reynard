"""Embedding Visualization Service

Provides dimensionality reduction and visualization capabilities for embeddings.
Supports PCA, t-SNE, UMAP, and statistical analysis of embedding data.
"""

import asyncio
import json
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

# Conditional numpy import
from app.core.service_conditional_loading import (
    can_load_service,
    is_numpy_enabled,
    load_service,
)

if is_numpy_enabled() and can_load_service("numpy"):
    try:
        import numpy as np

        load_service("numpy")
    except ImportError:
        np = None
else:
    np = None

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
    """Service for embedding visualization and dimensionality reduction.

    Provides comprehensive embedding analysis including:
    - Dimensionality reduction (PCA, t-SNE, UMAP)
    - Statistical analysis and quality metrics
    - Caching and performance optimization
    - Real-time progress tracking
    """

    def __init__(self, config: dict[str, Any] = None):
        if config is None:
            config = {}

        # Enhanced configuration
        self.cache_ttl = config.get("cache_ttl_seconds", 3600)  # 1 hour default
        self.max_samples = config.get("max_samples", 10000)
        self.max_concurrent_reductions = config.get("max_concurrent_reductions", 3)
        self.enable_parallel_processing = config.get("enable_parallel_processing", True)
        self.progress_update_interval = config.get("progress_update_interval", 0.1)

        # Enhanced caching with compression and statistics
        self.cache: dict[str, dict[str, Any]] = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "total_size_bytes": 0,
        }

        # Progress tracking
        self.active_jobs: dict[str, dict[str, Any]] = {}
        self.job_progress_callbacks: dict[str, callable] = {}

        # Performance optimization
        self.reduction_queue = asyncio.Queue(maxsize=self.max_concurrent_reductions)
        self.worker_tasks: list[asyncio.Task] = []

        # Initialize dimensionality reduction methods
        self.reducers = {
            "pca": get_dimensionality_reducer("pca"),
            "tsne": get_dimensionality_reducer("tsne"),
            "umap": get_dimensionality_reducer("umap"),
        }

        # Start background tasks
        self._start_background_tasks()

        logger.info("EmbeddingVisualizationService initialized with enhanced features")

    def _start_background_tasks(self):
        """Start background tasks for cache cleanup and optimization."""
        # Start cache cleanup task
        asyncio.create_task(self._cache_cleanup_loop())

        # Start worker tasks for parallel processing
        if self.enable_parallel_processing:
            for i in range(self.max_concurrent_reductions):
                task = asyncio.create_task(self._reduction_worker(f"worker-{i}"))
                self.worker_tasks.append(task)

    async def _cache_cleanup_loop(self):
        """Background task to clean up expired cache entries."""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                await self._cleanup_expired_cache()
            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Error in cache cleanup loop")

    async def _cleanup_expired_cache(self):
        """Remove expired cache entries and update statistics."""
        now = datetime.now()
        expired_keys = []

        for key, entry in self.cache.items():
            if now - entry["timestamp"] > timedelta(
                seconds=entry.get("ttl", self.cache_ttl),
            ):
                expired_keys.append(key)

        for key in expired_keys:
            del self.cache[key]
            self.cache_stats["evictions"] += 1

        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")

    async def _reduction_worker(self, worker_name: str):
        """Worker task for processing reduction jobs."""
        while True:
            try:
                job_data = await self.reduction_queue.get()
                await self._process_reduction_job(job_data, worker_name)
                self.reduction_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception(f"Error in reduction worker {worker_name}")

    async def _process_reduction_job(self, job_data: dict[str, Any], worker_name: str):
        """Process a single reduction job with progress tracking."""
        job_id = job_data["job_id"]
        method = job_data["method"]
        embeddings = job_data["embeddings"]
        parameters = job_data["parameters"]

        try:
            # Update job status
            self.active_jobs[job_id]["status"] = "processing"
            self.active_jobs[job_id]["worker"] = worker_name

            # Send progress update
            await self._send_progress_update(
                job_id,
                {
                    "status": "processing",
                    "worker": worker_name,
                    "progress": 0.1,
                    "message": f"Starting {method.upper()} reduction with {worker_name}",
                },
            )

            # Perform the actual reduction
            result = await self._perform_reduction_with_progress(
                method,
                embeddings,
                parameters,
                job_id,
            )

            # Update job with result
            self.active_jobs[job_id]["result"] = result
            self.active_jobs[job_id]["status"] = "completed"
            self.active_jobs[job_id]["completed_at"] = datetime.now()

            # Send final progress update
            await self._send_progress_update(
                job_id,
                {
                    "status": "completed",
                    "progress": 1.0,
                    "message": f"{method.upper()} reduction completed successfully",
                },
            )

        except Exception as e:
            # Handle job failure
            self.active_jobs[job_id]["status"] = "failed"
            self.active_jobs[job_id]["error"] = str(e)
            self.active_jobs[job_id]["failed_at"] = datetime.now()

            await self._send_progress_update(
                job_id,
                {
                    "status": "failed",
                    "error": str(e),
                    "message": f"{method.upper()} reduction failed: {e!s}",
                },
            )

            logger.exception(f"Reduction job {job_id} failed in {worker_name}")

    async def _send_progress_update(self, job_id: str, progress_data: dict[str, Any]):
        """Send progress update for a job."""
        if job_id in self.job_progress_callbacks:
            try:
                await self.job_progress_callbacks[job_id](job_id, progress_data)
            except Exception as e:
                logger.warning(f"Failed to send progress update for job {job_id}: {e}")

    async def _perform_reduction_with_progress(
        self,
        method: str,
        embeddings: np.ndarray,
        parameters: dict[str, Any],
        job_id: str,
    ) -> np.ndarray:
        """Perform dimensionality reduction with progress updates."""
        # This is a simplified version - in practice, you'd integrate with the actual
        # reduction algorithms to provide real progress updates

        # Simulate progress updates
        for progress in [0.2, 0.4, 0.6, 0.8]:
            await self._send_progress_update(
                job_id,
                {
                    "status": "processing",
                    "progress": progress,
                    "message": f"Processing {method.upper()} reduction... {int(progress * 100)}%",
                },
            )
            await asyncio.sleep(0.1)  # Simulate work

        # Perform actual reduction
        reducer = self.reducers[method]
        return await self._perform_reduction_with_params(
            reducer,
            embeddings,
            method,
            parameters,
        )

    async def get_embedding_stats(self) -> EmbeddingStats:
        """Get comprehensive statistics about available embeddings.

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
                f"Retrieved embedding stats: {stats.total_embeddings} embeddings",
            )
            return stats

        except Exception as e:
            logger.error(f"Error getting embedding stats: {e}")
            raise

    async def get_available_methods(self) -> dict[str, Any]:
        """Get available dimensionality reduction methods and their parameters.

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
        """Perform dimensionality reduction on embeddings.

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
                method,
                filters,
                parameters,
                max_samples,
                random_seed,
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

            # Get embeddings from vector database
            embeddings, original_indices = await self._get_embeddings(
                filters,
                max_samples,
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
                reducer,
                embeddings_array,
                method,
                parameters,
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
                f"Successfully performed {method} reduction: {len(embeddings)} embeddings -> {transformed_data.shape}",
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
                    (datetime.now() - start_time).total_seconds() * 1000,
                ),
                job_id=job_id,
                cached=False,
                error=str(e),
            )

    async def analyze_embedding_quality(
        self,
        embeddings: list[list[float]],
    ) -> EmbeddingQualityMetrics:
        """Analyze the quality of embeddings using various metrics.

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
                    "Low coherence - embeddings may not capture semantic relationships well",
                )
                recommendations.append(
                    "Consider using a different embedding model or fine-tuning",
                )

            if separation_score < 0.4:
                issues.append("Poor separation - embeddings may be too similar")
                recommendations.append(
                    "Increase embedding dimensionality or use contrastive learning",
                )

            if density_score < 0.3:
                issues.append("Low density - embeddings may be too sparse")
                recommendations.append("Consider using denser embedding models")

            if distribution_score < 0.6:
                issues.append("Poor distribution - embeddings may have bias")
                recommendations.append(
                    "Normalize embeddings or use balanced training data",
                )

            if overall_score >= 0.8:
                recommendations.append(
                    "Excellent embedding quality - no immediate improvements needed",
                )
            elif overall_score >= 0.6:
                recommendations.append(
                    "Good embedding quality - minor optimizations possible",
                )
            else:
                recommendations.append(
                    "Consider significant improvements to embedding quality",
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
        """Get enhanced cache statistics and management information."""
        total_entries = len(self.cache)
        total_size = sum(len(str(entry)) for entry in self.cache.values())

        # Calculate hit rate
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (
            self.cache_stats["hits"] / total_requests if total_requests > 0 else 0.0
        )

        return {
            "total_entries": total_entries,
            "total_size_bytes": total_size,
            "default_ttl_seconds": self.cache_ttl,
            "cache_hit_rate": hit_rate,
            "cache_hits": self.cache_stats["hits"],
            "cache_misses": self.cache_stats["misses"],
            "cache_evictions": self.cache_stats["evictions"],
            "oldest_entry": min(
                (entry["timestamp"] for entry in self.cache.values()),
                default=None,
            ),
            "newest_entry": max(
                (entry["timestamp"] for entry in self.cache.values()),
                default=None,
            ),
            "active_jobs": len(self.active_jobs),
            "worker_tasks": len(self.worker_tasks),
            "queue_size": self.reduction_queue.qsize(),
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

    async def get_job_status(self, job_id: str) -> dict[str, Any]:
        """Get the status of a specific job."""
        if job_id not in self.active_jobs:
            return {"status": "not_found", "message": "Job not found"}

        job = self.active_jobs[job_id]
        return {
            "job_id": job_id,
            "status": job.get("status", "unknown"),
            "method": job.get("method"),
            "created_at": job.get("created_at", datetime.now()).isoformat(),
            "worker": job.get("worker"),
            "progress": job.get("progress", 0.0),
            "error": job.get("error"),
            "result_available": "result" in job,
        }

    async def get_all_jobs(self) -> dict[str, Any]:
        """Get status of all active jobs."""
        return {
            "total_jobs": len(self.active_jobs),
            "jobs": {
                job_id: await self.get_job_status(job_id)
                for job_id in self.active_jobs.keys()
            },
        }

    async def cancel_job(self, job_id: str) -> dict[str, Any]:
        """Cancel a specific job."""
        if job_id not in self.active_jobs:
            return {"success": False, "message": "Job not found"}

        job = self.active_jobs[job_id]
        if job.get("status") in ["completed", "failed", "cancelled"]:
            return {"success": False, "message": "Job already finished"}

        # Mark job as cancelled
        job["status"] = "cancelled"
        job["cancelled_at"] = datetime.now()

        logger.info(f"Job {job_id} cancelled")
        return {"success": True, "message": "Job cancelled successfully"}

    async def get_visualization_data(self, job_id: str) -> dict[str, Any]:
        """Get visualization data for a completed job."""
        if job_id not in self.active_jobs:
            return {"error": "Job not found"}

        job = self.active_jobs[job_id]
        if job.get("status") != "completed" or "result" not in job:
            return {"error": "Job not completed or result not available"}

        result = job["result"]
        return {
            "job_id": job_id,
            "method": job.get("method"),
            "transformed_data": (
                result.tolist() if hasattr(result, "tolist") else result
            ),
            "metadata": {
                "original_shape": job.get("original_shape"),
                "reduced_shape": result.shape if hasattr(result, "shape") else None,
                "processing_time_ms": job.get("processing_time_ms", 0),
                "completed_at": job.get("completed_at", datetime.now()).isoformat(),
            },
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
        self,
        cached_entry: dict[str, Any],
        custom_ttl: int | None = None,
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
        """Get embeddings from the vector database using pgvector."""
        try:
            # Get database connection from the vector store service
            if (
                not hasattr(self, '_vector_store_service')
                or not self._vector_store_service
            ):
                # Try to get the vector store service from the RAG service
                from app.services.rag.rag_service import RAGService

                rag_service = RAGService()
                await rag_service.initialize()
                self._vector_store_service = rag_service.vector_store_service

            if not self._vector_store_service or not self._vector_store_service._engine:
                raise RuntimeError("Vector store service not available")

            # Build the query with filters
            base_query = """
                SELECT 
                    e.id,
                    e.embedding,
                    e.modality,
                    e.model_id,
                    e.quality_score,
                    e.metadata,
                    f.file_type,
                    f.path,
                    d.name as dataset_name
                FROM embeddings e
                JOIN files f ON e.file_id = f.id
                JOIN datasets d ON f.dataset_id = d.id
            """

            where_conditions = []
            params = {}

            # Apply filters
            if filters:
                if 'dataset_id' in filters:
                    where_conditions.append("d.id = :dataset_id")
                    params['dataset_id'] = filters['dataset_id']

                if 'modality' in filters:
                    where_conditions.append("e.modality = :modality")
                    params['modality'] = filters['modality']

                if 'model_id' in filters:
                    where_conditions.append("e.model_id = :model_id")
                    params['model_id'] = filters['model_id']

                if 'file_type' in filters:
                    where_conditions.append("f.file_type = :file_type")
                    params['file_type'] = filters['file_type']

                if 'min_quality' in filters:
                    where_conditions.append("e.quality_score >= :min_quality")
                    params['min_quality'] = filters['min_quality']

                if 'created_after' in filters:
                    where_conditions.append("e.created_at >= :created_after")
                    params['created_after'] = filters['created_after']

                if 'created_before' in filters:
                    where_conditions.append("e.created_at <= :created_before")
                    params['created_before'] = filters['created_before']

            # Add WHERE clause if we have conditions
            if where_conditions:
                base_query += " WHERE " + " AND ".join(where_conditions)

            # Add ordering and limit
            base_query += " ORDER BY e.created_at DESC"

            if max_samples:
                base_query += " LIMIT :max_samples"
                params['max_samples'] = max_samples

            # Execute the query
            with self._vector_store_service._engine.connect() as conn:
                from sqlalchemy import text

                result = conn.execute(text(base_query), params)

                embeddings = []
                original_indices = []

                for idx, row in enumerate(result):
                    # Convert vector to list of floats
                    embedding_vector = row[1]  # This is the VECTOR column
                    if hasattr(embedding_vector, 'tolist'):
                        embedding_list = embedding_vector.tolist()
                    else:
                        # Handle different vector representations
                        embedding_list = list(embedding_vector)

                    embeddings.append(embedding_list)
                    original_indices.append(idx)

                logger.info(
                    f"Retrieved {len(embeddings)} embeddings from vector database"
                )
                return embeddings, original_indices

        except Exception as e:
            logger.error(f"Failed to get embeddings from vector database: {e}")
            raise RuntimeError(f"Vector database query failed: {e}")

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
