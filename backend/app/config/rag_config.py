"""RAG Configuration for Reynard Backend.

This module provides centralized RAG configuration management with
environment variable support and secure defaults.
"""

import os
from dataclasses import dataclass, field
from typing import Any

from app.config.embedding_backend_config import EmbeddingBackendsConfig


@dataclass
class RAGConfig:
    """Configuration class for RAG service."""

    # Core RAG settings
    enabled: bool = field(
        default_factory=lambda: os.getenv("RAG_ENABLED", "true").lower() == "true",
    )

    # Database configuration
    rag_database_url: str = field(
        default_factory=lambda: os.getenv(
            "RAG_DATABASE_URL",
            None,  # Will be set from environment variable
        ),
    )

    # AI service configuration (Ollama provider)
    ollama_base_url: str = field(
        default_factory=lambda: os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    )

    # Model configuration - EmbeddingGemma as priority
    text_model: str = field(
        default_factory=lambda: os.getenv("RAG_TEXT_MODEL", "embeddinggemma:latest"),
    )
    code_model: str = field(
        default_factory=lambda: os.getenv("RAG_CODE_MODEL", "embeddinggemma:latest"),
    )
    caption_model: str = field(
        default_factory=lambda: os.getenv("RAG_CAPTION_MODEL", "nomic-embed-text"),
    )
    clip_model: str = field(
        default_factory=lambda: os.getenv("RAG_CLIP_MODEL", "ViT-L-14/openai"),
    )

    # Chunking configuration
    chunk_max_tokens: int = field(
        default_factory=lambda: int(os.getenv("RAG_CHUNK_MAX_TOKENS", "512")),
    )
    chunk_min_tokens: int = field(
        default_factory=lambda: int(os.getenv("RAG_CHUNK_MIN_TOKENS", "100")),
    )
    chunk_overlap_ratio: float = field(
        default_factory=lambda: float(os.getenv("RAG_CHUNK_OVERLAP_RATIO", "0.15")),
    )

    # Ingestion configuration
    ingest_batch_size_text: int = field(
        default_factory=lambda: int(os.getenv("RAG_INGEST_BATCH_SIZE_TEXT", "16")),
    )
    ingest_concurrency: int = field(
        default_factory=lambda: int(os.getenv("RAG_INGEST_CONCURRENCY", "2")),
    )
    ingest_max_attempts: int = field(
        default_factory=lambda: int(os.getenv("RAG_INGEST_MAX_ATTEMPTS", "5")),
    )
    ingest_backoff_base_s: float = field(
        default_factory=lambda: float(os.getenv("RAG_INGEST_BACKOFF_BASE_S", "0.5")),
    )

    # Rate limiting
    query_rate_limit_per_minute: int = field(
        default_factory=lambda: int(os.getenv("RAG_QUERY_RATE_LIMIT_PER_MINUTE", "60")),
    )
    ingest_rate_limit_per_minute: int = field(
        default_factory=lambda: int(os.getenv("RAG_INGEST_RATE_LIMIT_PER_MINUTE", "10")),
    )

    # Embedding backend configuration
    embedding_backends: EmbeddingBackendsConfig = field(
        default_factory=EmbeddingBackendsConfig,
    )

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary format expected by services."""
        return {
            "rag_enabled": self.enabled,
            "rag_database_url": self.rag_database_url,
            "ollama_base_url": self.ollama_base_url,
            "rag_text_model": self.text_model,
            "rag_code_model": self.code_model,
            "rag_caption_model": self.caption_model,
            "rag_clip_model": self.clip_model,
            "rag_chunk_max_tokens": self.chunk_max_tokens,
            "rag_chunk_min_tokens": self.chunk_min_tokens,
            "rag_chunk_overlap_ratio": self.chunk_overlap_ratio,
            "rag_ingest_batch_size_text": self.ingest_batch_size_text,
            "rag_ingest_concurrency": self.ingest_concurrency,
            "rag_ingest_max_attempts": self.ingest_max_attempts,
            "rag_ingest_backoff_base_s": self.ingest_backoff_base_s,
            "rag_query_rate_limit_per_minute": self.query_rate_limit_per_minute,
            "rag_ingest_rate_limit_per_minute": self.ingest_rate_limit_per_minute,
            "embedding_backends": self.embedding_backends.to_dict(),
        }

    def validate(self) -> None:
        """Validate configuration settings."""
        # Check if we're in development mode
        is_development = (
            os.getenv("ENVIRONMENT", "development").lower() == "development"
        )

        # Only enforce secure password in production
        if not is_development:
            if not self.rag_database_url or "CHANGE_THIS_PASSWORD" in self.rag_database_url:
                raise ValueError(
                    "RAG configuration error: RAG_DATABASE_URL must be set with a secure password. "
                    "Please set the RAG_DATABASE_URL environment variable with your actual database credentials.",
                )

        if not self.ollama_base_url:
            raise ValueError("RAG configuration error: OLLAMA_BASE_URL must be set")

        if self.chunk_max_tokens <= 0:
            raise ValueError(
                "RAG configuration error: RAG_CHUNK_MAX_TOKENS must be positive",
            )

        if self.chunk_min_tokens <= 0:
            raise ValueError(
                "RAG configuration error: RAG_CHUNK_MIN_TOKENS must be positive",
            )

        if not 0 <= self.chunk_overlap_ratio <= 1:
            raise ValueError(
                "RAG configuration error: RAG_CHUNK_OVERLAP_RATIO must be between 0 and 1",
            )

        # Validate embedding backends configuration
        self.embedding_backends.validate()


# Global config instance
_rag_config: RAGConfig | None = None


def get_rag_config() -> RAGConfig:
    """Get the global RAG configuration instance."""
    global _rag_config
    if _rag_config is None:
        _rag_config = RAGConfig()
        _rag_config.validate()
    return _rag_config
