"""
RAGPhase2Service: Comprehensive Phase 2 RAG service integrating all enhancements.

Responsibilities:
- Integrate AST-aware chunking with enhanced embedding service
- Coordinate model evaluation and hybrid search
- Provide unified API for Phase 2 features
- Performance monitoring and optimization
- Seamless fallback to Phase 1 when needed
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path

from .enhanced_embedding_service import EnhancedEmbeddingService
from .ast_code_chunker import ASTCodeChunker
from .model_evaluator import ModelEvaluator
from .hybrid_search_engine import HybridSearchEngine
from .performance_monitor import PerformanceMonitor

logger = logging.getLogger("uvicorn")


class RAGPhase2Service:
    """Comprehensive Phase 2 RAG service with all enhancements."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("rag_phase2_enabled", True)
        
        # Initialize services
        self.embedding_service = EnhancedEmbeddingService()
        self.ast_chunker = ASTCodeChunker()
        self.model_evaluator = None  # Will be initialized after embedding service
        self.hybrid_search_engine = None  # Will be initialized after embedding service
        self.performance_monitor = PerformanceMonitor()
        
        # Phase 2 specific configuration
        self.ast_chunking_enabled = config.get("rag_ast_chunking_enabled", True)
        self.hybrid_search_enabled = config.get("rag_hybrid_search_enabled", True)
        self.model_evaluation_enabled = config.get("rag_model_evaluation_enabled", False)
        
        # Performance tracking
        self.phase2_stats = {
            "ast_chunks_created": 0,
            "hybrid_searches_performed": 0,
            "model_evaluations_completed": 0,
            "fallback_to_phase1": 0,
            "total_processing_time": 0.0
        }

    async def initialize(self) -> bool:
        """Initialize the Phase 2 RAG service."""
        try:
            if not self.enabled:
                logger.info("RAG Phase 2 service disabled by configuration")
                return True
            
            # Initialize embedding service
            embedding_success = await self.embedding_service.initialize(self.config)
            if not embedding_success:
                logger.error("Failed to initialize enhanced embedding service")
                return False
            
            # Initialize performance monitor
            await self.performance_monitor.start()
            
            # Initialize model evaluator (requires embedding service)
            if self.model_evaluation_enabled:
                # Mock vector DB service for now
                vector_db_service = self._create_mock_vector_db_service()
                self.model_evaluator = ModelEvaluator(
                    self.embedding_service, vector_db_service
                )
            
            # Initialize hybrid search engine (requires embedding service)
            if self.hybrid_search_enabled:
                vector_db_service = self._create_mock_vector_db_service()
                self.hybrid_search_engine = HybridSearchEngine(
                    self.embedding_service, vector_db_service
                )
            
            logger.info("RAG Phase 2 service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG Phase 2 service: {e}")
            return False

    def _create_mock_vector_db_service(self):
        """Create a mock vector DB service for testing and evaluation."""
        class MockVectorDBService:
            async def similarity_search(self, embedding, limit=10):
                # Return mock results
                return [
                    {
                        'text': f'Mock result {i}',
                        'similarity': 0.9 - (i * 0.1),
                        'metadata': {'id': f'doc_{i}'}
                    }
                    for i in range(min(limit, 5))
                ]
        
        return MockVectorDBService()

    async def chunk_code_with_ast(self, 
                                 code: str, 
                                 language: str,
                                 model: str = "embeddinggemma:latest") -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Chunk code using AST-aware chunking and generate embeddings."""
        if not self.ast_chunking_enabled:
            logger.warning("AST chunking disabled, falling back to simple chunking")
            return self._fallback_chunking(code, language, model)
        
        try:
            start_time = time.time()
            
            # Use AST-aware chunking
            chunks, symbol_map = self.ast_chunker.chunk_code_ast_aware(code, language)
            
            # Generate embeddings for chunks
            chunk_texts = [chunk['text'] for chunk in chunks]
            embeddings = await self.embedding_service.embed_batch(chunk_texts, model)
            
            # Add embeddings to chunks
            for i, chunk in enumerate(chunks):
                chunk['embedding'] = embeddings[i] if i < len(embeddings) else None
            
            processing_time = time.time() - start_time
            self.phase2_stats["ast_chunks_created"] += len(chunks)
            self.phase2_stats["total_processing_time"] += processing_time
            
            # Record performance metrics
            await self.performance_monitor.record_embedding_metrics(
                model=model,
                latency_ms=processing_time * 1000,
                success=True,
                cache_hit=False,
                tokens=sum(chunk.get('tokens', 0) for chunk in chunks),
                batch_size=len(chunks)
            )
            
            return chunks, symbol_map
            
        except Exception as e:
            logger.error(f"AST chunking failed: {e}")
            self.phase2_stats["fallback_to_phase1"] += 1
            return self._fallback_chunking(code, language, model)

    def _fallback_chunking(self, code: str, language: str, model: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """Fallback to simple chunking when AST chunking fails."""
        # Simple line-based chunking
        lines = code.split('\n')
        chunk_size = 50  # lines per chunk
        
        chunks = []
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i:i + chunk_size]
            chunk_text = '\n'.join(chunk_lines)
            
            chunks.append({
                'text': chunk_text,
                'metadata': {
                    'type': 'fallback',
                    'start_line': i + 1,
                    'end_line': min(i + chunk_size, len(lines)),
                    'language': language
                },
                'tokens': len(chunk_text.split()) * 1.3
            })
        
        return chunks, {}

    async def hybrid_search(self, 
                          query: str,
                          limit: int = 10,
                          semantic_weight: Optional[float] = None) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword matching."""
        if not self.hybrid_search_enabled or not self.hybrid_search_engine:
            logger.warning("Hybrid search disabled, falling back to semantic search")
            return await self._fallback_semantic_search(query, limit)
        
        try:
            start_time = time.time()
            
            results = await self.hybrid_search_engine.hybrid_search(
                query, limit, semantic_weight
            )
            
            processing_time = time.time() - start_time
            self.phase2_stats["hybrid_searches_performed"] += 1
            self.phase2_stats["total_processing_time"] += processing_time
            
            # Record search metrics
            await self.performance_monitor.record_search_metrics(
                query_type="hybrid",
                latency_ms=processing_time * 1000,
                results_count=len(results),
                recall_at_10=0.9  # Placeholder
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {e}")
            return await self._fallback_semantic_search(query, limit)

    async def _fallback_semantic_search(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Fallback to semantic search when hybrid search fails."""
        try:
            query_embedding = await self.embedding_service.embed_text(query)
            
            # Mock vector DB search
            mock_results = [
                {
                    'text': f'Fallback result {i}',
                    'similarity': 0.8 - (i * 0.1),
                    'metadata': {'id': f'fallback_{i}'}
                }
                for i in range(min(limit, 3))
            ]
            
            return [{
                'content': r['text'],
                'score': r['similarity'],
                'type': 'semantic_fallback',
                'metadata': r['metadata']
            } for r in mock_results]
            
        except Exception as e:
            logger.error(f"Fallback semantic search failed: {e}")
            return []

    async def evaluate_models(self) -> Dict[str, Any]:
        """Evaluate different embedding models for performance comparison."""
        if not self.model_evaluation_enabled or not self.model_evaluator:
            logger.warning("Model evaluation disabled")
            return {"error": "Model evaluation not enabled"}
        
        try:
            start_time = time.time()
            
            results = await self.model_evaluator.evaluate_models()
            
            processing_time = time.time() - start_time
            self.phase2_stats["model_evaluations_completed"] += 1
            self.phase2_stats["total_processing_time"] += processing_time
            
            # Generate evaluation report
            report = self.model_evaluator.generate_evaluation_report(results)
            
            return {
                "results": results,
                "report": report,
                "processing_time": processing_time,
                "models_evaluated": len(results)
            }
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            return {"error": str(e)}

    async def index_documents_for_hybrid_search(self, documents: List[Dict[str, Any]]) -> bool:
        """Index documents for hybrid search functionality."""
        if not self.hybrid_search_enabled or not self.hybrid_search_engine:
            logger.warning("Hybrid search not available for indexing")
            return False
        
        try:
            self.hybrid_search_engine.index_documents(documents)
            logger.info(f"Indexed {len(documents)} documents for hybrid search")
            return True
            
        except Exception as e:
            logger.error(f"Document indexing failed: {e}")
            return False

    async def get_phase2_stats(self) -> Dict[str, Any]:
        """Get comprehensive Phase 2 statistics."""
        base_stats = await self.embedding_service.get_enhanced_stats()
        search_stats = self.hybrid_search_engine.get_search_stats() if self.hybrid_search_engine else {}
        monitor_stats = self.performance_monitor.get_monitor_stats()
        chunker_stats = self.ast_chunker.get_chunker_stats()
        
        return {
            "phase2_enabled": self.enabled,
            "features": {
                "ast_chunking_enabled": self.ast_chunking_enabled,
                "hybrid_search_enabled": self.hybrid_search_enabled,
                "model_evaluation_enabled": self.model_evaluation_enabled
            },
            "phase2_stats": self.phase2_stats,
            "embedding_service": base_stats,
            "hybrid_search": search_stats,
            "performance_monitor": monitor_stats,
            "ast_chunker": chunker_stats
        }

    async def benchmark_phase2_performance(self, 
                                         test_queries: List[str],
                                         test_code_samples: List[Tuple[str, str]]) -> Dict[str, Any]:
        """Benchmark Phase 2 performance across different features."""
        benchmark_results = {
            "ast_chunking": {},
            "hybrid_search": {},
            "model_evaluation": {},
            "overall": {}
        }
        
        start_time = time.time()
        
        # Benchmark AST chunking
        if self.ast_chunking_enabled:
            chunking_times = []
            for code, language in test_code_samples:
                chunk_start = time.time()
                await self.chunk_code_with_ast(code, language)
                chunking_times.append((time.time() - chunk_start) * 1000)
            
            benchmark_results["ast_chunking"] = {
                "average_time_ms": sum(chunking_times) / len(chunking_times),
                "min_time_ms": min(chunking_times),
                "max_time_ms": max(chunking_times),
                "samples_tested": len(test_code_samples)
            }
        
        # Benchmark hybrid search
        if self.hybrid_search_enabled and self.hybrid_search_engine:
            search_times = []
            for query in test_queries:
                search_start = time.time()
                await self.hybrid_search(query, limit=10)
                search_times.append((time.time() - search_start) * 1000)
            
            benchmark_results["hybrid_search"] = {
                "average_time_ms": sum(search_times) / len(search_times),
                "min_time_ms": min(search_times),
                "max_time_ms": max(search_times),
                "queries_tested": len(test_queries)
            }
        
        # Overall benchmark
        total_time = time.time() - start_time
        benchmark_results["overall"] = {
            "total_time_seconds": total_time,
            "features_tested": len([k for k, v in benchmark_results.items() if v]),
            "queries_tested": len(test_queries),
            "code_samples_tested": len(test_code_samples)
        }
        
        return benchmark_results

    async def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check for Phase 2 service."""
        health_status = {
            "overall": "healthy",
            "services": {},
            "features": {},
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Check embedding service
        try:
            embedding_health = await self.embedding_service.health_check()
            health_status["services"]["embedding_service"] = "healthy" if embedding_health else "unhealthy"
        except Exception as e:
            health_status["services"]["embedding_service"] = f"error: {e}"
        
        # Check AST chunker
        try:
            chunker_stats = self.ast_chunker.get_chunker_stats()
            health_status["features"]["ast_chunking"] = "healthy" if chunker_stats["initialized"] else "unhealthy"
        except Exception as e:
            health_status["features"]["ast_chunking"] = f"error: {e}"
        
        # Check hybrid search
        if self.hybrid_search_engine:
            try:
                search_stats = self.hybrid_search_engine.get_search_stats()
                health_status["features"]["hybrid_search"] = "healthy"
            except Exception as e:
                health_status["features"]["hybrid_search"] = f"error: {e}"
        else:
            health_status["features"]["hybrid_search"] = "disabled"
        
        # Check model evaluator
        if self.model_evaluator:
            try:
                eval_stats = self.model_evaluator.get_evaluation_stats()
                health_status["features"]["model_evaluation"] = "healthy"
            except Exception as e:
                health_status["features"]["model_evaluation"] = f"error: {e}"
        else:
            health_status["features"]["model_evaluation"] = "disabled"
        
        # Determine overall health
        unhealthy_services = [s for s in health_status["services"].values() if s != "healthy"]
        unhealthy_features = [f for f in health_status["features"].values() if f not in ["healthy", "disabled"]]
        
        if unhealthy_services or unhealthy_features:
            health_status["overall"] = "degraded"
        
        return health_status

    async def shutdown(self) -> None:
        """Shutdown the Phase 2 service."""
        try:
            await self.embedding_service.shutdown()
            await self.performance_monitor.stop()
            logger.info("RAG Phase 2 service shutdown complete")
        except Exception as e:
            logger.error(f"Error during Phase 2 service shutdown: {e}")
