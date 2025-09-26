"""Vector store service interfaces.

This module defines the interfaces for vector storage and retrieval services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence

from .base import BaseService


@dataclass
class VectorDocument:
    """Document stored in vector database."""

    id: str
    content: str
    embedding: List[float]
    metadata: Dict[str, Any]
    created_at: str
    updated_at: str


@dataclass
class VectorSearchResult:
    """Result of vector search."""

    document: VectorDocument
    similarity_score: float
    rank: int


class IVectorStoreService(BaseService, ABC):
    """Interface for vector store services."""

    @abstractmethod
    async def insert_document_embeddings(
        self,
        embeddings: Sequence[Dict[str, Any]],
    ) -> int:
        """Insert document embeddings into the database."""
        pass

    @abstractmethod
    async def similarity_search(
        self,
        query_embedding: Sequence[float],
        limit: int = 20,
        dataset_id: str | None = None,
        similarity_threshold: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Perform similarity search using vector cosine similarity."""
        pass

    @abstractmethod
    async def get_document_chunks(self, file_id: str) -> List[Dict[str, Any]]:
        """Get all chunks for a specific document."""
        pass

    @abstractmethod
    async def delete_document(self, file_id: str) -> bool:
        """Delete a document and all its embeddings."""
        pass

    @abstractmethod
    async def get_dataset_stats(self, dataset_id: str) -> Dict[str, Any]:
        """Get statistics for a specific dataset."""
        pass


class VectorStore(ABC):
    """Abstract base class for vector stores."""

    @abstractmethod
    async def store_documents(
        self,
        documents: List[VectorDocument],
    ) -> List[str]:
        """Store documents in the vector store."""
        pass

    @abstractmethod
    async def search_similar(
        self,
        query_embedding: List[float],
        limit: int = 10,
        threshold: float = 0.0,
    ) -> List[VectorSearchResult]:
        """Search for similar documents."""
        pass

    @abstractmethod
    async def delete_documents(self, document_ids: List[str]) -> bool:
        """Delete documents by IDs."""
        pass

    @abstractmethod
    async def get_document(self, document_id: str) -> Optional[VectorDocument]:
        """Get a document by ID."""
        pass
