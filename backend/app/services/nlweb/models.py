"""NLWeb Models for Reynard Backend

Pydantic models for NLWeb service requests, responses, and configuration.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class NLWebToolParameter(BaseModel):
    """Parameter definition for NLWeb tools."""

    name: str = Field(..., description="Parameter name")
    type: str = Field(
        ..., description="Parameter type (string, number, boolean, object, array)",
    )
    description: str = Field(..., description="Human-readable description")
    required: bool = Field(False, description="Whether the parameter is required")
    default: Any | None = Field(None, description="Default value if not provided")
    constraints: dict[str, Any] | None = Field(
        None, description="Validation constraints",
    )


class NLWebTool(BaseModel):
    """NLWeb tool definition."""

    name: str = Field(..., description="Unique identifier for the tool")
    description: str = Field(
        ..., description="Human-readable description of what the tool does",
    )
    category: str = Field(..., description="Category for grouping tools")
    tags: list[str] = Field(
        default_factory=list, description="Tags for search and filtering",
    )
    path: str = Field(..., description="Tool execution path or endpoint")
    method: str = Field("POST", description="HTTP method for tool execution")
    parameters: list[NLWebToolParameter] = Field(
        default_factory=list, description="Required parameters",
    )
    examples: list[str] = Field(
        default_factory=list, description="Example usage prompts",
    )
    enabled: bool = Field(True, description="Whether the tool is currently enabled")
    priority: int = Field(
        50,
        description="Priority for tool selection (higher = more likely to be selected)",
    )
    timeout: int = Field(30000, description="Execution timeout in milliseconds")


class NLWebContext(BaseModel):
    """Context information for NLWeb queries."""

    current_path: str | None = Field(
        None, description="Current working directory or path",
    )
    selected_items: list[str] | None = Field(
        None, description="Selected files or items",
    )
    git_status: dict[str, Any] | None = Field(None, description="Git repository status")
    user_preferences: dict[str, Any] | None = Field(
        None, description="User preferences and settings",
    )
    application_state: dict[str, Any] | None = Field(
        None, description="Current application state",
    )
    user_id: str | None = Field(None, description="User identifier for personalization")
    session_id: str | None = Field(None, description="Session information")


class NLWebSuggestion(BaseModel):
    """Tool suggestion with confidence scoring."""

    tool: NLWebTool = Field(..., description="Tool that was suggested")
    score: float = Field(..., description="Confidence score (0-100)", ge=0, le=100)
    parameters: dict[str, Any] = Field(
        default_factory=dict, description="Suggested parameters for the tool",
    )
    reasoning: str = Field(..., description="Reasoning for why this tool was suggested")
    parameter_hints: dict[str, Any] = Field(
        default_factory=dict, description="Parameter hints for better execution",
    )


class NLWebSuggestionRequest(BaseModel):
    """Request for tool suggestions."""

    query: str = Field(
        ..., description="Natural language query", min_length=1, max_length=1000,
    )
    context: NLWebContext | None = Field(
        None, description="Additional context for the query",
    )
    max_suggestions: int | None = Field(
        5, description="Maximum number of suggestions to return", ge=1, le=20,
    )
    min_score: float | None = Field(
        0.0, description="Minimum confidence score for suggestions", ge=0, le=100,
    )
    include_reasoning: bool | None = Field(
        True, description="Whether to include reasoning in suggestions",
    )


class NLWebSuggestionResponse(BaseModel):
    """Response containing tool suggestions."""

    suggestions: list[NLWebSuggestion] = Field(
        ..., description="List of tool suggestions",
    )
    query: str = Field(..., description="Original query")
    processing_time_ms: float = Field(
        ..., description="Processing time in milliseconds",
    )
    cache_hit: bool = Field(False, description="Whether this was served from cache")
    total_tools_considered: int = Field(
        ..., description="Total number of tools considered",
    )


class NLWebHealthStatus(BaseModel):
    """Health status of NLWeb service."""

    status: str = Field(
        ..., description="Overall health status (healthy, degraded, unhealthy)",
    )
    enabled: bool = Field(..., description="Whether NLWeb is enabled")
    connection_state: str = Field(
        ..., description="Connection state to external services",
    )
    connection_attempts: int = Field(0, description="Number of connection attempts")
    last_ok_timestamp: datetime | None = Field(
        None, description="Last successful operation timestamp",
    )
    base_url: str | None = Field(
        None, description="Base URL for external NLWeb service",
    )
    canary_enabled: bool = Field(False, description="Whether canary rollout is enabled")
    canary_percentage: float = Field(0.0, description="Canary rollout percentage")
    rollback_enabled: bool = Field(
        False, description="Whether emergency rollback is enabled",
    )
    performance_monitoring: bool = Field(
        True, description="Whether performance monitoring is enabled",
    )


class NLWebPerformanceStats(BaseModel):
    """Performance statistics for NLWeb service."""

    total_requests: int = Field(0, description="Total number of requests processed")
    successful_requests: int = Field(0, description="Number of successful requests")
    failed_requests: int = Field(0, description="Number of failed requests")
    avg_processing_time_ms: float = Field(
        0.0, description="Average processing time in milliseconds",
    )
    p95_processing_time_ms: float = Field(
        0.0, description="95th percentile processing time",
    )
    p99_processing_time_ms: float = Field(
        0.0, description="99th percentile processing time",
    )
    cache_hit_rate: float = Field(0.0, description="Cache hit rate percentage")
    cache_hits: int = Field(0, description="Number of cache hits")
    cache_misses: int = Field(0, description="Number of cache misses")
    cache_size: int = Field(0, description="Current cache size")
    max_cache_size: int = Field(1000, description="Maximum cache size")
    rate_limit_hits: int = Field(0, description="Number of rate limit hits")
    stale_served_count: int = Field(0, description="Number of stale responses served")
    degradation_events: int = Field(0, description="Number of degradation events")


class NLWebConfiguration(BaseModel):
    """Configuration for NLWeb service."""

    enabled: bool = Field(True, description="Whether NLWeb is enabled")
    base_url: str | None = Field(
        None, description="Base URL for external NLWeb service",
    )
    suggest_timeout_s: float = Field(
        1.5, description="Timeout for suggestion requests in seconds",
    )
    cache_ttl_s: float = Field(10.0, description="Cache TTL in seconds")
    cache_max_entries: int = Field(64, description="Maximum number of cache entries")
    allow_stale_on_error: bool = Field(
        True, description="Allow returning stale cache on errors",
    )
    warm_timeout_s: float = Field(
        2.0, description="Timeout for warmup requests in seconds",
    )
    rate_limit_window_s: float = Field(60.0, description="Rate limit window in seconds")
    rate_limit_max_requests: int = Field(30, description="Maximum requests per window")
    canary_enabled: bool = Field(False, description="Whether canary rollout is enabled")
    canary_percentage: float = Field(5.0, description="Canary rollout percentage")
    rollback_enabled: bool = Field(
        False, description="Whether emergency rollback is enabled",
    )
    performance_monitoring_enabled: bool = Field(
        True, description="Whether performance monitoring is enabled",
    )
    proxy_max_retries: int = Field(2, description="Maximum retries for proxy requests")
    proxy_backoff_ms: int = Field(
        200, description="Backoff delay for proxy requests in milliseconds",
    )
    proxy_connect_timeout_ms: int = Field(
        2000, description="Connect timeout for proxy requests in milliseconds",
    )
    proxy_read_timeout_ms: int = Field(
        10000, description="Read timeout for proxy requests in milliseconds",
    )
    proxy_sse_idle_timeout_ms: int = Field(
        15000, description="SSE idle timeout in milliseconds",
    )


class NLWebRollbackRequest(BaseModel):
    """Request to enable/disable emergency rollback."""

    enable: bool = Field(..., description="Whether to enable rollback")
    reason: str = Field("No reason provided", description="Reason for rollback action")


class NLWebRollbackResponse(BaseModel):
    """Response for rollback request."""

    success: bool = Field(..., description="Whether the rollback action was successful")
    rollback_enabled: bool = Field(..., description="Current rollback state")
    reason: str = Field(..., description="Reason for the rollback action")
    timestamp: datetime = Field(..., description="Timestamp of the rollback action")


class NLWebVerificationCheck(BaseModel):
    """Individual verification check."""

    name: str = Field(..., description="Check name")
    description: str = Field(..., description="Check description")
    status: str = Field(..., description="Check status (pass, fail, warn, info)")
    value: str | int | float | bool = Field(..., description="Check value")
    threshold: str = Field(..., description="Threshold for the check")


class NLWebVerificationResponse(BaseModel):
    """Verification checklist response."""

    service_available: bool = Field(
        ..., description="Whether NLWeb service is available",
    )
    config_loaded: bool = Field(..., description="Whether configuration is loaded")
    checks: list[NLWebVerificationCheck] = Field(
        default_factory=list, description="List of verification checks",
    )
    overall_status: str = Field(..., description="Overall verification status")


class NLWebAskRequest(BaseModel):
    """Request for NLWeb ask endpoint."""

    query: str = Field(..., description="Natural language query")
    context: NLWebContext | None = Field(None, description="Additional context")
    stream: bool = Field(True, description="Whether to stream the response")
    max_tokens: int | None = Field(None, description="Maximum tokens in response")
    temperature: float | None = Field(
        None, description="Temperature for response generation",
    )


class NLWebMCPRequest(BaseModel):
    """Request for NLWeb MCP endpoint."""

    method: str = Field(..., description="MCP method to call")
    params: dict[str, Any] | None = Field(
        None, description="Parameters for the MCP method",
    )
    id: str = Field("1", description="Request ID for the MCP call")


class NLWebSitesResponse(BaseModel):
    """Response for NLWeb sites endpoint."""

    sites: list[dict[str, Any]] = Field(..., description="List of available sites")
    total_sites: int = Field(..., description="Total number of sites")
