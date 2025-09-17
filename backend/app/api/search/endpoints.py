"""
Search API Endpoints
===================

FastAPI endpoints for advanced search functionality.
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from .models import (
    HybridSearchRequest,
    IndexRequest,
    SearchRequest,
    SemanticSearchRequest,
    SyntaxSearchRequest,
)
from .natural_language_endpoints import router as natural_language_router

# SearchService is imported dynamically in get_search_service()

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/search", tags=["search"])

# Include natural language endpoints
router.include_router(natural_language_router)


def get_search_service() -> Any:
    """Get the search service instance from the service registry."""
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
async def semantic_search(request: SemanticSearchRequest) -> JSONResponse:
    """
    Perform semantic search using vector embeddings.

    This endpoint provides intelligent code search that understands the meaning
    and context of your queries, not just exact text matches.
    """
    try:
        search_service = get_search_service()
        result = await search_service.semantic_search(request)
        return JSONResponse(content=result.dict())
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
            "indexed_files": str(stats.total_files_indexed),
            "total_chunks": str(stats.total_chunks),
        }
    except Exception as e:
        logger.exception("Health check failed")
        return {"status": "unhealthy", "service": "search", "error": str(e)}
