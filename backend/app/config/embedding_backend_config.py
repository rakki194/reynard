"""Embedding Backend Configuration for Reynard Backend.

This module provides granular control over different embedding backends,
allowing easy enable/disable of specific providers like Ollama, Sentence Transformers,
and future backends without affecting the entire embedding service.
"""

import os
from dataclasses import dataclass, field
from typing import Any


@dataclass
class EmbeddingBackendConfig:
    """Configuration for individual embedding backends."""

    # Backend identification
    name: str
    provider: str  # 'ollama', 'sentence_transformers', 'openai', 'huggingface', etc.

    # Enable/disable control
    enabled: bool = True

    # Backend-specific settings
    base_url: str | None = None
    api_key: str | None = None
    timeout_seconds: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0

    # Model configuration
    default_model: str | None = None
    supported_models: list[str] = field(default_factory=list)

    # Performance settings
    max_concurrent_requests: int = 8
    batch_size: int = 16

    # Fallback priority (lower number = higher priority)
    priority: int = 1

    # Additional metadata
    description: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary format."""
        return {
            "name": self.name,
            "provider": self.provider,
            "enabled": self.enabled,
            "base_url": self.base_url,
            "api_key": self.api_key,
            "timeout_seconds": self.timeout_seconds,
            "max_retries": self.max_retries,
            "retry_delay": self.retry_delay,
            "default_model": self.default_model,
            "supported_models": self.supported_models,
            "max_concurrent_requests": self.max_concurrent_requests,
            "batch_size": self.batch_size,
            "priority": self.priority,
            "description": self.description,
            "metadata": self.metadata,
        }


@dataclass
class EmbeddingBackendsConfig:
    """Configuration for all embedding backends."""

    # Individual backend configurations
    backends: dict[str, EmbeddingBackendConfig] = field(default_factory=dict)

    # Global settings
    enabled: bool = field(
        default_factory=lambda: os.getenv("EMBEDDING_BACKENDS_ENABLED", "true").lower()
        == "true",
    )

    # Fallback behavior
    allow_fallback: bool = field(
        default_factory=lambda: os.getenv("EMBEDDING_ALLOW_FALLBACK", "true").lower()
        == "true",
    )

    # Default backend selection
    default_backend: str = field(
        default_factory=lambda: os.getenv("EMBEDDING_DEFAULT_BACKEND", "ollama"),
    )


    def __post_init__(self) -> None:
        """Initialize default backend configurations if not provided."""
        if not self.backends:
            self._initialize_default_backends()

    def _initialize_default_backends(self) -> None:
        """Initialize default backend configurations."""
        # Ollama backend configuration
        ollama_config = EmbeddingBackendConfig(
            name="ollama",
            provider="ollama",
            enabled=os.getenv("EMBEDDING_OLLAMA_ENABLED", "true").lower() == "true",
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            timeout_seconds=int(os.getenv("EMBEDDING_OLLAMA_TIMEOUT", "30")),
            max_retries=int(os.getenv("EMBEDDING_OLLAMA_MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("EMBEDDING_OLLAMA_RETRY_DELAY", "1.0")),
            default_model=os.getenv(
                "EMBEDDING_OLLAMA_DEFAULT_MODEL", "embeddinggemma:latest",
            ),
            supported_models=[
                "embeddinggemma:latest",
                "embeddinggemma",
                "nomic-embed-text",
                "mxbai-embed-large",
                "bge-m3",
            ],
            max_concurrent_requests=int(
                os.getenv("EMBEDDING_OLLAMA_MAX_CONCURRENT", "8"),
            ),
            batch_size=int(os.getenv("EMBEDDING_OLLAMA_BATCH_SIZE", "16")),
            priority=1,
            description="Ollama local embedding service with various models",
        )

        # Sentence Transformers backend configuration
        sentence_transformers_config = EmbeddingBackendConfig(
            name="sentence_transformers",
            provider="sentence_transformers",
            enabled=os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED", "true").lower()
            == "true",
            timeout_seconds=int(
                os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_TIMEOUT", "30"),
            ),
            max_retries=int(
                os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_MAX_RETRIES", "3"),
            ),
            retry_delay=float(
                os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_RETRY_DELAY", "1.0"),
            ),
            default_model=os.getenv(
                "EMBEDDING_SENTENCE_TRANSFORMERS_DEFAULT_MODEL",
                "sentence-transformers/all-MiniLM-L6-v2",
            ),
            supported_models=[
                "sentence-transformers/all-MiniLM-L6-v2",
                "sentence-transformers/all-mpnet-base-v2",
                "sentence-transformers/all-distilroberta-v1",
            ],
            max_concurrent_requests=int(
                os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_MAX_CONCURRENT", "4"),
            ),
            batch_size=int(
                os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_BATCH_SIZE", "8"),
            ),
            priority=2,
            description="Sentence Transformers library for local embeddings",
        )

        # OpenAI backend configuration (future)
        openai_config = EmbeddingBackendConfig(
            name="openai",
            provider="openai",
            enabled=os.getenv("EMBEDDING_OPENAI_ENABLED", "false").lower() == "true",
            api_key=os.getenv("OPENAI_API_KEY"),
            timeout_seconds=int(os.getenv("EMBEDDING_OPENAI_TIMEOUT", "30")),
            max_retries=int(os.getenv("EMBEDDING_OPENAI_MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("EMBEDDING_OPENAI_RETRY_DELAY", "1.0")),
            default_model=os.getenv(
                "EMBEDDING_OPENAI_DEFAULT_MODEL", "text-embedding-3-small",
            ),
            supported_models=[
                "text-embedding-3-small",
                "text-embedding-3-large",
                "text-embedding-ada-002",
            ],
            max_concurrent_requests=int(
                os.getenv("EMBEDDING_OPENAI_MAX_CONCURRENT", "5"),
            ),
            batch_size=int(os.getenv("EMBEDDING_OPENAI_BATCH_SIZE", "10")),
            priority=3,
            description="OpenAI embedding API service",
        )

        # Hugging Face backend configuration (future)
        huggingface_config = EmbeddingBackendConfig(
            name="huggingface",
            provider="huggingface",
            enabled=os.getenv("EMBEDDING_HUGGINGFACE_ENABLED", "false").lower()
            == "true",
            api_key=os.getenv("HUGGINGFACE_API_KEY"),
            timeout_seconds=int(os.getenv("EMBEDDING_HUGGINGFACE_TIMEOUT", "30")),
            max_retries=int(os.getenv("EMBEDDING_HUGGINGFACE_MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("EMBEDDING_HUGGINGFACE_RETRY_DELAY", "1.0")),
            default_model=os.getenv(
                "EMBEDDING_HUGGINGFACE_DEFAULT_MODEL",
                "sentence-transformers/all-MiniLM-L6-v2",
            ),
            supported_models=[
                "sentence-transformers/all-MiniLM-L6-v2",
                "sentence-transformers/all-mpnet-base-v2",
                "BAAI/bge-large-en-v1.5",
            ],
            max_concurrent_requests=int(
                os.getenv("EMBEDDING_HUGGINGFACE_MAX_CONCURRENT", "4"),
            ),
            batch_size=int(os.getenv("EMBEDDING_HUGGINGFACE_BATCH_SIZE", "8")),
            priority=4,
            description="Hugging Face Inference API for embeddings",
        )

        # Add all backends to the configuration
        self.backends = {
            "ollama": ollama_config,
            "sentence_transformers": sentence_transformers_config,
            "openai": openai_config,
            "huggingface": huggingface_config,
        }

    def get_enabled_backends(self) -> list[EmbeddingBackendConfig]:
        """Get list of enabled backends sorted by priority."""
        enabled_backends = [
            backend for backend in self.backends.values() if backend.enabled
        ]
        return sorted(enabled_backends, key=lambda x: x.priority)

    def get_backend(self, name: str) -> EmbeddingBackendConfig | None:
        """Get a specific backend configuration by name."""
        return self.backends.get(name)

    def is_backend_enabled(self, name: str) -> bool:
        """Check if a specific backend is enabled."""
        backend = self.backends.get(name)
        return backend is not None and backend.enabled

    def enable_backend(self, name: str) -> bool:
        """Enable a specific backend."""
        backend = self.backends.get(name)
        if backend:
            backend.enabled = True
            return True
        return False

    def disable_backend(self, name: str) -> bool:
        """Disable a specific backend."""
        backend = self.backends.get(name)
        if backend:
            backend.enabled = False
            return True
        return False

    def get_primary_backend(self) -> EmbeddingBackendConfig | None:
        """Get the primary (highest priority) enabled backend."""
        enabled_backends = self.get_enabled_backends()
        return enabled_backends[0] if enabled_backends else None

    def get_fallback_backends(self) -> list[EmbeddingBackendConfig]:
        """Get fallback backends (excluding the primary)."""
        enabled_backends = self.get_enabled_backends()
        return enabled_backends[1:] if len(enabled_backends) > 1 else []

    def to_dict(self) -> dict[str, Any]:
        """Convert configuration to dictionary format."""
        return {
            "enabled": self.enabled,
            "allow_fallback": self.allow_fallback,
            "default_backend": self.default_backend,
            "backends": {
                name: backend.to_dict() for name, backend in self.backends.items()
            },
        }

    def validate(self) -> None:
        """Validate the configuration."""
        if not self.enabled:
            return  # Skip validation if embedding backends are disabled

        # Check if at least one backend is enabled
        enabled_backends = self.get_enabled_backends()
        if not enabled_backends:
            raise ValueError(
                "EmbeddingBackendsConfig validation error: "
                "At least one backend must be enabled",
            )

        # Validate individual backend configurations
        for backend in self.backends.values():
            if backend.enabled:
                self._validate_backend(backend)

    def _validate_backend(self, backend: EmbeddingBackendConfig) -> None:
        """Validate a specific backend configuration."""
        if backend.provider == "ollama" and backend.enabled:
            if not backend.base_url:
                raise ValueError(
                    f"Backend '{backend.name}': base_url is required for Ollama",
                )

        if backend.provider in ["openai", "huggingface"] and backend.enabled:
            if not backend.api_key:
                raise ValueError(
                    f"Backend '{backend.name}': api_key is required for {backend.provider}",
                )

        if backend.timeout_seconds <= 0:
            raise ValueError(
                f"Backend '{backend.name}': timeout_seconds must be positive",
            )

        if backend.max_retries < 0:
            raise ValueError(
                f"Backend '{backend.name}': max_retries must be non-negative",
            )

        if backend.retry_delay < 0:
            raise ValueError(
                f"Backend '{backend.name}': retry_delay must be non-negative",
            )


# Global configuration instance
_embedding_backends_config: EmbeddingBackendsConfig | None = None


def get_embedding_backends_config() -> EmbeddingBackendsConfig:
    """Get the global embedding backends configuration instance."""
    global _embedding_backends_config
    if _embedding_backends_config is None:
        _embedding_backends_config = EmbeddingBackendsConfig()
        _embedding_backends_config.validate()
    return _embedding_backends_config


def reset_embedding_backends_config() -> None:
    """Reset the global configuration instance (useful for testing)."""
    global _embedding_backends_config
    _embedding_backends_config = None
