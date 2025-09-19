#!/usr/bin/env python3
"""
Semantic Search Engine
=====================

Unified semantic search implementation with RAG backend integration.
Provides advanced semantic search capabilities using vector embeddings.
"""

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class SemanticSearchEngine:
    """
    Unified semantic search engine with RAG backend integration.

    Provides advanced semantic search capabilities using vector embeddings
    and retrieval-augmented generation techniques.
    """

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

        self._initialized = False
        self._rag_service = None

    async def initialize(self) -> bool:
        """Initialize the semantic search service."""
        try:
            # Try to import and initialize RAG service
            from services.semantic_search_service import SemanticSearchService

            self._rag_service = SemanticSearchService(self.project_root)
            self._initialized = await self._rag_service.initialize()

            if self._initialized:
                logger.info("Semantic search service initialized successfully")
            else:
                logger.warning("Semantic search service initialization failed")

            return self._initialized

        except ImportError:
            logger.warning(
                "Semantic search service not available - RAG backend not found"
            )
            return False
        except Exception as e:
            logger.error(f"Error initializing semantic search service: {e}")
            return False

    async def semantic_search(
        self,
        query: str,
        search_type: str = "hybrid",
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        top_k: int = 20,
        similarity_threshold: float = 0.7,
        model: str | None = None,
    ) -> dict[str, Any]:
        """
        Perform semantic search using vector embeddings.

        Args:
            query: Search query for semantic understanding
            search_type: Type of search to perform (hybrid, vector, text, code, context)
            file_types: File extensions to search in
            directories: Directories to search in
            top_k: Maximum number of results to return
            similarity_threshold: Minimum similarity score for results
            model: Embedding model to use

        Returns:
            Search results with semantic relevance scores
        """
        if not self._initialized or not self._rag_service:
            return {
                "success": False,
                "error": "Semantic search service not available",
                "results": [],
            }

        try:
            result = await self._rag_service.semantic_search(
                query=query,
                search_type=search_type,
                file_types=file_types,
                directories=directories,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                model=model,
            )
            return result

        except Exception as e:
            logger.exception("Error in semantic search")
            return {
                "success": False,
                "error": str(e),
                "results": [],
            }

    async def embed_text(self, text: str, model: str | None = None) -> dict[str, Any]:
        """
        Generate vector embedding for text.

        Args:
            text: Text to generate embedding for
            model: Embedding model to use

        Returns:
            Embedding result with vector data
        """
        if not self._initialized or not self._rag_service:
            return {
                "success": False,
                "error": "Semantic search service not available",
            }

        try:
            result = await self._rag_service.embed_text(text, model)
            return result

        except Exception as e:
            logger.exception("Error generating text embedding")
            return {
                "success": False,
                "error": str(e),
            }

    async def index_documents(
        self,
        file_paths: list[str],
        model: str | None = None,
        chunk_size: int = 512,
        overlap: int = 50,
    ) -> dict[str, Any]:
        """
        Index documents for semantic search.

        Args:
            file_paths: List of file paths to index
            model: Embedding model to use for indexing
            chunk_size: Size of text chunks for indexing
            overlap: Overlap between chunks

        Returns:
            Indexing result with statistics
        """
        if not self._initialized or not self._rag_service:
            return {
                "success": False,
                "error": "Semantic search service not available",
            }

        try:
            result = await self._rag_service.index_documents(
                file_paths=file_paths,
                model=model,
                chunk_size=chunk_size,
                overlap=overlap,
            )
            return result

        except Exception as e:
            logger.exception("Error indexing documents")
            return {
                "success": False,
                "error": str(e),
            }

    async def get_rag_stats(self) -> dict[str, Any]:
        """Get RAG service statistics and health status."""
        if not self._initialized or not self._rag_service:
            return {
                "success": False,
                "error": "Semantic search service not available",
                "stats": {},
            }

        try:
            result = await self._rag_service.get_rag_stats()
            return result

        except Exception as e:
            logger.exception("Error getting RAG stats")
            return {
                "success": False,
                "error": str(e),
                "stats": {},
            }

    async def hybrid_search(
        self,
        query: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        max_results: int = 50,
    ) -> dict[str, Any]:
        """
        Perform hybrid search combining semantic and traditional text search.

        Args:
            query: Search query
            file_types: File extensions to search in
            directories: Directories to search in
            max_results: Maximum number of results to return

        Returns:
            Combined search results from multiple strategies
        """
        try:
            results = {}

            # Traditional text search
            from .file_search import FileSearchEngine

            file_engine = FileSearchEngine(self.project_root)

            text_result = await file_engine.search_content(
                query=query,
                file_types=file_types,
                directories=directories,
                context_lines=2,
            )
            results["text_search"] = text_result

            # Semantic search (if available)
            if self._initialized and self._rag_service:
                semantic_result = await self.semantic_search(
                    query=query,
                    search_type="hybrid",
                    file_types=file_types,
                    directories=directories,
                    top_k=max_results // 2,
                )
                results["semantic_search"] = semantic_result

            # Combine results
            combined_results = self._combine_search_results(results, max_results)

            return {
                "success": True,
                "query": query,
                "total_results": len(combined_results),
                "results": combined_results,
                "search_strategies": list(results.keys()),
            }

        except Exception as e:
            logger.exception("Error in hybrid search")
            return {
                "success": False,
                "error": str(e),
                "results": [],
            }

    def _combine_search_results(
        self, results: dict[str, Any], max_results: int
    ) -> list[dict[str, Any]]:
        """Combine results from multiple search strategies."""
        combined: list[dict[str, Any]] = []
        seen_files: set[str] = set()

        # Add semantic search results first (higher priority)
        self._add_semantic_results(results, combined, seen_files)

        # Add text search results
        self._add_text_results(results, combined, seen_files)

        return combined[:max_results]

    def _add_semantic_results(
        self,
        results: dict[str, Any],
        combined: list[dict[str, Any]],
        seen_files: set[str],
    ) -> None:
        """Add semantic search results to combined list."""
        if "semantic_search" not in results or not results["semantic_search"].get(
            "success"
        ):
            return

        for item in results["semantic_search"].get("results", []):
            file_path = item.get("file_path", "")
            if file_path and file_path not in seen_files:
                item["source"] = "semantic"
                combined.append(item)
                seen_files.add(file_path)

    def _add_text_results(
        self,
        results: dict[str, Any],
        combined: list[dict[str, Any]],
        seen_files: set[str],
    ) -> None:
        """Add text search results to combined list."""
        if "text_search" not in results or not results["text_search"].get("success"):
            return

        for match in results["text_search"].get("matches", []):
            file_path = match.get("file_path", "")
            if file_path and file_path not in seen_files:
                combined.append(
                    {
                        "file_path": file_path,
                        "score": 0.5,  # Lower score for text search
                        "match_type": "text",
                        "source": "text",
                        "content": match.get("content", ""),
                        "line_number": match.get("line_number"),
                        "snippet": (
                            match.get("content", "")[:100]
                            if match.get("content")
                            else ""
                        ),
                    }
                )
                seen_files.add(file_path)
