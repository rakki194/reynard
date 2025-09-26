"""Search service interfaces.

This module defines the interfaces for search engine services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, List, Optional

from .base import BaseService


class SearchType(Enum):
    """Types of search operations."""

    SEMANTIC = "semantic"
    KEYWORD = "keyword"
    HYBRID = "hybrid"


@dataclass
class SearchResult:
    """Result of a search operation."""

    content: str
    score: float
    metadata: Dict[str, Any]
    source: str
    rank: int


class ISearchEngine(BaseService, ABC):
    """Interface for search engine services."""

    @abstractmethod
    async def semantic_search(
        self,
        query: str,
        limit: int = 10,
        dataset_id: str | None = None,
        similarity_threshold: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using embeddings."""
        pass

    @abstractmethod
    async def keyword_search(
        self,
        query: str,
        limit: int = 10,
        use_bm25: bool = True,
    ) -> List[Dict[str, Any]]:
        """Perform keyword-based search."""
        pass

    @abstractmethod
    async def hybrid_search(
        self,
        query: str,
        limit: int = 10,
        semantic_weight: float | None = None,
        keyword_weight: float | None = None,
        dataset_id: str | None = None,
    ) -> List[Dict[str, Any]]:
        """Combine semantic and keyword search with weighted fusion."""
        pass

    @abstractmethod
    async def search_with_filters(
        self,
        query: str,
        search_type: str = "hybrid",
        limit: int = 10,
        filters: Dict[str, Any] | None = None,
    ) -> List[Dict[str, Any]]:
        """Search with additional filters and options."""
        pass

    @abstractmethod
    async def populate_from_vector_store(self) -> None:
        """Populate the keyword index with documents from the vector store."""
        pass

    @abstractmethod
    def clear_index(self) -> None:
        """Clear the keyword index."""
        pass

    @abstractmethod
    async def benchmark_search_performance(
        self,
        test_queries: List[str],
        iterations: int = 5,
    ) -> Dict[str, Any]:
        """Benchmark search performance across different methods."""
        pass


class SearchProvider(ABC):
    """Abstract base class for search providers."""

    @abstractmethod
    async def search(
        self,
        query: str,
        search_type: SearchType = SearchType.HYBRID,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[SearchResult]:
        """Perform search operation."""
        pass

    @abstractmethod
    async def index_documents(
        self,
        documents: List[Dict[str, Any]],
    ) -> bool:
        """Index documents for search."""
        pass

    @abstractmethod
    async def remove_documents(self, document_ids: List[str]) -> bool:
        """Remove documents from index."""
        pass
