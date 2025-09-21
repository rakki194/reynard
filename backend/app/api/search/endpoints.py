"""
Unified Search API Endpoints
===========================

FastAPI endpoints for the unified search service providing comprehensive search capabilities
across the Reynard codebase. This module implements a sophisticated search API that supports
multiple search strategies including semantic, syntax, hybrid, and intelligent search modes.

The search service provides:
- Semantic search using vector embeddings and RAG backend
- Syntax search using ripgrep for exact pattern matching
- Hybrid search combining multiple strategies
- Intelligent search with automatic strategy selection
- Natural language query processing
- Query expansion and suggestion capabilities
- Performance monitoring and caching
- Comprehensive result formatting and ranking

Architecture:
- RESTful API design with FastAPI
- Async/await support for high performance
- Comprehensive error handling and validation
- Request/response models with Pydantic
- Integration with optimization and caching systems
- Support for multiple file types and directory filtering

Usage:
    The search endpoints are automatically registered with the FastAPI application
    and provide a unified interface for all search operations across the Reynard
    project codebase.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .models import (
    HybridSearchRequest,
    IndexRequest,
    SearchRequest,
    SemanticSearchRequest,
    SyntaxSearchRequest,
)
from .search import SearchService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/search", tags=["search"])


class NaturalLanguageSearchRequest(BaseModel):
    """Request model for natural language search."""

    query: str = Field(..., description="Natural language search query")
    max_results: int = Field(20, description="Maximum number of results to return")
    file_types: Optional[List[str]] = Field(None, description="File extensions to search in")
    directories: Optional[List[str]] = Field(None, description="Directories to search in")
    enable_expansion: bool = Field(True, description="Enable query expansion")
    confidence_threshold: float = Field(0.6, description="Minimum confidence threshold")


class IntelligentSearchRequest(BaseModel):
    """Request model for intelligent search."""

    query: str = Field(..., description="Search query (natural language or structured)")
    max_results: int = Field(20, description="Maximum number of results to return")
    file_types: Optional[List[str]] = Field(None, description="File extensions to search in")
    directories: Optional[List[str]] = Field(None, description="Directories to search in")
    search_modes: Optional[List[str]] = Field(None, description="Specific search modes to use")


class ContextualSearchRequest(BaseModel):
    """Request model for contextual search."""

    query: str = Field(..., description="Search query")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context information")
    max_results: int = Field(20, description="Maximum number of results to return")


def get_search_service() -> SearchService:
    """
    Get the search service instance from the service registry.
    
    Retrieves the initialized search service from the global service registry.
    This function ensures that the search service is properly initialized and
    available before processing search requests.
    
    Returns:
        SearchService: The initialized search service instance
        
    Raises:
        HTTPException: If the search service is not available or not initialized
    """
    from app.core.service_registry import get_service_registry

    registry = get_service_registry()
    search_service = registry.get_service_instance("search")

    if search_service is None:
        raise HTTPException(
            status_code=503,
            detail="Search service not available. Please ensure the service is properly initialized.",
        )

    return search_service


@router.post("/semantic", response_model=dict[str, Any])
async def semantic_search(request: SemanticSearchRequest, http_request: Request) -> JSONResponse:
    """
    Perform semantic search using vector embeddings with intelligent caching.
    
    This endpoint provides advanced code search capabilities that understand the
    semantic meaning and context of queries, not just exact text matches. It uses
    vector embeddings and machine learning models to find conceptually related
    code, functions, and documentation.
    
    Features:
    - Vector-based similarity search using sentence transformers
    - Integration with RAG backend for enhanced results
    - Intelligent caching with configurable TTL
    - Support for file type and directory filtering
    - Configurable similarity thresholds
    - Performance monitoring and metrics
    
    Args:
        request: SemanticSearchRequest containing query parameters
        http_request: FastAPI Request object for metadata extraction
        
    Returns:
        JSONResponse: Search results with performance metadata
        
    Raises:
        HTTPException: If search fails or service is unavailable
        
    Example:
        ```json
        {
            "query": "authentication flow",
            "max_results": 10,
            "similarity_threshold": 0.7,
            "file_types": [".py", ".ts"],
            "directories": ["packages/auth", "backend"]
        }
        ```
    """
    start_time = time.time()
    
    try:
        search_service = get_search_service()
        result = await search_service.semantic_search(request)
        
        # Add performance metadata
        response_data = result.dict()
        response_data["performance"] = {
            "endpoint_time_ms": (time.time() - start_time) * 1000,
            "client_ip": http_request.client.host if http_request.client else "unknown",
            "user_agent": http_request.headers.get("user-agent", "unknown")
        }
        
        return JSONResponse(content=response_data)
    except Exception as e:
        logger.exception("Semantic search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/syntax", response_model=dict[str, Any])
async def syntax_search(request: SyntaxSearchRequest) -> JSONResponse:
    """
    Perform syntax-based search using ripgrep.

    This endpoint provides fast, precise text search with support for regex
    patterns, file type filtering, and code-aware pattern matching.
    """
    try:
        search_service = get_search_service()
        result = await search_service.syntax_search(request)
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Syntax search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/hybrid", response_model=dict[str, Any])
async def hybrid_search(request: HybridSearchRequest) -> JSONResponse:
    """
    Perform hybrid search combining semantic and syntax search.

    This endpoint provides the best of both worlds: semantic understanding
    for finding conceptually related code and precise syntax matching for
    exact patterns and structures.
    """
    try:
        search_service = get_search_service()
        result = await search_service.hybrid_search(request)
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Hybrid search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/natural-language", response_model=dict[str, Any])
async def natural_language_search(request: NaturalLanguageSearchRequest) -> JSONResponse:
    """Perform natural language search with intelligent query processing."""
    try:
        search_service = get_search_service()
        result = await search_service.natural_language_search(
            query=request.query,
            max_results=request.max_results,
            file_types=request.file_types,
            directories=request.directories,
            enable_expansion=request.enable_expansion,
            confidence_threshold=request.confidence_threshold,
        )
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Natural language search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/intelligent", response_model=dict[str, Any])
async def intelligent_search(request: IntelligentSearchRequest) -> JSONResponse:
    """Perform intelligent search that automatically chooses the best approach."""
    try:
        search_service = get_search_service()
        result = await search_service.intelligent_search(
            query=request.query,
            max_results=request.max_results,
            file_types=request.file_types,
            directories=request.directories,
            search_modes=request.search_modes,
        )
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Intelligent search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/contextual", response_model=dict[str, Any])
async def contextual_search(request: ContextualSearchRequest) -> JSONResponse:
    """Perform contextual search with additional context information."""
    try:
        search_service = get_search_service()
        result = await search_service.contextual_search(
            query=request.query,
            context=request.context,
            max_results=request.max_results,
        )
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Contextual search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/index", response_model=dict[str, Any])
async def index_codebase(request: IndexRequest) -> JSONResponse:
    """
    Index the codebase for search.

    This endpoint creates a searchable index of your codebase, including
    vector embeddings for semantic search and text indexing for fast retrieval.
    """
    try:
        search_service = get_search_service()
        result = await search_service.index_codebase(request)
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Codebase indexing failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/stats", response_model=dict[str, Any])
async def get_search_stats() -> JSONResponse:
    """
    Get search statistics and performance metrics.

    Returns information about the search index, including file counts,
    index size, search performance, and cache hit rates.
    """
    try:
        search_service = get_search_service()
        stats = await search_service.get_search_stats()
        return JSONResponse(content=stats.dict())
    except Exception as e:
        logger.exception("Failed to get search stats")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/suggestions", response_model=dict[str, Any])
async def get_query_suggestions(
    query: str = Query(..., description="Query to get suggestions for"),
    max_suggestions: int = Query(
        default=5, ge=1, le=20, description="Maximum suggestions to return"
    ),
) -> JSONResponse:
    """
    Get intelligent query suggestions.

    Provides smart suggestions to improve your search queries, including
    synonyms, code patterns, and completion suggestions.
    """
    try:
        search_service = get_search_service()
        suggestions = await search_service.get_query_suggestions(query, max_suggestions)
        return JSONResponse(content=suggestions.dict())
    except Exception as e:
        logger.exception("Failed to get query suggestions")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/suggestions/intelligent", response_model=dict[str, Any])
async def get_intelligent_suggestions(
    query: str = Query(..., description="Query to get suggestions for"),
    max_suggestions: int = Query(5, description="Maximum number of suggestions"),
) -> JSONResponse:
    """Get intelligent query suggestions based on natural language processing."""
    try:
        search_service = get_search_service()
        result = await search_service.get_intelligent_suggestions(
            query=query,
            max_suggestions=max_suggestions,
        )
        return JSONResponse(content=result.dict())
    except Exception as e:
        logger.exception("Failed to get intelligent suggestions")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/search", response_model=dict[str, Any])
async def smart_search(request: SearchRequest) -> JSONResponse:
    """
    Smart search that automatically chooses the best search strategy.

    This endpoint analyzes your query and automatically selects the most
    appropriate search method (semantic, syntax, or hybrid) for optimal results.
    """
    try:
        # Analyze query to determine best strategy
        query_lower = request.query.lower()

        # Check for code-specific patterns
        code_patterns = ["function", "class", "import", "def", "async", "await"]
        has_code_patterns = any(pattern in query_lower for pattern in code_patterns)

        # Check for semantic concepts
        semantic_concepts = [
            "authentication",
            "error handling",
            "data processing",
            "api",
        ]
        has_semantic_concepts = any(
            concept in query_lower for concept in semantic_concepts
        )

        search_service = get_search_service()

        # Choose search strategy
        if has_code_patterns and has_semantic_concepts:
            # Use hybrid search for complex queries
            hybrid_request = HybridSearchRequest(
                query=request.query,
                max_results=request.max_results,
                file_types=request.file_types,
                directories=request.directories,
                case_sensitive=request.case_sensitive,
                whole_word=request.whole_word,
                context_lines=request.context_lines,
            )
            result = await search_service.hybrid_search(hybrid_request)
        elif has_semantic_concepts:
            # Use semantic search for conceptual queries
            semantic_request = SemanticSearchRequest(
                query=request.query,
                max_results=request.max_results,
                file_types=request.file_types,
                directories=request.directories,
            )
            result = await search_service.semantic_search(semantic_request)
        else:
            # Use syntax search for pattern-based queries
            syntax_request = SyntaxSearchRequest(
                query=request.query,
                max_results=request.max_results,
                file_types=request.file_types,
                directories=request.directories,
                case_sensitive=request.case_sensitive,
                whole_word=request.whole_word,
                context_lines=request.context_lines,
            )
            result = await search_service.syntax_search(syntax_request)

        return JSONResponse(content=result.dict())

    except Exception as e:
        logger.exception("Smart search failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint for search service.

    Returns the status of the search service and its dependencies.
    """
    try:
        search_service = get_search_service()
        # Test basic functionality
        stats = await search_service.get_search_stats()

        return {
            "status": "healthy",
            "service": "search",
            "indexed_files": "0",  # Not tracked in current implementation
            "total_chunks": "0",   # Not tracked in current implementation
            "search_count": str(stats.get("search_count", 0)),
            "avg_search_time": f"{stats.get('avg_search_time', 0):.2f}ms",
            "cache_hit_rate": f"{stats.get('cache_hit_rate', 0):.1f}%"
        }
    except Exception as e:
        logger.exception("Health check failed")
        return {"status": "unhealthy", "service": "search", "error": str(e)}


@router.get("/performance")
async def get_performance_metrics() -> Dict[str, Any]:
    """
    Get detailed performance metrics for the search service.
    
    Returns comprehensive performance data including cache statistics,
    search metrics, and optimization status.
    """
    try:
        search_service = get_search_service()
        
        # Get performance metrics if available
        if hasattr(search_service, 'get_performance_metrics'):
            metrics = search_service.get_performance_metrics()
        else:
            # Fallback for non-optimized service
            stats = await search_service.get_search_stats()
            metrics = {
                "search_metrics": {
                    "total_searches": stats.search_count,
                    "avg_search_time_ms": stats.avg_search_time,
                    "cache_hit_rate": stats.cache_hit_rate
                },
                "cache_status": {
                    "redis_available": False,
                    "legacy_cache_size": 0
                },
                "optimization_status": {
                    "optimization_available": False
                }
            }
        
        return {
            "status": "success",
            "timestamp": time.time(),
            "metrics": metrics
        }
        
    except Exception as e:
        logger.exception("Failed to get performance metrics")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/cache/clear")
async def clear_search_cache(namespace: str = Query("search_results", description="Cache namespace to clear")) -> Dict[str, Any]:
    """
    Clear search cache.
    
    Allows clearing of cached search results to force fresh searches.
    """
    try:
        search_service = get_search_service()
        
        if hasattr(search_service, 'clear_cache'):
            result = await search_service.clear_cache()
            return {
                "status": "success" if result.get("success", False) else "failed",
                "message": result.get("message", "Cache cleared successfully")
            }
        else:
            return {
                "status": "not_supported",
                "message": "Cache clearing not supported by this service version"
            }
            
    except Exception as e:
        logger.exception("Failed to clear cache")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/analyze-query")
async def analyze_query(
    query: str = Query(..., description="Query to analyze"),
) -> Dict[str, Any]:
    """Analyze a query to understand its intent and structure."""
    try:
        search_service = get_search_service()
        
        # Process the query using the NLP processor
        processed_query = search_service.nlp_processor.process_query(query)
        
        return {
            "success": True,
            "query": query,
            "analysis": {
                "original_query": processed_query["original_query"],
                "normalized_query": processed_query["normalized_query"],
                "intent": processed_query["intent"],
                "entities": processed_query["entities"],
                "expanded_terms": processed_query["expanded_terms"],
                "search_strategy": processed_query["search_strategy"],
                "code_patterns": processed_query["code_patterns"],
                "file_filters": processed_query["file_filters"],
                "confidence": processed_query["confidence"],
            },
        }
    except Exception as e:
        logger.exception("Query analysis failed")
        raise HTTPException(status_code=500, detail=str(e)) from e