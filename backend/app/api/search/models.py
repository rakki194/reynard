"""
Search API Models
================

Pydantic models for search API requests and responses.
"""

from typing import Any

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Base search request model."""

    query: str = Field(..., description="Search query")
    max_results: int = Field(
        default=20, ge=1, le=100, description="Maximum results to return"
    )
    file_types: list[str] | None = Field(
        default=None, description="File extensions to search"
    )
    directories: list[str] | None = Field(
        default=None, description="Directories to search in"
    )
    case_sensitive: bool = Field(default=False, description="Case-sensitive search")
    whole_word: bool = Field(default=False, description="Match whole words only")
    context_lines: int = Field(
        default=0, ge=0, le=10, description="Context lines around matches"
    )


class SemanticSearchRequest(SearchRequest):
    """Semantic search request model."""

    similarity_threshold: float = Field(
        default=0.1, ge=0.0, le=1.0, description="Minimum similarity score"
    )
    model: str | None = Field(default=None, description="Embedding model to use")
    search_type: str = Field(
        default="hybrid", description="Search type: hybrid, vector, text, code"
    )


class SyntaxSearchRequest(SearchRequest):
    """Syntax search request model."""

    pattern_type: str | None = Field(
        default=None, description="Code pattern type to search for"
    )
    language: str = Field(default="py", description="Programming language")
    expand_query: bool = Field(default=True, description="Expand query with synonyms")


class HybridSearchRequest(SearchRequest):
    """Hybrid search request model."""

    semantic_weight: float = Field(
        default=0.6, ge=0.0, le=1.0, description="Weight for semantic results"
    )
    syntax_weight: float = Field(
        default=0.4, ge=0.0, le=1.0, description="Weight for syntax results"
    )
    similarity_threshold: float = Field(
        default=0.7, ge=0.0, le=1.0, description="Minimum similarity score"
    )


class IndexRequest(BaseModel):
    """Codebase indexing request model."""

    project_root: str | None = Field(default=None, description="Project root directory")
    file_types: list[str] | None = Field(
        default=None, description="File types to index"
    )
    directories: list[str] | None = Field(
        default=None, description="Directories to index"
    )
    force_reindex: bool = Field(
        default=False, description="Force reindexing of existing files"
    )
    chunk_size: int = Field(
        default=512, ge=64, le=2048, description="Text chunk size for indexing"
    )
    overlap: int = Field(default=50, ge=0, le=256, description="Overlap between chunks")


class SearchResult(BaseModel):
    """Individual search result model."""

    file_path: str = Field(..., description="Path to the file")
    line_number: int = Field(..., description="Line number of the match")
    content: str = Field(..., description="Content of the match")
    score: float = Field(..., description="Relevance score")
    match_type: str = Field(..., description="Type of match: semantic, syntax, hybrid")
    context: str | None = Field(default=None, description="Surrounding context")
    snippet: str | None = Field(default=None, description="Code snippet")
    metadata: dict[str, Any] | None = Field(
        default=None, description="Additional metadata"
    )


class SearchResponse(BaseModel):
    """Search response model."""

    success: bool = Field(..., description="Whether the search was successful")
    query: str = Field(..., description="Original search query")
    total_results: int = Field(..., description="Total number of results found")
    results: list[SearchResult] = Field(..., description="Search results")
    search_time: float = Field(..., description="Search execution time in seconds")
    search_strategies: list[str] = Field(
        default=[], description="Search strategies used"
    )
    error: str | None = Field(
        default=None, description="Error message if search failed"
    )


class IndexResponse(BaseModel):
    """Indexing response model."""

    model_config = {"protected_namespaces": ()}

    success: bool = Field(..., description="Whether indexing was successful")
    indexed_files: int = Field(..., description="Number of files indexed")
    total_chunks: int = Field(..., description="Total number of text chunks created")
    index_time: float = Field(..., description="Indexing time in seconds")
    model_used: str = Field(..., description="Embedding model used")
    error: str | None = Field(
        default=None, description="Error message if indexing failed"
    )


class SearchStats(BaseModel):
    """Search statistics model."""

    total_files_indexed: int = Field(..., description="Total files in index")
    total_chunks: int = Field(..., description="Total chunks in index")
    index_size_mb: float = Field(..., description="Index size in MB")
    last_indexed: str | None = Field(
        default=None, description="Last indexing timestamp"
    )
    search_count: int = Field(..., description="Total number of searches performed")
    avg_search_time: float = Field(..., description="Average search time in seconds")
    cache_hit_rate: float = Field(..., description="Cache hit rate percentage")


class QuerySuggestion(BaseModel):
    """Query suggestion model."""

    suggestion: str = Field(..., description="Suggested query")
    confidence: float = Field(..., description="Confidence score")
    type: str = Field(..., description="Suggestion type: synonym, pattern, completion")


class SuggestionsResponse(BaseModel):
    """Query suggestions response model."""

    success: bool = Field(..., description="Whether suggestions were generated")
    query: str = Field(..., description="Original query")
    suggestions: list[QuerySuggestion] = Field(..., description="Query suggestions")
    error: str | None = Field(
        default=None, description="Error message if suggestions failed"
    )
