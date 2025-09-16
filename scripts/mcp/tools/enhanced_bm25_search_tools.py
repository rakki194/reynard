#!/usr/bin/env python3
"""
Enhanced BM25 Search Tools for MCP Server
==========================================

Agent-friendly BM25 search tools with advanced features:
- Query expansion and suggestions
- File type and directory filtering
- Performance optimization
- Intelligent caching
- Search analytics
"""

import logging
from typing import Any, Dict, List, Optional

try:
    from tools.enhanced_bm25_search import (
        clear_search_cache,
        get_query_suggestions,
        get_search_stats,
        reindex_project,
        search_enhanced,
    )
except ImportError:
    # Fallback for when the module isn't available
    def clear_search_cache():
        pass

    def get_query_suggestions(query: str, max_suggestions: int = 5) -> List[str]:
        return []

    def get_search_stats() -> Dict[str, Any]:
        return {}

    def reindex_project(project_root: Optional[str] = None):
        pass

    def search_enhanced(
        needle: str,
        project_root: Optional[str] = None,
        top_k: int = 20,
        expand_query: bool = True,
        file_types: Optional[List[str]] = None,
        directories: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        return []


logger = logging.getLogger(__name__)


class EnhancedBM25SearchTools:
    """Enhanced BM25 Search Tools for MCP Server with agent-friendly features."""

    def __init__(self) -> None:
        """Initialize enhanced BM25 search tools."""
        self.tools = [
            {
                "name": "search_enhanced",
                "description": "Enhanced BM25 search with query expansion, filtering, and intelligent suggestions",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query or pattern to find in the codebase",
                        },
                        "project_root": {
                            "type": "string",
                            "description": "Root directory of the project to search (optional, defaults to Reynard project root)",
                            "default": None,
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of top results to return (default: 20)",
                            "default": 20,
                        },
                        "expand_query": {
                            "type": "boolean",
                            "description": "Whether to expand query with synonyms and related terms (default: true)",
                            "default": True,
                        },
                        "file_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Filter results by file types (e.g., ['.py', '.ts', '.js'])",
                            "default": None,
                        },
                        "directories": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Filter results by directories (e.g., ['packages/', 'examples/'])",
                            "default": None,
                        },
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "get_query_suggestions",
                "description": "Get intelligent query suggestions to improve search results",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The query to get suggestions for",
                        },
                        "max_suggestions": {
                            "type": "integer",
                            "description": "Maximum number of suggestions to return (default: 5)",
                            "default": 5,
                        },
                    },
                    "required": ["query"],
                },
            },
            {
                "name": "get_search_analytics",
                "description": "Get comprehensive search analytics and statistics",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
            {
                "name": "clear_search_cache",
                "description": "Clear the search cache for fresh results",
                "inputSchema": {
                    "type": "object",
                    "properties": {},
                    "required": [],
                },
            },
            {
                "name": "reindex_project",
                "description": "Reindex the project for updated content",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "project_root": {
                            "type": "string",
                            "description": "Root directory of the project to reindex (optional, defaults to Reynard project root)",
                            "default": None,
                        },
                    },
                    "required": [],
                },
            },
            {
                "name": "search_by_file_type",
                "description": "Search for patterns within specific file types",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query or pattern",
                        },
                        "file_types": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "File types to search in (e.g., ['.py', '.ts'])",
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of results to return (default: 20)",
                            "default": 20,
                        },
                    },
                    "required": ["query", "file_types"],
                },
            },
            {
                "name": "search_in_directory",
                "description": "Search for patterns within specific directories",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query or pattern",
                        },
                        "directories": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Directories to search in (e.g., ['packages/', 'examples/'])",
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of results to return (default: 20)",
                            "default": 20,
                        },
                    },
                    "required": ["query", "directories"],
                },
            },
        ]

    def get_tools(self) -> List[Dict[str, Any]]:
        """Get list of available enhanced BM25 search tools."""
        return self.tools

    def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call an enhanced BM25 search tool.

        Args:
            name: Tool name
            arguments: Tool arguments

        Returns:
            Tool result
        """
        try:
            if name == "search_enhanced":
                return self._handle_search_enhanced(arguments)
            elif name == "get_query_suggestions":
                return self._handle_get_query_suggestions(arguments)
            elif name == "get_search_analytics":
                return self._handle_get_search_analytics(arguments)
            elif name == "clear_search_cache":
                return self._handle_clear_search_cache(arguments)
            elif name == "reindex_project":
                return self._handle_reindex_project(arguments)
            elif name == "search_by_file_type":
                return self._handle_search_by_file_type(arguments)
            elif name == "search_in_directory":
                return self._handle_search_in_directory(arguments)
            else:
                return {"error": f"Unknown tool: {name}"}

        except Exception as e:
            logger.error(f"Error calling enhanced BM25 search tool {name}: {e}")
            return {"error": f"Tool execution failed: {str(e)}"}

    def _handle_search_enhanced(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle enhanced search requests."""
        query = arguments.get("query", "")
        project_root = arguments.get("project_root")
        top_k = arguments.get("top_k", 20)
        expand_query = arguments.get("expand_query", True)
        file_types = arguments.get("file_types")
        directories = arguments.get("directories")

        if not query:
            return {"error": "Missing required parameter: query"}

        results = search_enhanced(
            needle=query,
            project_root=project_root,
            top_k=top_k,
            expand_query=expand_query,
            file_types=file_types,
            directories=directories,
        )

        return {
            "success": True,
            "results": results,
            "total_found": len(results),
            "search_query": query,
            "search_params": {
                "expand_query": expand_query,
                "file_types": file_types,
                "directories": directories,
                "top_k": top_k,
            },
        }

    def _handle_get_query_suggestions(
        self, arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle query suggestions requests."""
        query = arguments.get("query", "")
        max_suggestions = arguments.get("max_suggestions", 5)

        if not query:
            return {"error": "Missing required parameter: query"}

        suggestions = get_query_suggestions(query, max_suggestions)

        return {
            "success": True,
            "query": query,
            "suggestions": suggestions,
            "total_suggestions": len(suggestions),
        }

    def _handle_get_search_analytics(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle search analytics requests."""
        stats = get_search_stats()

        return {
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
        }

    def _handle_clear_search_cache(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle cache clearing requests."""
        clear_search_cache()

        return {
            "success": True,
            "message": "Search cache cleared successfully",
        }

    def _handle_reindex_project(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle project reindexing requests."""
        project_root = arguments.get("project_root")
        reindex_project(project_root)

        return {
            "success": True,
            "message": "Project reindexed successfully",
        }

    def _handle_search_by_file_type(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle file type specific search requests."""
        query = arguments.get("query", "")
        file_types = arguments.get("file_types", [])
        top_k = arguments.get("top_k", 20)

        if not query:
            return {"error": "Missing required parameter: query"}
        if not file_types:
            return {"error": "Missing required parameter: file_types"}

        results = search_enhanced(
            needle=query,
            top_k=top_k,
            file_types=file_types,
        )

        return {
            "success": True,
            "results": results,
            "total_found": len(results),
            "search_query": query,
            "file_types": file_types,
        }

    def _handle_search_in_directory(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Handle directory specific search requests."""
        query = arguments.get("query", "")
        directories = arguments.get("directories", [])
        top_k = arguments.get("top_k", 20)

        if not query:
            return {"error": "Missing required parameter: query"}
        if not directories:
            return {"error": "Missing required parameter: directories"}

        results = search_enhanced(
            needle=query,
            top_k=top_k,
            directories=directories,
        )

        return {
            "success": True,
            "results": results,
            "total_found": len(results),
            "search_query": query,
            "directories": directories,
        }

    def _calculate_cache_hit_rate(self, stats: Dict[str, Any]) -> float:
        """Calculate cache hit rate percentage."""
        search_stats = stats.get("search_stats", {})
        total_searches = search_stats.get("total_searches", 0)
        cache_hits = search_stats.get("cache_hits", 0)

        if total_searches == 0:
            return 0.0

        return round((cache_hits / total_searches) * 100, 2)
