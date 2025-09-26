"""🦊 Reynard RAG (Retrieval-Augmented Generation) Service
======================================================

Orchestrator for all RAG capabilities within the Reynard ecosystem.
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
- Consistent API for all RAG operations with consistent error handling
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

import logging
import time
from typing import Any

from app.core.debug_logging import log_rag_operation, debug_log

from ..email.infrastructure.continuous_indexing import ContinuousIndexingService
from .services.core import VectorStoreService, DocumentIndexer, SearchEngine
from .services.core.embedding import EmbeddingService
from .services.core.document_categorization import DocumentCategorizationService
from .services.core.paper_indexing_integration import PaperIndexingIntegration
from .services.monitoring.prometheus_monitoring import PrometheusMonitoringService
from .services.security.access_control_security import AccessControlSecurityService
from .services.evaluation.model_evaluation import ModelEvaluationService
from .services.improvement.continuous_improvement import ContinuousImprovementService
from .services.documentation.auto_documentation import AutoDocumentationService
from .file_indexing_service import get_file_indexing_service
from .initial_indexing import InitialIndexingService
from .progress_monitor import get_progress_monitor

logger = logging.getLogger("uvicorn")


class RAGService:
    """RAG service orchestrator with enterprise-grade capabilities.

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

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_enabled", False)

        # Core services
        self.embedding_service: EmbeddingService | None = None
        self.vector_store_service: VectorStoreService | None = None
        self.document_indexer: DocumentIndexer | None = None
        self.search_engine: SearchEngine | None = None
        
        # Document categorization services
        self.categorization_service: DocumentCategorizationService | None = None
        self.paper_indexing_integration: PaperIndexingIntegration | None = None

        # File indexing service dependency
        self.file_indexing_service = get_file_indexing_service()

        # Advanced services
        self.performance_monitor: PrometheusMonitoringService | None = None
        self.security_service: AccessControlSecurityService | None = None
        self.continuous_improvement: ContinuousImprovementService | None = None
        self.documentation_service: AutoDocumentationService | None = None
        self.model_evaluator: ModelEvaluationService | None = None
        self.continuous_indexing: ContinuousIndexingService | None = None
        self.initial_indexing_service: InitialIndexingService | None = None

        # Service status
        self.initialized = False
        self.startup_time: float | None = None

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
                f"RAG service initialized successfully in {self.startup_time:.2f}s",
            )
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            return False

    async def _initialize_core_services(self) -> None:
        """Initialize core RAG services."""
        logger.info("Initializing core services...")

        # Initialize file indexing service first (dependency for other services)
        if not await self.file_indexing_service.initialize(self.config):
            raise RuntimeError("Failed to initialize file indexing service")
        logger.info("✅ File indexing service initialized")

        # Initialize embedding service with AI service
        from app.core.service_registry import get_service_registry
        service_registry = get_service_registry()
        ai_service = service_registry.get_service_instance("ai_service")
        
        self.embedding_service = EmbeddingService(ai_service, self.config)
        if not await self.embedding_service.initialize():
            raise RuntimeError("Failed to initialize embedding service")

        # Initialize vector store service
        self.vector_store_service = VectorStoreService(self.config)
        if not await self.vector_store_service.initialize():
            raise RuntimeError("Failed to initialize vector store service")

        # Initialize document indexer with file indexing service dependency
        self.document_indexer = DocumentIndexer(self.config)
        if not await self.document_indexer.initialize():
            raise RuntimeError("Failed to initialize document indexer")

        # Initialize search engine
        self.search_engine = SearchEngine(self.config)
        if not await self.search_engine.initialize():
            raise RuntimeError("Failed to initialize search engine")

        # Set dependencies for search engine
        self.search_engine.set_dependencies(
            self.embedding_service, self.vector_store_service
        )

        # Populate search engine with existing documents
        try:
            await self.search_engine.populate_from_vector_store()
            logger.info("Search engine populated with existing documents")
        except Exception as e:
            logger.warning(f"Failed to populate search engine: {e}")

        # Initialize document categorization services
        if self.config.get("document_categorization_enabled", True):
            self.categorization_service = DocumentCategorizationService(self.config)
            if not await self.categorization_service.initialize():
                logger.warning("Failed to initialize categorization service")
            else:
                logger.info("✅ Document categorization service initialized")
        
        # Initialize paper indexing integration
        if self.config.get("auto_categorize_papers", True):
            self.paper_indexing_integration = PaperIndexingIntegration(self.config)
            if not await self.paper_indexing_integration.initialize():
                logger.warning("Failed to initialize paper indexing integration")
            else:
                logger.info("✅ Paper indexing integration initialized")

        logger.info("Core services initialized successfully")

    async def _initialize_advanced_services(self) -> None:
        """Initialize advanced RAG services."""
        logger.info("Initializing advanced services...")

        # Initialize performance monitor
        if self.config.get("rag_monitoring_enabled", True):
            self.performance_monitor = PrometheusMonitoringService(self.config)
            if not await self.performance_monitor.initialize():
                logger.warning("Failed to initialize performance monitor")
            else:
                logger.info("Performance monitor initialized")

        # Initialize security service
        if self.config.get("rag_security_enabled", True):
            self.security_service = AccessControlSecurityService(self.config)
            if not await self.security_service.initialize():
                logger.warning("Failed to initialize security service")
            else:
                logger.info("Security service initialized")

        # Initialize continuous improvement
        if self.config.get("rag_continuous_improvement_enabled", True):
            self.continuous_improvement = ContinuousImprovementService(self.config)
            if not await self.continuous_improvement.initialize():
                logger.warning("Failed to initialize continuous improvement service")
            else:
                logger.info("Continuous improvement service initialized")

        # Initialize documentation service
        if self.config.get("rag_documentation_enabled", True):
            self.documentation_service = AutoDocumentationService(self.config)
            if not await self.documentation_service.initialize():
                logger.warning("Failed to initialize documentation service")
            else:
                logger.info("Documentation service initialized")

        # Initialize model evaluator
        if self.config.get("rag_model_evaluation_enabled", True):
            self.model_evaluator = ModelEvaluationService(self.config)
            if not await self.model_evaluator.initialize():
                logger.warning("Failed to initialize model evaluator")
            else:
                # Set dependencies for model evaluator
                self.model_evaluator.set_dependencies(
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
                    self.continuous_indexing, self.vector_store_service,
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
                self.initial_indexing_service.perform_initial_indexing(force=False),
            )

        except Exception as e:
            logger.error(f"❌ Failed to trigger initial indexing: {e}")

    def _setup_service_dependencies(self) -> None:
        """Set up dependencies between services."""
        # This is where we would wire up service dependencies
        # For example, having the performance monitor track metrics from other services

    # Core API Methods

    async def embed_text(
        self, text: str, model: str = "embeddinggemma:latest",
    ) -> list[float]:
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
        self, texts: list[str], model: str = "embeddinggemma:latest",
    ) -> list[list[float]]:
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

    @debug_log("rag_search", logger)
    async def search(
        self,
        query: str,
        search_type: str = "hybrid",
        limit: int = 10,
        filters: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
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
                    query, search_type, limit, filters,
                )
                latency_ms = (time.time() - start_time) * 1000

                await self.performance_monitor.record_metric(
                    "search_latency_ms",
                    latency_ms,
                    tags={"search_type": search_type, "status": "success"},
                )
            else:
                results = await self.search_engine.search_with_filters(
                    query, search_type, limit, filters,
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
        language_filter: str | None = None,
        file_type_filter: str | None = None,
    ) -> list[dict[str, Any]]:
        """Perform semantic search using vector embeddings."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter

        return await self.search(
            query=query, search_type="semantic", limit=top_k, filters=filters,
        )

    async def keyword_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: str | None = None,
        file_type_filter: str | None = None,
    ) -> list[dict[str, Any]]:
        """Perform keyword search using BM25."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter

        return await self.search(
            query=query, search_type="keyword", limit=top_k, filters=filters,
        )

    async def hybrid_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: str | None = None,
        file_type_filter: str | None = None,
    ) -> list[dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search."""
        filters = {}
        if language_filter:
            filters["language"] = language_filter
        if file_type_filter:
            filters["file_type"] = file_type_filter

        return await self.search(
            query=query, search_type="hybrid", limit=top_k, filters=filters,
        )

    @debug_log("rag_index_documents", logger)
    async def index_documents(self, documents: list[dict[str, Any]]) -> dict[str, Any]:
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

    async def get_system_health(self) -> dict[str, Any]:
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
                system_health = await self.performance_monitor.get_health_status()
                health_status["performance"] = system_health

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

    async def get_statistics(self) -> dict[str, Any]:
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
                ] = await self.search_engine.get_stats()

            # Get advanced service stats
            if self.performance_monitor:
                stats["advanced_services"][
                    "performance_monitor"
                ] = await self.performance_monitor.get_monitoring_stats()

            if self.security_service:
                stats["advanced_services"][
                    "security_service"
                ] = await self.security_service.get_security_stats()

            if self.continuous_improvement:
                stats["advanced_services"][
                    "continuous_improvement"
                ] = await self.continuous_improvement.get_improvement_stats()

            if self.documentation_service:
                stats["advanced_services"][
                    "documentation_service"
                ] = await self.documentation_service.get_documentation_stats()

            if self.model_evaluator:
                stats["advanced_services"][
                    "model_evaluator"
                ] = await self.model_evaluator.get_evaluation_stats()

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
            return await self.performance_monitor.generate_report("performance", hours=hours)
        except Exception as e:
            logger.error(f"Failed to generate performance report: {e}")
            return f"Error generating report: {e}"

    async def evaluate_models(self) -> dict[str, Any]:
        """Evaluate different embedding models."""
        if not self.initialized or not self.model_evaluator:
            return {"error": "Model evaluation not available"}

        try:
            return await self.model_evaluator.evaluate_models()
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            return {"error": str(e)}

    async def get_optimization_recommendations(self) -> list[dict[str, Any]]:
        """Get optimization recommendations."""
        if not self.initialized or not self.continuous_improvement:
            return []

        try:
            return await self.continuous_improvement.generate_optimization_recommendations()
        except Exception as e:
            logger.error(f"Failed to get optimization recommendations: {e}")
            return []

    async def categorize_paper(self, metadata: dict[str, Any]) -> dict[str, Any]:
        """Categorize a paper using the categorization service."""
        if not self.initialized or not self.categorization_service:
            return {"error": "Categorization service not available"}
        
        try:
            category = await self.categorization_service.categorize_paper_from_metadata(metadata)
            if category:
                return {
                    "success": True,
                    "primary_domain": category.primary_domain.value,
                    "secondary_domains": [d.value for d in category.secondary_domains],
                    "confidence": category.confidence,
                    "keywords": category.keywords,
                    "domain_tags": category.domain_tags,
                    "reasoning": category.reasoning
                }
            else:
                return {"success": False, "error": "Failed to categorize paper"}
        except Exception as e:
            logger.error(f"Failed to categorize paper: {e}")
            return {"success": False, "error": str(e)}
    
    async def process_papers_for_rag(
        self,
        papers_directory: str = None,
        max_papers: int = None,
        force_reprocess: bool = False
    ) -> dict[str, Any]:
        """Process papers for RAG indexing with automatic categorization."""
        if not self.initialized or not self.paper_indexing_integration:
            return {"error": "Paper indexing integration not available"}
        
        try:
            papers_dir = Path(papers_directory) if papers_directory else None
            return await self.paper_indexing_integration.batch_process_papers(
                papers_directory=papers_dir,
                max_papers=max_papers,
                force_reprocess=force_reprocess
            )
        except Exception as e:
            logger.error(f"Failed to process papers for RAG: {e}")
            return {"error": str(e)}
    
    async def get_rag_ready_papers(
        self,
        domain_filter: str = None,
        min_confidence: float = 0.0,
        limit: int = None
    ) -> list[dict[str, Any]]:
        """Get papers ready for RAG indexing."""
        if not self.initialized or not self.paper_indexing_integration:
            return []
        
        try:
            from .services.core.document_categorization import ScientificDomain
            domain_enum = None
            if domain_filter:
                try:
                    domain_enum = ScientificDomain(domain_filter)
                except ValueError:
                    logger.error(f"Invalid domain filter: {domain_filter}")
                    return []
            
            return await self.paper_indexing_integration.get_rag_ready_papers(
                domain_filter=domain_enum,
                min_confidence=min_confidence,
                limit=limit
            )
        except Exception as e:
            logger.error(f"Failed to get RAG ready papers: {e}")
            return []
    
    async def get_categorization_statistics(self) -> dict[str, Any]:
        """Get categorization service statistics."""
        if not self.initialized or not self.categorization_service:
            return {"error": "Categorization service not available"}
        
        try:
            return self.categorization_service.get_statistics()
        except Exception as e:
            logger.error(f"Failed to get categorization statistics: {e}")
            return {"error": str(e)}

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

            # Shutdown advanced services
            if self.performance_monitor:
                await self.performance_monitor.shutdown()

            if self.security_service:
                await self.security_service.shutdown()

            if self.continuous_improvement:
                await self.continuous_improvement.shutdown()

            if self.documentation_service:
                await self.documentation_service.shutdown()

            if self.model_evaluator:
                await self.model_evaluator.shutdown()
            
            # Shutdown categorization services
            if self.paper_indexing_integration:
                await self.paper_indexing_integration.shutdown()
            
            if self.categorization_service:
                await self.categorization_service.shutdown()

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

    def get_available_models(self) -> list[str]:
        """Get list of available embedding models."""
        if not self.embedding_service:
            return []
        return self.embedding_service.get_available_models()

    def get_best_model(self, model_type: str = "text") -> str:
        """Get the best available model for the specified type."""
        if not self.embedding_service:
            return "embeddinggemma:latest"
        return self.embedding_service.get_best_model()