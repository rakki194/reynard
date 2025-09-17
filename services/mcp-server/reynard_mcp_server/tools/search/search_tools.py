#!/usr/bin/env python3
"""
Unified Search Tools
===================

MCP tool handlers for the unified search system.
Provides a clean interface to all search capabilities including:
- BM25 text search with query expansion
- File pattern matching
- Code pattern recognition
- Semantic search with RAG integration
- Ripgrep-based text search
"""

import logging
from pathlib import Path
from typing import Any, Dict

from .bm25_search import (
    clear_search_cache,
    get_query_suggestions,
    get_search_stats,
    reindex_project,
    search_needle_in_haystack,
)
from .file_search import FileSearchEngine
from .ripgrep_search import RipgrepSearchEngine
from .semantic_search import SemanticSearchEngine

logger = logging.getLogger(__name__)


class SearchTools:
    """
    Unified search tools for MCP Server.

    Provides a clean interface to all search capabilities with consistent
    naming and behavior across different search engines.
    """

    def __init__(self, project_root: Path | None = None):
        # Default to the Reynard project root
        if project_root is None:
            current_dir = Path(__file__).parent
            self.project_root = current_dir.parent.parent.parent.parent
        else:
            self.project_root = project_root

        # Initialize search engines
        self.bm25_engine = None  # Lazy initialization
        self.file_engine = FileSearchEngine(project_root)
        self.ripgrep_engine = RipgrepSearchEngine(project_root)
        self.semantic_engine = SemanticSearchEngine(project_root)

    def _format_result(self, result: dict[str, Any], operation: str) -> dict[str, Any]:
        """Format tool result for MCP response."""
        success = result.get("success", False)
        status = "✅ SUCCESS" if success else "❌ FAILED"

        # Format output text
        output_lines = [f"{status} - {operation}"]

        if "results" in result:
            results = result["results"]
            if isinstance(results, list) and results:
                output_lines.append(f"\n🔍 Found {len(results)} results:")
                for i, item in enumerate(results[:10], 1):  # Show first 10
                    file_path = item.get("file_path", "Unknown")
                    line_number = item.get("line_number", "")
                    content = item.get("content", "")[:80]
                    score = item.get("score", 0.0)

                    output_lines.append(
                        f"  {i}. {file_path}:{line_number} (score: {score:.2f})"
                    )
                    if content:
                        output_lines.append(f"     {content}...")
                if len(results) > 10:
                    output_lines.append(f"  ... and {len(results) - 10} more results")
            else:
                output_lines.append("No results found")

        elif "files" in result:
            files = result["files"]
            output_lines.append(f"\n📁 Found {len(files)} files:")
            for file_path in files[:10]:  # Show first 10 files
                output_lines.append(f"  • {file_path}")
            if len(files) > 10:
                output_lines.append(f"  ... and {len(files) - 10} more")

        elif "matches" in result:
            matches = result["matches"]
            output_lines.append(f"\n🔍 Found {len(matches)} matches:")
            for match in matches[:5]:  # Show first 5 matches
                output_lines.append(f"  • {match}")
            if len(matches) > 5:
                output_lines.append(f"  ... and {len(matches) - 5} more")

        if result.get("error"):
            output_lines.append(f"\n⚠️ Error: {result['error']}")

        if result.get("search_strategies"):
            strategies = result["search_strategies"]
            output_lines.append(f"\n🎯 Search strategies used: {', '.join(strategies)}")

        return {
            "success": success,
            "output": "\n".join(output_lines),
            "data": result,
        }

    async def search_enhanced(
        self,
        query: str,
        project_root: str | None = None,
        top_k: int = 20,
        expand_query: bool = True,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        include_agent_context: bool = False,
        agent_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Enhanced search with query expansion, filtering, and intelligent suggestions.

        Args:
            query: The search query or pattern to find in the codebase
            project_root: Root directory of the project to search
            top_k: Number of top results to return
            expand_query: Whether to expand query with synonyms and related terms
            file_types: Filter results by file types
            directories: Filter results by directories
            include_agent_context: Include ECS agent spatial context in search results
            agent_id: Agent ID to include spatial context for

        Returns:
            Enhanced search results with metadata
        """
        try:
            # Use BM25 search as the primary search method
            results = search_needle_in_haystack(
                needle=query,
                project_root=project_root,
                top_k=top_k,
                expand_query=expand_query,
                file_types=file_types,
                directories=directories,
            )

            # Add ECS agent context if requested
            agent_context = None
            if include_agent_context and agent_id:
                agent_context = self._get_agent_spatial_context(agent_id)

            return self._format_result(
                {
                    "success": True,
                    "results": results,
                    "total_found": len(results),
                    "search_query": query,
                    "search_params": {
                        "expand_query": expand_query,
                        "file_types": file_types,
                        "directories": directories,
                        "top_k": top_k,
                        "include_agent_context": include_agent_context,
                    },
                    "agent_context": agent_context,
                },
                "Enhanced Search",
            )

        except Exception as e:
            logger.exception("Error in enhanced search")
            return self._format_result(
                {"success": False, "error": str(e)}, "Enhanced Search"
            )

    async def search_files(
        self,
        pattern: str,
        directory: str | None = None,
        recursive: bool = True,
        include_hidden: bool = False,
    ) -> dict[str, Any]:
        """
        Search for files by name pattern in the project.

        Args:
            pattern: File name pattern to search for (supports glob patterns)
            directory: Directory to search in (defaults to project root)
            recursive: Search recursively in subdirectories
            include_hidden: Include hidden files and directories

        Returns:
            List of matching file paths
        """
        try:
            files = await self.file_engine.search_files(
                pattern=pattern,
                directory=directory,
                recursive=recursive,
                include_hidden=include_hidden,
            )

            return self._format_result({"success": True, "files": files}, "File Search")

        except Exception as e:
            logger.exception("Error searching files")
            return self._format_result(
                {"success": False, "error": str(e)}, "File Search"
            )

    async def list_files(
        self,
        directory: str | None = None,
        pattern: str | None = None,
        include_hidden: bool = False,
    ) -> dict[str, Any]:
        """
        List files in a directory with optional filtering.

        Args:
            directory: Directory to list (defaults to project root)
            pattern: Optional file pattern filter
            include_hidden: Include hidden files and directories

        Returns:
            List of file paths
        """
        try:
            files = await self.file_engine.list_files(
                directory=directory,
                pattern=pattern,
                include_hidden=include_hidden,
            )

            return self._format_result({"success": True, "files": files}, "List Files")

        except Exception as e:
            logger.exception("Error listing files")
            return self._format_result(
                {"success": False, "error": str(e)}, "List Files"
            )

    async def search_content(
        self,
        query: str,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
        case_sensitive: bool = False,
        whole_word: bool = False,
        max_count: int | None = None,
        context_lines: int = 0,
    ) -> dict[str, Any]:
        """
        Search for content within files using ripgrep.

        Args:
            query: Search query or pattern
            file_types: File extensions to search in
            directories: Directories to search in
            case_sensitive: Case-sensitive search
            whole_word: Match whole words only
            max_count: Maximum number of matches
            context_lines: Number of context lines around matches

        Returns:
            Search results with file paths and content
        """
        try:
            result = await self.ripgrep_engine.search(
                pattern=query,
                file_types=file_types,
                directories=directories,
                case_sensitive=case_sensitive,
                whole_word=whole_word,
                max_count=max_count,
                context_lines=context_lines,
            )

            return self._format_result(result, "Content Search")

        except Exception as e:
            logger.exception("Error in content search")
            return self._format_result(
                {"success": False, "error": str(e)}, "Content Search"
            )

    async def search_code_patterns(
        self,
        pattern_type: str,
        language: str = "py",
        name: str | None = None,
        file_types: list[str] | None = None,
        directories: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Search for specific code patterns (functions, classes, imports, etc.).

        Args:
            pattern_type: Type of code pattern to search for
            language: Programming language to search in
            name: Optional specific name to search for
            file_types: File extensions to search in
            directories: Directories to search in

        Returns:
            Search results with code pattern matches
        """
        try:
            result = await self.ripgrep_engine.search_code_patterns(
                pattern_type=pattern_type,
                language=language,
                name=name,
                file_types=file_types,
                directories=directories,
            )

            return self._format_result(result, "Code Pattern Search")

        except Exception as e:
            logger.exception("Error searching code patterns")
            return self._format_result(
                {"success": False, "error": str(e)}, "Code Pattern Search"
            )

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
        Perform semantic search using vector embeddings and RAG backend.

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
        try:
            result = await self.semantic_engine.semantic_search(
                query=query,
                search_type=search_type,
                file_types=file_types,
                directories=directories,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                model=model,
            )

            return self._format_result(result, "Semantic Search")

        except Exception as e:
            logger.exception("Error in semantic search")
            return self._format_result(
                {"success": False, "error": str(e)}, "Semantic Search"
            )

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
            result = await self.semantic_engine.hybrid_search(
                query=query,
                file_types=file_types,
                directories=directories,
                max_results=max_results,
            )

            return self._format_result(result, "Hybrid Search")

        except Exception as e:
            logger.exception("Error in hybrid search")
            return self._format_result(
                {"success": False, "error": str(e)}, "Hybrid Search"
            )

    async def get_query_suggestions(
        self, query: str, max_suggestions: int = 5
    ) -> dict[str, Any]:
        """
        Get intelligent query suggestions to improve search results.

        Args:
            query: The query to get suggestions for
            max_suggestions: Maximum number of suggestions to return

        Returns:
            List of query suggestions
        """
        try:
            suggestions = get_query_suggestions(query, max_suggestions)

            return self._format_result(
                {
                    "success": True,
                    "query": query,
                    "suggestions": suggestions,
                    "total_suggestions": len(suggestions),
                },
                "Query Suggestions",
            )

        except Exception as e:
            logger.exception("Error getting query suggestions")
            return self._format_result(
                {"success": False, "error": str(e)}, "Query Suggestions"
            )

    async def get_search_analytics(self) -> dict[str, Any]:
        """
        Get comprehensive search analytics and statistics.

        Returns:
            Search analytics and performance statistics
        """
        try:
            stats = get_search_stats()

            return self._format_result(
                {
                    "success": True,
                    "analytics": stats,
                    "summary": {
                        "total_files_indexed": stats.get("corpus_size", 0),
                        "avg_document_length": stats.get("avg_document_length", 0),
                        "total_searches": stats.get("search_stats", {}).get(
                            "total_searches", 0
                        ),
                        "cache_hit_rate": self._calculate_cache_hit_rate(stats),
                        "avg_search_time": stats.get("search_stats", {}).get(
                            "avg_search_time", 0
                        ),
                    },
                },
                "Search Analytics",
            )

        except Exception as e:
            logger.exception("Error getting search analytics")
            return self._format_result(
                {"success": False, "error": str(e)}, "Search Analytics"
            )

    async def clear_search_cache(self) -> dict[str, Any]:
        """
        Clear the search cache for fresh results.

        Returns:
            Cache clearing result
        """
        try:
            clear_search_cache()

            return self._format_result(
                {"success": True, "message": "Search cache cleared successfully"},
                "Clear Cache",
            )

        except Exception as e:
            logger.exception("Error clearing search cache")
            return self._format_result(
                {"success": False, "error": str(e)}, "Clear Cache"
            )

    async def reindex_project(self, project_root: str | None = None) -> dict[str, Any]:
        """
        Reindex the project for updated content.

        Args:
            project_root: Root directory of the project to reindex

        Returns:
            Reindexing result
        """
        try:
            reindex_project(project_root)

            return self._format_result(
                {"success": True, "message": "Project reindexed successfully"},
                "Reindex Project",
            )

        except Exception as e:
            logger.exception("Error reindexing project")
            return self._format_result(
                {"success": False, "error": str(e)}, "Reindex Project"
            )

    def _calculate_cache_hit_rate(self, stats: dict[str, Any]) -> float:
        """Calculate cache hit rate percentage."""
        search_stats = stats.get("search_stats", {})
        total_searches = search_stats.get("total_searches", 0)
        cache_hits = search_stats.get("cache_hits", 0)

        if total_searches == 0:
            return 0.0

        return round((cache_hits / total_searches) * 100, 2)

    def _get_agent_spatial_context(self, agent_id: str) -> Dict[str, Any] | None:
        """Get spatial context for an agent from ECS system."""
        try:
            # Import here to avoid circular imports
            from ..ecs_agent_tools import ECSAgentTools

            # Create a temporary ECS tools instance to get agent data
            ecs_tools = ECSAgentTools()

            # Get agent positions
            positions_result = ecs_tools.get_ecs_agent_positions({})
            if positions_result.get("content"):
                import json

                positions_data = json.loads(positions_result["content"][0]["text"])

                # Find the specific agent
                for agent_data in positions_data:
                    if agent_data.get("id") == agent_id:
                        return {
                            "agent_id": agent_id,
                            "position": agent_data.get("position"),
                            "target": agent_data.get("target"),
                            "velocity": agent_data.get("velocity"),
                            "movement_speed": agent_data.get("movement_speed"),
                            "spirit": agent_data.get("spirit"),
                            "name": agent_data.get("name"),
                        }

            return None
        except Exception as e:
            logger.warning(f"Failed to get agent spatial context: {e}")
            return None
