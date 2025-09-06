"""
Pydantic models for tool API endpoints.

This module defines the request and response models used by the tool API
to ensure proper validation and documentation.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


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
    default: Optional[Any] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    choices: Optional[List[Any]] = None
    pattern: Optional[str] = None


class ToolInfo(BaseModel):
    """Information about a tool."""

    name: str
    description: str
    category: str
    tags: List[str]
    required_permission: str
    parameters: List[ToolParameterInfo]
    timeout: Optional[int] = None


class ToolListRequest(BaseModel):
    """Request model for listing tools."""

    category: Optional[str] = Field(None, description="Filter by category")
    tag: Optional[str] = Field(None, description="Filter by tag")
    permission: Optional[str] = Field(None, description="Filter by required permission")


class ToolSearchRequest(BaseModel):
    """Request model for searching tools."""

    query: str = Field(..., description="Search query", min_length=1)


class ToolExecutionRequest(BaseModel):
    """Request model for tool execution."""

    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Tool parameters"
    )
    dry_run: bool = Field(False, description="Whether to perform a dry run")
    timeout: Optional[int] = Field(
        None, description="Custom timeout in seconds", ge=1, le=300
    )


class ToolExecutionResult(BaseModel):
    """Response model for tool execution."""

    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time: float
    dry_run: bool = False
    tool_name: str


class ToolListResponse(BaseModel):
    """Response model for tool listing."""

    tools: List[ToolInfo]
    total_count: int
    filtered_count: int
    categories: List[str]
    tags: List[str]


class ToolSearchResponse(BaseModel):
    """Response model for tool search."""

    tools: List[ToolInfo]
    query: str
    total_results: int


class ToolCategoriesResponse(BaseModel):
    """Response model for tool categories."""

    categories: List[str]


class ToolStatsResponse(BaseModel):
    """Response model for tool registry statistics."""

    total_tools: int
    categories: int
    tags: int
    tools_by_category: Dict[str, int]
    tools_by_permission: Dict[str, int]


class ErrorResponse(BaseModel):
    """Standard error response model."""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


# ---------- RAG Models ----------


class RAGIngestItem(BaseModel):
    source: Optional[str] = None
    content: str


class RAGIngestRequest(BaseModel):
    items: List[RAGIngestItem]
    model: Optional[str] = None


class RAGIngestResponse(BaseModel):
    processed: int
    failures: int
    total: int


class RAGReindexFilters(BaseModel):
    modality: Optional[str] = None
    model: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class RAGReindexRequest(BaseModel):
    filters: Optional[RAGReindexFilters] = None


class RAGQueryRequest(BaseModel):
    q: str
    modality: str = "docs"  # docs|code|captions|images
    top_k: int = 20
    w_vec: Optional[float] = None
    w_text: Optional[float] = None


class RAGQueryHit(BaseModel):
    id: Optional[int] = None
    score: float
    extra: Dict[str, Any] = {}
    highlights: Optional[List[str]] = None


class RAGQueryResponse(BaseModel):
    hits: List[RAGQueryHit]
    total: int
    modality: Optional[str] = None
