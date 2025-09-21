"""
🦊 Reynard RAG Search Tools
===========================

Unified search functionality using the FastAPI RAG backend with BM25 fallback.
This module provides the primary search interface for the MCP server, integrating
with the Reynard RAG system for semantic search and falling back to BM25 for
traditional text search when needed.

Key Features:
- Primary: FastAPI RAG backend with Ollama embeddings
- Fallback: BM25 search for traditional text matching
- Hybrid search combining semantic and keyword search
- Intelligent query routing based on query type
- Comprehensive result ranking and filtering
"""

import logging
from typing import Any, Dict, List, Optional

import aiohttp
from pydantic import BaseModel, Field

from ..definitions import register_tool

logger = logging.getLogger(__name__)


class RAGSearchRequest(BaseModel):
    """Request model for RAG search."""

    query: str = Field(..., description="Search query")
    top_k: int = Field(default=10, description="Number of results to return")
    similarity_threshold: Optional[float] = Field(
        default=None, description="Minimum similarity threshold"
    )
    modality: str = Field(
        default="hybrid", description="Search modality: hybrid, semantic, or keyword"
    )


class RAGSearchResult(BaseModel):
    """Result model for RAG search."""

    content: str = Field(..., description="Content of the result")
    score: float = Field(..., description="Relevance score")
    path: str = Field(..., description="File path")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    type: str = Field(default="hybrid", description="Search type used")


class RAGSearchResponse(BaseModel):
    """Response model for RAG search."""

    results: List[RAGSearchResult] = Field(..., description="Search results")
    query: str = Field(..., description="Original query")
    total: int = Field(..., description="Total number of results")
    search_type: str = Field(..., description="Type of search performed")


class RAGSearchEngine:
    """RAG search engine with FastAPI backend integration and BM25 fallback."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.bm25_engine = None

    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    async def _ensure_session(self):
        """Ensure HTTP session is available."""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def _get_bm25_engine(self):
        """Get BM25 engine for fallback search."""
        if not self.bm25_engine:
            try:
                from .bm25_search import ReynardBM25Search

                self.bm25_engine = ReynardBM25Search()
                await self.bm25_engine.initialize()
            except Exception as e:
                logger.warning(f"Failed to initialize BM25 engine: {e}")
                return None
        return self.bm25_engine

    async def search(
        self,
        query: str,
        top_k: int = 10,
        similarity_threshold: Optional[float] = None,
        modality: str = "hybrid",
    ) -> RAGSearchResponse:
        """
        Perform search using RAG backend with BM25 fallback.

        Args:
            query: Search query
            top_k: Number of results to return
            similarity_threshold: Minimum similarity threshold
            modality: Search modality (hybrid, semantic, keyword)

        Returns:
            RAGSearchResponse with search results
        """
        try:
            # Try RAG backend first
            rag_results = await self._search_rag_backend(
                query, top_k, similarity_threshold, modality
            )

            if rag_results and rag_results.results:
                logger.info(f"RAG search returned {len(rag_results.results)} results")
                return rag_results

            # Fallback to BM25 if RAG returns no results
            logger.info("RAG search returned no results, falling back to BM25")
            bm25_results = await self._search_bm25_fallback(query, top_k)

            if bm25_results:
                return bm25_results

            # Return empty results if both fail
            return RAGSearchResponse(
                results=[], query=query, total=0, search_type="none"
            )

        except Exception as e:
            logger.error(f"Search failed: {e}")
            # Try BM25 fallback on error
            try:
                bm25_results = await self._search_bm25_fallback(query, top_k)
                if bm25_results:
                    return bm25_results
            except Exception as bm25_error:
                logger.error(f"BM25 fallback also failed: {bm25_error}")

            return RAGSearchResponse(
                results=[], query=query, total=0, search_type="error"
            )

    async def _search_rag_backend(
        self,
        query: str,
        top_k: int,
        similarity_threshold: Optional[float],
        modality: str,
    ) -> Optional[RAGSearchResponse]:
        """Search using the FastAPI RAG backend."""
        try:
            await self._ensure_session()

            payload = {"q": query, "top_k": top_k, "modality": modality}

            if similarity_threshold:
                payload["similarity_threshold"] = similarity_threshold

            async with self.session.post(
                f"{self.base_url}/api/rag/test-query",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as response:
                if response.status == 200:
                    data = await response.json()

                    # Convert results to RAGSearchResult objects
                    results = []
                    for item in data.get("results", []):
                        result = RAGSearchResult(
                            content=item.get("content", ""),
                            score=item.get("score", 0.0),
                            path=item.get("path", ""),
                            metadata=item.get("metadata", {}),
                            type=item.get("type", "hybrid"),
                        )
                        results.append(result)

                    return RAGSearchResponse(
                        results=results,
                        query=data.get("query", query),
                        total=data.get("total", len(results)),
                        search_type="rag",
                    )
                else:
                    logger.warning(f"RAG backend returned status {response.status}")
                    return None

        except Exception as e:
            logger.error(f"RAG backend search failed: {e}")
            return None

    async def _search_bm25_fallback(
        self, query: str, top_k: int
    ) -> Optional[RAGSearchResponse]:
        """Fallback search using BM25."""
        try:
            bm25_engine = await self._get_bm25_engine()
            if not bm25_engine:
                return None

            # Perform BM25 search
            bm25_results = await bm25_engine.search(query, limit=top_k)

            # Convert BM25 results to RAGSearchResult objects
            results = []
            for item in bm25_results:
                result = RAGSearchResult(
                    content=item.get("content", ""),
                    score=item.get("score", 0.0),
                    path=item.get("path", ""),
                    metadata=item.get("metadata", {}),
                    type="bm25",
                )
                results.append(result)

            return RAGSearchResponse(
                results=results, query=query, total=len(results), search_type="bm25"
            )

        except Exception as e:
            logger.error(f"BM25 fallback search failed: {e}")
            return None


# Global search engine instance
_search_engine: Optional[RAGSearchEngine] = None


async def get_search_engine() -> RAGSearchEngine:
    """Get or create the global search engine instance."""
    global _search_engine
    if not _search_engine:
        _search_engine = RAGSearchEngine()
    return _search_engine


@register_tool
async def search_codebase(
    query: str,
    top_k: int = 10,
    similarity_threshold: Optional[float] = None,
    modality: str = "hybrid",
) -> Dict[str, Any]:
    """
    Search the Reynard codebase using RAG backend with BM25 fallback.

    This is the primary search tool for the MCP server, providing intelligent
    semantic search through the FastAPI RAG backend with Ollama embeddings,
    falling back to BM25 search for traditional text matching.

    Args:
        query: Search query (e.g., "authentication flow", "MCP server implementation")
        top_k: Number of results to return (default: 10)
        similarity_threshold: Minimum similarity threshold for results (optional)
        modality: Search modality - "hybrid" (default), "semantic", or "keyword"

    Returns:
        Dictionary containing search results with content, scores, and metadata
    """
    try:
        async with RAGSearchEngine() as engine:
            response = await engine.search(
                query=query,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                modality=modality,
            )

            # Convert to dictionary format for MCP response
            return {
                "results": [
                    {
                        "content": result.content,
                        "score": result.score,
                        "path": result.path,
                        "metadata": result.metadata,
                        "type": result.type,
                    }
                    for result in response.results
                ],
                "query": response.query,
                "total": response.total,
                "search_type": response.search_type,
            }

    except Exception as e:
        logger.error(f"Codebase search failed: {e}")
        return {
            "error": str(e),
            "results": [],
            "query": query,
            "total": 0,
            "search_type": "error",
        }


@register_tool
async def search_semantic(
    query: str, top_k: int = 10, similarity_threshold: Optional[float] = None
) -> Dict[str, Any]:
    """
    Perform semantic search using RAG backend with Ollama embeddings.

    This tool focuses specifically on semantic search, understanding the meaning
    and context of queries rather than just keyword matching.

    Args:
        query: Semantic search query
        top_k: Number of results to return (default: 10)
        similarity_threshold: Minimum similarity threshold (optional)

    Returns:
        Dictionary containing semantic search results
    """
    return await search_codebase(
        query=query,
        top_k=top_k,
        similarity_threshold=similarity_threshold,
        modality="semantic",
    )


@register_tool
async def search_keyword(query: str, top_k: int = 10) -> Dict[str, Any]:
    """
    Perform keyword search using BM25 fallback.

    This tool focuses on traditional keyword matching, useful for exact
    text searches and when semantic search doesn't find relevant results.

    Args:
        query: Keyword search query
        top_k: Number of results to return (default: 10)

    Returns:
        Dictionary containing keyword search results
    """
    return await search_codebase(query=query, top_k=top_k, modality="keyword")
