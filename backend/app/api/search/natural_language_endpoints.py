"""
Natural Language Search Endpoints
================================

FastAPI endpoints for natural language semantic search capabilities.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ...security.mcp_auth import MCPTokenData, require_mcp_permission
from .enhanced_search_service import EnhancedSearchService
from .models import SearchResponse, SuggestionsResponse

logger = logging.getLogger("uvicorn")

router = APIRouter(tags=["search", "natural-language"])


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


def get_enhanced_search_service() -> EnhancedSearchService:
    """Get the enhanced search service instance."""
    return EnhancedSearchService()


@router.post("/natural-language", response_model=SearchResponse)
async def natural_language_search(
    request: NaturalLanguageSearchRequest,
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:natural")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> SearchResponse:
    """Perform natural language search with intelligent query processing."""
    try:
        result = await service.natural_language_search(
            query=request.query,
            max_results=request.max_results,
            file_types=request.file_types,
            directories=request.directories,
            enable_expansion=request.enable_expansion,
            confidence_threshold=request.confidence_threshold,
        )
        return result
    except Exception as e:
        logger.error(f"Natural language search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Natural language search failed: {e!s}",
        )


@router.post("/intelligent", response_model=SearchResponse)
async def intelligent_search(
    request: IntelligentSearchRequest,
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:intelligent")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> SearchResponse:
    """Perform intelligent search that automatically chooses the best approach."""
    try:
        result = await service.intelligent_search(
            query=request.query,
            max_results=request.max_results,
            file_types=request.file_types,
            directories=request.directories,
            search_modes=request.search_modes,
        )
        return result
    except Exception as e:
        logger.error(f"Intelligent search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligent search failed: {e!s}",
        )


@router.post("/contextual", response_model=SearchResponse)
async def contextual_search(
    request: ContextualSearchRequest,
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:contextual")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> SearchResponse:
    """Perform contextual search with additional context information."""
    try:
        result = await service.contextual_search(
            query=request.query,
            context=request.context,
            max_results=request.max_results,
        )
        return result
    except Exception as e:
        logger.error(f"Contextual search failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contextual search failed: {e!s}",
        )


@router.get("/suggestions/intelligent", response_model=SuggestionsResponse)
async def get_intelligent_suggestions(
    query: str = Query(..., description="Query to get suggestions for"),
    max_suggestions: int = Query(5, description="Maximum number of suggestions"),
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:suggestions")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> SuggestionsResponse:
    """Get intelligent query suggestions based on natural language processing."""
    try:
        result = await service.get_intelligent_suggestions(
            query=query,
            max_suggestions=max_suggestions,
        )
        return result
    except Exception as e:
        logger.error(f"Failed to get intelligent suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get intelligent suggestions: {e!s}",
        )


@router.get("/analyze-query")
async def analyze_query(
    query: str = Query(..., description="Query to analyze"),
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:analyze")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> Dict[str, Any]:
    """Analyze a query to understand its intent and structure."""
    try:
        # Process the query using the NLP processor
        processed_query = service.nlp_processor.process_query(query)
        
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
        logger.error(f"Query analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query analysis failed: {e!s}",
        )


@router.get("/health/natural-language")
async def health_check_natural_language(
    mcp_client: MCPTokenData = Depends(require_mcp_permission("search:health")),
    service: EnhancedSearchService = Depends(get_enhanced_search_service),
) -> Dict[str, Any]:
    """Check the health of the natural language search service."""
    try:
        # Test the NLP processor
        test_query = "find authentication function"
        processed = service.nlp_processor.process_query(test_query)
        
        return {
            "success": True,
            "service": "natural_language_search",
            "status": "healthy",
            "nlp_processor": {
                "enabled": service._nlp_enabled,
                "query_expansion": service._query_expansion_enabled,
                "intent_detection": service._intent_detection_enabled,
                "test_query_processed": processed["confidence"] > 0.5,
            },
            "timestamp": "2025-01-15T10:30:00Z",
        }
    except Exception as e:
        logger.error(f"Natural language search health check failed: {e}")
        return {
            "success": False,
            "service": "natural_language_search",
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2025-01-15T10:30:00Z",
        }
