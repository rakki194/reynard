"""Pydantic models for tool API endpoints.

This module defines the request and response models used by the tool API
to ensure proper validation and documentation.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ToolCategory(str, Enum):
    """Tool categories for organization."""

    GIT = "git"
    FILE = "file"
    SYSTEM = "system"
    DATA = "data"
    UTILITY = "utility"


class ToolPermission(str, Enum):
    """Tool permission levels."""

    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    ADMIN = "admin"


class ToolParameterInfo(BaseModel):
    """Information about a tool parameter."""

    name: str
    type: str
    description: str
    required: bool
    default: Any | None = None
    min_value: float | None = None
    max_value: float | None = None
    min_length: int | None = None
    max_length: int | None = None
    choices: list[Any] | None = None
    pattern: str | None = None


class ToolInfo(BaseModel):
    """Information about a tool."""

    name: str
    description: str
    category: str
    tags: list[str]
    required_permission: str
    parameters: list[ToolParameterInfo]
    timeout: int | None = None


class ToolListRequest(BaseModel):
    """Request model for listing tools."""

    category: str | None = Field(None, description="Filter by category")
    tag: str | None = Field(None, description="Filter by tag")
    permission: str | None = Field(None, description="Filter by required permission")


class ToolSearchRequest(BaseModel):
    """Request model for searching tools."""

    query: str = Field(..., description="Search query", min_length=1)


class ToolExecutionRequest(BaseModel):
    """Request model for tool execution."""

    parameters: dict[str, Any] = Field(
        default_factory=dict,
        description="Tool parameters",
    )
    dry_run: bool = Field(False, description="Whether to perform a dry run")
    timeout: int | None = Field(
        None,
        description="Custom timeout in seconds",
        ge=1,
        le=300,
    )


class ToolExecutionResult(BaseModel):
    """Response model for tool execution."""

    success: bool
    result: dict[str, Any] | None = None
    error: str | None = None
    execution_time: float
    dry_run: bool = False
    tool_name: str


class ToolListResponse(BaseModel):
    """Response model for tool listing."""

    tools: list[ToolInfo]
    total_count: int
    filtered_count: int
    categories: list[str]
    tags: list[str]


class ToolSearchResponse(BaseModel):
    """Response model for tool search."""

    tools: list[ToolInfo]
    query: str
    total_results: int


class ToolCategoriesResponse(BaseModel):
    """Response model for tool categories."""

    categories: list[str]


class ToolStatsResponse(BaseModel):
    """Response model for tool registry statistics."""

    total_tools: int
    categories: int
    tags: int
    tools_by_category: dict[str, int]
    tools_by_permission: dict[str, int]


class ErrorResponse(BaseModel):
    """Standard error response model."""

    error: str
    detail: str | None = None
    code: str | None = None


# ---------- RAG Models ----------


class RAGIngestItem(BaseModel):
    source: str | None = None
    content: str


class RAGIngestRequest(BaseModel):
    items: list[RAGIngestItem]
    model: str | None = None


class RAGIngestResponse(BaseModel):
    processed: int
    failures: int
    total: int


class RAGReindexFilters(BaseModel):
    modality: str | None = None
    model: str | None = None
    start_date: str | None = None
    end_date: str | None = None


class RAGReindexRequest(BaseModel):
    filters: RAGReindexFilters | None = None


class RAGQueryRequest(BaseModel):
    q: str
    modality: str = "docs"  # docs|code|captions|images
    top_k: int = 20
    w_vec: float | None = None
    w_text: float | None = None


class RAGQueryHit(BaseModel):
    id: int | None = None
    score: float
    extra: dict[str, Any] = {}
    highlights: list[str] | None = None


class RAGQueryResponse(BaseModel):
    hits: list[RAGQueryHit]
    total: int
    modality: str | None = None
