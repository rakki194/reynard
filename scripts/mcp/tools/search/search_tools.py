#!/usr/bin/env python3
"""
Unified Search Tools
===================

MCP tool handlers for the unified search system.
Now uses the new @register_tool decorator system for automatic registration.

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

from services.search_service import SearchService
from protocol.tool_registry import register_tool

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

# Initialize search engines
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent.parent.parent
search_service = SearchService()
file_search_engine = FileSearchEngine(project_root)
ripgrep_search_engine = RipgrepSearchEngine(project_root)
semantic_search_engine = SemanticSearchEngine()


@register_tool(
    name="search_content",
    category="search",
    description="Search for content using BM25 with query expansion",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def search_content(**kwargs) -> dict[str, Any]:
    """Search for content using BM25 with query expansion."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    top_k = arguments.get("top_k", 20)
    expand_query = arguments.get("expand_query", True)
    
    try:
        result = search_needle_in_haystack(
            query=query,
            top_k=top_k,
            expand_query=expand_query,
            project_root=project_root
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Search Results for '{query}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_content: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error searching content: {e!s}"
                }
            ]
        }


@register_tool(
    name="search_enhanced",
    category="search",
    description="Enhanced BM25 search with query expansion, filtering, and intelligent suggestions",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def search_enhanced(**kwargs) -> dict[str, Any]:
    """Enhanced BM25 search with query expansion, filtering, and intelligent suggestions."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    top_k = arguments.get("top_k", 20)
    expand_query = arguments.get("expand_query", True)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")
    
    try:
        result = search_needle_in_haystack(
            query=query,
            top_k=top_k,
            expand_query=expand_query,
            project_root=project_root,
            file_types=file_types,
            directories=directories
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Enhanced Search Results for '{query}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_enhanced: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error in enhanced search: {e!s}"
                }
            ]
        }


@register_tool(
    name="search_files",
    category="search",
    description="Search for files by name pattern in the project",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def search_files(**kwargs) -> dict[str, Any]:
    """Search for files by name pattern in the project."""
    arguments = kwargs.get("arguments", {})
    pattern = arguments.get("pattern", "")
    directory = arguments.get("directory")
    recursive = arguments.get("recursive", True)
    include_hidden = arguments.get("include_hidden", False)
    
    try:
        result = await file_search_engine.search_files(
            pattern=pattern,
            directory=directory,
            recursive=recursive,
            include_hidden=include_hidden
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📁 File Search Results for '{pattern}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_files: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error searching files: {e!s}"
                }
            ]
        }


@register_tool(
    name="list_files",
    category="search",
    description="List files in a directory with optional filtering",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def list_files(**kwargs) -> dict[str, Any]:
    """List files in a directory with optional filtering."""
    arguments = kwargs.get("arguments", {})
    directory = arguments.get("directory", ".")
    pattern = arguments.get("pattern")
    include_hidden = arguments.get("include_hidden", False)
    
    try:
        result = await file_search_engine.list_files(
            directory=directory,
            pattern=pattern,
            include_hidden=include_hidden
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📁 Files in '{directory}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in list_files: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error listing files: {e!s}"
                }
            ]
        }


@register_tool(
    name="search_code_patterns",
    category="search",
    description="Search for specific code patterns (functions, classes, imports, etc.)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def search_code_patterns(**kwargs) -> dict[str, Any]:
    """Search for specific code patterns (functions, classes, imports, etc.)."""
    arguments = kwargs.get("arguments", {})
    pattern = arguments.get("pattern", "")
    file_types = arguments.get("file_types", ["*.py", "*.ts", "*.tsx", "*.js", "*.jsx"])
    directories = arguments.get("directories")
    
    try:
        result = await ripgrep_search_engine.search_code_patterns(
            pattern=pattern,
            file_types=file_types,
            directories=directories
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Code Pattern Search Results for '{pattern}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_code_patterns: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error searching code patterns: {e!s}"
                }
            ]
        }


@register_tool(
    name="semantic_search",
    category="search",
    description="Perform semantic search using vector embeddings and RAG backend",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def semantic_search(**kwargs) -> dict[str, Any]:
    """Perform semantic search using vector embeddings and RAG backend."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    search_type = arguments.get("search_type", "hybrid")
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")
    top_k = arguments.get("top_k", 20)
    similarity_threshold = arguments.get("similarity_threshold", 0.7)
    model = arguments.get("model")
    
    try:
        result = await semantic_search_engine.semantic_search(
            query=query,
            search_type=search_type,
            file_types=file_types,
            directories=directories,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
            model=model
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🧠 Semantic Search Results for '{query}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in semantic_search: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error in semantic search: {e!s}"
                }
            ]
        }


@register_tool(
    name="hybrid_search",
    category="search",
    description="Perform hybrid search combining semantic and traditional text search",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def hybrid_search(**kwargs) -> dict[str, Any]:
    """Perform hybrid search combining semantic and traditional text search."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    top_k = arguments.get("top_k", 20)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")
    
    try:
        result = await semantic_search_engine.hybrid_search(
            query=query,
            top_k=top_k,
            file_types=file_types,
            directories=directories
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔀 Hybrid Search Results for '{query}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in hybrid_search: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error in hybrid search: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_query_suggestions",
    category="search",
    description="Get intelligent query suggestions based on project content",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_query_suggestions(**kwargs) -> dict[str, Any]:
    """Get intelligent query suggestions based on project content."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_suggestions = arguments.get("max_suggestions", 10)
    
    try:
        result = get_query_suggestions(
            query=query,
            max_suggestions=max_suggestions,
            project_root=project_root
        )
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"💡 Query Suggestions for '{query}':\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in get_query_suggestions: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting query suggestions: {e!s}"
                }
            ]
        }


@register_tool(
    name="get_search_analytics",
    category="search",
    description="Get search analytics and statistics",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def get_search_analytics(**kwargs) -> dict[str, Any]:
    """Get search analytics and statistics."""
    try:
        result = get_search_stats(project_root=project_root)
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📊 Search Analytics:\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in get_search_analytics: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error getting search analytics: {e!s}"
                }
            ]
        }


@register_tool(
    name="clear_search_cache",
    category="search",
    description="Clear search cache and temporary files",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={}
)
def clear_search_cache(**kwargs) -> dict[str, Any]:
    """Clear search cache and temporary files."""
    try:
        result = clear_search_cache(project_root=project_root)
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🗑️ Search Cache Cleared:\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in clear_search_cache: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error clearing search cache: {e!s}"
                }
            ]
        }


@register_tool(
    name="reindex_project",
    category="search",
    description="Reindex the entire project for search",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={}
)
async def reindex_project(**kwargs) -> dict[str, Any]:
    """Reindex the entire project for search."""
    try:
        result = await reindex_project(project_root=project_root)
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔄 Project Reindexed:\n\n{result}"
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in reindex_project: %s", e)
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"❌ Error reindexing project: {e!s}"
                }
            ]
        }