"""Embedding service interfaces.

This module defines the interfaces for embedding generation services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .base import BaseService


@dataclass
class EmbeddingResult:
    """Result of embedding generation."""
    
    embedding: List[float]
    model: str
    token_count: int
    processing_time_ms: float
    metadata: Dict[str, Any]


class IEmbeddingService(BaseService, ABC):
    """Interface for embedding generation services."""

    @abstractmethod
    async def embed_text(
        self, text: str, model: str = "embeddinggemma:latest",
    ) -> List[float]:
        """Generate embedding for a single text."""
        pass

    @abstractmethod
    async def embed_batch(
        self, texts: List[str], model: str = "embeddinggemma:latest",
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        pass

    @abstractmethod
    def get_model_info(self, model: str) -> Dict[str, Any] | None:
        """Get information about a specific model."""
        pass

    @abstractmethod
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        pass

    @abstractmethod
    def get_best_model(self) -> str:
        """Get the best available model based on priority and availability."""
        pass


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""

    @abstractmethod
    async def generate_embedding(
        self, text: str, model: str = "embeddinggemma:latest",
    ) -> EmbeddingResult:
        """Generate embedding for text."""
        pass

    @abstractmethod
    async def generate_embeddings_batch(
        self, texts: List[str], model: str = "embeddinggemma:latest",
    ) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts."""
        pass

    @abstractmethod
    def get_supported_models(self) -> List[str]:
        """Get list of supported models."""
        pass

    @abstractmethod
    def is_model_available(self, model: str) -> bool:
        """Check if a model is available."""
        pass