"""Ollama Embedding Service: Text embedding generation using Ollama.

This service provides text embedding generation using the Ollama API,
with support for multiple models, caching, and performance optimization.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import hashlib
import logging
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional

import aiohttp

from ...interfaces.base import BaseService, ServiceStatus
from ...interfaces.embedding import EmbeddingProvider, EmbeddingResult, IEmbeddingService

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


class OllamaEmbeddingService(BaseService, EmbeddingProvider):
    """Ollama-based embedding service with caching and optimization."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__("ollama-embedding", config)
        
        # Service configuration
        self.base_url = self.config.get("ollama_base_url", "http://localhost:11434")
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
        
        # Metrics
        self.metrics = {
            "requests": 0,
            "errors": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_latency_ms": 0.0,
        }

    def _initialize_model_registry(self) -> Dict[str, Dict[str, Any]]:
        """Initialize the model registry with metadata."""
        return {
            "embeddinggemma:latest": {
                "dim": 1024,
                "max_tokens": 2048,
                "description": "Google's EmbeddingGemma model via Ollama",
            },
            "embeddinggemma": {
                "dim": 1024,
                "max_tokens": 512,
                "description": "Google's EmbeddingGemma model via Ollama",
            },
            "nomic-embed-text": {
                "dim": 768,
                "max_tokens": 512,
                "description": "Nomic's general-purpose embedding model",
            },
            "mxbai-embed-large": {
                "dim": 1024,
                "max_tokens": 512,
                "description": "Multilingual embedding model",
            },
        }

    async def initialize(self) -> bool:
        """Initialize the embedding service."""
        try:
            self.update_status(ServiceStatus.INITIALIZING, "Initializing Ollama embedding service")
            
            # Test connection to Ollama
            if not await self._test_connection():
                self.update_status(ServiceStatus.ERROR, "Failed to connect to Ollama")
                return False
            
            self.update_status(ServiceStatus.HEALTHY, "Ollama embedding service initialized")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Ollama embedding service: {e}")
            self.update_status(ServiceStatus.ERROR, f"Initialization failed: {e}")
            return False

    async def shutdown(self) -> None:
        """Shutdown the embedding service."""
        try:
            self.update_status(ServiceStatus.SHUTTING_DOWN, "Shutting down Ollama embedding service")
            
            # Clear cache
            self.lru_cache.cache.clear()
            
            self.update_status(ServiceStatus.SHUTDOWN, "Ollama embedding service shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Error during shutdown: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check."""
        try:
            # Test connection
            is_healthy = await self._test_connection()
            
            if is_healthy:
                self.update_status(ServiceStatus.HEALTHY, "Service is healthy")
            else:
                self.update_status(ServiceStatus.ERROR, "Connection test failed")
            
            return {
                "status": self.status.value,
                "message": self.health.message,
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "cache_stats": self.lru_cache.get_stats(),
                "dependencies": self.get_dependency_status(),
            }
            
        except Exception as e:
            self.logger.error(f"Health check failed: {e}")
            self.update_status(ServiceStatus.ERROR, f"Health check failed: {e}")
            return {
                "status": "error",
                "message": str(e),
                "last_updated": self.health.last_updated.isoformat(),
                "metrics": self.metrics,
                "dependencies": self.get_dependency_status(),
            }

    async def _test_connection(self) -> bool:
        """Test connection to Ollama service."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    return response.status == 200
        except Exception:
            return False

    def _generate_cache_key(self, text: str, model: str) -> str:
        """Generate cache key for text and model combination."""
        content = f"{model}:{text}"
        return hashlib.md5(content.encode()).hexdigest()

    async def embed_text_detailed(
        self, 
        text: str, 
        model: Optional[str] = None,
        **kwargs
    ) -> EmbeddingResult:
        """Generate embedding for a single text."""
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [EMBEDDING] Starting embedding generation for text length: {len(text)}")
        
        if not self.is_healthy():
            logger.error("🚨 [EMBEDDING] Service is not healthy")
            raise RuntimeError("Embedding service is not healthy")
        
        model = model or self.default_model
        
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [EMBEDDING] Using model: {model}")
        
        # Check cache first
        cache_key = self._generate_cache_key(text, model)
        cached_embedding = self.lru_cache.get(cache_key)
        if cached_embedding:
            self.metrics["cache_hits"] += 1
            if DEBUG_RAG_OPERATIONS:
                logger.info(f"🦊 [EMBEDDING] Cache HIT for key: {cache_key[:16]}...")
            return EmbeddingResult(
                embedding=cached_embedding,
                model=model,
                token_count=self.estimate_tokens(text, model),
                processing_time_ms=0.0,
                metadata={"cached": True}
            )
        
        self.metrics["cache_misses"] += 1
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [EMBEDDING] Cache MISS for key: {cache_key[:16]}...")
        
        # Validate text
        if not self.validate_text(text, model):
            logger.error(f"🚨 [EMBEDDING] Text validation failed for model {model}")
            raise ValueError(f"Text is invalid for model {model}")
        
        # Generate embedding
        start_time = time.time()
        
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [EMBEDDING] Generating embedding with Ollama...")
        
        async with self.concurrency_limiter:
            embedding = await self._generate_embedding(text, model)
        
        processing_time = (time.time() - start_time) * 1000
        
        if DEBUG_RAG_OPERATIONS:
            logger.info(f"🦊 [EMBEDDING] Generated embedding in {processing_time:.2f}ms, dimension: {len(embedding)}")
        
        # Cache the result
        self.lru_cache.put(cache_key, embedding)
        
        # Update metrics
        self.metrics["requests"] += 1
        self.metrics["total_latency_ms"] += processing_time
        
        return EmbeddingResult(
            embedding=embedding,
            model=model,
            token_count=self.estimate_tokens(text, model),
            processing_time_ms=processing_time,
            metadata={"cached": False}
        )

    async def embed_batch_detailed(
        self, 
        texts: List[str], 
        model: Optional[str] = None,
        **kwargs
    ) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts."""
        if not self.is_healthy():
            raise RuntimeError("Embedding service is not healthy")
        
        model = model or self.default_model
        
        # Process texts concurrently
        tasks = [self.embed_text_detailed(text, model, **kwargs) for text in texts]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        embeddings = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                self.logger.error(f"Failed to embed text {i}: {result}")
                self.metrics["errors"] += 1
                # Create error result
                embeddings.append(EmbeddingResult(
                    embedding=[],
                    model=model,
                    token_count=0,
                    processing_time_ms=0.0,
                    metadata={"error": str(result)}
                ))
            else:
                embeddings.append(result)
        
        return embeddings

    async def _generate_embedding(self, text: str, model: str) -> List[float]:
        """Generate embedding using Ollama API."""
        for attempt in range(self.max_retries):
            try:
                # Format prompt for EmbeddingGemma
                if "embeddinggemma" in model.lower():
                    formatted_text = f"task: search result | query: {text}"
                else:
                    formatted_text = text
                
                payload = {"model": model, "prompt": formatted_text}
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        f"{self.base_url}/api/embeddings",
                        json=payload,
                        timeout=aiohttp.ClientTimeout(total=self.timeout)
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            embedding = result.get("embedding", [])
                            if embedding:
                                return embedding
                            else:
                                raise RuntimeError("No embedding returned from Ollama")
                        else:
                            raise RuntimeError(f"Ollama API error: {response.status}")
                            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                    continue
                else:
                    self.metrics["errors"] += 1
                    raise RuntimeError(f"Failed to generate embedding after {self.max_retries} attempts: {e}")

    def get_available_models(self) -> List[str]:
        """Get list of available embedding models."""
        return list(self.model_registry.keys())

    def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model."""
        if model not in self.model_registry:
            raise ValueError(f"Model {model} not found")
        return self.model_registry[model]

    def get_best_model(self) -> str:
        """Get the best available model for general use."""
        return self.default_model

    def validate_text(self, text: str, model: Optional[str] = None) -> bool:
        """Validate if text is suitable for embedding."""
        if not text or not text.strip():
            return False
        
        model = model or self.default_model
        model_info = self.model_registry.get(model, {})
        max_tokens = model_info.get("max_tokens", 512)
        
        # Conservative character-based estimation
        max_chars = int(max_tokens * 3.5)
        return len(text) <= max_chars

    def estimate_tokens(self, text: str, model: Optional[str] = None) -> int:
        """Estimate token count for text."""
        # Rough estimation: 1 token ≈ 3.5 characters
        return int(len(text) / 3.5)

    async def get_embedding_stats(self) -> Dict[str, Any]:
        """Get embedding service statistics."""
        avg_latency = (
            self.metrics["total_latency_ms"] / self.metrics["requests"]
            if self.metrics["requests"] > 0 else 0.0
        )
        
        return {
            "service_name": self.name,
            "status": self.status.value,
            "requests": self.metrics["requests"],
            "errors": self.metrics["errors"],
            "cache_hits": self.metrics["cache_hits"],
            "cache_misses": self.metrics["cache_misses"],
            "cache_hit_rate": self.lru_cache.get_hit_rate(),
            "average_latency_ms": avg_latency,
            "available_models": len(self.model_registry),
            "default_model": self.default_model,
            "base_url": self.base_url,
        }

    # Implement abstract methods from EmbeddingProvider interface
    async def generate_embedding(
        self, text: str, model: str = "embeddinggemma:latest"
    ) -> EmbeddingResult:
        """Generate embedding for text (alias for embed_text_detailed)."""
        return await self.embed_text_detailed(text, model)

    async def generate_embeddings_batch(
        self, texts: List[str], model: str = "embeddinggemma:latest"
    ) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts (alias for embed_batch_detailed)."""
        return await self.embed_batch_detailed(texts, model)

    def get_supported_models(self) -> List[str]:
        """Get list of supported models."""
        return self.get_available_models()

    def is_model_available(self, model: str) -> bool:
        """Check if a model is available."""
        return model in self.model_registry

    async def get_stats(self) -> Dict[str, Any]:
        """Get service statistics (alias for get_embedding_stats)."""
        return await self.get_embedding_stats()

    # Additional methods for compatibility with IEmbeddingService interface
    async def embed_text(
        self, 
        text: str, 
        model: str = "embeddinggemma:latest"
    ) -> List[float]:
        """Generate embedding for a single text (returns raw embedding vector)."""
        result = await self.generate_embedding(text, model)
        return result.embedding

    async def embed_batch(
        self, 
        texts: List[str], 
        model: str = "embeddinggemma:latest"
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts (returns raw embedding vectors)."""
        results = await self.generate_embeddings_batch(texts, model)
        return [result.embedding for result in results]

    def get_model_info(self, model: str) -> Dict[str, Any] | None:
        """Get information about a specific model."""
        if model in self.model_registry:
            return {
                "name": model,
                "dimensions": self.model_registry[model].get("dimensions", 1024),
                "max_tokens": self.model_registry[model].get("max_tokens", 512),
                "description": self.model_registry[model].get("description", f"Ollama model: {model}")
            }
        return None

    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return list(self.model_registry.keys())

    def get_best_model(self) -> str:
        """Get the best available model based on priority and availability."""
        return self.default_model

    def get_hit_rate(self) -> float:
        """Get cache hit rate."""
        if self.lru_cache.hits + self.lru_cache.misses == 0:
            return 0.0
        return self.lru_cache.hits / (self.lru_cache.hits + self.lru_cache.misses)
