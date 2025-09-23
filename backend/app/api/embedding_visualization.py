"""
Embedding Visualization API Endpoints

Provides REST API endpoints for embedding dimensionality reduction and visualization.
Refactored to use BaseServiceRouter infrastructure for consistency and maintainability.
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Any

from fastapi import Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

from app.core.base_router import BaseServiceRouter, ServiceStatus
from app.core.router_mixins import (
    ConfigEndpointMixin,
    MetricsMixin,
    RateLimitingMixin,
    StreamingResponseMixin,
    ValidationMixin,
)
from app.core.logging_config import get_service_logger
from app.services.processing.embedding_visualization_service import (
    EmbeddingVisualizationService,
)
from app.utils.dimensionality_reduction import (
    get_available_methods,
    validate_parameters,
)

logger = get_service_logger("embedding-visualization")


class EmbeddingConfigModel(BaseModel):
    """Configuration model for embedding visualization service."""

    # Service configuration
    enabled: bool = Field(True, description="Enable embedding visualization service")
    cache_ttl_seconds: int = Field(
        3600, ge=300, le=86400, description="Default cache TTL in seconds"
    )
    max_samples: int = Field(
        10000, ge=100, le=100000, description="Maximum samples per reduction"
    )
    max_embedding_dimension: int = Field(
        4096, ge=64, le=8192, description="Maximum embedding dimension"
    )

    # Performance settings
    enable_parallel_processing: bool = Field(
        True, description="Enable parallel processing for large datasets"
    )
    max_concurrent_reductions: int = Field(
        3, ge=1, le=10, description="Maximum concurrent reduction operations"
    )
    progress_update_interval: float = Field(
        0.1, ge=0.01, le=1.0, description="Progress update interval in seconds"
    )

    # WebSocket settings
    websocket_timeout: int = Field(
        300, ge=30, le=1800, description="WebSocket connection timeout in seconds"
    )
    max_websocket_connections: int = Field(
        50, ge=5, le=200, description="Maximum WebSocket connections"
    )
    heartbeat_interval: float = Field(
        30.0, ge=5.0, le=120.0, description="WebSocket heartbeat interval in seconds"
    )

    # Quality analysis settings
    enable_quality_analysis: bool = Field(
        True, description="Enable embedding quality analysis"
    )
    quality_analysis_threshold: float = Field(
        0.5, ge=0.0, le=1.0, description="Quality analysis threshold"
    )
    enable_quality_recommendations: bool = Field(
        True, description="Enable quality improvement recommendations"
    )

    # Rate limiting
    reduction_rate_limit: int = Field(
        10, ge=1, le=50, description="Reduction requests per minute"
    )
    quality_rate_limit: int = Field(
        20, ge=1, le=100, description="Quality analysis requests per minute"
    )
    websocket_rate_limit: int = Field(
        30, ge=1, le=100, description="WebSocket connections per minute"
    )

    # Caching settings
    enable_result_caching: bool = Field(True, description="Enable result caching")
    cache_compression: bool = Field(True, description="Enable cache compression")
    cache_cleanup_interval: int = Field(
        3600, ge=300, le=86400, description="Cache cleanup interval in seconds"
    )


# Pydantic models for request/response
class EmbeddingReductionRequest(BaseModel):
    """Request model for embedding dimensionality reduction."""

    method: str = Field(..., description="Reduction method: pca, tsne, or umap")
    filters: dict[str, Any] | None = Field(
        None, description="Embedding filter criteria"
    )
    parameters: dict[str, Any] | None = Field(
        None, description="Method-specific parameters"
    )
    max_samples: int | None = Field(
        10000, description="Maximum number of samples to process"
    )
    random_seed: int | None = Field(None, description="Random seed for reproducibility")
    use_cache: bool | None = Field(True, description="Whether to use cached results")
    cache_ttl_seconds: int | None = Field(
        None, description="Custom TTL for caching this result"
    )


class EmbeddingReductionResponse(BaseModel):
    """Response model for embedding dimensionality reduction."""

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


class EmbeddingStatsResponse(BaseModel):
    """Response model for embedding statistics."""

    total_embeddings: int
    embedding_dimension: int
    mean_values: list[float]
    std_values: list[float]
    min_values: list[float]
    max_values: list[float]
    quality_score: float
    last_updated: str


class EmbeddingQualityRequest(BaseModel):
    """Request model for embedding quality analysis."""

    embeddings: list[list[float]] = Field(
        ..., description="Embedding vectors to analyze"
    )


class EmbeddingQualityResponse(BaseModel):
    """Response model for embedding quality analysis."""

    overall_score: float
    coherence_score: float
    separation_score: float
    density_score: float
    distribution_score: float
    recommendations: list[str]
    issues: list[str]


class CacheStatsResponse(BaseModel):
    """Response model for cache statistics."""

    total_entries: int
    total_size_bytes: int
    default_ttl_seconds: int
    cache_hit_rate: float
    oldest_entry: str | None
    newest_entry: str | None


# Enhanced WebSocket connection manager for real-time progress updates
class WebSocketManager:
    """Enhanced WebSocket manager with connection pooling and heartbeat support."""

    def __init__(self, max_connections: int = 50, heartbeat_interval: float = 30.0):
        self.active_connections: dict[str, WebSocket] = {}
        self.connection_metadata: dict[str, dict[str, Any]] = {}
        self.max_connections = max_connections
        self.heartbeat_interval = heartbeat_interval
        self._heartbeat_task = None

    async def connect(self, websocket: WebSocket, connection_id: str = None):
        """Accept a new WebSocket connection with enhanced management."""
        if len(self.active_connections) >= self.max_connections:
            await websocket.close(code=1013, reason="Server overloaded")
            logger.warning(
                f"WebSocket connection rejected: max connections ({self.max_connections}) reached"
            )
            return None

        if connection_id is None:
            connection_id = str(uuid.uuid4())

        await websocket.accept()
        self.active_connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "connected_at": datetime.now(),
            "last_heartbeat": datetime.now(),
            "message_count": 0,
            "status": "active",
        }

        logger.info(
            f"WebSocket connected: {connection_id}. Total connections: {len(self.active_connections)}"
        )
        return connection_id

    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection by ID."""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
            del self.connection_metadata[connection_id]
            logger.info(
                f"WebSocket disconnected: {connection_id}. Total connections: {len(self.active_connections)}"
            )

    def disconnect_websocket(self, websocket: WebSocket):
        """Remove a WebSocket connection by websocket object."""
        for connection_id, conn in list(self.active_connections.items()):
            if conn == websocket:
                self.disconnect(connection_id)
                break

    async def send_progress(
        self,
        job_id: str,
        progress: dict[str, Any],
        target_connections: list[str] = None,
    ):
        """Send progress update to specified or all connected clients."""
        if not self.active_connections:
            return

        message = {
            "type": "progress",
            "job_id": job_id,
            "timestamp": datetime.now().isoformat(),
            **progress,
        }

        # Determine target connections
        if target_connections is None:
            target_connections = list(self.active_connections.keys())

        # Send to target connections
        disconnected = []
        for connection_id in target_connections:
            if connection_id in self.active_connections:
                try:
                    await self.active_connections[connection_id].send_text(
                        json.dumps(message)
                    )
                    self.connection_metadata[connection_id]["message_count"] += 1
                except Exception as e:
                    logger.warning(
                        f"Failed to send progress update to {connection_id}: {e}"
                    )
                    disconnected.append(connection_id)

        # Remove disconnected connections
        for connection_id in disconnected:
            self.disconnect(connection_id)

    async def send_heartbeat(self):
        """Send heartbeat to all connections to keep them alive."""
        if not self.active_connections:
            return

        message = {
            "type": "heartbeat",
            "timestamp": datetime.now().isoformat(),
        }

        disconnected = []
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_text(json.dumps(message))
                self.connection_metadata[connection_id][
                    "last_heartbeat"
                ] = datetime.now()
                except Exception:
                    logger.warning(f"Failed to send heartbeat to {connection_id}")
                    disconnected.append(connection_id)

        # Remove disconnected connections
        for connection_id in disconnected:
            self.disconnect(connection_id)

    async def start_heartbeat(self):
        """Start the heartbeat task."""
        if self._heartbeat_task is None:
            self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())

    async def stop_heartbeat(self):
        """Stop the heartbeat task."""
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            try:
                await self._heartbeat_task
            except asyncio.CancelledError:
                pass
            self._heartbeat_task = None

    async def _heartbeat_loop(self):
        """Heartbeat loop that runs in the background."""
        while True:
            try:
                await asyncio.sleep(self.heartbeat_interval)
                await self.send_heartbeat()
            except asyncio.CancelledError:
                break
            except Exception:
                logger.exception("Error in heartbeat loop")

    def get_connection_stats(self) -> dict[str, Any]:
        """Get statistics about active connections."""
        if not self.connection_metadata:
            return {
                "total_connections": 0,
                "max_connections": self.max_connections,
                "average_connection_age": 0,
                "total_messages_sent": 0,
            }

        now = datetime.now()
        total_age = sum(
            (now - meta["connected_at"]).total_seconds()
            for meta in self.connection_metadata.values()
        )
        total_messages = sum(
            meta["message_count"] for meta in self.connection_metadata.values()
        )

        return {
            "total_connections": len(self.active_connections),
            "max_connections": self.max_connections,
            "average_connection_age": total_age / len(self.connection_metadata),
            "total_messages_sent": total_messages,
            "connections": {
                conn_id: {
                    "connected_at": meta["connected_at"].isoformat(),
                    "last_heartbeat": meta["last_heartbeat"].isoformat(),
                    "message_count": meta["message_count"],
                    "status": meta["status"],
                }
                for conn_id, meta in self.connection_metadata.items()
            },
        }


class EmbeddingVisualizationServiceRouter(
    BaseServiceRouter,
    ConfigEndpointMixin,
    MetricsMixin,
    RateLimitingMixin,
    StreamingResponseMixin,
    ValidationMixin,
):
    """Service router for embedding visualization endpoints."""

    def __init__(self):
        super().__init__("embedding-visualization")
        self.service_name = "embedding-visualization"
        self.config_model = EmbeddingConfigModel
        self.websocket_manager = WebSocketManager(
            max_connections=50, heartbeat_interval=30.0
        )

        # Initialize mixins
        self.setup_config_endpoints(self.config_model)
        self.setup_rate_limiting_endpoints()
        self.setup_metrics_endpoints()

        # Setup embedding visualization endpoints
        # TODO: Fix endpoint definitions to use proper async function syntax
        # self._setup_embedding_endpoints()

        # Start WebSocket heartbeat
        asyncio.create_task(self.websocket_manager.start_heartbeat())

    def get_service(self):
        """Get the embedding visualization service instance."""
        return EmbeddingVisualizationService()

    async def check_service_health(self) -> ServiceStatus:
        """Check the health of the embedding visualization service."""
        try:
            service = self.get_service()
            stats = await service.get_embedding_stats()

            return ServiceStatus(
                service_name=self.service_name,
                status="healthy",
                message="Service is operational",
                details={
                    "total_embeddings": stats.total_embeddings,
                    "embedding_dimension": stats.embedding_dimension,
                    "quality_score": stats.quality_score,
                    "available_methods": list(get_available_methods().keys()),
                    "websocket_stats": self.websocket_manager.get_connection_stats(),
                },
            )
        except Exception as e:
            logger.exception(f"Health check failed for {self.service_name}")
            return ServiceStatus(
                service_name=self.service_name,
                status="unhealthy",
                message=f"Service health check failed: {str(e)}",
                details={"error": str(e)},
            )

    def _setup_embedding_endpoints(self):
        """Setup embedding visualization endpoints."""
        api_router = self.get_router()

        # Core endpoints
        api_router.get("/stats", response_model=EmbeddingStatsResponse)(
            self._standard_async_operation(self._get_embedding_stats_impl)
        )

        api_router.get("/methods")(
            self._standard_async_operation(self._get_available_methods_impl)
        )

        api_router.post("/reduce", response_model=EmbeddingReductionResponse)(
            self._standard_async_operation(self._perform_reduction_impl)
        )

        api_router.post("/quality", response_model=EmbeddingQualityResponse)(
            self._standard_async_operation(self._analyze_quality_impl)
        )

        # Cache management endpoints
        api_router.get("/cache/stats", response_model=CacheStatsResponse)(
            self._standard_async_operation(self._get_cache_stats_impl)
        )

        api_router.delete("/cache")(
            self._standard_async_operation(self._clear_cache_impl)
        )

        # WebSocket endpoint
        api_router.websocket("/progress")(self._embedding_progress_websocket_impl)

        # Health check endpoint
        api_router.get("/health")(
            self._standard_async_operation(self._health_check_impl)
        )

        # WebSocket statistics endpoint
        api_router.get("/websocket/stats")(
            self._standard_async_operation(self._get_websocket_stats_impl)
        )

        # Job management endpoints
        api_router.get("/jobs")(self._standard_async_operation(self._get_all_jobs_impl))
        api_router.get("/jobs/{job_id}")(
            self._standard_async_operation(self._get_job_status_impl)
        )
        api_router.delete("/jobs/{job_id}")(
            self._standard_async_operation(self._cancel_job_impl)
        )

        # Visualization endpoints
        api_router.get("/visualization/{job_id}")(
            self._standard_async_operation(self._get_visualization_data_impl)
        )

    async def _get_embedding_stats_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get comprehensive statistics about available embeddings."""
        service = self.get_service()
        stats = await service.get_embedding_stats()

        return EmbeddingStatsResponse(
            total_embeddings=stats.total_embeddings,
            embedding_dimension=stats.embedding_dimension,
            mean_values=stats.mean_values,
            std_values=stats.std_values,
            min_values=stats.min_values,
            max_values=stats.max_values,
            quality_score=stats.quality_score,
            last_updated=stats.last_updated.isoformat(),
        )

    async def _get_available_methods_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get available dimensionality reduction methods and their parameters."""
        service = self.get_service()
        return await service.get_available_methods()

    async def _perform_reduction_impl(
        self,
        request: EmbeddingReductionRequest,
        _current_user: User = Depends(require_active_user),
    ):
        """Perform dimensionality reduction on embeddings."""
        # Validate method
        available_methods = get_available_methods()
        if request.method not in available_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported reduction method: {request.method}. Available: {list(available_methods.keys())}",
            )

        # Validate parameters
        try:
            validated_params = validate_parameters(
                request.method, request.parameters or {}
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e

        # Send initial progress update
        job_id = str(uuid.uuid4())
        await self.websocket_manager.send_progress(
            job_id,
            {
                "status": "started",
                "method": request.method,
                "message": f"Starting {request.method.upper()} reduction...",
            },
        )

        # Perform reduction
        service = self.get_service()
        result = await service.perform_reduction(
            method=request.method,
            filters=request.filters,
            parameters=validated_params,
            max_samples=request.max_samples,
            random_seed=request.random_seed,
            use_cache=request.use_cache,
            cache_ttl_seconds=request.cache_ttl_seconds,
        )

        # Update job_id in result
        result.job_id = job_id

        # Send completion progress update
        await self.websocket_manager.send_progress(
            job_id,
            {
                "status": "completed",
                "method": request.method,
                "message": f"{request.method.upper()} reduction completed",
                "processing_time_ms": result.processing_time_ms,
                "samples_processed": len(result.transformed_data),
            },
        )

        return EmbeddingReductionResponse(
            success=result.success,
            method=result.method,
            transformed_data=result.transformed_data,
            original_indices=result.original_indices,
            parameters=result.parameters,
            metadata=result.metadata,
            processing_time_ms=result.processing_time_ms,
            job_id=result.job_id,
            cached=result.cached,
            error=result.error,
        )

    async def _analyze_quality_impl(
        self,
        request: EmbeddingQualityRequest,
        _current_user: User = Depends(require_active_user),
    ):
        """Analyze the quality of embeddings using various metrics."""
        if not request.embeddings:
            raise HTTPException(status_code=400, detail="No embeddings provided")

        # Validate embedding format
        if not all(
            isinstance(emb, list) and all(isinstance(x, int | float) for x in emb)
            for emb in request.embeddings
        ):
            raise HTTPException(status_code=400, detail="Invalid embedding format")

        # Analyze quality
        service = self.get_service()
        quality_metrics = await service.analyze_embedding_quality(request.embeddings)

        return EmbeddingQualityResponse(
            overall_score=quality_metrics.overall_score,
            coherence_score=quality_metrics.coherence_score,
            separation_score=quality_metrics.separation_score,
            density_score=quality_metrics.density_score,
            distribution_score=quality_metrics.distribution_score,
            recommendations=quality_metrics.recommendations,
            issues=quality_metrics.issues,
        )

    async def _get_cache_stats_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get cache statistics and management information."""
        service = self.get_service()
        stats = await service.get_cache_stats()

        return CacheStatsResponse(
            total_entries=stats["total_entries"],
            total_size_bytes=stats["total_size_bytes"],
            default_ttl_seconds=stats["default_ttl_seconds"],
            cache_hit_rate=stats["cache_hit_rate"],
            oldest_entry=(
                stats["oldest_entry"].isoformat() if stats["oldest_entry"] else None
            ),
            newest_entry=(
                stats["newest_entry"].isoformat() if stats["newest_entry"] else None
            ),
        )

    async def _clear_cache_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Clear all cached reduction results."""
        service = self.get_service()
        return await service.clear_cache()

    async def _health_check_impl(self):
        """Health check endpoint for embedding visualization service."""
        health_status = await self.check_service_health()

        if health_status.status == "healthy":
            return {
                "status": "healthy",
                "service": self.service_name,
                "timestamp": datetime.now().isoformat(),
                **health_status.details,
            }

        return {
            "status": "unhealthy",
            "service": self.service_name,
            "timestamp": datetime.now().isoformat(),
            "error": health_status.message,
        }

    async def _embedding_progress_websocket_impl(self, websocket: WebSocket):
        """WebSocket endpoint for real-time progress updates during embedding visualization."""
        connection_id = await self.websocket_manager.connect(websocket)
        if connection_id is None:
            return  # Connection was rejected

        try:
            while True:
                # Keep connection alive and handle any incoming messages
                data = await websocket.receive_text()

                # Handle different message types
                try:
                    message = json.loads(data)
                    if message.get("type") == "ping":
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "pong",
                                    "timestamp": datetime.now().isoformat(),
                                }
                            )
                        )
                    elif message.get("type") == "subscribe":
                        # Handle subscription to specific job IDs
                        job_id = message.get("job_id")
                        if job_id:
                            # Store subscription info in metadata
                            if (
                                connection_id
                                in self.websocket_manager.connection_metadata
                            ):
                                self.websocket_manager.connection_metadata[
                                    connection_id
                                ]["subscribed_jobs"] = [job_id]
                except json.JSONDecodeError:
                    # Echo back any non-JSON data (for testing)
                    await websocket.send_text(f"Echo: {data}")

        except WebSocketDisconnect:
            self.websocket_manager.disconnect(connection_id)
        except Exception:
            logger.exception("WebSocket error")
            self.websocket_manager.disconnect(connection_id)

    async def _get_websocket_stats_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get WebSocket connection statistics."""
        return self.websocket_manager.get_connection_stats()

    async def _get_all_jobs_impl(
        self, _current_user: User = Depends(require_active_user)
    ):
        """Get status of all active jobs."""
        service = self.get_service()
        return await service.get_all_jobs()

    async def _get_job_status_impl(
        self, job_id: str, _current_user: User = Depends(require_active_user)
    ):
        """Get the status of a specific job."""
        service = self.get_service()
        return await service.get_job_status(job_id)

    async def _cancel_job_impl(
        self, job_id: str, _current_user: User = Depends(require_active_user)
    ):
        """Cancel a specific job."""
        service = self.get_service()
        return await service.cancel_job(job_id)

    async def _get_visualization_data_impl(
        self, job_id: str, _current_user: User = Depends(require_active_user)
    ):
        """Get visualization data for a completed job."""
        service = self.get_service()
        return await service.get_visualization_data(job_id)


# Create router instance
embedding_router = EmbeddingVisualizationServiceRouter()
router = embedding_router.get_router()
