"""
🦊 Reynard RAG (Retrieval-Augmented Generation) Service
======================================================

Unified orchestrator for all RAG capabilities within the Reynard ecosystem.
This service provides a comprehensive, production-ready RAG system that combines
advanced semantic search, document indexing, and intelligent information retrieval
with enterprise-grade monitoring, security, and performance optimization.

The RAG Service provides:
- Advanced semantic search with vector embeddings and similarity matching
- Intelligent document indexing and content management
- Multi-modal search supporting text, image, and mixed content
- Real-time performance monitoring and analytics
- Comprehensive security scanning and threat detection
- Continuous improvement through machine learning optimization
- Enterprise-grade documentation and API management
- Model evaluation and A/B testing capabilities

Core Architecture:
- EmbeddingService: Vector embedding generation and management
- VectorStoreService: High-performance vector storage and retrieval
- DocumentIndexer: Intelligent document processing and indexing
- SearchEngine: Advanced search algorithms and ranking
- PerformanceMonitor: Real-time metrics and performance tracking
- SecurityService: Security scanning and threat detection
- ContinuousImprovement: ML-based system optimization
- DocumentationService: API documentation and management
- ModelEvaluator: Model performance evaluation and testing

Key Features:
- Unified API for all RAG operations with consistent error handling
- Service orchestration with dependency management and health monitoring
- Configuration management with environment-specific settings
- Graceful shutdown and resource cleanup
- Comprehensive logging and audit trails
- Performance optimization and caching strategies
- Security-first design with threat detection and prevention

The service integrates seamlessly with the Reynard backend architecture,
providing scalable, secure, and high-performance RAG capabilities for
the entire ecosystem.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..continuous_indexing import ContinuousIndexingService
from .advanced import (
    ContinuousImprovement,
    DocumentationService,
    ModelEvaluator,
    PerformanceMonitor,
    SecurityService,
)
from .core import DocumentIndexer, EmbeddingService, SearchEngine, VectorStoreService
from .initial_indexing import InitialIndexingService
from .progress_monitor import get_progress_monitor

logger = logging.getLogger("uvicorn")


class RAGService:
    """
    Unified RAG service orchestrator with enterprise-grade capabilities.

    The RAGService serves as the central orchestrator for all RAG operations within
    the Reynard ecosystem. It provides a comprehensive, production-ready RAG system
    that combines advanced semantic search, document indexing, and intelligent
    information retrieval with enterprise-grade monitoring, security, and performance
    optimization.

    Key Responsibilities:
    - Service orchestration and dependency management
    - Configuration management and initialization
    - Health monitoring and performance statistics
    - Security scanning and threat detection
    - Continuous improvement through ML optimization
    - Graceful shutdown and resource cleanup

    Service Architecture:
    - Core Services: Embedding, VectorStore, DocumentIndexer, SearchEngine
    - Advanced Services: PerformanceMonitor, SecurityService, ContinuousImprovement
    - Support Services: DocumentationService, ModelEvaluator

    The service maintains comprehensive statistics and monitoring capabilities,
    providing real-time insights into system performance, security status, and
    operational health.

    Example:
        ```python
        config = {
            "rag_enabled": True,
            "embedding_model": "mxbai-embed-large",
            "vector_store": "chroma",
            "security_enabled": True
        }
        rag_service = RAGService(config)
        await rag_service.initialize()
        ```
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_enabled", False)

        # Core services
        self.embedding_service: Optional[EmbeddingService] = None
        self.vector_store_service: Optional[VectorStoreService] = None
        self.document_indexer: Optional[DocumentIndexer] = None
        self.search_engine: Optional[SearchEngine] = None

        # Advanced services
        self.performance_monitor: Optional[PerformanceMonitor] = None
        self.security_service: Optional[SecurityService] = None
        self.continuous_improvement: Optional[ContinuousImprovement] = None
        self.documentation_service: Optional[DocumentationService] = None
        self.model_evaluator: Optional[ModelEvaluator] = None
        self.continuous_indexing: Optional[ContinuousIndexingService] = None
        self.initial_indexing_service: Optional[InitialIndexingService] = None

        # Service status
        self.initialized = False
        self.startup_time: Optional[float] = None

        # Statistics
        self.stats = {
            "requests_total": 0,
            "embedding_requests": 0,
            "search_requests": 0,
            "indexing_requests": 0,
            "errors_total": 0,
            "uptime_seconds": 0.0,
        }

    async def initialize(self) -> bool:
        """Initialize all RAG services."""
        if not self.enabled:
            logger.info("RAG service disabled by configuration")
            return True

        try:
            start_time = time.time()
            logger.info("Initializing RAG service...")

            # Initialize core services
            await self._initialize_core_services()

            # Initialize advanced services
            await self._initialize_advanced_services()

            # Set up service dependencies
            self._setup_service_dependencies()

            self.initialized = True
            self.startup_time = time.time() - start_time

            logger.info(
                f"RAG service initialized successfully in {self.startup_time:.2f}s"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            return False

    async def _initialize_core_services(self) -> None:
        """Initialize core RAG services."""
        logger.info("Initializing core services...")

        # Initialize embedding service
        self.embedding_service = EmbeddingService()
        if not await self.embedding_service.initialize(self.config):
            raise RuntimeError("Failed to initialize embedding service")

        # Initialize vector store service
        self.vector_store_service = VectorStoreService()
        if not await self.vector_store_service.initialize(self.config):
            raise RuntimeError("Failed to initialize vector store service")

        # Initialize document indexer
        self.document_indexer = DocumentIndexer()
        if not await self.document_indexer.initialize(
            self.config, self.vector_store_service, self.embedding_service
        ):
            raise RuntimeError("Failed to initialize document indexer")

        # Initialize search engine
        self.search_engine = SearchEngine(
            self.embedding_service, self.vector_store_service
        )

        logger.info("Core services initialized successfully")

    async def _initialize_advanced_services(self) -> None:
        """Initialize advanced RAG services."""
        logger.info("Initializing advanced services...")

        # Initialize performance monitor
        if self.config.get("rag_monitoring_enabled", True):
            self.performance_monitor = PerformanceMonitor(self.config)
            logger.info("Performance monitor initialized")

        # Initialize security service
        if self.config.get("rag_security_enabled", True):
            self.security_service = SecurityService(self.config)
            logger.info("Security service initialized")

        # Initialize continuous improvement
        if self.config.get("rag_continuous_improvement_enabled", True):
            self.continuous_improvement = ContinuousImprovement(self.config)
            logger.info("Continuous improvement service initialized")

        # Initialize documentation service
        if self.config.get("rag_documentation_enabled", True):
            self.documentation_service = DocumentationService(self.config)
            logger.info("Documentation service initialized")

        # Initialize model evaluator
        if self.config.get("rag_model_evaluation_enabled", True):
            self.model_evaluator = ModelEvaluator(
                self.embedding_service, self.vector_store_service
            )
            logger.info("Model evaluator initialized")

        # Initialize continuous indexing
        if self.config.get("rag_continuous_indexing_enabled", True):
            self.continuous_indexing = ContinuousIndexingService(self.config)
            if await self.continuous_indexing.initialize():
                # Set the RAG service reference for indexing operations
                self.continuous_indexing.set_rag_service(self)
                logger.info("Continuous indexing service initialized")

                # Initialize initial indexing service
                self.initial_indexing_service = InitialIndexingService(self.config)
                await self.initial_indexing_service.initialize(
                    self.continuous_indexing, self.vector_store_service
                )
                logger.info("Initial indexing service initialized")

                if self.config.get("rag_continuous_indexing_auto_start", True):
                    await self.continuous_indexing.start_watching()
                    logger.info("Continuous indexing started automatically")

                    # Trigger initial indexing if enabled and database is empty
                    if self.config.get("rag_initial_indexing_enabled", True):
                        await self._trigger_initial_indexing()
            else:
                logger.warning("Failed to initialize continuous indexing service")

        logger.info("Advanced services initialized successfully")

    async def _trigger_initial_indexing(self) -> None:
        """Trigger initial indexing of the entire codebase at startup."""
        try:
            if not self.initial_indexing_service:
                logger.warning("Initial indexing service not available")
                return

            logger.info("🔄 Starting initial codebase indexing...")

            # Check if database is empty
            is_empty = await self.initial_indexing_service.is_database_empty()
            if not is_empty:
                logger.info("Database already has content, skipping initial indexing")
                return

            # Start progress monitoring
            progress_monitor = get_progress_monitor()
            await progress_monitor.start_monitoring(self.initial_indexing_service)

            # Start initial indexing in background
            import asyncio

            asyncio.create_task(
                self.initial_indexing_service.perform_initial_indexing(force=False)
            )

        except Exception as e:
            logger.error(f"❌ Failed to trigger initial indexing: {e}")

    def _setup_service_dependencies(self) -> None:
        """Set up dependencies between services."""
        # This is where we would wire up service dependencies
        # For example, having the performance monitor track metrics from other services
        pass

    # Core API Methods

    async def embed_text(
        self, text: str, model: str = "embeddinggemma:latest"
    ) -> List[float]:
        """Generate embedding for text."""
        if not self.initialized:
            raise RuntimeError("RAG service not initialized")

        try:
            self.stats["embedding_requests"] += 1
            self.stats["requests_total"] += 1

            # Record performance metrics
            if self.performance_monitor:
                start_time = time.time()
                embedding = await self.embedding_service.embed_text(text, model)
                latency_ms = (time.time() - start_time) * 1000

                await self.performance_monitor.record_metric(
                    "embedding_latency_ms",
                    latency_ms,
                    tags={"model": model, "status": "success"},
                )
            else:
                embedding = await self.embedding_service.embed_text(text, model)

            return embedding

        except Exception as e:
            self.stats["errors_total"] += 1
            logger.error(f"Failed to generate embedding: {e}")

            if self.performance_monitor:
                await self.performance_monitor.record_metric(
                    "embedding_errors_total",
                    1,
                    tags={"model": model, "status": "error"},
                )

            raise

    async def embed_batch(
        self, texts: List[str], model: str = "embeddinggemma:latest"
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        if not self.initialized:
            raise RuntimeError("RAG service not initialized")

        try:
            self.stats["embedding_requests"] += 1
            self.stats["requests_total"] += 1

            # Record performance metrics
            if self.performance_monitor:
                start_time = time.time()
                embeddings = await self.embedding_service.embed_batch(texts, model)
                latency_ms = (time.time() - start_time) * 1000

                await self.performance_monitor.record_metric(
                    "embedding_batch_latency_ms",
                    latency_ms,
                    tags={
                        "model": model,
                        "batch_size": len(texts),
                        "status": "success",
                    },
                )
            else:
                embeddings = await self.embedding_service.embed_batch(texts, model)

            return embeddings

        except Exception as e:
            self.stats["errors_total"] += 1
            logger.error(f"Failed to generate batch embeddings: {e}")

            if self.performance_monitor:
                await self.performance_monitor.record_metric(
                    "embedding_batch_errors_total",
                    1,
                    tags={"model": model, "batch_size": len(texts), "status": "error"},
                )

            raise

    async def search(
        self,
        query: str,
        search_type: str = "hybrid",
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Perform search using the specified method."""
        if not self.initialized:
            raise RuntimeError("RAG service not initialized")

        try:
            self.stats["search_requests"] += 1
            self.stats["requests_total"] += 1

            # Record performance metrics
            if self.performance_monitor:
                start_time = time.time()
                results = await self.search_engine.search_with_filters(
                    query, search_type, limit, filters
                )
                latency_ms = (time.time() - start_time) * 1000

                await self.performance_monitor.record_metric(
                    "search_latency_ms",
                    latency_ms,
                    tags={"search_type": search_type, "status": "success"},
                )
            else:
                results = await self.search_engine.search_with_filters(
                    query, search_type, limit, filters
                )

            return results

        except Exception as e:
            self.stats["errors_total"] += 1
            logger.error(f"Search failed: {e}")
            raise

    async def semantic_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: Optional[str] = None,
        file_type_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using vector embeddings."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter
        
        return await self.search(
            query=query,
            search_type="semantic",
            limit=top_k,
            filters=filters
        )

    async def keyword_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: Optional[str] = None,
        file_type_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Perform keyword search using BM25."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter
        
        return await self.search(
            query=query,
            search_type="keyword",
            limit=top_k,
            filters=filters
        )

    async def hybrid_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: Optional[str] = None,
        file_type_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter
        
        return await self.search(
            query=query,
            search_type="hybrid",
            limit=top_k,
            filters=filters
        )

    async def index_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Index documents for search."""
        if not self.initialized:
            raise RuntimeError("RAG service not initialized")

        try:
            self.stats["indexing_requests"] += 1
            self.stats["requests_total"] += 1

            # Record performance metrics
            if self.performance_monitor:
                start_time = time.time()
                results = []
                async for result in self.document_indexer.index_documents(documents):
                    results.append(result)
                latency_ms = (time.time() - start_time) * 1000

                await self.performance_monitor.record_metric(
                    "indexing_latency_ms",
                    latency_ms,
                    tags={"document_count": len(documents), "status": "success"},
                )
            else:
                results = []
                async for result in self.document_indexer.index_documents(documents):
                    results.append(result)

            return {
                "status": "success",
                "documents_processed": len(documents),
                "results": results,
            }

        except Exception as e:
            self.stats["errors_total"] += 1
            logger.error(f"Document indexing failed: {e}")

            if self.performance_monitor:
                await self.performance_monitor.record_metric(
                    "indexing_errors_total",
                    1,
                    tags={"document_count": len(documents), "status": "error"},
                )

            raise

    # Advanced API Methods

    async def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health status."""
        if not self.initialized:
            return {"status": "not_initialized", "healthy": False}

        try:
            health_status = {
                "status": "healthy",
                "healthy": True,
                "services": {},
                "uptime_seconds": time.time() - (self.startup_time or 0),
                "timestamp": time.time(),
            }

            # Check core services
            health_status["services"][
                "embedding_service"
            ] = await self.embedding_service.health_check()
            health_status["services"][
                "vector_store"
            ] = await self.vector_store_service.health_check()
            health_status["services"][
                "document_indexer"
            ] = await self.document_indexer.health_check()

            # Check advanced services
            if self.performance_monitor:
                system_health = await self.performance_monitor.get_system_health()
                health_status["performance"] = {
                    "overall_status": system_health.overall_status,
                    "performance_score": system_health.performance_score,
                    "alerts": system_health.alerts,
                }

            # Determine overall health
            all_services_healthy = all(health_status["services"].values())
            health_status["healthy"] = all_services_healthy

            if not all_services_healthy:
                health_status["status"] = "degraded"

            return health_status

        except Exception as e:
            logger.error(f"Failed to get system health: {e}")
            return {
                "status": "error",
                "healthy": False,
                "error": str(e),
                "timestamp": time.time(),
            }

    async def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        if not self.initialized:
            return {"error": "Service not initialized"}

        try:
            stats = {
                "service": {
                    "initialized": self.initialized,
                    "enabled": self.enabled,
                    "uptime_seconds": time.time() - (self.startup_time or 0),
                    "startup_time_seconds": self.startup_time or 0,
                },
                "requests": self.stats.copy(),
                "core_services": {},
                "advanced_services": {},
            }

            # Get core service stats
            if self.embedding_service:
                stats["core_services"][
                    "embedding_service"
                ] = await self.embedding_service.get_stats()

            if self.vector_store_service:
                stats["core_services"][
                    "vector_store"
                ] = await self.vector_store_service.get_stats()

            if self.document_indexer:
                stats["core_services"][
                    "document_indexer"
                ] = await self.document_indexer.get_stats()

            if self.search_engine:
                stats["core_services"][
                    "search_engine"
                ] = self.search_engine.get_search_stats()

            # Get advanced service stats
            if self.performance_monitor:
                stats["advanced_services"][
                    "performance_monitor"
                ] = self.performance_monitor.get_monitor_stats()

            if self.security_service:
                stats["advanced_services"][
                    "security_service"
                ] = self.security_service.get_security_stats()

            if self.continuous_improvement:
                stats["advanced_services"][
                    "continuous_improvement"
                ] = self.continuous_improvement.get_continuous_improvement_stats()

            if self.documentation_service:
                stats["advanced_services"][
                    "documentation_service"
                ] = self.documentation_service.get_documentation_stats()

            if self.model_evaluator:
                stats["advanced_services"][
                    "model_evaluator"
                ] = self.model_evaluator.get_evaluation_stats()

            if self.continuous_indexing:
                stats["advanced_services"][
                    "continuous_indexing"
                ] = self.continuous_indexing.get_stats()

            return stats

        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {"error": str(e)}

    async def generate_performance_report(self, hours: int = 24) -> str:
        """Generate a comprehensive performance report."""
        if not self.initialized or not self.performance_monitor:
            return "Performance monitoring not available"

        try:
            return await self.performance_monitor.generate_performance_report(hours)
        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            return f"Error generating report: {e}"

    async def evaluate_models(self) -> Dict[str, Any]:
        """Evaluate different embedding models."""
        if not self.initialized or not self.model_evaluator:
            return {"error": "Model evaluation not available"}

        try:
            return await self.model_evaluator.evaluate_models()
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            return {"error": str(e)}

    async def get_optimization_recommendations(self) -> List[Dict[str, Any]]:
        """Get optimization recommendations."""
        if not self.initialized or not self.continuous_improvement:
            return []

        try:
            return await self.continuous_improvement.get_optimization_recommendations()
        except Exception as e:
            logger.error(f"Failed to get optimization recommendations: {e}")
            return []

    async def shutdown(self) -> None:
        """Gracefully shutdown all services."""
        logger.info("Shutting down RAG service...")

        try:
            # Shutdown services in reverse order
            if self.continuous_indexing:
                await self.continuous_indexing.shutdown()

            if self.document_indexer:
                await self.document_indexer.shutdown()

            if self.vector_store_service:
                await self.vector_store_service.shutdown()

            if self.embedding_service:
                await self.embedding_service.shutdown()

            # Advanced services don't need explicit shutdown for now
            # but we could add cleanup logic here if needed

            self.initialized = False
            logger.info("RAG service shutdown complete")

        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

    # Utility Methods

    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self.initialized

    def is_enabled(self) -> bool:
        """Check if the service is enabled."""
        return self.enabled

    def get_available_models(self) -> List[str]:
        """Get list of available embedding models."""
        if not self.embedding_service:
            return []
        return self.embedding_service.get_available_models()

    def get_best_model(self, model_type: str = "text") -> str:
        """Get the best available model for the specified type."""
        if not self.embedding_service:
            return "embeddinggemma:latest"
        return self.embedding_service.get_best_model(model_type)
