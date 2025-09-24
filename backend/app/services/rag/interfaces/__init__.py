"""RAG Service Interfaces: Abstract base classes and protocols for RAG services.

This module provides the foundational interfaces that all RAG services must implement,
ensuring consistency, testability, and maintainability across the entire RAG system.

Interfaces:
- BaseService: Core service lifecycle and health monitoring
- EmbeddingProvider: Text embedding generation
- VectorStore: Vector storage and similarity search
- SearchProvider: Search functionality
- DocumentProcessor: Document indexing and processing
- MonitoringProvider: Performance monitoring and metrics
- SecurityProvider: Security and access control
- ConfigurationProvider: Configuration management

Author: Reynard Development Team
Version: 1.0.0
"""

from .base import BaseService, ServiceStatus
from .embedding import EmbeddingProvider, EmbeddingResult
from .vector_store import VectorStore, VectorSearchResult
from .search import SearchProvider, SearchResult, SearchType
from .document import DocumentProcessor, DocumentChunk, ChunkMetadata
from .monitoring import MonitoringProvider, Metric, Alert
from .security import SecurityProvider, AccessLevel, SecurityPolicy
from .configuration import ConfigurationProvider, ServiceConfig

__all__ = [
    # Base interfaces
    "BaseService",
    "ServiceStatus",
    
    # Core service interfaces
    "EmbeddingProvider",
    "EmbeddingResult",
    "VectorStore", 
    "VectorSearchResult",
    "SearchProvider",
    "SearchResult",
    "SearchType",
    "DocumentProcessor",
    "DocumentChunk",
    "ChunkMetadata",
    
    # Advanced service interfaces
    "MonitoringProvider",
    "Metric",
    "Alert",
    "SecurityProvider",
    "AccessLevel",
    "SecurityPolicy",
    "ConfigurationProvider",
    "ServiceConfig",
]
