#!/usr/bin/env python3
"""
Semantic File Search Tool Definitions
====================================

MCP tool definitions for semantic file search operations.
Provides advanced semantic search capabilities through RAG backend integration.
"""

from typing import Any


def get_semantic_file_search_tool_definitions() -> dict[str, dict[str, Any]]:
    """Get semantic file search tool definitions for MCP."""

    return {
        "semantic_search": {
            "name": "semantic_search",
            "description": "Perform semantic search using vector embeddings and RAG backend",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query for semantic understanding",
                    },
                    "search_type": {
                        "type": "string",
                        "enum": ["hybrid", "vector", "text", "code", "context"],
                        "description": "Type of search to perform (default: hybrid)",
                    },
                    "file_types": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "File extensions to search in (e.g., ['py', 'ts', 'js'])",
                    },
                    "directories": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Directories to search in (default: project root)",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 20)",
                    },
                    "similarity_threshold": {
                        "type": "number",
                        "description": "Minimum similarity score for results (default: 0.7)",
                    },
                    "model": {
                        "type": "string",
                        "description": "Embedding model to use (auto-selected if not specified)",
                    },
                },
                "required": ["query"],
            },
        },
        "hybrid_search": {
            "name": "hybrid_search",
            "description": "Perform hybrid search combining semantic and traditional text search",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
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
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 50)",
                    },
                },
                "required": ["query"],
            },
        },
        "embed_text": {
            "name": "embed_text",
            "description": "Generate vector embedding for text using RAG backend",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to generate embedding for",
                    },
                    "model": {
                        "type": "string",
                        "description": "Embedding model to use (auto-selected if not specified)",
                    },
                },
                "required": ["text"],
            },
        },
        "index_documents": {
            "name": "index_documents",
            "description": "Index documents for semantic search",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "file_paths": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of file paths to index",
                    },
                    "model": {
                        "type": "string",
                        "description": "Embedding model to use for indexing",
                    },
                    "chunk_size": {
                        "type": "integer",
                        "description": "Size of text chunks for indexing (default: 512)",
                    },
                    "overlap": {
                        "type": "integer",
                        "description": "Overlap between chunks (default: 50)",
                    },
                },
                "required": ["file_paths"],
            },
        },
        "get_search_stats": {
            "name": "get_search_stats",
            "description": "Get semantic search service statistics and health status",
            "inputSchema": {
                "type": "object",
                "properties": {},
            },
        },
    }
