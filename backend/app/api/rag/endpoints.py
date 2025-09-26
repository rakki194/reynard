"""🦊 Reynard RAG (Retrieval-Augmented Generation) API Endpoints
============================================================

Comprehensive RAG system endpoints for the Reynard backend, providing advanced
semantic search, text embedding, and intelligent document retrieval capabilities.
This module implements the core API endpoints for the RAG system, enabling
sophisticated AI-powered search and information retrieval across the Reynard
ecosystem.

The RAG system provides:
- Semantic search using vector embeddings and similarity matching
- Multi-modal search supporting text, image, and mixed content
- Intelligent document retrieval with relevance scoring
- Text embedding generation for semantic analysis
- Configurable search parameters and result ranking
- Integration with the Reynard knowledge base and document corpus
- Query optimization and result caching
- Performance monitoring and metrics collection
- Comprehensive error handling and validation
- Security integration with authentication and authorization

Key Features:
- Vector-based semantic search with configurable similarity thresholds
- Multi-modal search supporting different content types
- Intelligent reranking for improved result relevance
- Query optimization with caching and performance tuning
- Result caching for improved response times
- Comprehensive error handling and logging
- MCP authentication and authorization
- Performance monitoring and metrics collection

API Endpoints:
- POST /query: Perform semantic search with RAG system
- POST /embed: Generate embeddings for text content
- POST /config: Configure RAG system parameters
- GET /health: Health check and system status
- GET /stats: System statistics and performance metrics

The RAG system integrates with the Reynard backend's service architecture,
providing seamless access to advanced AI capabilities while maintaining
security and performance standards.

Author: Reynard Development Team
Version: 2.0.0 - Refactored with BaseServiceRouter patterns
"""

import time
import uuid
from typing import Any

import jwt
from fastapi import Depends
from pydantic import BaseModel, Field

from ...core.base_router import BaseServiceRouter
from ...core.config_mixin import ConfigEndpointMixin
from ...core.logging_config import get_service_logger
from ...security.mcp_auth import MCPTokenData, require_rag_query
from .models import (
    AnalyticsExportRequest,
    AnalyticsExportResponse,
    AnalyticsReportRequest,
    AnalyticsReportResponse,
    PerformanceStatsRequest,
    PerformanceStatsResponse,
    QueryIntentRequest,
    QueryIntentResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    RealTimeMetricsResponse,
    SemanticEnhancementRequest,
    SemanticEnhancementResponse,
    UsageInsightsRequest,
    UsageInsightsResponse,
    UserFeedbackRequest,
    UserFeedbackResponse,
)
from .query_analytics import get_analytics_collector
from .semantic_search import get_semantic_enhancer
from .service import get_rag_service

logger = get_service_logger("rag")


class RAGConfigModel(BaseModel):
    """Configuration model for RAG service."""

    rag_enabled: bool = Field(
        default=True,
        description="Enable RAG system functionality",
    )
    rag_text_model: str = Field(
        default="mxbai-embed-large",
        description="Default text embedding model",
    )
    rag_code_model: str = Field(default="bge-m3", description="Code embedding model")
    rag_caption_model: str = Field(
        default="nomic-embed-text",
        description="Caption embedding model",
    )
    rag_clip_model: str = Field(
        default="ViT-L-14/openai",
        description="CLIP model for image embeddings",
    )
    rag_chunk_max_tokens: int = Field(
        default=512,
        ge=100,
        le=2048,
        description="Maximum tokens per chunk",
    )
    rag_chunk_min_tokens: int = Field(
        default=100,
        ge=50,
        le=512,
        description="Minimum tokens per chunk",
    )
    rag_chunk_overlap_ratio: float = Field(
        default=0.15,
        ge=0.0,
        le=0.5,
        description="Chunk overlap ratio",
    )
    rag_query_rate_limit_per_minute: int = Field(
        default=60,
        ge=1,
        le=1000,
        description="Query rate limit per minute",
    )
    rag_ingest_rate_limit_per_minute: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Ingestion rate limit per minute",
    )
    enable_query_caching: bool = Field(
        default=True,
        description="Enable query result caching",
    )
    cache_ttl_seconds: int = Field(
        default=3600,
        ge=60,
        le=86400,
        description="Cache TTL in seconds",
    )
    enable_query_optimization: bool = Field(
        default=True,
        description="Enable query optimization",
    )
    max_concurrent_queries: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum concurrent queries",
    )


class RAGServiceRouter(BaseServiceRouter, ConfigEndpointMixin):
    """RAG service router with enterprise-grade patterns.

    Provides standardized service patterns including:
    - Centralized error handling and recovery
    - Configuration management with validation
    - Query optimization and result caching
    - Performance monitoring and metrics
    - Health monitoring and system status
    - Service dependency management
    """

    def __init__(self):
        super().__init__(service_name="rag", prefix="/api/rag", tags=["rag"])

        # Setup configuration endpoints
        self.setup_config_endpoints(RAGConfigModel)

        # Setup RAG-specific endpoints
        self._setup_rag_endpoints()

        logger.info("RAGServiceRouter initialized with enterprise patterns")

    def get_service(self) -> Any:
        """Get the RAG service instance."""
        return get_rag_service()

    def check_service_health(self) -> Any:
        """Check RAG service health."""
        try:
            service = self.get_service()
            # Check if service is available and responsive
            config = service.get_config() if hasattr(service, "get_config") else {}

            return {
                "service_name": self.service_name,
                "is_healthy": True,
                "status": "operational",
                "details": {
                    "rag_enabled": config.get("rag_enabled", False),
                    "vector_db_enabled": config.get("vector_db_enabled", False),
                    "embedding_models": [
                        config.get("rag_text_model", ""),
                        config.get("rag_code_model", ""),
                        config.get("rag_caption_model", ""),
                    ],
                    "service_initialized": service is not None,
                },
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.exception("RAG service health check failed")
            return {
                "service_name": self.service_name,
                "is_healthy": False,
                "status": "unhealthy",
                "details": {"error": str(e)},
                "timestamp": time.time(),
            }

    def _setup_rag_endpoints(self) -> None:
        """Setup RAG-specific endpoints."""

        @self.router.post("/query", response_model=RAGQueryResponse)
        async def query_rag(
            request: RAGQueryRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Perform advanced semantic search using the RAG system."""
            return await self._standard_async_operation(
                "query_rag",
                self._handle_query_request,
                request,
            )

        @self.router.post("/embed")
        async def embed_texts(request: dict):
            """Generate vector embeddings for text content."""
            return await self._standard_async_operation(
                "embed_texts",
                self._handle_embed_request,
                request,
            )

        @self.router.post("/test-query")
        async def test_query_rag(request: RAGQueryRequest):
            """Test RAG query endpoint without authentication (development only)."""
            return await self._standard_async_operation(
                "test_query_rag",
                self._handle_test_query_request,
                request,
            )

        @self.router.get("/health", operation_id="rag_health_check")
        async def health_check():
            """Simple health check for RAG service."""
            return await self._standard_async_operation(
                "health_check",
                self._handle_health_check_request,
            )

        @self.router.post("/test-token")
        async def get_test_token():
            """Generate a test token for benchmarking (development only)."""
            return await self._standard_async_operation(
                "get_test_token",
                self._handle_test_token_request,
            )

        @self.router.get("/stats")
        async def get_rag_stats():
            """Get RAG system statistics and performance metrics."""
            return await self._standard_async_operation(
                "get_rag_stats",
                self._handle_stats_request,
            )

        # Enhanced Semantic Search Endpoints
        @self.router.post("/semantic/detect-intent", response_model=QueryIntentResponse)
        async def detect_query_intent(
            request: QueryIntentRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Detect query intent for semantic search optimization."""
            return await self._standard_async_operation(
                "detect_query_intent",
                self._handle_detect_intent_request,
                request,
            )

        @self.router.post(
            "/semantic/enhance-query",
            response_model=SemanticEnhancementResponse,
        )
        async def enhance_query(
            request: SemanticEnhancementRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Enhance query with semantic processing and expansion."""
            return await self._standard_async_operation(
                "enhance_query",
                self._handle_enhance_query_request,
                request,
            )

        # Query Analytics Endpoints
        @self.router.post("/analytics/record-metrics")
        async def record_query_metrics(request: dict):
            """Record query performance metrics for analytics."""
            return await self._standard_async_operation(
                "record_query_metrics",
                self._handle_record_metrics_request,
                request,
            )

        @self.router.post("/analytics/feedback")
        async def record_user_feedback(
            request: UserFeedbackRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Record user feedback for query analytics."""
            return await self._standard_async_operation(
                "record_user_feedback",
                self._handle_user_feedback_request,
                request,
            )

        @self.router.get(
            "/analytics/performance",
            response_model=PerformanceStatsResponse,
        )
        async def get_performance_stats(
            time_window_hours: int = 24,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Get query performance statistics."""
            request = PerformanceStatsRequest(time_window_hours=time_window_hours)
            return await self._standard_async_operation(
                "get_performance_stats",
                self._handle_performance_stats_request,
                request,
            )

        @self.router.get("/analytics/insights", response_model=UsageInsightsResponse)
        async def get_usage_insights(
            time_window_hours: int = 24,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Get usage insights and analytics."""
            request = UsageInsightsRequest(time_window_hours=time_window_hours)
            return await self._standard_async_operation(
                "get_usage_insights",
                self._handle_usage_insights_request,
                request,
            )

        @self.router.post("/analytics/report", response_model=AnalyticsReportResponse)
        async def generate_analytics_report(
            request: AnalyticsReportRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Generate comprehensive analytics report."""
            return await self._standard_async_operation(
                "generate_analytics_report",
                self._handle_analytics_report_request,
                request,
            )

        @self.router.get("/analytics/realtime", response_model=RealTimeMetricsResponse)
        async def get_real_time_metrics(_: MCPTokenData = Depends(require_rag_query)):
            """Get real-time analytics metrics."""
            return await self._standard_async_operation(
                "get_real_time_metrics",
                self._handle_real_time_metrics_request,
            )

        @self.router.post("/analytics/export", response_model=AnalyticsExportResponse)
        async def export_analytics_data(
            request: AnalyticsExportRequest,
            _: MCPTokenData = Depends(require_rag_query),
        ):
            """Export analytics data in specified format."""
            return await self._standard_async_operation(
                "export_analytics_data",
                self._handle_export_analytics_request,
                request,
            )

    async def _handle_query_request(
        self, request: RAGQueryRequest, user_id: str = "system"
    ) -> RAGQueryResponse:
        """Handle RAG query request with optimization and caching."""
        service = self.get_service()

        # Apply query optimization if enabled
        optimized_request = self._optimize_query_request(request)

        result = await service.query(
            query=optimized_request.q,
            modality=optimized_request.modality,
            top_k=optimized_request.top_k,
            similarity_threshold=optimized_request.similarity_threshold,
            enable_reranking=optimized_request.enable_reranking,
            user_id=user_id,
        )

        # Apply result caching if enabled
        self._cache_query_result(optimized_request, result)

        return RAGQueryResponse(**result)

    async def _handle_embed_request(self, request: dict, user_id: str = "system"):
        """Handle embedding generation request with optimization."""
        service = self.get_service()

        texts = request.get("texts", [])
        model = request.get("model", "mxbai-embed-large")

        # Apply query optimization for embedding requests
        optimized_texts = self._optimize_embedding_texts(texts)

        # Generate embeddings using the actual embedding service with RBAC checks
        embeddings = await service.embed_batch(optimized_texts, model, user_id)

        return {"embeddings": embeddings, "model": model, "count": len(embeddings)}

    async def _handle_test_query_request(self, request: RAGQueryRequest):
        """Handle test query request without authentication."""
        service = self.get_service()

        results = await service.search(
            query=request.q,
            search_type=request.modality or "hybrid",
            limit=request.top_k,
            filters=(
                {"similarity_threshold": request.similarity_threshold}
                if request.similarity_threshold
                else None
            ),
        )
        return {"results": results, "query": request.q, "total": len(results)}

    async def _handle_health_check_request(self):
        """Handle health check request."""
        return {
            "status": "healthy",
            "service": "rag",
            "message": "RAG service is running",
        }

    async def _handle_test_token_request(self):
        """Handle test token generation request."""
        # Create a test token
        payload = {
            "client_id": "test-benchmark",
            "client_type": "tool",
            "permissions": ["rag:query", "rag:config"],
            "issued_at": time.time(),
            "expires_at": time.time() + 3600,  # 1 hour
            "scope": "mcp",
        }

        token = jwt.encode(payload, "reynard-mcp-secret-key-2025", algorithm="HS256")

        return {
            "token": token,
            "expires_in": 3600,
            "permissions": payload["permissions"],
        }

    async def _handle_stats_request(self):
        """Handle stats request with performance metrics."""
        service = self.get_service()
        stats = await service.get_stats()
        return stats

    def _optimize_query_request(self, request: RAGQueryRequest) -> RAGQueryRequest:
        """Optimize query request for better performance."""
        # Apply query optimization techniques
        optimized_q = request.q.strip()

        # Limit query length for better performance
        if len(optimized_q) > 1000:
            optimized_q = optimized_q[:1000] + "..."
            logger.warning("Query truncated for optimization")

        # Adjust top_k based on query complexity
        optimized_top_k = min(request.top_k or 20, 50)  # Cap at 50 results

        return RAGQueryRequest(
            q=optimized_q,
            modality=request.modality,
            top_k=optimized_top_k,
            similarity_threshold=request.similarity_threshold,
            enable_reranking=request.enable_reranking,
        )

    def _optimize_embedding_texts(self, texts: list[str]) -> list[str]:
        """Optimize texts for embedding generation."""
        optimized_texts = []
        for text in texts:
            # Clean and optimize text
            cleaned_text = text.strip()
            if cleaned_text:
                # Limit text length for better performance
                if len(cleaned_text) > 8000:
                    cleaned_text = cleaned_text[:8000] + "..."
                    logger.warning("Text truncated for embedding optimization")
                optimized_texts.append(cleaned_text)
        return optimized_texts

    def _cache_query_result(self, request: RAGQueryRequest, result: dict) -> None:
        """Cache query result for improved performance."""
        # TODO: Implement actual caching mechanism
        # This would integrate with Redis or similar caching system
        cache_key = f"rag_query:{hash(request.q)}:{request.top_k}:{request.similarity_threshold}"
        logger.debug(f"Caching query result with key: {cache_key}")

    # Enhanced Semantic Search Handler Methods
    async def _handle_detect_intent_request(
        self,
        request: QueryIntentRequest,
    ) -> QueryIntentResponse:
        """Handle query intent detection request."""
        try:
            semantic_enhancer = get_semantic_enhancer()
            intent = await semantic_enhancer._detect_query_intent(request.query)

            return QueryIntentResponse(
                intent_type=intent.intent_type,
                confidence=intent.confidence,
                keywords=intent.keywords,
                entities=intent.entities,
                context=intent.context,
            )
        except Exception as e:
            logger.error(f"Intent detection failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Intent detection failed: {e!s}",
            )

    async def _handle_enhance_query_request(
        self,
        request: SemanticEnhancementRequest,
    ) -> SemanticEnhancementResponse:
        """Handle semantic query enhancement request."""
        try:
            semantic_enhancer = get_semantic_enhancer()

            # Create search context if provided
            from .semantic_search import SearchContext

            context = SearchContext() if request.context else None

            enhanced_query, intent, metadata = await semantic_enhancer.enhance_query(
                request.query,
                context,
            )

            return SemanticEnhancementResponse(
                original_query=request.query,
                enhanced_query=enhanced_query,
                enhancement_applied=enhanced_query != request.query,
                enhancement_details=metadata,
            )
        except Exception as e:
            logger.error(f"Query enhancement failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Query enhancement failed: {e!s}",
            )

    # Query Analytics Handler Methods
    async def _handle_record_metrics_request(self, request: dict) -> dict:
        """Handle query metrics recording request."""
        try:
            analytics_collector = get_analytics_collector()

            await analytics_collector.record_query_metrics(
                query_id=request.get("query_id", str(uuid.uuid4())),
                query_text=request.get("query_text", ""),
                processing_time=request.get("processing_time", 0.0),
                embedding_time=request.get("embedding_time", 0.0),
                search_time=request.get("search_time", 0.0),
                results_count=request.get("results_count", 0),
                top_score=request.get("top_score", 0.0),
                avg_score=request.get("avg_score", 0.0),
                session_id=request.get("session_id"),
                user_id=request.get("user_id"),
            )

            return {
                "recorded": True,
                "query_id": request.get("query_id"),
                "timestamp": time.time(),
            }
        except Exception as e:
            logger.error(f"Metrics recording failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Metrics recording failed: {e!s}",
            )

    async def _handle_user_feedback_request(
        self,
        request: UserFeedbackRequest,
    ) -> UserFeedbackResponse:
        """Handle user feedback recording request."""
        try:
            analytics_collector = get_analytics_collector()

            await analytics_collector.record_user_feedback(
                query_id=request.query_id,
                feedback_type=request.feedback_type,
                rating=request.rating,
                comments=request.comments,
                clicked_results=request.clicked_results,
            )

            return UserFeedbackResponse(
                recorded=True,
                query_id=request.query_id,
                feedback_type=request.feedback_type,
                timestamp=time.time(),
            )
        except Exception as e:
            logger.error(f"User feedback recording failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"User feedback recording failed: {e!s}",
            )

    async def _handle_performance_stats_request(
        self,
        request: PerformanceStatsRequest,
    ) -> PerformanceStatsResponse:
        """Handle performance statistics request."""
        try:
            analytics_collector = get_analytics_collector()
            stats = await analytics_collector.get_performance_stats(
                request.time_window_hours,
            )

            return PerformanceStatsResponse(
                total_queries=stats.total_queries,
                avg_processing_time=stats.avg_processing_time,
                avg_embedding_time=stats.avg_embedding_time,
                avg_search_time=stats.avg_search_time,
                avg_total_time=stats.avg_total_time,
                avg_results_count=stats.avg_results_count,
                avg_top_score=stats.avg_top_score,
                avg_avg_score=stats.avg_avg_score,
                p95_processing_time=stats.p95_processing_time,
                p99_processing_time=stats.p99_processing_time,
                success_rate=stats.success_rate,
                error_rate=stats.error_rate,
                time_window_hours=request.time_window_hours,
            )
        except Exception as e:
            logger.error(f"Performance stats retrieval failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Performance stats retrieval failed: {e!s}",
            )

    async def _handle_usage_insights_request(
        self,
        request: UsageInsightsRequest,
    ) -> UsageInsightsResponse:
        """Handle usage insights request."""
        try:
            analytics_collector = get_analytics_collector()
            insights = await analytics_collector.get_usage_insights(
                request.time_window_hours,
            )

            return UsageInsightsResponse(
                popular_queries=insights.popular_queries,
                query_trends=insights.query_trends,
                peak_usage_hours=insights.peak_usage_hours,
                user_behavior_patterns=insights.user_behavior_patterns,
                search_effectiveness=insights.search_effectiveness,
                optimization_opportunities=insights.optimization_opportunities,
                time_window_hours=request.time_window_hours,
            )
        except Exception as e:
            logger.error(f"Usage insights retrieval failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Usage insights retrieval failed: {e!s}",
            )

    async def _handle_analytics_report_request(
        self,
        request: AnalyticsReportRequest,
    ) -> AnalyticsReportResponse:
        """Handle analytics report generation request."""
        try:
            analytics_collector = get_analytics_collector()
            report = await analytics_collector.generate_analytics_report(
                request.time_period,
            )

            # Convert to response format
            performance_stats = PerformanceStatsResponse(
                total_queries=report.performance_stats.total_queries,
                avg_processing_time=report.performance_stats.avg_processing_time,
                avg_embedding_time=report.performance_stats.avg_embedding_time,
                avg_search_time=report.performance_stats.avg_search_time,
                avg_total_time=report.performance_stats.avg_total_time,
                avg_results_count=report.performance_stats.avg_results_count,
                avg_top_score=report.performance_stats.avg_top_score,
                avg_avg_score=report.performance_stats.avg_avg_score,
                p95_processing_time=report.performance_stats.p95_processing_time,
                p99_processing_time=report.performance_stats.p99_processing_time,
                success_rate=report.performance_stats.success_rate,
                error_rate=report.performance_stats.error_rate,
                time_window_hours=24,  # Default
            )

            usage_insights = UsageInsightsResponse(
                popular_queries=report.usage_insights.popular_queries,
                query_trends=report.usage_insights.query_trends,
                peak_usage_hours=report.usage_insights.peak_usage_hours,
                user_behavior_patterns=report.usage_insights.user_behavior_patterns,
                search_effectiveness=report.usage_insights.search_effectiveness,
                optimization_opportunities=report.usage_insights.optimization_opportunities,
                time_window_hours=24,  # Default
            )

            return AnalyticsReportResponse(
                report_id=report.report_id,
                generated_at=report.generated_at,
                time_period=report.time_period,
                performance_stats=performance_stats,
                usage_insights=usage_insights,
                recommendations=report.recommendations,
                metadata=report.metadata,
            )
        except Exception as e:
            logger.error(f"Analytics report generation failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Analytics report generation failed: {e!s}",
            )

    async def _handle_real_time_metrics_request(self) -> RealTimeMetricsResponse:
        """Handle real-time metrics request."""
        try:
            analytics_collector = get_analytics_collector()
            metrics = await analytics_collector.get_real_time_metrics()

            return RealTimeMetricsResponse(
                queries_per_minute=metrics["queries_per_minute"],
                avg_response_time=metrics["avg_response_time"],
                active_sessions=metrics["active_sessions"],
                error_rate=metrics["error_rate"],
                timestamp=metrics["timestamp"],
            )
        except Exception as e:
            logger.error(f"Real-time metrics retrieval failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Real-time metrics retrieval failed: {e!s}",
            )

    async def _handle_export_analytics_request(
        self,
        request: AnalyticsExportRequest,
    ) -> AnalyticsExportResponse:
        """Handle analytics data export request."""
        try:
            analytics_collector = get_analytics_collector()
            export_data = await analytics_collector.export_analytics_data(
                request.format,
            )

            return AnalyticsExportResponse(
                exported=True,
                format=request.format,
                data_size=(
                    len(str(export_data)) if isinstance(export_data, str) else None
                ),
                download_url=None,  # Would be implemented with file storage
                expires_at=time.time() + 3600,  # 1 hour expiration
            )
        except Exception as e:
            logger.error(f"Analytics export failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Analytics export failed: {e!s}",
            )


# Create router instance


rag_router = RAGServiceRouter()
router = rag_router.get_router()
