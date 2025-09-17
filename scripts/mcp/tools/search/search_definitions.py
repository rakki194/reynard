#!/usr/bin/env python3
"""
Search Tool Definitions
======================

MCP tool definitions for the unified search system.
Consolidates all search-related tool schemas into a single module.
"""

from typing import Any, Dict, List

# BM25 Search Tools
BM25_SEARCH_DEFINITION: Dict[str, Any] = {
    "name": "bm25_search",
    "description": "Perform BM25 text search with query expansion and filtering",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Search query string"},
            "top_k": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 20,
            },
            "expand_query": {
                "type": "boolean",
                "description": "Whether to expand query with synonyms",
                "default": True,
            },
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File extensions to search in (e.g., ['.py', '.ts'])",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
        },
        "required": ["query"],
    },
}

NEEDLE_IN_HAYSTACK_DEFINITION: Dict[str, Any] = {
    "name": "search_needle_in_haystack",
    "description": "Find a specific string or pattern in the codebase",
    "inputSchema": {
        "type": "object",
        "properties": {
            "needle": {
                "type": "string",
                "description": "String or pattern to search for",
            },
            "project_root": {
                "type": "string",
                "description": "Root directory to search in",
                "default": None,
            },
            "top_k": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 20,
            },
            "expand_query": {
                "type": "boolean",
                "description": "Whether to expand query with synonyms",
                "default": True,
            },
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File extensions to search in",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
        },
        "required": ["needle"],
    },
}

# File Search Tools
SEARCH_FILES_DEFINITION: Dict[str, Any] = {
    "name": "search_files",
    "description": "Search for files by name pattern",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pattern": {
                "type": "string",
                "description": "File name pattern to search for",
            },
            "directory": {
                "type": "string",
                "description": "Directory to search in",
                "default": None,
            },
            "recursive": {
                "type": "boolean",
                "description": "Whether to search recursively",
                "default": True,
            },
            "include_hidden": {
                "type": "boolean",
                "description": "Whether to include hidden files",
                "default": False,
            },
        },
        "required": ["pattern"],
    },
}

LIST_FILES_DEFINITION: Dict[str, Any] = {
    "name": "list_files",
    "description": "List files in a directory with optional filtering",
    "inputSchema": {
        "type": "object",
        "properties": {
            "directory": {
                "type": "string",
                "description": "Directory to list files from",
                "default": None,
            },
            "pattern": {
                "type": "string",
                "description": "File pattern to filter by",
                "default": None,
            },
            "include_hidden": {
                "type": "boolean",
                "description": "Whether to include hidden files",
                "default": False,
            },
        },
    },
}

SEARCH_CONTENT_DEFINITION: Dict[str, Any] = {
    "name": "search_content",
    "description": "Search for content within files",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "Text to search for"},
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File extensions to search in",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
            "case_sensitive": {
                "type": "boolean",
                "description": "Whether search is case sensitive",
                "default": False,
            },
            "whole_word": {
                "type": "boolean",
                "description": "Whether to match whole words only",
                "default": False,
            },
            "max_count": {
                "type": "integer",
                "description": "Maximum number of matches to return",
                "default": None,
            },
            "context_lines": {
                "type": "integer",
                "description": "Number of context lines to include",
                "default": 0,
            },
        },
        "required": ["query"],
    },
}

SEARCH_CODE_PATTERNS_DEFINITION: Dict[str, Any] = {
    "name": "search_code_patterns",
    "description": "Search for specific code patterns (functions, classes, imports, etc.)",
    "inputSchema": {
        "type": "object",
        "properties": {
            "pattern_type": {
                "type": "string",
                "description": "Type of pattern to search for",
                "enum": ["function", "class", "import", "todo", "fixme", "comment"],
            },
            "language": {
                "type": "string",
                "description": "Programming language",
                "default": "py",
            },
            "name": {
                "type": "string",
                "description": "Specific name to search for",
                "default": None,
            },
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File extensions to search in",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
        },
        "required": ["pattern_type"],
    },
}

# Semantic Search Tools
SEMANTIC_SEARCH_DEFINITION: Dict[str, Any] = {
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
                "description": "Type of search to perform",
                "enum": ["hybrid", "vector", "text", "code", "context"],
                "default": "hybrid",
            },
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "File extensions to search in",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
            "top_k": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 20,
            },
            "similarity_threshold": {
                "type": "number",
                "description": "Minimum similarity score for results",
                "default": 0.7,
            },
            "model": {
                "type": "string",
                "description": "Embedding model to use",
                "default": None,
            },
        },
        "required": ["query"],
    },
}

HYBRID_SEARCH_DEFINITION: Dict[str, Any] = {
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
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Directories to search in",
                "default": None,
            },
            "max_results": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 50,
            },
        },
        "required": ["query"],
    },
}

EMBED_TEXT_DEFINITION: Dict[str, Any] = {
    "name": "embed_text",
    "description": "Generate vector embedding for text using RAG backend",
    "inputSchema": {
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "Text to embed"},
            "model": {
                "type": "string",
                "description": "Embedding model to use",
                "default": None,
            },
        },
        "required": ["text"],
    },
}

INDEX_DOCUMENTS_DEFINITION: Dict[str, Any] = {
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
                "description": "Embedding model to use",
                "default": None,
            },
            "chunk_size": {
                "type": "integer",
                "description": "Size of text chunks for indexing",
                "default": 512,
            },
            "overlap": {
                "type": "integer",
                "description": "Overlap between chunks",
                "default": 50,
            },
        },
        "required": ["file_paths"],
    },
}

# Enhanced Search Tools
SEARCH_ENHANCED_DEFINITION: Dict[str, Any] = {
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
                "description": "Root directory of the project to search",
                "default": None,
            },
            "top_k": {
                "type": "integer",
                "description": "Number of top results to return",
                "default": 20,
            },
            "expand_query": {
                "type": "boolean",
                "description": "Whether to expand query with synonyms and related terms",
                "default": True,
            },
            "file_types": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Filter results by file types",
                "default": None,
            },
            "directories": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Filter results by directories",
                "default": None,
            },
            "include_agent_context": {
                "type": "boolean",
                "description": "Include ECS agent spatial context in search results",
                "default": False,
            },
            "agent_id": {
                "type": "string",
                "description": "Agent ID to include spatial context for",
                "default": None,
            },
        },
        "required": ["query"],
    },
}

# Utility Tools
GET_QUERY_SUGGESTIONS_DEFINITION: Dict[str, Any] = {
    "name": "get_query_suggestions",
    "description": "Get intelligent query suggestions based on search history and context",
    "inputSchema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Base query to get suggestions for",
            },
            "max_suggestions": {
                "type": "integer",
                "description": "Maximum number of suggestions to return",
                "default": 5,
            },
        },
        "required": ["query"],
    },
}

GET_SEARCH_ANALYTICS_DEFINITION: Dict[str, Any] = {
    "name": "get_search_analytics",
    "description": "Get search analytics and statistics",
    "inputSchema": {"type": "object", "properties": {}},
}

CLEAR_SEARCH_CACHE_DEFINITION: Dict[str, Any] = {
    "name": "clear_search_cache",
    "description": "Clear the search cache",
    "inputSchema": {"type": "object", "properties": {}},
}

REINDEX_PROJECT_DEFINITION: Dict[str, Any] = {
    "name": "reindex_project",
    "description": "Reindex the entire project for search",
    "inputSchema": {
        "type": "object",
        "properties": {
            "project_root": {
                "type": "string",
                "description": "Root directory of the project to reindex",
                "default": None,
            }
        },
    },
}

# All search tool definitions
SEARCH_TOOL_DEFINITIONS: List[Dict[str, Any]] = [
    BM25_SEARCH_DEFINITION,
    NEEDLE_IN_HAYSTACK_DEFINITION,
    SEARCH_FILES_DEFINITION,
    LIST_FILES_DEFINITION,
    SEARCH_CONTENT_DEFINITION,
    SEARCH_CODE_PATTERNS_DEFINITION,
    SEMANTIC_SEARCH_DEFINITION,
    HYBRID_SEARCH_DEFINITION,
    EMBED_TEXT_DEFINITION,
    INDEX_DOCUMENTS_DEFINITION,
    SEARCH_ENHANCED_DEFINITION,
    GET_QUERY_SUGGESTIONS_DEFINITION,
    GET_SEARCH_ANALYTICS_DEFINITION,
    CLEAR_SEARCH_CACHE_DEFINITION,
    REINDEX_PROJECT_DEFINITION,
]
