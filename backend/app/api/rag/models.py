"""
RAG API Models for Reynard Backend

Pydantic models for RAG API requests and responses with enhanced semantic search
and analytics capabilities.
"""

import time
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class RAGQueryRequest(BaseModel):
    """Enhanced request model for RAG search queries with semantic search capabilities."""

    q: str = Field(..., description="Search query", min_length=1, max_length=1000)
    modality: str | None = Field(
        None, description="Search modality (docs, code, captions, images)"
    )
    top_k: int | None = Field(
        20, description="Number of results to return", ge=1, le=100
    )
    similarity_threshold: float | None = Field(
        0.0, description="Minimum similarity score", ge=0.0, le=1.0
    )
    enable_reranking: bool | None = Field(False, description="Enable result reranking")

    # Enhanced semantic search fields
    enable_semantic_enhancement: bool | None = Field(
        True, description="Enable semantic query enhancement"
    )
    intent_detection: bool | None = Field(
        True, description="Enable query intent detection"
    )
    context_aware_search: bool | None = Field(
        False, description="Enable context-aware search optimization"
    )
    session_id: str | None = Field(None, description="Session identifier for context")
    user_id: str | None = Field(None, description="User identifier for personalization")

    # Advanced search parameters
    query_expansion: bool | None = Field(
        True, description="Enable automatic query expansion"
    )
    semantic_boost: float | None = Field(
        1.0, description="Semantic relevance boost factor", ge=0.1, le=2.0
    )
    temporal_weight: float | None = Field(
        0.1, description="Temporal relevance weight", ge=0.0, le=1.0
    )

    @field_validator("q")
    @classmethod
    def validate_query(cls, v: str) -> str:
        """Validate search query."""
        if not v or not v.strip():
            raise ValueError("Query cannot be empty or whitespace only")

        # Check for potentially malicious content
        dangerous_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"eval\s*\(",
            r"exec\s*\(",
        ]

        import re

        for pattern in dangerous_patterns:
            if re.search(pattern, v, re.IGNORECASE):
                raise ValueError("Query contains potentially dangerous content")

        return v.strip()

    @field_validator("modality")
    @classmethod
    def validate_modality(cls, v: Optional[str]) -> Optional[str]:
        """Validate search modality."""
        if v is not None:
            valid_modalities = ["docs", "code", "captions", "images", "all"]
            if v not in valid_modalities:
                raise ValueError(
                    f"Invalid modality. Must be one of: {valid_modalities}"
                )
        return v

    @model_validator(mode="after")
    def validate_query_parameters(self) -> "RAGQueryRequest":
        """Validate query parameters for consistency."""
        # Ensure top_k is reasonable for the query length
        query_length = len(self.q.split())
        if self.top_k and self.top_k > query_length * 5:
            # Adjust top_k if it's too high for the query complexity
            self.top_k = min(self.top_k, query_length * 5)

        return self


class RAGQueryHit(BaseModel):
    """Enhanced individual search result hit with semantic search metadata."""

    id: int | str | None = None
    score: float = Field(..., description="Similarity score", ge=0.0, le=1.0)
    highlights: list[str] | None = None
    extra: dict[str, Any] | None = None

    # Enhanced semantic search fields
    enhanced_score: float | None = Field(
        None, description="Enhanced semantic score", ge=0.0, le=1.0
    )
    relevance_factors: dict[str, float] | None = Field(
        None, description="Relevance factor breakdown"
    )
    semantic_tags: list[str] | None = Field(None, description="Semantic content tags")
    context_matches: list[str] | None = Field(
        None, description="Context match indicators"
    )
    rerank_reason: str | None = Field(None, description="Reason for reranking")
    intent_alignment: float | None = Field(
        None, description="Intent alignment score", ge=0.0, le=1.0
    )
    content_quality: float | None = Field(
        None, description="Content quality score", ge=0.0, le=1.0
    )

    # File navigation information
    file_path: str | None = None
    file_content: str | None = None
    file_metadata: dict[str, Any] | None = None
    chunk_index: int | None = None
    chunk_text: str | None = None
    chunk_tokens: int | None = None
    chunk_metadata: dict[str, Any] | None = None

    # Image information
    image_path: str | None = None
    image_id: str | None = None
    thumbnail_path: str | None = None
    preview_path: str | None = None
    image_metadata: dict[str, Any] | None = None
    image_dimensions: dict[str, int] | None = None
    image_size: int | None = None
    image_format: str | None = None
    embedding_vector: list[float] | None = None


class RAGQueryResponse(BaseModel):
    """Enhanced response model for RAG search queries with analytics and semantic search metadata."""

    hits: list[RAGQueryHit] = Field(..., description="Search results")
    total: int = Field(..., description="Total number of results", ge=0)
    query_time: float | None = Field(
        None, description="Query processing time in seconds", ge=0.0
    )
    embedding_time: float | None = Field(
        None, description="Embedding generation time in seconds", ge=0.0
    )
    search_time: float | None = Field(
        None, description="Vector search time in seconds", ge=0.0
    )
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")

    # Enhanced semantic search metadata
    query_id: str | None = Field(None, description="Unique query identifier")
    enhanced_query: str | None = Field(None, description="Enhanced/expanded query text")
    detected_intent: dict[str, Any] | None = Field(
        None, description="Detected query intent"
    )
    semantic_enhancement_applied: bool | None = Field(
        None, description="Whether semantic enhancement was applied"
    )
    reranking_applied: bool | None = Field(
        None, description="Whether reranking was applied"
    )

    # Performance analytics
    total_time: float | None = Field(None, description="Total processing time", ge=0.0)
    cache_hit: bool | None = Field(
        None, description="Whether result was served from cache"
    )
    optimization_applied: dict[str, Any] | None = Field(
        None, description="Applied optimizations"
    )

    # Search effectiveness metrics
    avg_result_score: float | None = Field(
        None, description="Average result score", ge=0.0, le=1.0
    )
    result_quality_distribution: dict[str, int] | None = Field(
        None, description="Quality score distribution"
    )
    semantic_coverage: float | None = Field(
        None, description="Semantic coverage score", ge=0.0, le=1.0
    )


class RAGIngestItem(BaseModel):
    """Individual document/item for ingestion."""

    source: str | None = Field(None, description="Document source identifier")
    content: str = Field(..., description="Document content")


class RAGIngestRequest(BaseModel):
    """Request model for document ingestion."""

    items: list[RAGIngestItem] = Field(..., description="Documents to ingest")
    model: str | None = Field(None, description="Embedding model to use")
    batch_size: int | None = Field(16, description="Batch size for processing")
    force_reindex: bool | None = Field(
        False, description="Force reindexing of existing documents"
    )


class RAGIngestResponse(BaseModel):
    """Response model for document ingestion."""

    processed: int = Field(..., description="Number of documents processed")
    total: int = Field(..., description="Total number of documents")
    failures: int = Field(0, description="Number of failed documents")
    processing_time: float | None = Field(
        None, description="Total processing time in seconds"
    )
    message: str | None = Field(None, description="Status message")


class RAGConfigRequest(BaseModel):
    """Request model for RAG configuration updates."""

    config: dict[str, Any] = Field(..., description="Configuration updates")


class RAGConfigResponse(BaseModel):
    """Response model for RAG configuration."""

    config: dict[str, Any] = Field(..., description="Current configuration")
    updated: bool = Field(False, description="Whether configuration was updated")


class RAGStatsResponse(BaseModel):
    """Response model for RAG statistics."""

    total_documents: int = Field(0, description="Total number of documents")
    total_chunks: int = Field(0, description="Total number of chunks")
    chunks_with_embeddings: int = Field(
        0, description="Number of chunks with embeddings"
    )
    embedding_coverage: float = Field(0.0, description="Embedding coverage percentage")
    default_model: str = Field("", description="Default embedding model")
    vector_db_enabled: bool = Field(
        False, description="Whether vector database is enabled"
    )
    cache_size: int = Field(0, description="Cache size in bytes")


class RAGIndexingStatusResponse(BaseModel):
    """Response model for indexing status."""

    queue_depth: int = Field(0, description="Number of items in queue")
    in_flight: int = Field(0, description="Number of items being processed")
    processing_rate: float = Field(0.0, description="Items processed per second")
    estimated_completion: str | None = Field(
        None, description="Estimated completion time"
    )


# Enhanced Semantic Search Models


class QueryIntentRequest(BaseModel):
    """Request model for query intent detection."""

    query: str = Field(
        ..., description="Query to analyze", min_length=1, max_length=1000
    )
    context: dict[str, Any] | None = Field(
        None, description="Additional context for intent detection"
    )


class QueryIntentResponse(BaseModel):
    """Response model for query intent detection."""

    intent_type: str = Field(..., description="Detected intent type")
    confidence: float = Field(..., description="Confidence score", ge=0.0, le=1.0)
    keywords: list[str] = Field(..., description="Extracted keywords")
    entities: list[str] = Field(..., description="Extracted entities")
    context: dict[str, Any] | None = Field(None, description="Additional context")


class SemanticEnhancementRequest(BaseModel):
    """Request model for semantic query enhancement."""

    query: str = Field(
        ..., description="Query to enhance", min_length=1, max_length=1000
    )
    intent_type: str | None = Field(None, description="Known intent type")
    enable_expansion: bool | None = Field(True, description="Enable query expansion")
    enable_synonyms: bool | None = Field(True, description="Enable synonym expansion")
    context: dict[str, Any] | None = Field(None, description="Search context")


class SemanticEnhancementResponse(BaseModel):
    """Response model for semantic query enhancement."""

    original_query: str = Field(..., description="Original query")
    enhanced_query: str = Field(..., description="Enhanced query")
    enhancement_applied: bool = Field(
        ..., description="Whether enhancement was applied"
    )
    enhancement_details: dict[str, Any] | None = Field(
        None, description="Enhancement details"
    )


# Query Analytics Models


class QueryMetricsRequest(BaseModel):
    """Request model for recording query metrics."""

    query_id: str = Field(..., description="Unique query identifier")
    query_text: str = Field(..., description="Query text")
    processing_time: float = Field(..., description="Processing time", ge=0.0)
    embedding_time: float = Field(..., description="Embedding time", ge=0.0)
    search_time: float = Field(..., description="Search time", ge=0.0)
    results_count: int = Field(..., description="Number of results", ge=0)
    top_score: float = Field(..., description="Top result score", ge=0.0, le=1.0)
    avg_score: float = Field(..., description="Average result score", ge=0.0, le=1.0)
    session_id: str | None = Field(None, description="Session identifier")
    user_id: str | None = Field(None, description="User identifier")


class QueryMetricsResponse(BaseModel):
    """Response model for query metrics recording."""

    recorded: bool = Field(..., description="Whether metrics were recorded")
    query_id: str = Field(..., description="Query identifier")
    timestamp: float = Field(..., description="Recording timestamp")


class UserFeedbackRequest(BaseModel):
    """Request model for user feedback."""

    query_id: str = Field(..., description="Query identifier")
    feedback_type: str = Field(..., description="Type of feedback")
    rating: float | None = Field(None, description="Rating score", ge=0.0, le=1.0)
    comments: str | None = Field(None, description="User comments", max_length=1000)
    clicked_results: list[str] | None = Field(None, description="Clicked result IDs")


class UserFeedbackResponse(BaseModel):
    """Response model for user feedback."""

    recorded: bool = Field(..., description="Whether feedback was recorded")
    query_id: str = Field(..., description="Query identifier")
    feedback_type: str = Field(..., description="Feedback type")
    timestamp: float = Field(..., description="Recording timestamp")


class PerformanceStatsRequest(BaseModel):
    """Request model for performance statistics."""

    time_window_hours: int | None = Field(
        24, description="Time window in hours", ge=1, le=168
    )


class PerformanceStatsResponse(BaseModel):
    """Response model for performance statistics."""

    total_queries: int = Field(..., description="Total number of queries")
    avg_processing_time: float = Field(..., description="Average processing time")
    avg_embedding_time: float = Field(..., description="Average embedding time")
    avg_search_time: float = Field(..., description="Average search time")
    avg_total_time: float = Field(..., description="Average total time")
    avg_results_count: float = Field(..., description="Average results count")
    avg_top_score: float = Field(..., description="Average top score")
    avg_avg_score: float = Field(..., description="Average average score")
    p95_processing_time: float = Field(
        ..., description="95th percentile processing time"
    )
    p99_processing_time: float = Field(
        ..., description="99th percentile processing time"
    )
    success_rate: float = Field(..., description="Success rate", ge=0.0, le=1.0)
    error_rate: float = Field(..., description="Error rate", ge=0.0, le=1.0)
    time_window_hours: int = Field(..., description="Time window used")


class UsageInsightsRequest(BaseModel):
    """Request model for usage insights."""

    time_window_hours: int | None = Field(
        24, description="Time window in hours", ge=1, le=168
    )


class UsageInsightsResponse(BaseModel):
    """Response model for usage insights."""

    popular_queries: list[tuple[str, int]] = Field(
        ..., description="Popular queries with counts"
    )
    query_trends: dict[str, list[tuple[float, int]]] = Field(
        ..., description="Query trends over time"
    )
    peak_usage_hours: list[int] = Field(..., description="Peak usage hours")
    user_behavior_patterns: dict[str, Any] = Field(
        ..., description="User behavior patterns"
    )
    search_effectiveness: dict[str, float] = Field(
        ..., description="Search effectiveness metrics"
    )
    optimization_opportunities: list[str] = Field(
        ..., description="Optimization opportunities"
    )
    time_window_hours: int = Field(..., description="Time window used")


class AnalyticsReportRequest(BaseModel):
    """Request model for analytics report generation."""

    time_period: str | None = Field(
        "24h", description="Time period (e.g., 24h, 7d, 30d)"
    )
    include_recommendations: bool | None = Field(
        True, description="Include optimization recommendations"
    )


class AnalyticsReportResponse(BaseModel):
    """Response model for analytics report."""

    report_id: str = Field(..., description="Report identifier")
    generated_at: float = Field(..., description="Report generation timestamp")
    time_period: str = Field(..., description="Time period analyzed")
    performance_stats: PerformanceStatsResponse = Field(
        ..., description="Performance statistics"
    )
    usage_insights: UsageInsightsResponse = Field(..., description="Usage insights")
    recommendations: list[str] = Field(..., description="Optimization recommendations")
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")


class RealTimeMetricsResponse(BaseModel):
    """Response model for real-time metrics."""

    queries_per_minute: float = Field(..., description="Queries per minute")
    avg_response_time: float = Field(..., description="Average response time")
    active_sessions: int = Field(..., description="Number of active sessions")
    error_rate: float = Field(..., description="Current error rate", ge=0.0, le=1.0)
    timestamp: float = Field(..., description="Metrics timestamp")


class AnalyticsExportRequest(BaseModel):
    """Request model for analytics data export."""

    format: str | None = Field("json", description="Export format (json, csv)")
    time_window_hours: int | None = Field(
        24, description="Time window in hours", ge=1, le=168
    )


class AnalyticsExportResponse(BaseModel):
    """Response model for analytics data export."""

    exported: bool = Field(..., description="Whether export was successful")
    format: str = Field(..., description="Export format used")
    data_size: int | None = Field(None, description="Exported data size in bytes")
    download_url: str | None = Field(None, description="Download URL for exported data")
    expires_at: float | None = Field(None, description="Download expiration timestamp")
