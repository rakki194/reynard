"""RAG Services: Modular service implementations.

This module provides the concrete implementations of RAG services, organized
into specialized service categories.

Service Categories:
- Core Services: Essential RAG functionality (embedding, vector store, search, document processing)
- Monitoring Services: Performance monitoring and metrics collection
- Security Services: Access control and security features
- Evaluation Services: Model evaluation and A/B testing
- Improvement Services: Continuous improvement and optimization
- Documentation Services: Automated documentation generation

Author: Reynard Development Team
Version: 1.0.0
"""

# Core services
from .core import DocumentIndexer, EmbeddingService, SearchEngine, VectorStoreService

# Documentation services
from .documentation.auto_documentation import AutoDocumentationService

# Evaluation services
from .evaluation.model_evaluation import ModelEvaluationService

# Improvement services
from .improvement.continuous_improvement import ContinuousImprovementService

# Monitoring services
from .monitoring.prometheus_monitoring import PrometheusMonitoringService

# Security services
from .security.access_control_security import AccessControlSecurityService

__all__ = [
    # Core services
    "EmbeddingService",
    "VectorStoreService",
    "SearchEngine",
    "DocumentIndexer",
    # Monitoring services
    "PrometheusMonitoringService",
    # Security services
    "AccessControlSecurityService",
    # Evaluation services
    "ModelEvaluationService",
    # Improvement services
    "ContinuousImprovementService",
    # Documentation services
    "AutoDocumentationService",
]
