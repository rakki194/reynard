"""
BM25 Search Tool Definitions for Reynard MCP Server
"""

from typing import Any


def get_bm25_search_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get BM25 search tool definitions."""
    return {
        "search_needle_in_haystack": {
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
    }
