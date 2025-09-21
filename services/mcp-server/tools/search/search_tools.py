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
from typing import Any

from protocol.tool_registry import register_tool

# Import the unified search service from the backend
import sys

sys.path.append("/home/kade/runeset/reynard/backend")

logger = logging.getLogger(__name__)

try:
    from app.api.search.search import SearchService
    from app.api.search.models import (
        SemanticSearchRequest,
        SyntaxSearchRequest,
        HybridSearchRequest,
        IndexRequest,
    )

    BACKEND_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Backend search service not available: {e}")
    SearchService = None
    SemanticSearchRequest = None
    SyntaxSearchRequest = None
    HybridSearchRequest = None
    IndexRequest = None
    BACKEND_AVAILABLE = False

# Import local search engines
try:
    from .bm25_search import search_needle_in_haystack, ReynardBM25Search
    from .file_search import FileSearchEngine
    from .ripgrep_search import RipgrepSearchEngine

    LOCAL_SEARCH_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Local search engines not available: {e}")
    search_needle_in_haystack = None
    ReynardBM25Search = None
    FileSearchEngine = None
    RipgrepSearchEngine = None
    LOCAL_SEARCH_AVAILABLE = False

# Initialize the unified search service
current_dir = Path(__file__).parent
project_root = current_dir.parent.parent.parent.parent

# Initialize search service if backend is available
if BACKEND_AVAILABLE:
    search_service = SearchService(project_root)
else:
    search_service = None

# Initialize local search engines
if LOCAL_SEARCH_AVAILABLE:
    file_search_engine = FileSearchEngine(project_root)
    ripgrep_search_engine = RipgrepSearchEngine(project_root)
else:
    file_search_engine = None
    ripgrep_search_engine = None


@register_tool(
    name="search_content",
    category="search",
    description="Search for content using unified search service",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def search_content(**kwargs) -> dict[str, Any]:
    """Search for content using unified search service."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_results = arguments.get("top_k", 20)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        # Use syntax search for content search
        request = SyntaxSearchRequest(
            query=query,
            max_results=max_results,
            file_types=file_types,
            directories=directories,
        )

        result = await search_service.syntax_search(request)

        if result.success:
            results_text = (
                f"Found {result.total_results} results in {result.search_time:.3f}s\n\n"
            )
            for i, res in enumerate(result.results[:10], 1):
                results_text += f"{i}. {res.file_path}:{res.line_number}\n"
                results_text += f"   {res.content}\n\n"
        else:
            results_text = f"Search failed: {result.error}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Search Results for '{query}':\n\n{results_text}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_content: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error searching content: {e!s}"}]
        }


@register_tool(
    name="search_enhanced",
    category="search",
    description="Enhanced BM25 search with query expansion, filtering, and intelligent suggestions",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
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
        if not LOCAL_SEARCH_AVAILABLE or search_needle_in_haystack is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Local search engines not available. Please ensure the search modules are properly installed.",
                    }
                ]
            }

        result = search_needle_in_haystack(
            needle=query,
            top_k=top_k,
            expand_query=expand_query,
            project_root=str(project_root),
            file_types=file_types,
            directories=directories,
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Enhanced Search Results for '{query}':\n\n{result}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_enhanced: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error in enhanced search: {e!s}"}]
        }


@register_tool(
    name="search_files",
    category="search",
    description="Search for files by name pattern in the project",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def search_files(**kwargs) -> dict[str, Any]:
    """Search for files by name pattern in the project."""
    arguments = kwargs.get("arguments", {})
    pattern = arguments.get("pattern", "")
    directory = arguments.get("directory")
    recursive = arguments.get("recursive", True)
    include_hidden = arguments.get("include_hidden", False)

    try:
        if not LOCAL_SEARCH_AVAILABLE or file_search_engine is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Local search engines not available. Please ensure the search modules are properly installed.",
                    }
                ]
            }

        result = await file_search_engine.search_files(
            pattern=pattern,
            directory=directory,
            recursive=recursive,
            include_hidden=include_hidden,
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"📁 File Search Results for '{pattern}':\n\n{result}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_files: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error searching files: {e!s}"}]
        }


@register_tool(
    name="list_files",
    category="search",
    description="List files in a directory with optional filtering",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def list_files(**kwargs) -> dict[str, Any]:
    """List files in a directory with optional filtering."""
    arguments = kwargs.get("arguments", {})
    directory = arguments.get("directory", ".")
    pattern = arguments.get("pattern")
    include_hidden = arguments.get("include_hidden", False)

    try:
        if not LOCAL_SEARCH_AVAILABLE or file_search_engine is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Local search engines not available. Please ensure the search modules are properly installed.",
                    }
                ]
            }

        result = await file_search_engine.list_files(
            directory=directory, pattern=pattern, include_hidden=include_hidden
        )

        return {
            "content": [
                {"type": "text", "text": f"📁 Files in '{directory}':\n\n{result}"}
            ]
        }
    except Exception as e:
        logger.exception("Error in list_files: %s", e)
        return {"content": [{"type": "text", "text": f"❌ Error listing files: {e!s}"}]}


@register_tool(
    name="search_code_patterns",
    category="search",
    description="Search for specific code patterns (functions, classes, imports, etc.)",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def search_code_patterns(**kwargs) -> dict[str, Any]:
    """Search for specific code patterns (functions, classes, imports, etc.)."""
    arguments = kwargs.get("arguments", {})
    pattern = arguments.get("pattern", "")
    file_types = arguments.get("file_types", ["*.py", "*.ts", "*.tsx", "*.js", "*.jsx"])
    directories = arguments.get("directories")

    try:
        if not LOCAL_SEARCH_AVAILABLE or ripgrep_search_engine is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Local search engines not available. Please ensure the search modules are properly installed.",
                    }
                ]
            }

        result = await ripgrep_search_engine.search_code_patterns(
            pattern_type=pattern, file_types=file_types, directories=directories
        )

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔍 Code Pattern Search Results for '{pattern}':\n\n{result}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in search_code_patterns: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error searching code patterns: {e!s}"}
            ]
        }


@register_tool(
    name="semantic_search",
    category="search",
    description="Perform semantic search using unified search service",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def semantic_search(**kwargs) -> dict[str, Any]:
    """Perform semantic search using unified search service."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_results = arguments.get("top_k", 20)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")
    similarity_threshold = arguments.get("similarity_threshold", 0.7)

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        request = SemanticSearchRequest(
            query=query,
            max_results=max_results,
            file_types=file_types,
            directories=directories,
            similarity_threshold=similarity_threshold,
        )

        result = await search_service.semantic_search(request)

        if result.success:
            results_text = (
                f"Found {result.total_results} results in {result.search_time:.3f}s\n"
            )
            results_text += f"Strategies: {', '.join(result.search_strategies)}\n\n"
            for i, res in enumerate(result.results[:10], 1):
                results_text += (
                    f"{i}. {res.file_path}:{res.line_number} (score: {res.score:.3f})\n"
                )
                results_text += f"   {res.snippet}\n\n"
        else:
            results_text = f"Search failed: {result.error}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🧠 Semantic Search Results for '{query}':\n\n{results_text}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in semantic_search: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error in semantic search: {e!s}"}]
        }


@register_tool(
    name="hybrid_search",
    category="search",
    description="Perform hybrid search combining semantic and syntax search",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def hybrid_search(**kwargs) -> dict[str, Any]:
    """Perform hybrid search combining semantic and syntax search."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_results = arguments.get("top_k", 20)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        request = HybridSearchRequest(
            query=query,
            max_results=max_results,
            file_types=file_types,
            directories=directories,
        )

        result = await search_service.hybrid_search(request)

        if result.success:
            results_text = (
                f"Found {result.total_results} results in {result.search_time:.3f}s\n"
            )
            results_text += f"Strategies: {', '.join(result.search_strategies)}\n\n"
            for i, res in enumerate(result.results[:10], 1):
                results_text += f"{i}. {res.file_path}:{res.line_number} (score: {res.score:.3f}, type: {res.match_type})\n"
                results_text += f"   {res.snippet}\n\n"
        else:
            results_text = f"Search failed: {result.error}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🔀 Hybrid Search Results for '{query}':\n\n{results_text}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in hybrid_search: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error in hybrid search: {e!s}"}]
        }


@register_tool(
    name="natural_language_search",
    category="search",
    description="Perform natural language search with NLP processing",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def natural_language_search(**kwargs) -> dict[str, Any]:
    """Perform natural language search with NLP processing."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_results = arguments.get("max_results", 10)
    file_types = arguments.get("file_types")
    directories = arguments.get("directories")

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        result = await search_service.natural_language_search(
            query=query,
            max_results=max_results,
            file_types=file_types,
            directories=directories,
        )

        if result.success:
            results_text = (
                f"Found {result.total_results} results in {result.search_time:.3f}s\n"
            )
            results_text += f"Strategies: {', '.join(result.search_strategies)}\n\n"
            for i, res in enumerate(result.results[:10], 1):
                results_text += (
                    f"{i}. {res.file_path}:{res.line_number} (score: {res.score:.3f})\n"
                )
                results_text += f"   {res.snippet}\n\n"
        else:
            results_text = f"Search failed: {result.error}"

        return {
            "content": [
                {
                    "type": "text",
                    "text": f"🗣️ Natural Language Search Results for '{query}':\n\n{results_text}",
                }
            ]
        }
    except Exception as e:
        logger.exception("Error in natural_language_search: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error in natural language search: {e!s}"}
            ]
        }


@register_tool(
    name="get_query_suggestions",
    category="search",
    description="Get intelligent query suggestions based on project content",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def get_query_suggestions(**kwargs) -> dict[str, Any]:
    """Get intelligent query suggestions based on project content."""
    arguments = kwargs.get("arguments", {})
    query = arguments.get("query", "")
    max_suggestions = arguments.get("max_suggestions", 10)

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        # Use the search service to get suggestions
        import asyncio

        result = asyncio.run(
            search_service.get_query_suggestions(query, max_suggestions)
        )

        if result.success:
            suggestions_text = f"💡 Query Suggestions for '{query}':\n\n"
            for i, suggestion in enumerate(result.suggestions[:max_suggestions], 1):
                suggestions_text += f"{i}. {suggestion.suggestion} (confidence: {suggestion.confidence:.2f}, type: {suggestion.type})\n"
        else:
            suggestions_text = f"❌ Failed to get suggestions: {result.error}"

        return {"content": [{"type": "text", "text": suggestions_text}]}
    except Exception as e:
        logger.exception("Error in get_query_suggestions: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error getting query suggestions: {e!s}"}
            ]
        }


@register_tool(
    name="get_search_analytics",
    category="search",
    description="Get search analytics and statistics",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def get_search_analytics(**kwargs) -> dict[str, Any]:
    """Get search analytics and statistics."""
    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        result = await search_service.get_search_stats()

        if hasattr(result, "total_files_indexed"):
            # Direct SearchStats object
            stats_text = "📊 Search Analytics:\n\n"
            stats_text += f"   Total files indexed: {result.total_files_indexed}\n"
            stats_text += f"   Total chunks: {result.total_chunks}\n"
            stats_text += f"   Search count: {result.search_count}\n"
            stats_text += f"   Average search time: {result.avg_search_time:.3f}s\n"
            stats_text += f"   Cache hit rate: {result.cache_hit_rate:.1f}%\n"
        elif isinstance(result, dict) and result.get("success"):
            # Dictionary response
            stats = result.get("data", {})
            stats_text = "📊 Search Analytics:\n\n"
            stats_text += (
                f"   Total files indexed: {stats.get('total_files_indexed', 0)}\n"
            )
            stats_text += f"   Total chunks: {stats.get('total_chunks', 0)}\n"
            stats_text += f"   Search count: {stats.get('search_count', 0)}\n"
            stats_text += (
                f"   Average search time: {stats.get('avg_search_time', 0):.3f}s\n"
            )
            stats_text += f"   Cache hit rate: {stats.get('cache_hit_rate', 0):.1f}%\n"
        else:
            stats_text = f"❌ Failed to get search analytics: {result}"

        return {"content": [{"type": "text", "text": stats_text}]}
    except Exception as e:
        logger.exception("Error in get_search_analytics: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error getting search analytics: {e!s}"}
            ]
        }


@register_tool(
    name="clear_search_cache",
    category="search",
    description="Clear search cache and temporary files",
    execution_type="sync",
    enabled=True,
    dependencies=[],
    config={},
)
def clear_search_cache(**kwargs) -> dict[str, Any]:
    """Clear search cache and temporary files."""
    try:
        if not LOCAL_SEARCH_AVAILABLE:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Local search engines not available. Please ensure the search modules are properly installed.",
                    }
                ]
            }

        # Clear cache by reinitializing search engines
        global file_search_engine, ripgrep_search_engine
        file_search_engine = FileSearchEngine(project_root)
        ripgrep_search_engine = RipgrepSearchEngine(project_root)

        result_text = "✅ Search cache cleared successfully!\n"
        result_text += f"   - File search engine reinitialized\n"
        result_text += f"   - Ripgrep search engine reinitialized\n"
        result_text += f"   - Project root: {project_root}"

        return {
            "content": [
                {"type": "text", "text": f"🗑️ Search Cache Cleared:\n\n{result_text}"}
            ]
        }
    except Exception as e:
        logger.exception("Error in clear_search_cache: %s", e)
        return {
            "content": [
                {"type": "text", "text": f"❌ Error clearing search cache: {e!s}"}
            ]
        }


@register_tool(
    name="reindex_project",
    category="search",
    description="Reindex the entire project for search",
    execution_type="async",
    enabled=True,
    dependencies=[],
    config={},
)
async def reindex_project(**kwargs) -> dict[str, Any]:
    """Reindex the entire project for search."""
    arguments = kwargs.get("arguments", {})
    project_root_path = arguments.get("project_root", str(project_root))
    file_types = arguments.get("file_types", ["py", "ts", "tsx", "js", "jsx"])
    directories = arguments.get("directories")
    force_reindex = arguments.get("force_reindex", True)

    try:
        if not BACKEND_AVAILABLE or search_service is None:
            return {
                "content": [
                    {
                        "type": "text",
                        "text": f"❌ Backend search service not available. Please ensure the FastAPI backend is running.",
                    }
                ]
            }

        request = IndexRequest(
            project_root=project_root_path,
            file_types=file_types,
            directories=directories,
            force_reindex=force_reindex,
        )

        result = await search_service.index_codebase(request)

        if result.success:
            results_text = "✅ Project reindexed successfully!\n"
            results_text += f"   Indexed files: {result.indexed_files}\n"
            results_text += f"   Total chunks: {result.total_chunks}\n"
            results_text += f"   Index time: {result.index_time:.3f}s\n"
            results_text += f"   Model used: {result.model_used}\n"
        else:
            results_text = f"❌ Reindexing failed: {result.error}"

        return {
            "content": [
                {"type": "text", "text": f"🔄 Project Reindexed:\n\n{results_text}"}
            ]
        }
    except Exception as e:
        logger.exception("Error in reindex_project: %s", e)
        return {
            "content": [{"type": "text", "text": f"❌ Error reindexing project: {e!s}"}]
        }
