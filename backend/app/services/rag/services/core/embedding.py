"""🦊 Reynard RAG Embedding Service
================================

Embedding service that integrates with the unified AI service for generating
embeddings for RAG operations.

This service provides a bridge between the RAG system and the unified AI service,
ensuring consistent embedding generation across all providers.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional

from app.services.ai.ai_service import AIService
from app.services.rag.interfaces.embedding import EmbeddingResult, IEmbeddingService
from app.services.rag.interfaces.base import BaseService

logger = logging.getLogger(__name__)


class EmbeddingService(IEmbeddingService):
    """Embedding service using the unified AI service."""
    
    def __init__(self, ai_service: AIService, config: Optional[Dict[str, Any]] = None):
        """Initialize the embedding service.
        
        Args:
            ai_service: The unified AI service instance
            config: Service configuration
        """
        super().__init__("unified-embedding-service", config)
        self.ai_service = ai_service
        self._initialized = False
        self._default_model = "embeddinggemma:latest"
        self._available_models = [
            "embeddinggemma:latest",
            "nomic-embed-text:latest",
            "all-minilm:latest",
        ]
        self.metrics = {
            "total_embeddings": 0,
            "total_batches": 0,
            "total_processing_time_ms": 0.0,
            "average_processing_time_ms": 0.0,
        }
    
    async def initialize(self) -> bool:
        """Initialize the embedding service."""
        try:
            logger.info("Initializing unified embedding service...")
            
            # Check if AI service is initialized
            if not self.ai_service._initialized:
                await self.ai_service.initialize()
            
            self._initialized = True
            logger.info("✅ Unified embedding service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize embedding service: {e}")
            return False
    
    async def embed_text(
        self, text: str, model: str = "embeddinggemma:latest",
    ) -> List[float]:
        """Generate embedding for a single text."""
        if not self._initialized:
            await self.initialize()
        
        try:
            start_time = time.time()
            
            # Use the AI service to generate embedding
            # For now, we'll use a simple text-to-embedding approach
            # This would need to be implemented in the AI service
            embedding = await self._generate_embedding_via_ai_service(text, model)
            
            processing_time = (time.time() - start_time) * 1000
            
            logger.debug(f"Generated embedding for text (length: {len(text)}) in {processing_time:.2f}ms")
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    async def embed_batch(
        self, texts: List[str], model: str = "embeddinggemma:latest",
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        if not self._initialized:
            await self.initialize()
        
        try:
            start_time = time.time()
            
            # Process texts in parallel for better performance
            tasks = [self._generate_embedding_via_ai_service(text, model) for text in texts]
            embeddings = await asyncio.gather(*tasks)
            
            processing_time = (time.time() - start_time) * 1000
            logger.debug(f"Generated {len(embeddings)} embeddings in {processing_time:.2f}ms")
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise
    
    async def _generate_embedding_via_ai_service(self, text: str, model: str) -> List[float]:
        """Generate embedding using the AI service.
        
        This is a placeholder implementation. In a real implementation,
        this would call the AI service's embedding endpoint.
        """
        # For now, return a dummy embedding
        # TODO: Implement actual embedding generation via AI service
        import hashlib
        import struct
        
        # Generate a deterministic "embedding" based on text hash
        text_hash = hashlib.sha256(text.encode()).digest()
        
        # Convert hash to float vector (1024 dimensions)
        embedding = []
        for i in range(0, len(text_hash), 4):
            chunk = text_hash[i:i+4]
            if len(chunk) == 4:
                # Convert 4 bytes to float
                value = struct.unpack('>f', chunk)[0]
                embedding.append(value)
        
        # Pad or truncate to 1024 dimensions
        while len(embedding) < 1024:
            embedding.append(0.0)
        
        return embedding[:1024]
    
    def get_model_info(self, model: str) -> Dict[str, Any] | None:
        """Get information about a specific model."""
        if model not in self._available_models:
            return None
        
        return {
            "name": model,
            "dimensions": 1024,
            "max_tokens": 512,
            "supported_languages": ["en", "code"],
            "description": f"Embedding model: {model}",
        }
    
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return self._available_models.copy()
    
    def get_best_model(self) -> str:
        """Get the best available model based on priority and availability."""
        return self._default_model

    async def shutdown(self) -> None:
        """Shutdown the embedding service gracefully."""
        try:
            logger.info("Shutting down unified embedding service...")
            # Clean up any resources if needed
            self._initialized = False
            logger.info("Unified embedding service shutdown complete")
        except Exception as e:
            logger.error(f"Error during embedding service shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check and return current status."""
        try:
            # Test embedding generation
            test_embedding = await self.embed_text("health check")
            is_healthy = test_embedding is not None and len(test_embedding) > 0
            
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "ai_service_available": self.ai_service is not None,
                "test_embedding_generated": is_healthy,
                "embedding_dimension": len(test_embedding) if test_embedding else 0,
                "last_check": time.time()
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "last_check": time.time()
            }

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        return {
            "total_embeddings_generated": self.metrics.get("total_embeddings", 0),
            "total_batches_processed": self.metrics.get("total_batches", 0),
            "average_processing_time_ms": self.metrics.get("average_processing_time_ms", 0.0),
            "total_processing_time_ms": self.metrics.get("total_processing_time_ms", 0.0),
            "ai_service_available": self.ai_service is not None,
            "service_name": "unified-embedding-service"
        }


class OllamaEmbeddingService(EmbeddingService):
    """Ollama-specific embedding service."""
    
    def __init__(self, ai_service: AIService):
        """Initialize the Ollama embedding service."""
        super().__init__(ai_service)
        self._default_model = "embeddinggemma:latest"
        self._available_models = [
            "embeddinggemma:latest",
            "nomic-embed-text:latest",
            "all-minilm:latest",
        ]
    
    async def _generate_embedding_via_ai_service(self, text: str, model: str) -> List[float]:
        """Generate embedding using Ollama via AI service."""
        try:
            # TODO: Implement actual Ollama embedding call
            # This would use the AI service to call Ollama's embedding endpoint
            return await super()._generate_embedding_via_ai_service(text, model)
        except Exception as e:
            logger.error(f"Ollama embedding generation failed: {e}")
            raise


# Main embedding service is now EmbeddingService (no alias needed)
