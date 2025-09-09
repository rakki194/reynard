"""
RAG API Models for Reynard Backend

Pydantic models for RAG API requests and responses.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class RAGQueryRequest(BaseModel):
    """Request model for RAG search queries."""
    q: str = Field(..., description="Search query")
    modality: Optional[str] = Field(None, description="Search modality (docs, code, captions, images)")
    top_k: Optional[int] = Field(20, description="Number of results to return")
    similarity_threshold: Optional[float] = Field(0.0, description="Minimum similarity score")
    enable_reranking: Optional[bool] = Field(False, description="Enable result reranking")


class RAGQueryHit(BaseModel):
    """Individual search result hit."""
    id: Optional[Union[int, str]] = None
    score: float = Field(..., description="Similarity score")
    highlights: Optional[List[str]] = None
    extra: Optional[Dict[str, Any]] = None
    
    # File navigation information
    file_path: Optional[str] = None
    file_content: Optional[str] = None
    file_metadata: Optional[Dict[str, Any]] = None
    chunk_index: Optional[int] = None
    chunk_text: Optional[str] = None
    chunk_tokens: Optional[int] = None
    chunk_metadata: Optional[Dict[str, Any]] = None
    
    # Image information
    image_path: Optional[str] = None
    image_id: Optional[str] = None
    thumbnail_path: Optional[str] = None
    preview_path: Optional[str] = None
    image_metadata: Optional[Dict[str, Any]] = None
    image_dimensions: Optional[Dict[str, int]] = None
    image_size: Optional[int] = None
    image_format: Optional[str] = None
    embedding_vector: Optional[List[float]] = None


class RAGQueryResponse(BaseModel):
    """Response model for RAG search queries."""
    hits: List[RAGQueryHit] = Field(..., description="Search results")
    total: int = Field(..., description="Total number of results")
    query_time: Optional[float] = Field(None, description="Query processing time in seconds")
    embedding_time: Optional[float] = Field(None, description="Embedding generation time in seconds")
    search_time: Optional[float] = Field(None, description="Vector search time in seconds")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class RAGIngestItem(BaseModel):
    """Individual document/item for ingestion."""
    source: Optional[str] = Field(None, description="Document source identifier")
    content: str = Field(..., description="Document content")


class RAGIngestRequest(BaseModel):
    """Request model for document ingestion."""
    items: List[RAGIngestItem] = Field(..., description="Documents to ingest")
    model: Optional[str] = Field(None, description="Embedding model to use")
    batch_size: Optional[int] = Field(16, description="Batch size for processing")
    force_reindex: Optional[bool] = Field(False, description="Force reindexing of existing documents")


class RAGIngestResponse(BaseModel):
    """Response model for document ingestion."""
    processed: int = Field(..., description="Number of documents processed")
    total: int = Field(..., description="Total number of documents")
    failures: int = Field(0, description="Number of failed documents")
    processing_time: Optional[float] = Field(None, description="Total processing time in seconds")
    message: Optional[str] = Field(None, description="Status message")


class RAGConfigRequest(BaseModel):
    """Request model for RAG configuration updates."""
    config: Dict[str, Any] = Field(..., description="Configuration updates")


class RAGConfigResponse(BaseModel):
    """Response model for RAG configuration."""
    config: Dict[str, Any] = Field(..., description="Current configuration")
    updated: bool = Field(False, description="Whether configuration was updated")


class RAGStatsResponse(BaseModel):
    """Response model for RAG statistics."""
    total_documents: int = Field(0, description="Total number of documents")
    total_chunks: int = Field(0, description="Total number of chunks")
    chunks_with_embeddings: int = Field(0, description="Number of chunks with embeddings")
    embedding_coverage: float = Field(0.0, description="Embedding coverage percentage")
    default_model: str = Field("", description="Default embedding model")
    vector_db_enabled: bool = Field(False, description="Whether vector database is enabled")
    cache_size: int = Field(0, description="Cache size in bytes")


class RAGIndexingStatusResponse(BaseModel):
    """Response model for indexing status."""
    queue_depth: int = Field(0, description="Number of items in queue")
    in_flight: int = Field(0, description="Number of items being processed")
    processing_rate: float = Field(0.0, description="Items processed per second")
    estimated_completion: Optional[str] = Field(None, description="Estimated completion time")
