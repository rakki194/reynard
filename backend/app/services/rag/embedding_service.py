"""
EmbeddingService: text/code/caption embeddings via Ollama `/api/embed`.

Responsibilities:
- Provide batch embedding API that calls Ollama embed endpoint
- Record simple metrics (counts/timing) internally for now
- Fallback adapters (noop/random) if Ollama unavailable (configurable later)
"""

import logging
import time
from typing import Any, Dict, List, Optional

logger = logging.getLogger("uvicorn")


class EmbeddingService:
    """Service for generating embeddings via Ollama."""
    
    def __init__(self):
        self._enabled = True
        self._metrics: Dict[str, Any] = {
            "requests": 0,
            "errors": 0,
            "last_ms": 0.0,
        }
        self._ollama_client = None
        # Simple in-memory cache for small inputs
        self._cache: Dict[str, List[List[float]]] = {}
        
        # Registry of known models and their dims/metric
        self._registry: Dict[str, Dict[str, Any]] = {
            "mxbai-embed-large": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
            "nomic-embed-text": {"dim": 768, "metric": "cosine", "max_tokens": 512},
            "bge-m3": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
            "bge-large-en-v1.5": {"dim": 1024, "metric": "cosine", "max_tokens": 512},
            "bge-base-en-v1.5": {"dim": 768, "metric": "cosine", "max_tokens": 512},
            "bge-small-en-v1.5": {"dim": 384, "metric": "cosine", "max_tokens": 512},
            "all-MiniLM-L6-v2": {"dim": 384, "metric": "cosine", "max_tokens": 256},
            "all-mpnet-base-v2": {"dim": 768, "metric": "cosine", "max_tokens": 384},
        }
        
        # Configuration
        self._ollama_base_url = "http://localhost:11434"
        self._timeout_seconds = 30
        self._max_retries = 3
        self._retry_delay = 1.0
    
    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the embedding service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            self._ollama_base_url = config.get("ollama_base_url", "http://localhost:11434")
            self._timeout_seconds = config.get("embedding_timeout_seconds", 30)
            self._max_retries = config.get("embedding_max_retries", 3)
            self._retry_delay = config.get("embedding_retry_delay", 1.0)
            
            if not self._enabled:
                logger.info("EmbeddingService disabled by config")
                return True
            
            # Test Ollama connection
            await self._test_ollama_connection()
            
            logger.info("EmbeddingService initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"EmbeddingService initialization failed: {e}")
            return False
    
    async def _test_ollama_connection(self) -> bool:
        """Test connection to Ollama service."""
        try:
            import aiohttp
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self._ollama_base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        logger.info("Ollama connection test successful")
                        return True
                    else:
                        logger.warning(f"Ollama connection test failed: {response.status}")
                        return False
        except Exception as e:
            logger.warning(f"Ollama connection test failed: {e}")
            return False
    
    async def embed_text(
        self, text: str, model: str = "mxbai-embed-large"
    ) -> List[float]:
        """Generate embedding for a single text."""
        if not self._enabled:
            # Return mock embedding for testing
            return [0.1] * self._registry.get(model, {}).get("dim", 1024)
        
        # Check cache first
        cache_key = f"{model}:{hash(text)}"
        if cache_key in self._cache:
            return self._cache[cache_key][0]
        
        try:
            start_time = time.time()
            
            # TODO: Implement actual Ollama embedding call
            # For now, return mock embedding
            dim = self._registry.get(model, {}).get("dim", 1024)
            embedding = [0.1 + (i * 0.001) for i in range(dim)]
            
            # Cache the result
            self._cache[cache_key] = [embedding]
            
            # Update metrics
            self._metrics["requests"] += 1
            self._metrics["last_ms"] = (time.time() - start_time) * 1000
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            self._metrics["errors"] += 1
            raise
    
    async def embed_batch(
        self, texts: List[str], model: str = "mxbai-embed-large"
    ) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        if not self._enabled:
            # Return mock embeddings for testing
            dim = self._registry.get(model, {}).get("dim", 1024)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]
        
        try:
            start_time = time.time()
            
            # TODO: Implement actual batch embedding call
            # For now, return mock embeddings
            dim = self._registry.get(model, {}).get("dim", 1024)
            embeddings = []
            
            for i, text in enumerate(texts):
                embedding = [0.1 + (i * 0.001) + (j * 0.0001) for j in range(dim)]
                embeddings.append(embedding)
            
            # Update metrics
            self._metrics["requests"] += 1
            self._metrics["last_ms"] = (time.time() - start_time) * 1000
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            self._metrics["errors"] += 1
            raise
    
    def get_model_info(self, model: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific model."""
        return self._registry.get(model)
    
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return list(self._registry.keys())
    
    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True
        
        try:
            return await self._test_ollama_connection()
        except Exception as e:
            logger.warning(f"EmbeddingService health check failed: {e}")
            return False
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get embedding service statistics."""
        return {
            "enabled": self._enabled,
            "requests": self._metrics["requests"],
            "errors": self._metrics["errors"],
            "last_request_ms": self._metrics["last_ms"],
            "cache_size": len(self._cache),
            "available_models": len(self._registry),
            "ollama_base_url": self._ollama_base_url
        }
    
    async def shutdown(self):
        """Shutdown the service."""
        self._cache.clear()
        logger.info("EmbeddingService shutdown complete")
