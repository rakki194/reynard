"""
Enhanced Search Tool Definitions
===============================

MCP tool definitions for enhanced semantic search capabilities.
"""

from typing import Any, Dict, List, Optional

from tools.definitions import ToolDefinition


def get_enhanced_search_tool_definitions() -> List[ToolDefinition]:
    """Get all enhanced search tool definitions."""
    return [
        ToolDefinition(
            name="natural_language_search",
            description="Perform natural language search with intelligent query processing. Understands intent and context to find relevant code using natural language queries.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query (e.g., 'find authentication function', 'show error handling code')",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 20,
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to search in (e.g., ['py', 'ts', 'js'])",
                    },
                    "directories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Directories to search in (e.g., ['backend', 'packages'])",
                    },
                    "enable_expansion": {
                        "type": "boolean",
                        "description": "Enable query expansion with synonyms and related terms",
                        "default": True,
                    },
                    "confidence_threshold": {
                        "type": "number",
                        "description": "Minimum confidence threshold for results (0.0-1.0)",
                        "default": 0.6,
                    },
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="intelligent_search",
            description="Perform intelligent search that automatically chooses the best approach based on query analysis. Combines semantic and syntax search strategies.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query (natural language or structured)",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 20,
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to search in",
                    },
                    "directories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Directories to search in",
                    },
                    "search_modes": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Specific search modes to use (semantic, syntax, hybrid)",
                    },
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="contextual_search",
            description="Perform contextual search with additional context information. Uses file path, function name, or other context to improve search relevance.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "context": {
                        "type": "object",
                        "description": "Additional context information",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Current file path",
                            },
                            "function_name": {
                                "type": "string",
                                "description": "Current function name",
                            },
                            "class_name": {
                                "type": "string",
                                "description": "Current class name",
                            },
                            "line_number": {
                                "type": "integer",
                                "description": "Current line number",
                            },
                        },
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 20,
                    },
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="analyze_query",
            description="Analyze a query to understand its intent, entities, and structure. Useful for understanding how the search system interprets queries.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Query to analyze"}
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="get_intelligent_suggestions",
            description="Get intelligent query suggestions based on natural language processing. Provides query improvements and completions.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query to get suggestions for",
                    },
                    "max_suggestions": {
                        "type": "integer",
                        "description": "Maximum number of suggestions to return",
                        "default": 5,
                    },
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="search_with_examples",
            description="Search with example queries to demonstrate natural language search capabilities. Shows how to use natural language for code search.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return",
                        "default": 10,
                    },
                },
                "required": ["query"],
            },
        ),
        ToolDefinition(
            name="enhanced_search_health_check",
            description="Check the health of the enhanced semantic search service. Verifies that natural language processing is working correctly.",
            inputSchema={"type": "object", "properties": {}},
        ),
    ]
