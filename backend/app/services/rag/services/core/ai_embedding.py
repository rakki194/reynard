"""🦊 AI Embedding Service: Text embedding generation using AI service.

This service provides text embedding generation using the AI service,
with support for multiple providers (Ollama, vLLM, SGLang, LLaMA.cpp), caching,
and performance optimization.

Author: Reynard Development Team
Version: 3.0.0 - AI service with multi-provider support
"""

import asyncio
import hashlib
import logging
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.embedding import EmbeddingProvider, EmbeddingResult, IEmbeddingService
from ....ai.ai_service import AIService
from ....ai.provider_registry import ProviderType

logger = logging.getLogger("uvicorn")

# Enable debug logging for RAG operations
DEBUG_RAG_OPERATIONS = True


class LRUCache:
    """LRU cache implementation with size limits and hit rate monitoring."""

    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.cache: OrderedDict[str, List[float]] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[List[float]]:
        """Get value from cache, updating access order."""
        if key in self.cache:
            value = self.cache.pop(key)
            self.cache[key] = value
            self.hits += 1
            return value
        self.misses += 1
        return None

    def put(self, key: str, value: List[float]) -> None:
        """Put value in cache, evicting LRU if necessary."""
        if key in self.cache:
            self.cache.pop(key)
        elif len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        self.cache[key] = value

    def get_hit_rate(self) -> float:
        """Get cache hit rate."""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.get_hit_rate(),
        }


class AIEmbeddingService(BaseService, EmbeddingProvider):
    """AI-based embedding service with caching and optimization."""

    def __init__(self, config: Optional[Dict[str, Any]] = None, ai_service: Optional[AIService] = None):
        super().__init__("ai-embedding", config)
        
        # AI service
        self.ai_service = ai_service
        
        # Service configuration
        self.timeout = self.config.get("timeout_seconds", 30)
        self.max_retries = self.config.get("max_retries", 3)
        self.retry_delay = self.config.get("retry_delay", 1.0)
        
        # Performance optimization
        self.cache_size = self.config.get("cache_size", 1000)
        self.lru_cache = LRUCache(max_size=self.cache_size)
        self.max_concurrent = self.config.get("max_concurrent", 8)
        self.concurrency_limiter = asyncio.Semaphore(self.max_concurrent)
        
        # Model registry
        self.model_registry = self._initialize_model_registry()
        self.default_model = self.config.get("default_model", "embeddinggemma:latest")
        self.default_provider = self.config.get("default_provider", ProviderType.OLLAMA)
        
        # Metrics
        self.metrics = {
            "requests": 0,
            "errors": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_latency_ms": 0.0,
        }

    def _initialize_model_registry(self) -> Dict[str, Dict[str, Any]]:
        """Initialize model registry with supported embedding models."""
        return {
            "embeddinggemma:latest": {
                "name": "embeddinggemma:latest",
                "provider": ProviderType.OLLAMA,
                "dimensions": 1024,
                "max_tokens": 512,
                "description": "Google's EmbeddingGemma model via Ollama",
            },
            "mxbai-embed-large": {
                "name": "mxbai-embed-large",
                "provider": ProviderType.OLLAMA,
                "dimensions": 1024,
                "max_tokens": 512,
                "description": "MixedBread AI large embedding model",
            },
            "nomic-embed-text": {
                "name": "nomic-embed-text",
                "provider": ProviderType.OLLAMA,
                "dimensions": 768,
                "max_tokens": 512,
                "description": "Nomic AI text embedding model",
            },
            "text-embedding-ada-002": {
                "name": "text-embedding-ada-002",
                "provider": ProviderType.VLLM,
                "dimensions": 1536,
                "max_tokens": 8191,
                "description": "OpenAI Ada-002 embedding model via vLLM",
            },
            "text-embedding-3-small": {
                "name": "text-embedding-3-small",
                "provider": ProviderType.VLLM,
                "dimensions": 1536,
                "max_tokens": 8191,
                "description": "OpenAI text-embedding-3-small via vLLM",
            },
        }

    async def initialize(self) -> bool:
        """Initialize the embedding service."""
        try:
            if not self.ai_service:
                # Try to get AI service from service registry
                from ....core.service_registry import ServiceRegistry
                service_registry = ServiceRegistry()
                self.ai_service = service_registry.get_service("ai_service")
                
                if not self.ai_service:
                    logger.error("AI service not available for embedding service")
                    return False

            self.status = ServiceStatus.RUNNING
            logger.info("AI embedding service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize AI embedding service: {e}")
            self.status = ServiceStatus.ERROR
            return False

    async def shutdown(self) -> None:
        """Shutdown the embedding service."""
        try:
            self.status = ServiceStatus.STOPPING
            # Clear cache
            self.lru_cache.cache.clear()
            self.status = ServiceStatus.STOPPED
            logger.info("AI embedding service shutdown completed")
        except Exception as e:
            logger.error(f"Error during embedding service shutdown: {e}")
            self.status = ServiceStatus.ERROR

    def _generate_cache_key(self, text: str, model: str) -> str:
        """Generate cache key for text and model combination."""
        content = f"{text}:{model}"
        return hashlib.md5(content.encode()).hexdigest()

    async def embed_text(
        self, 
        text: str, 
        model: Optional[str] = None,
        **kwargs
    ) -> EmbeddingResult:
        """Generate embedding for a single text."""
        if not self.ai_service:
            raise RuntimeError("AI service not available")

        model = model or self.default_model
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = self._generate_cache_key(text, model)
            cached_embedding = self.lru_cache.get(cache_key)
            
            if cached_embedding:
                self.metrics["cache_hits"] += 1
                if DEBUG_RAG_OPERATIONS:
                    logger.debug(f"Cache hit for embedding: {cache_key[:8]}...")
                
                return EmbeddingResult(
                    embedding=cached_embedding,
                    model=model,
                    text=text,
                    dimensions=len(cached_embedding),
                    processing_time_ms=(time.time() - start_time) * 1000,
                    cached=True,
                )
            
            self.metrics["cache_misses"] += 1
            
            # Generate embedding using AI service
            async with self.concurrency_limiter:
                embedding = await self._generate_embedding(text, model)
            
            # Cache the result
            self.lru_cache.put(cache_key, embedding)
            
            processing_time = (time.time() - start_time) * 1000
            self.metrics["requests"] += 1
            self.metrics["total_latency_ms"] += processing_time
            
            if DEBUG_RAG_OPERATIONS:
                logger.debug(f"Generated embedding for text: {text[:50]}... (model: {model}, time: {processing_time:.2f}ms)")
            
            return EmbeddingResult(
                embedding=embedding,
                model=model,
                text=text,
                dimensions=len(embedding),
                processing_time_ms=processing_time,
                cached=False,
            )
            
        except Exception as e:
            self.metrics["errors"] += 1
            logger.error(f"Failed to generate embedding: {e}")
            raise

    async def embed_batch(
        self, 
        texts: List[str], 
        model: Optional[str] = None,
        **kwargs
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        if not self.ai_service:
            raise RuntimeError("AI service not available")

        model = model or self.default_model
        start_time = time.time()
        
        try:
            # Process texts concurrently
            tasks = [self.embed_text(text, model, **kwargs) for text in texts]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            embeddings = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to generate embedding for text {i}: {result}")
                    # Use zero vector as fallback
                    model_info = self.model_registry.get(model, {})
                    dimensions = model_info.get("dimensions", 1024)
                    embeddings.append([0.0] * dimensions)
                else:
                    embeddings.append(result.embedding)
            
            processing_time = (time.time() - start_time) * 1000
            if DEBUG_RAG_OPERATIONS:
                logger.debug(f"Generated {len(embeddings)} embeddings in {processing_time:.2f}ms")
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise

    async def embed_batch_detailed(
        self, 
        texts: List[str], 
        model: Optional[str] = None,
        **kwargs
    ) -> List[EmbeddingResult]:
        """Generate embeddings for a batch of texts with detailed results."""
        if not self.ai_service:
            raise RuntimeError("AI service not available")

        model = model or self.default_model
        start_time = time.time()
        
        try:
            # Process texts concurrently
            tasks = [self.embed_text(text, model, **kwargs) for text in texts]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            embeddings = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to generate embedding for text {i}: {result}")
                    # Create error result
                    model_info = self.model_registry.get(model, {})
                    dimensions = model_info.get("dimensions", 1024)
                    error_result = EmbeddingResult(
                        embedding=[0.0] * dimensions,
                        model=model,
                        text=texts[i],
                        dimensions=dimensions,
                        processing_time_ms=0.0,
                        cached=False,
                        error=str(result),
                    )
                    embeddings.append(error_result)
                else:
                    embeddings.append(result)
            
            processing_time = (time.time() - start_time) * 1000
            if DEBUG_RAG_OPERATIONS:
                logger.debug(f"Generated {len(embeddings)} detailed embeddings in {processing_time:.2f}ms")
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate detailed batch embeddings: {e}")
            raise

    async def _generate_embedding(self, text: str, model: str) -> List[float]:
        """Generate embedding using AI service."""
        for attempt in range(self.max_retries):
            try:
                # Get model info to determine provider
                model_info = self.model_registry.get(model, {})
                provider = model_info.get("provider", self.default_provider)
                
                # Format text for embedding generation
                formatted_text = self._format_text_for_embedding(text, model)
                
                # Generate embedding using AI service
                embedding = await self.ai_service.generate_embedding(
                    text=formatted_text,
                    model=model,
                    provider=provider,
                )
                
                if embedding and len(embedding) > 0:
                    return embedding
                else:
                    raise RuntimeError("No embedding returned from AI service")
                    
            except Exception as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                    continue
                else:
                    self.metrics["errors"] += 1
                    raise RuntimeError(f"Failed to generate embedding after {self.max_retries} attempts: {e}")

    def _format_text_for_embedding(self, text: str, model: str) -> str:
        """Format text for embedding generation based on model requirements."""
        # Format prompt for EmbeddingGemma
        if "embeddinggemma" in model.lower():
            return f"task: search result | query: {text}"
        elif "mxbai" in model.lower():
            return f"search_query: {text}"
        elif "nomic" in model.lower():
            return f"search_document: {text}"
        else:
            return text

    def get_available_models(self) -> List[str]:
        """Get list of available embedding models."""
        return list(self.model_registry.keys())

    def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model."""
        return self.model_registry.get(model, {})

    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics."""
        cache_stats = self.lru_cache.get_stats()
        avg_latency = (
            self.metrics["total_latency_ms"] / self.metrics["requests"]
            if self.metrics["requests"] > 0
            else 0.0
        )
        
        return {
            "service_name": self.name,
            "status": self.status.value,
            "metrics": {
                **self.metrics,
                "average_latency_ms": avg_latency,
            },
            "cache": cache_stats,
            "models": {
                "available": len(self.model_registry),
                "default": self.default_model,
            },
        }

    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of the service."""
        return {
            "service_name": self.name,
            "status": self.status.value,
            "healthy": self.status == ServiceStatus.RUNNING,
            "ai_service_available": self.ai_service is not None,
            "cache_size": len(self.lru_cache.cache),
            "available_models": len(self.model_registry),
            "error_rate": (
                self.metrics["errors"] / self.metrics["requests"]
                if self.metrics["requests"] > 0
                else 0.0
            ),
        }
