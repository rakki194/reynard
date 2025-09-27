"""🦊 Lazy RAG Service Implementation
==================================

Lazy loading implementation for the RAG service to reduce startup memory consumption.
This service defers heavy imports and initialization until actually needed.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class LazyRAGService:
    """Lazy loading RAG service to reduce startup memory consumption."""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the lazy RAG service.
        
        Args:
            config: RAG service configuration
        """
        self.config = config or {}
        self._rag_service = None
        self._initialized = False
        self._initialization_lock = asyncio.Lock()
    
    async def _ensure_initialized(self):
        """Ensure the RAG service is initialized."""
        if not self._initialized:
            async with self._initialization_lock:
                if not self._initialized:
                    logger.info("🔄 Lazy loading RAG service...")
                    
                    # Import RAG service only when needed
                    from app.services.rag.rag_service import RAGService
                    
                    # Create and initialize the service
                    self._rag_service = RAGService(self.config)
                    await self._rag_service.initialize()
                    
                    self._initialized = True
                    logger.info("✅ RAG service lazy loaded successfully")
    
    async def embed_text(
        self,
        text: str,
        model: str = "embeddinggemma:latest",
    ) -> List[float]:
        """Generate embedding for text."""
        await self._ensure_initialized()
        return await self._rag_service.embed_text(text, model)
    
    async def embed_batch(
        self,
        texts: List[str],
        model: str = "embeddinggemma:latest",
        user_id: str = "system",
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        await self._ensure_initialized()
        return await self._rag_service.embed_batch(texts, model, user_id)
    
    async def search(
        self,
        query: str,
        search_type: str = "hybrid",
        limit: int = 10,
        filters: Dict[str, Any] = None,
        user_id: str = "system",
    ) -> List[Dict[str, Any]]:
        """Perform search using the specified method."""
        await self._ensure_initialized()
        return await self._rag_service.search(query, search_type, limit, filters, user_id)
    
    async def semantic_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: str = None,
        file_type_filter: str = None,
    ) -> List[Dict[str, Any]]:
        """Perform semantic search using vector embeddings."""
        await self._ensure_initialized()
        return await self._rag_service.semantic_search(query, top_k, language_filter, file_type_filter)
    
    async def keyword_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: str = None,
        file_type_filter: str = None,
    ) -> List[Dict[str, Any]]:
        """Perform keyword search using BM25."""
        await self._ensure_initialized()
        return await self._rag_service.keyword_search(query, top_k, language_filter, file_type_filter)
    
    async def hybrid_search(
        self,
        query: str,
        top_k: int = 10,
        language_filter: str = None,
        file_type_filter: str = None,
    ) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search."""
        await self._ensure_initialized()
        return await self._rag_service.hybrid_search(query, top_k, language_filter, file_type_filter)
    
    async def index_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Index documents for search."""
        await self._ensure_initialized()
        return await self._rag_service.index_documents(documents)
    
    async def get_system_health(self) -> Dict[str, Any]:
        """Get comprehensive system health status."""
        if not self._initialized:
            return {"status": "not_initialized", "healthy": False}
        
        await self._ensure_initialized()
        return await self._rag_service.get_system_health()
    
    async def is_healthy(self) -> bool:
        """Check if the RAG service is healthy."""
        if not self._initialized:
            return False
        
        await self._ensure_initialized()
        return await self._rag_service.is_healthy()
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics."""
        if not self._initialized:
            return {"status": "not_initialized"}
        
        await self._ensure_initialized()
        return await self._rag_service.get_statistics()
    
    async def shutdown(self) -> None:
        """Gracefully shutdown the RAG service."""
        if self._initialized and self._rag_service:
            await self._rag_service.shutdown()
            self._initialized = False
            logger.info("✅ Lazy RAG service shutdown complete")
    
    def is_initialized(self) -> bool:
        """Check if the service is initialized."""
        return self._initialized
    
    def is_enabled(self) -> bool:
        """Check if the service is enabled."""
        return self.config.get("rag_enabled", False)
    
    def get_available_models(self) -> List[str]:
        """Get list of available embedding models."""
        if not self._initialized:
            return ["embeddinggemma:latest"]  # Default model
        return self._rag_service.get_available_models()
    
    def get_best_model(self, model_type: str = "text") -> str:
        """Get the best available model for the specified type."""
        if not self._initialized:
            return "embeddinggemma:latest"
        return self._rag_service.get_best_model(model_type)


# Global lazy RAG service instance
_lazy_rag_service: Optional[LazyRAGService] = None


def get_lazy_rag_service(config: Optional[Dict[str, Any]] = None) -> LazyRAGService:
    """Get the global lazy RAG service instance.
    
    Args:
        config: RAG service configuration
        
    Returns:
        LazyRAGService instance
    """
    global _lazy_rag_service
    
    if _lazy_rag_service is None:
        _lazy_rag_service = LazyRAGService(config)
    
    return _lazy_rag_service


async def shutdown_lazy_rag_service():
    """Shutdown the global lazy RAG service."""
    global _lazy_rag_service
    
    if _lazy_rag_service:
        await _lazy_rag_service.shutdown()
        _lazy_rag_service = None
