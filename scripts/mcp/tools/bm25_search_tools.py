"""
BM25 Search Tools for Reynard MCP Server

This module provides MCP tool wrappers for the BM25 search functionality.
"""

import logging
from typing import Any, Dict, List

from tools.bm25_search import search_needle_in_haystack

logger = logging.getLogger(__name__)


class BM25SearchTools:
    """BM25 Search Tools for MCP Server."""

    def __init__(self) -> None:
        """Initialize BM25 search tools."""
        self.tools = [
            {
                "name": "search_needle_in_haystack",
                "description": "Search for a specific pattern (needle) in the codebase (haystack) using BM25 algorithm",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "needle": {
                            "type": "string",
                            "description": "The pattern or text to search for in the codebase",
                        },
                        "project_root": {
                            "type": "string",
                            "description": "Root directory of the project to search (optional, defaults to current directory)",
                            "default": None,
                        },
                        "top_k": {
                            "type": "integer",
                            "description": "Number of top results to return (default: 20)",
                            "default": 20,
                        },
                    },
                    "required": ["needle"],
                },
            }
        ]

    def get_tools(self) -> list[dict[str, Any]]:
        """Get list of available BM25 search tools."""
        return self.tools

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """
        Call a BM25 search tool.

        Args:
            name: Tool name
            arguments: Tool arguments

        Returns:
            Tool result
        """
        try:
            if name == "search_needle_in_haystack":
                needle = arguments.get("needle")
                project_root = arguments.get("project_root")
                top_k = arguments.get("top_k", 20)

                if not needle:
                    return {"error": "Missing required parameter: needle"}

                results = search_needle_in_haystack(
                    needle=needle, project_root=project_root, top_k=top_k
                )

                return {
                    "results": results,
                    "total_found": len(results),
                    "search_query": needle,
                }

            else:
                return {"error": f"Unknown tool: {name}"}

        except Exception as e:
            logger.error(f"Error calling BM25 search tool {name}: {e}")
            return {"error": f"Tool execution failed: {str(e)}"}
