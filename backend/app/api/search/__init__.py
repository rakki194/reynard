"""
Search API Module
================

Unified search API with semantic, syntax, hybrid, and natural language search capabilities.
"""

from .endpoints import router
from .models import (
    HybridSearchRequest,
    IndexRequest,
    SearchRequest,
    SearchResponse,
    SearchResult,
    SearchStats,
    SemanticSearchRequest,
    SuggestionsResponse,
    SyntaxSearchRequest,
)
from .search import SearchService

__all__ = [
    "router",
    "SearchService",
    "SearchRequest",
    "SearchResponse", 
    "SearchResult",
    "SearchStats",
    "SemanticSearchRequest",
    "SyntaxSearchRequest",
    "HybridSearchRequest",
    "IndexRequest",
    "SuggestionsResponse",
]