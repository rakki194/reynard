"""
RAG Service for Reynard Backend

Business logic for RAG operations including search, ingestion, and administration.

Refactored to use standardized logging and service patterns with proper dependency injection.
"""

import asyncio
import time
from collections.abc import AsyncGenerator
from typing import Any

from ...config.rag_config import get_rag_config
from ...core.logging_config import get_service_logger
from ...services.rag import DocumentIndexer, EmbeddingService, VectorStoreService
from .models import RAGIngestItem

logger = get_service_logger("rag")


class RAGService:
    """Main RAG service orchestrator."""

    def __init__(self) -> None:
        self._vector_db_service = None
        self._embedding_service = None
        self._indexing_service = None
        self._config: dict[str, Any] = {}
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the RAG service and its dependencies."""
        if self._initialized:
            return

        try:
            # Load configuration from environment variables
            rag_config = get_rag_config()
            self._config = rag_config.to_dict()

            # Initialize vector database service
            self._vector_db_service = VectorStoreService()
            await self._vector_db_service.initialize(self._config)

            # Initialize embedding service
            self._embedding_service = EmbeddingService()
            await self._embedding_service.initialize(self._config)

            # Initialize indexing service
            self._indexing_service = DocumentIndexer()
            await self._indexing_service.initialize(
                self._config, self._vector_db_service, self._embedding_service
            )

            self._initialized = True
            logger.info("RAG service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {e}")
            raise

    async def query(
        self,
        query: str,
        modality: str | None = None,
        top_k: int = 20,
        similarity_threshold: float = 0.0,
        enable_reranking: bool = False,
    ) -> dict[str, Any]:
        """Perform semantic search query."""
        if not self._initialized:
            await self.initialize()

        start_time = time.time()

        try:
            # Check if database is enabled
            if not self._config.get("rag_enabled", False):
                # Return mock response when database is disabled
                return {
                    "hits": [],
                    "total": 0,
                    "query_time": 0.0,
                    "embedding_time": 0.0,
                    "search_time": 0.0,
                    "metadata": {
                        "message": "RAG database disabled - no results available",
                        "query": query,
                        "modality": modality,
                        "top_k": top_k,
                        "similarity_threshold": similarity_threshold,
                        "enable_reranking": enable_reranking,
                    },
                }

            # Generate query embedding
            embedding_start = time.time()
            query_embedding = await self._embedding_service.embed_text(
                query, model=self._config.get("rag_text_model", "mxbai-embed-large")
            )
            embedding_time = time.time() - embedding_start

            # Perform vector search
            search_start = time.time()
            results = await self._vector_db_service.similar_document_chunks(
                query_embedding, top_k
            )
            search_time = time.time() - search_start

            # Convert results to expected format
            hits = []
            for result in results:
                if result["score"] >= similarity_threshold:
                    hits.append(
                        {
                            "id": result["chunk_id"],
                            "score": result["score"],
                            "chunk_text": result["chunk_text"],
                            "file_path": result["document_source"],
                            "chunk_index": result["chunk_index"],
                            "chunk_metadata": result["chunk_metadata"],
                            "file_metadata": result["document_metadata"],
                        }
                    )

            query_time = time.time() - start_time

            return {
                "hits": hits,
                "total": len(hits),
                "query_time": query_time,
                "embedding_time": embedding_time,
                "search_time": search_time,
                "metadata": {
                    "modality": modality or "docs",
                    "reranked": enable_reranking,
                    "embedding_model": self._config.get(
                        "rag_text_model", "mxbai-embed-large"
                    ),
                },
            }
        except Exception as e:
            logger.error(f"Failed to perform RAG query: {e}")
            raise

    async def index_documents(self, documents: list[dict[str, Any]]) -> dict[str, Any]:
        """Index documents using the DocumentIndexer."""
        if not self._initialized:
            await self.initialize()

        try:
            # Use the indexing service to process documents
            result = {"processed": 0, "total": len(documents), "failures": 0}

            async for event in self._indexing_service.index_documents(documents):
                if event["type"] == "progress":
                    result["processed"] = event.get("processed", 0)
                    result["failures"] = event.get("failures", 0)
                elif event["type"] == "error":
                    result["failures"] += 1
                    logger.error(
                        f"Indexing error: {event.get('error', 'Unknown error')}"
                    )
                elif event["type"] == "complete":
                    result["processed"] = event.get("processed", 0)
                    result["failures"] = event.get("failures", 0)
                    break

            return result
        except Exception as e:
            logger.error(f"Failed to index documents: {e}")
            raise

    async def ingest_documents(
        self,
        items: list[RAGIngestItem],
        model: str | None = None,
        batch_size: int = 16,
        force_reindex: bool = False,
    ) -> dict[str, Any]:
        """Ingest documents into the RAG system."""
        if not self._initialized:
            await self.initialize()

        start_time = time.time()
        processed = 0
        failures = 0

        try:
            # TODO: Implement actual ingestion logic
            # For now, simulate processing
            for item in items:
                try:
                    # Simulate processing
                    await asyncio.sleep(0.1)
                    processed += 1
                except Exception:
                    failures += 1

            processing_time = time.time() - start_time

            return {
                "processed": processed,
                "total": len(items),
                "failures": failures,
                "processing_time": processing_time,
                "message": f"Processed {processed} documents successfully",
            }
        except Exception as e:
            logger.error(f"Failed to ingest documents: {e}")
            raise

    async def ingest_documents_stream(
        self,
        items: list[RAGIngestItem],
        model: str | None = None,
        batch_size: int = 16,
        force_reindex: bool = False,
    ) -> AsyncGenerator[str]:
        """Stream document ingestion progress."""
        if not self._initialized:
            await self.initialize()

        try:
            # Convert RAGIngestItem to dict format expected by indexing service
            items_dict = [
                {"source": item.source, "content": item.content} for item in items
            ]

            # Use indexing service for streaming ingestion
            async for event in self._indexing_service.ingest_documents(
                items_dict, model, batch_size
            ):
                yield f'{{"type": "{event["type"]}", "processed": {event.get("processed", 0)}, "total": {event.get("total", 0)}, "failures": {event.get("failures", 0)}, "message": "{event.get("message", "")}"}}'

        except Exception as e:
            logger.error(f"Failed to stream document ingestion: {e}")
            yield f'{{"type": "error", "error": "{e!s}"}}'

    async def get_config(self) -> dict[str, Any]:
        """Get current RAG configuration."""
        if not self._initialized:
            await self.initialize()

        # TODO: Load actual configuration
        return {
            "rag_enabled": True,
            "rag_text_model": "mxbai-embed-large",
            "rag_code_model": "bge-m3",
            "rag_caption_model": "nomic-embed-text",
            "rag_clip_model": "ViT-L-14/openai",
            "rag_chunk_max_tokens": 512,
            "rag_chunk_min_tokens": 100,
            "rag_chunk_overlap_ratio": 0.15,
            "rag_query_rate_limit_per_minute": 60,
            "rag_ingest_rate_limit_per_minute": 10,
        }

    async def update_config(self, config: dict[str, Any]) -> None:
        """Update RAG configuration."""
        if not self._initialized:
            await self.initialize()

        # TODO: Implement actual configuration update
        self._config.update(config)
        logger.info(f"RAG configuration updated: {config}")

    async def get_stats(self) -> dict[str, Any]:
        """Get RAG system statistics."""
        if not self._initialized:
            await self.initialize()

        try:
            # Get vector database stats
            vector_stats = await self._vector_db_service.get_stats()

            # Get embedding service stats
            embedding_stats = await self._embedding_service.get_stats()

            # Get indexing service stats
            indexing_stats = await self._indexing_service.get_stats()

            return {
                "total_documents": vector_stats.get("total_documents", 0),
                "total_chunks": vector_stats.get("total_chunks", 0),
                "chunks_with_embeddings": vector_stats.get("chunks_with_embeddings", 0),
                "embedding_coverage": vector_stats.get("embedding_coverage", 0.0),
                "default_model": self._config.get(
                    "rag_text_model", "embeddinggemma:latest"
                ),
                "vector_db_enabled": vector_stats.get("migrations_ok", False),
                "cache_size": embedding_stats.get("cache_size", 0),
                "embedding_requests": embedding_stats.get("requests", 0),
                "embedding_errors": embedding_stats.get("errors", 0),
                "indexing_queue_size": indexing_stats.get("queue_size", 0),
                "indexing_processed": indexing_stats.get("metrics", {}).get(
                    "processed", 0
                ),
                "indexing_failed": indexing_stats.get("metrics", {}).get("failed", 0),
            }
        except Exception as e:
            logger.error(f"Failed to get RAG stats: {e}")
            return {
                "total_documents": 0,
                "total_chunks": 0,
                "chunks_with_embeddings": 0,
                "embedding_coverage": 0.0,
                "default_model": "embeddinggemma:latest",
                "vector_db_enabled": False,
                "cache_size": 0,
                "error": str(e),
            }

    async def get_indexing_status(self) -> dict[str, Any]:
        """Get current indexing status."""
        if not self._initialized:
            await self.initialize()

        try:
            indexing_stats = await self._indexing_service.get_stats()
            metrics = indexing_stats.get("metrics", {})

            return {
                "queue_depth": indexing_stats.get("queue_size", 0),
                "in_flight": metrics.get("in_flight", 0),
                "processing_rate": metrics.get("throughput_last_sec", 0.0),
                "estimated_completion": None,  # TODO: Calculate based on queue depth and rate
                "processed": metrics.get("processed", 0),
                "failed": metrics.get("failed", 0),
                "dead_letter": metrics.get("dead_letter", 0),
                "avg_latency_ms": metrics.get("avg_latency_ms", 0.0),
            }
        except Exception as e:
            logger.error(f"Failed to get indexing status: {e}")
            return {
                "queue_depth": 0,
                "in_flight": 0,
                "processing_rate": 0.0,
                "estimated_completion": None,
                "error": str(e),
            }

    async def rebuild_index(self) -> dict[str, Any]:
        """Rebuild the vector index."""
        if not self._initialized:
            await self.initialize()

        # TODO: Implement actual index rebuild
        return {"status": "initiated", "message": "Index rebuild started"}

    async def clear_cache(self) -> dict[str, Any]:
        """Clear the RAG system cache."""
        if not self._initialized:
            await self.initialize()

        # TODO: Implement actual cache clearing
        return {"status": "cleared", "message": "Cache cleared successfully"}


class RAGServiceManager:
    """
    Service manager for RAG API with proper dependency injection.

    This class manages the RAG service instance without using globals,
    providing better testability and cleaner architecture.
    """

    def __init__(self):
        self._service: RAGService | None = None
        self._initialized: bool = False

    def get_service(self) -> RAGService:
        """Get the RAG service instance."""
        if self._service is None:
            self._service = RAGService()
            logger.info("RAG service instance created")
        return self._service

    async def initialize_service(self, config: dict[str, Any]) -> bool:
        """Initialize the RAG service with configuration."""
        try:
            service = self.get_service()
            await service.initialize()
        except (
            Exception
        ) as e:  # noqa: BLE001 - We want to catch all initialization errors
            logger.exception(
                "Failed to initialize RAG service",
                extra={
                    "error": str(e),
                    "error_type": type(e).__name__,
                    "config_provided": bool(config),
                },
            )
            return False
        else:
            self._initialized = True
            logger.info(
                "RAG service initialized successfully",
                extra={
                    "config_keys": list(config.keys()) if config else [],
                    "service_initialized": True,
                },
            )
            return True

    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized

    def reset_service(self) -> None:
        """Reset the service instance (useful for testing)."""
        self._service = None
        self._initialized = False
        logger.info("RAG service instance reset")


# Create a singleton instance of the service manager
_service_manager = RAGServiceManager()


def get_rag_service() -> RAGService:
    """Get the RAG service instance."""
    return _service_manager.get_service()


async def initialize_rag_service(config: dict[str, Any]) -> bool:
    """Initialize the RAG service with configuration."""
    return await _service_manager.initialize_service(config)


def is_rag_service_initialized() -> bool:
    """Check if the RAG service is initialized."""
    return _service_manager.is_initialized()


def reset_rag_service() -> None:
    """Reset the RAG service instance (useful for testing)."""
    _service_manager.reset_service()
