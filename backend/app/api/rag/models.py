"""
RAG API Models for Reynard Backend

Pydantic models for RAG API requests and responses.
"""

from typing import Any

from pydantic import BaseModel, Field


class RAGQueryRequest(BaseModel):
    """Request model for RAG search queries."""

    q: str = Field(..., description="Search query")
    modality: str | None = Field(
        None, description="Search modality (docs, code, captions, images)"
    )
    top_k: int | None = Field(20, description="Number of results to return")
    similarity_threshold: float | None = Field(
        0.0, description="Minimum similarity score"
    )
    enable_reranking: bool | None = Field(False, description="Enable result reranking")


class RAGQueryHit(BaseModel):
    """Individual search result hit."""

    id: int | str | None = None
    score: float = Field(..., description="Similarity score")
    highlights: list[str] | None = None
    extra: dict[str, Any] | None = None

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
    """Response model for RAG search queries."""

    hits: list[RAGQueryHit] = Field(..., description="Search results")
    total: int = Field(..., description="Total number of results")
    query_time: float | None = Field(
        None, description="Query processing time in seconds"
    )
    embedding_time: float | None = Field(
        None, description="Embedding generation time in seconds"
    )
    search_time: float | None = Field(None, description="Vector search time in seconds")
    metadata: dict[str, Any] | None = Field(None, description="Additional metadata")


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
