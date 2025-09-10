"""
Embedding Visualization API Endpoints

Provides REST API endpoints for embedding dimensionality reduction and visualization.
"""

import logging
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User
from ..services.embedding_visualization_service import (
    EmbeddingVisualizationService,
    EmbeddingStats,
    EmbeddingReductionResult,
    EmbeddingQualityMetrics
)
from ..utils.dimensionality_reduction import (
    get_available_methods,
    validate_parameters
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/embedding-visualization", tags=["embedding-visualization"])

# Global service instance
embedding_viz_service = EmbeddingVisualizationService()


# Pydantic models for request/response
class EmbeddingReductionRequest(BaseModel):
    """Request model for embedding dimensionality reduction."""
    
    method: str = Field(..., description="Reduction method: pca, tsne, or umap")
    filters: Optional[Dict[str, Any]] = Field(
        None, description="Embedding filter criteria"
    )
    parameters: Optional[Dict[str, Any]] = Field(
        None, description="Method-specific parameters"
    )
    max_samples: Optional[int] = Field(
        10000, description="Maximum number of samples to process"
    )
    random_seed: Optional[int] = Field(
        None, description="Random seed for reproducibility"
    )
    use_cache: Optional[bool] = Field(True, description="Whether to use cached results")
    cache_ttl_seconds: Optional[int] = Field(
        None, description="Custom TTL for caching this result"
    )


class EmbeddingReductionResponse(BaseModel):
    """Response model for embedding dimensionality reduction."""
    
    success: bool
    method: str
    transformed_data: List[List[float]]
    original_indices: List[int]
    parameters: Dict[str, Any]
    metadata: Dict[str, Any]
    processing_time_ms: int
    job_id: str
    cached: bool
    error: Optional[str] = None


class EmbeddingStatsResponse(BaseModel):
    """Response model for embedding statistics."""
    
    total_embeddings: int
    embedding_dimension: int
    mean_values: List[float]
    std_values: List[float]
    min_values: List[float]
    max_values: List[float]
    quality_score: float
    last_updated: str


class EmbeddingQualityRequest(BaseModel):
    """Request model for embedding quality analysis."""
    
    embeddings: List[List[float]] = Field(..., description="Embedding vectors to analyze")


class EmbeddingQualityResponse(BaseModel):
    """Response model for embedding quality analysis."""
    
    overall_score: float
    coherence_score: float
    separation_score: float
    density_score: float
    distribution_score: float
    recommendations: List[str]
    issues: List[str]


class CacheStatsResponse(BaseModel):
    """Response model for cache statistics."""
    
    total_entries: int
    total_size_bytes: int
    default_ttl_seconds: int
    cache_hit_rate: float
    oldest_entry: Optional[str]
    newest_entry: Optional[str]


# WebSocket connection manager for real-time progress updates
class WebSocketManager:
    """Manages WebSocket connections for progress updates."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_progress(self, job_id: str, progress: Dict[str, Any]):
        """Send progress update to all connected clients."""
        if not self.active_connections:
            return
        
        message = {
            "type": "progress",
            "job_id": job_id,
            "timestamp": datetime.now().isoformat(),
            **progress
        }
        
        # Send to all connections
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Failed to send progress update: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)


# Global WebSocket manager
websocket_manager = WebSocketManager()


@router.get("/stats", response_model=EmbeddingStatsResponse)
async def get_embedding_stats(
    current_user: User = Depends(require_active_user)
):
    """
    Get comprehensive statistics about available embeddings.
    
    Returns:
        EmbeddingStatsResponse: Statistical information about the embedding dataset
    """
    try:
        stats = await embedding_viz_service.get_embedding_stats()
        
        return EmbeddingStatsResponse(
            total_embeddings=stats.total_embeddings,
            embedding_dimension=stats.embedding_dimension,
            mean_values=stats.mean_values,
            std_values=stats.std_values,
            min_values=stats.min_values,
            max_values=stats.max_values,
            quality_score=stats.quality_score,
            last_updated=stats.last_updated.isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error getting embedding stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/methods")
async def get_available_reduction_methods(
    current_user: User = Depends(require_active_user)
):
    """
    Get available dimensionality reduction methods and their parameters.
    
    Returns:
        Dict containing available methods and their parameter schemas
    """
    try:
        methods_info = await embedding_viz_service.get_available_methods()
        return methods_info
        
    except Exception as e:
        logger.error(f"Error getting available methods: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reduce", response_model=EmbeddingReductionResponse)
async def perform_embedding_reduction(
    request: EmbeddingReductionRequest,
    current_user: User = Depends(require_active_user)
):
    """
    Perform dimensionality reduction on embeddings.
    
    This endpoint retrieves embeddings based on the provided filters and applies
    the specified dimensionality reduction method (PCA, t-SNE, or UMAP).
    Supports caching and real-time progress updates via WebSocket.
    
    Args:
        request: Reduction request with method, filters, and parameters
        current_user: Current authenticated user
        
    Returns:
        EmbeddingReductionResponse: Results of the reduction operation
        
    Raises:
        HTTPException: If method not available, invalid parameters, or processing fails
    """
    try:
        # Validate method
        available_methods = get_available_methods()
        if request.method not in available_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported reduction method: {request.method}. Available: {list(available_methods.keys())}"
            )
        
        # Validate parameters
        try:
            validated_params = validate_parameters(request.method, request.parameters or {})
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Send initial progress update
        job_id = str(uuid.uuid4())
        await websocket_manager.send_progress(job_id, {
            "status": "started",
            "method": request.method,
            "message": f"Starting {request.method.upper()} reduction..."
        })
        
        # Perform reduction
        result = await embedding_viz_service.perform_reduction(
            method=request.method,
            filters=request.filters,
            parameters=validated_params,
            max_samples=request.max_samples,
            random_seed=request.random_seed,
            use_cache=request.use_cache,
            cache_ttl_seconds=request.cache_ttl_seconds
        )
        
        # Update job_id in result
        result.job_id = job_id
        
        # Send completion progress update
        await websocket_manager.send_progress(job_id, {
            "status": "completed",
            "method": request.method,
            "message": f"{request.method.upper()} reduction completed",
            "processing_time_ms": result.processing_time_ms,
            "samples_processed": len(result.transformed_data)
        })
        
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
            error=result.error
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing embedding reduction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quality", response_model=EmbeddingQualityResponse)
async def analyze_embedding_quality(
    request: EmbeddingQualityRequest,
    current_user: User = Depends(require_active_user)
):
    """
    Analyze the quality of embeddings using various metrics.
    
    Args:
        request: Embedding quality analysis request
        current_user: Current authenticated user
        
    Returns:
        EmbeddingQualityResponse: Quality analysis results
    """
    try:
        if not request.embeddings:
            raise HTTPException(status_code=400, detail="No embeddings provided")
        
        # Validate embedding format
        if not all(isinstance(emb, list) and all(isinstance(x, (int, float)) for x in emb) 
                  for emb in request.embeddings):
            raise HTTPException(status_code=400, detail="Invalid embedding format")
        
        # Analyze quality
        quality_metrics = await embedding_viz_service.analyze_embedding_quality(request.embeddings)
        
        return EmbeddingQualityResponse(
            overall_score=quality_metrics.overall_score,
            coherence_score=quality_metrics.coherence_score,
            separation_score=quality_metrics.separation_score,
            density_score=quality_metrics.density_score,
            distribution_score=quality_metrics.distribution_score,
            recommendations=quality_metrics.recommendations,
            issues=quality_metrics.issues
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing embedding quality: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cache/stats", response_model=CacheStatsResponse)
async def get_cache_stats(
    current_user: User = Depends(require_active_user)
):
    """
    Get cache statistics and management information.
    
    Returns:
        CacheStatsResponse: Cache statistics
    """
    try:
        stats = await embedding_viz_service.get_cache_stats()
        
        return CacheStatsResponse(
            total_entries=stats['total_entries'],
            total_size_bytes=stats['total_size_bytes'],
            default_ttl_seconds=stats['default_ttl_seconds'],
            cache_hit_rate=stats['cache_hit_rate'],
            oldest_entry=stats['oldest_entry'].isoformat() if stats['oldest_entry'] else None,
            newest_entry=stats['newest_entry'].isoformat() if stats['newest_entry'] else None
        )
        
    except Exception as e:
        logger.error(f"Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cache")
async def clear_cache(
    current_user: User = Depends(require_active_user)
):
    """
    Clear all cached reduction results.
    
    Returns:
        Dict with clearing results
    """
    try:
        result = await embedding_viz_service.clear_cache()
        return result
        
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/progress")
async def embedding_visualization_progress_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time progress updates during embedding visualization.
    
    Clients can connect to this endpoint to receive progress updates for
    long-running dimensionality reduction operations.
    """
    await websocket_manager.connect(websocket)
    
    try:
        while True:
            # Keep connection alive and handle any incoming messages
            data = await websocket.receive_text()
            
            # Echo back any received data (for testing)
            await websocket.send_text(f"Echo: {data}")
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        websocket_manager.disconnect(websocket)


@router.get("/health")
async def health_check():
    """
    Health check endpoint for embedding visualization service.
    
    Returns:
        Dict with service health status
    """
    try:
        # Check if service is responsive
        stats = await embedding_viz_service.get_embedding_stats()
        
        return {
            "status": "healthy",
            "service": "embedding-visualization",
            "timestamp": datetime.now().isoformat(),
            "total_embeddings": stats.total_embeddings,
            "embedding_dimension": stats.embedding_dimension,
            "available_methods": list(get_available_methods().keys())
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "embedding-visualization",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }
