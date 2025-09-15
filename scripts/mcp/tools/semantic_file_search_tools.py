#!/usr/bin/env python3
"""
Semantic File Search Tools
==========================

MCP tool handlers for semantic file search operations.
Integrates with RAG backend for advanced semantic search capabilities.
Follows the 100-line axiom and modular architecture principles.
"""

import logging
from pathlib import Path
from typing import Any

from services.file_search_service import FileSearchService
from services.semantic_search_service import SemanticSearchService

logger = logging.getLogger(__name__)

# Constants
SEMANTIC_SERVICE_UNAVAILABLE = "Semantic search service not available"
SEMANTIC_SEARCH_OPERATION = "Semantic Search"
TEXT_EMBEDDING_OPERATION = "Text Embedding"
DOCUMENT_INDEXING_OPERATION = "Document Indexing"
SEARCH_STATS_OPERATION = "Search Stats"
HYBRID_SEARCH_OPERATION = "Hybrid Search"

# Magic numbers
MIN_PARTS_FOR_FILE_PATH = 2
MIN_PARTS_FOR_CONTEXT = 2


class SemanticFileSearchTools:
    """Handles semantic file search operations for MCP."""

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent
        else:
            self.project_root = project_root

        # Initialize services
        self._semantic_service = SemanticSearchService(project_root)
        self._file_service = FileSearchService(project_root)
        self._initialized = False

    async def _ensure_initialized(self) -> bool:
        """Ensure services are initialized."""
        if not self._initialized:
            self._initialized = await self._semantic_service.initialize()
        return self._initialized

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        # Handle both success field and direct data responses
        has_success_field = "success" in result
        is_success = result.get("success", True) if has_success_field else True
        status = "✅ SUCCESS" if is_success else "❌ FAILED"

        # Format output text
        output_lines = [f"{status} - {operation}"]

        if "results" in result:
            results = result["results"]
            if isinstance(results, list) and results:
                output_lines.append(f"Found {len(results)} results:")
                for i, item in enumerate(results[:10], 1):  # Show first 10
                    file_path = item.get("file_path", "Unknown")
                    score = item.get("score", 0.0)
                    snippet = item.get("snippet", "")[:100]
                    output_lines.append(f"  {i}. {file_path} (score: {score:.3f})")
                    if snippet:
                        output_lines.append(f"     {snippet}...")
            else:
                output_lines.append("No results found")

        if "error" in result:
            output_lines.append(f"Error: {result['error']}")

        return {
            "success": result.get("success", False),
            "output": "\n".join(output_lines),
            "data": result,
        }

    async def semantic_search(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Perform semantic search using RAG backend."""
        query = arguments.get("query", "")
        search_type = arguments.get("search_type", "hybrid")
        file_types = arguments.get("file_types", [])
        directories = arguments.get("directories", [])
        top_k = arguments.get("top_k", 20)
        similarity_threshold = arguments.get("similarity_threshold", 0.7)
        model = arguments.get("model")

        try:
            # Ensure services are initialized
            if not await self._ensure_initialized():
                return self._format_result(
                    {
                        "success": False,
                        "error": SEMANTIC_SERVICE_UNAVAILABLE,
                    },
                    SEMANTIC_SEARCH_OPERATION,
                )

            # Perform semantic search
            result = await self._semantic_service.semantic_search(
                query=query,
                search_type=search_type,
                file_types=file_types if file_types else None,
                directories=directories if directories else None,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                model=model,
            )

            return self._format_result(result, SEMANTIC_SEARCH_OPERATION)

        except Exception as e:
            logger.exception("Error in semantic search")
            return self._format_result(
                {"success": False, "error": str(e)}, SEMANTIC_SEARCH_OPERATION
            )

    async def hybrid_search(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Perform hybrid search combining semantic and traditional text search."""
        query = arguments.get("query", "")
        file_types = arguments.get("file_types", [])
        directories = arguments.get("directories", [])
        max_results = arguments.get("max_results", 50)

        try:
            results = {}

            # Traditional text search
            text_result = await self._file_service.semantic_search(
                query=query,
                file_types=file_types if file_types else None,
                directories=directories if directories else None,
                context_lines=2,
            )
            results["text_search"] = text_result

            # Semantic search (if available)
            if await self._ensure_initialized():
                semantic_result = await self._semantic_service.semantic_search(
                    query=query,
                    search_type="hybrid",
                    file_types=file_types if file_types else None,
                    directories=directories if directories else None,
                    top_k=max_results // 2,
                )
                results["semantic_search"] = semantic_result

            # Combine results
            combined_results = self._combine_search_results(results, max_results)

            return self._format_result(
                {
                    "success": True,
                    "query": query,
                    "total_results": len(combined_results),
                    "results": combined_results,
                    "search_strategies": list(results.keys()),
                },
                HYBRID_SEARCH_OPERATION,
            )

        except Exception as e:
            logger.exception("Error in hybrid search")
            return self._format_result(
                {"success": False, "error": str(e)}, HYBRID_SEARCH_OPERATION
            )

    async def embed_text(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Generate embedding for text using RAG backend."""
        text = arguments.get("text", "")
        model = arguments.get("model")

        try:
            if not await self._ensure_initialized():
                return self._format_result(
                    {
                        "success": False,
                        "error": SEMANTIC_SERVICE_UNAVAILABLE,
                    },
                    TEXT_EMBEDDING_OPERATION,
                )

            result = await self._semantic_service.embed_text(text, model)

            return self._format_result(result, TEXT_EMBEDDING_OPERATION)

        except Exception as e:
            logger.exception("Error generating text embedding")
            return self._format_result(
                {"success": False, "error": str(e)}, TEXT_EMBEDDING_OPERATION
            )

    async def index_documents(self, arguments: dict[str, Any]) -> dict[str, Any]:
        """Index documents for semantic search."""
        file_paths = arguments.get("file_paths", [])
        model = arguments.get("model")
        chunk_size = arguments.get("chunk_size", 512)
        overlap = arguments.get("overlap", 50)

        try:
            if not await self._ensure_initialized():
                return self._format_result(
                    {
                        "success": False,
                        "error": SEMANTIC_SERVICE_UNAVAILABLE,
                    },
                    DOCUMENT_INDEXING_OPERATION,
                )

            result = await self._semantic_service.index_documents(
                file_paths=file_paths,
                model=model,
                chunk_size=chunk_size,
                overlap=overlap,
            )

            return self._format_result(result, DOCUMENT_INDEXING_OPERATION)

        except Exception as e:
            logger.exception("Error indexing documents")
            return self._format_result(
                {"success": False, "error": str(e)}, DOCUMENT_INDEXING_OPERATION
            )

    async def get_search_stats(self, _arguments: dict[str, Any]) -> dict[str, Any]:
        """Get semantic search service statistics."""
        try:
            if not await self._ensure_initialized():
                return self._format_result(
                    {
                        "success": False,
                        "error": SEMANTIC_SERVICE_UNAVAILABLE,
                    },
                    SEARCH_STATS_OPERATION,
                )

            result = await self._semantic_service.get_rag_stats()

            return self._format_result(result, SEARCH_STATS_OPERATION)

        except Exception as e:
            logger.exception("Error getting search stats")
            return self._format_result(
                {"success": False, "error": str(e)}, SEARCH_STATS_OPERATION
            )

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

        for strategy_results in results["text_search"].get("results", {}).values():
            if strategy_results.get("success") and "stdout" in strategy_results:
                self._parse_ripgrep_output(
                    strategy_results["stdout"], combined, seen_files
                )

    def _parse_ripgrep_output(
        self, output: str, combined: list[dict[str, Any]], seen_files: set[str]
    ) -> None:
        """Parse ripgrep output and add to combined results."""
        lines = output.split("\n")
        for line in lines:
            if ":" in line:
                self._process_ripgrep_line(line, combined, seen_files)

    def _process_ripgrep_line(
        self, line: str, combined: list[dict[str, Any]], seen_files: set[str]
    ) -> None:
        """Process a single ripgrep output line."""
        parts = line.split(":", 2)
        if len(parts) < MIN_PARTS_FOR_FILE_PATH:
            return

        file_path = parts[0]
        if not file_path or file_path in seen_files:
            return

        context = parts[2] if len(parts) > MIN_PARTS_FOR_CONTEXT else ""
        combined.append(
            {
                "file_path": file_path,
                "score": 0.5,  # Lower score for text search
                "match_type": "text",
                "source": "text",
                "context": context,
                "snippet": context[:100] if context else "",
            }
        )
        seen_files.add(file_path)
