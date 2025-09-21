"""
RAG Services for Reynard Backend

This module provides a comprehensive RAG (Retrieval-Augmented Generation) system
with clean, modular architecture and intuitive naming.

Core Services:
- EmbeddingService: Unified embedding generation with multiple providers
- VectorStoreService: PostgreSQL + pgvector management
- DocumentIndexer: Intelligent document processing and chunking
- SearchEngine: Advanced search with semantic and keyword matching

Advanced Features:
- PerformanceMonitor: Comprehensive performance monitoring
- SecurityService: Enterprise-grade security and compliance
- ContinuousImprovement: A/B testing and optimization
- DocumentationService: Automated documentation generation
- ModelEvaluator: Model evaluation and benchmarking

Main Entry Point:
- RAGService: Unified orchestrator for all RAG capabilities
"""

# Advanced services
from .advanced import (
    ContinuousImprovement,
    DocumentationService,
    ModelEvaluator,
    PerformanceMonitor,
    SecurityService,
)

# Core services
from .core import DocumentIndexer, EmbeddingService, SearchEngine, VectorStoreService

# Main service orchestrator
from .rag_service import RAGService

__all__ = [
    # Main service
    "RAGService",
    # Core services
    "EmbeddingService",
    "VectorStoreService",
    "DocumentIndexer",
    "SearchEngine",
    # Advanced services
    "PerformanceMonitor",
    "SecurityService",
    "ContinuousImprovement",
    "DocumentationService",
    "ModelEvaluator",
]
