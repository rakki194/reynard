#!/usr/bin/env python3
"""
File Search Tool Definitions
============================

Defines MCP tools for file searching and code pattern matching.
Follows the 100-line axiom and modular architecture principles.
"""

from typing import Any


def get_file_search_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get file search MCP tool definitions."""

    return {
        "search_files": {
            "name": "search_files",
            "description": "Search for files by name pattern in the project",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "File name pattern to search for (supports glob patterns)",
                    },
                    "directory": {
                        "type": "string",
                        "description": "Directory to search in (defaults to project root)",
                    },
                    "recursive": {
                        "type": "boolean",
                        "description": "Search recursively in subdirectories (default: true)",
                    },
                },
                "required": ["pattern"],
            },
        },
        "list_files": {
            "name": "list_files",
            "description": "List files in a directory with optional filtering",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "directory": {
                        "type": "string",
                        "description": "Directory to list (defaults to project root)",
                    },
                    "pattern": {
                        "type": "string",
                        "description": "Optional file pattern filter",
                    },
                    "include_hidden": {
                        "type": "boolean",
                        "description": "Include hidden files and directories (default: false)",
                    },
                },
            },
        },
        "semantic_search": {
            "name": "semantic_search",
            "description": "Search for code by semantic meaning using grep patterns",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query or pattern",
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to search in (e.g., ['py', 'ts', 'js'])",
                    },
                    "case_sensitive": {
                        "type": "boolean",
                        "description": "Case-sensitive search (default: false)",
                    },
                },
                "required": ["query"],
            },
        },
        "search_code_patterns": {
            "name": "search_code_patterns",
            "description": "Search for specific code patterns (functions, classes, imports, etc.)",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "pattern_type": {
                        "type": "string",
                        "enum": [
                            "function",
                            "class",
                            "import",
                            "export",
                            "todo",
                            "fixme",
                        ],
                        "description": "Type of code pattern to search for",
                    },
                    "language": {
                        "type": "string",
                        "description": "Programming language to search in (py, ts, js, etc.)",
                    },
                    "name": {
                        "type": "string",
                        "description": "Optional specific name to search for",
                    },
                },
                "required": ["pattern_type"],
            },
        },
    }
