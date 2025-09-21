"""
🦊 Reynard RAG Search Tools Module
==================================

Unified search functionality for the Reynard MCP Server using FastAPI RAG backend.
Provides comprehensive search capabilities including:
- Primary: FastAPI RAG backend with Ollama embeddings for semantic search
- Fallback: BM25 text search for traditional keyword matching
- Hybrid search combining semantic and keyword search
- Intelligent query routing and result ranking
"""

# Import BM25 for fallback functionality
from .bm25_search import BM25SearchEngine, ReynardBM25Search

# Import the new RAG search tools
from .rag_search_tools import (
    RAGSearchEngine,
    RAGSearchRequest,
    RAGSearchResponse,
    RAGSearchResult,
    get_search_engine,
    search_codebase,
    search_keyword,
    search_semantic,
)

__all__ = [
    # New RAG search tools (primary)
    "RAGSearchEngine",
    "RAGSearchRequest",
    "RAGSearchResult",
    "RAGSearchResponse",
    "get_search_engine",
    "search_codebase",
    "search_semantic",
    "search_keyword",
    # BM25 for fallback
    "BM25SearchEngine",
    "ReynardBM25Search",
]
