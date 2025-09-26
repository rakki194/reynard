"""RAG Services for Reynard Backend

This module provides a comprehensive RAG (Retrieval-Augmented Generation) system
with clean, modular architecture and intuitive naming.

Core Services:
- EmbeddingService: Embedding generation with multiple providers
- VectorStoreService: PostgreSQL + pgvector management
- DocumentIndexer: Intelligent document processing and chunking
- SearchEngine: Advanced search with semantic and keyword matching

Advanced Features:
- PrometheusMonitoringService: Comprehensive performance monitoring
- AccessControlSecurityService: Enterprise-grade security and compliance
- ContinuousImprovementService: A/B testing and optimization
- AutoDocumentationService: Automated documentation generation
- ModelEvaluationService: Model evaluation and benchmarking

Main Entry Point:
- RAGService: Orchestrator for all RAG capabilities
"""

# Conditional imports based on environment configuration
import os

# Only import RAG services if RAG is enabled
RAG_ENABLED = os.getenv("RAG_ENABLED", "true").lower() == "true"

if RAG_ENABLED:
    # Core services
    # Main service orchestrator
    from .rag_service import RAGService
    from .services.core import (
        DocumentIndexer,
        EmbeddingService,
        SearchEngine,
        VectorStoreService,
    )
    from .services.documentation.auto_documentation import AutoDocumentationService
    from .services.evaluation.model_evaluation import ModelEvaluationService
    from .services.improvement.continuous_improvement import (
        ContinuousImprovementService,
    )

    # Advanced services
    from .services.monitoring.prometheus_monitoring import PrometheusMonitoringService
    from .services.rbac.rbac_rag_service import RBACRAGService

    # Legacy aliases for backward compatibility
    PerformanceMonitor = PrometheusMonitoringService
    SecurityService = RBACRAGService
    ContinuousImprovement = ContinuousImprovementService
    DocumentationService = AutoDocumentationService
    ModelEvaluator = ModelEvaluationService
else:
    # Create placeholder classes when RAG is disabled
    class EmbeddingService:
        pass

    class VectorStoreService:
        pass

    class DocumentIndexer:
        pass

    class SearchEngine:
        pass

    class PrometheusMonitoringService:
        pass

    class RBACRAGService:
        pass

    class ModelEvaluationService:
        pass

    class ContinuousImprovementService:
        pass

    class AutoDocumentationService:
        pass

    class RAGService:
        pass

    # Legacy aliases
    PerformanceMonitor = PrometheusMonitoringService
    SecurityService = RBACRAGService
    ContinuousImprovement = ContinuousImprovementService
    DocumentationService = AutoDocumentationService
    ModelEvaluator = ModelEvaluationService

__all__ = [
    # Main service
    "RAGService",
    # Core services
    "EmbeddingService",
    "VectorStoreService",
    "DocumentIndexer",
    "SearchEngine",
    # Advanced services
    "PrometheusMonitoringService",
    "AccessControlSecurityService",
    "ModelEvaluationService",
    "ContinuousImprovementService",
    "AutoDocumentationService",
    # Legacy aliases for backward compatibility
    "PerformanceMonitor",
    "SecurityService",
    "ContinuousImprovement",
    "DocumentationService",
    "ModelEvaluator",
]
