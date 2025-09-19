"""
Embedding Service: Unified embedding generation with multiple providers.

This service provides a clean interface for generating embeddings using:
- Ollama (primary)
- Sentence Transformers (fallback)
- OpenAI (future)
- Hugging Face (future)
- Mock embeddings (testing)

Features:
- Model registry with metadata
- Batch processing with concurrency control
- LRU caching for performance
- Token validation and truncation
- Provider fallback chain
- Granular backend enable/disable control
"""

import asyncio
import hashlib
import logging
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional

import psutil

from app.config.embedding_backend_config import EmbeddingBackendsConfig, EmbeddingBackendConfig

logger = logging.getLogger("uvicorn")

# Optional imports
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    np = None


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
            "hit_rate": self.get_hit_rate()
        }


class EmbeddingService:
    """Unified embedding service with multiple providers and optimizations."""

    def __init__(self) -> None:
        self._enabled = True
        self._metrics: Dict[str, Any] = {
            "requests": 0,
            "errors": 0,
            "last_ms": 0.0,
            "ollama_requests": 0,
            "sentence_transformer_requests": 0,
            "openai_requests": 0,
            "huggingface_requests": 0,
        }
        
        # LRU cache for performance
        self.lru_cache = LRUCache(max_size=1000)
        
        # Model registry with metadata
        self._model_registry = self._initialize_model_registry()
        
        # Backend configuration
        self._backend_config: Optional[EmbeddingBackendsConfig] = None
        
        # Legacy configuration (for backward compatibility)
        self._ollama_base_url = "http://localhost:11434"
        self._timeout_seconds = 30
        self._max_retries = 3
        self._retry_delay = 1.0
        self._batch_size = 16
        self._max_concurrent_requests = 8
        
        # Sentence-transformer models
        self._sentence_transformer_models: Dict[str, SentenceTransformer] = {}
        
        # Rate limiting and concurrency control
        self._rate_limiter = asyncio.Semaphore(10)
        self._concurrency_limiter = asyncio.Semaphore(self._max_concurrent_requests)

    def _initialize_model_registry(self) -> Dict[str, Dict[str, Any]]:
        """Initialize the model registry with metadata."""
        return {
            # Ollama models (primary)
            "embeddinggemma:latest": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 1,
                "description": "Google's EmbeddingGemma model via Ollama"
            },
            "embeddinggemma": {
                "dim": 1024,
                "metric": "cosine", 
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 1,
                "description": "Google's EmbeddingGemma model via Ollama"
            },
            "nomic-embed-text": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 2,
                "description": "Nomic's general-purpose embedding model"
            },
            "mxbai-embed-large": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 2,
                "description": "Multilingual embedding model"
            },
            "bge-m3": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
                "description": "BGE M3 multilingual embedding model"
            },
            # Sentence-transformer models (fallback)
            "sentence-transformers/all-MiniLM-L6-v2": {
                "dim": 384,
                "metric": "cosine",
                "max_tokens": 256,
                "provider": "sentence_transformers",
                "priority": 4,
                "description": "Lightweight sentence transformer model"
            },
            "sentence-transformers/all-mpnet-base-v2": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 384,
                "provider": "sentence_transformers",
                "priority": 4,
                "description": "High-quality sentence transformer model"
            },
        }

    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the embedding service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            
            # Initialize backend configuration
            backend_config_dict = config.get("embedding_backends", {})
            self._backend_config = EmbeddingBackendsConfig()
            
            # Override with config values if provided
            if backend_config_dict:
                self._backend_config.enabled = backend_config_dict.get("enabled", True)
                self._backend_config.allow_fallback = backend_config_dict.get("allow_fallback", True)
                self._backend_config.default_backend = backend_config_dict.get("default_backend", "ollama")
                self._backend_config.mock_mode = backend_config_dict.get("mock_mode", False)
                
                # Update individual backend configurations
                backends_dict = backend_config_dict.get("backends", {})
                for backend_name, backend_dict in backends_dict.items():
                    if backend_name in self._backend_config.backends:
                        backend = self._backend_config.backends[backend_name]
                        backend.enabled = backend_dict.get("enabled", backend.enabled)
                        backend.base_url = backend_dict.get("base_url", backend.base_url)
                        backend.api_key = backend_dict.get("api_key", backend.api_key)
                        backend.timeout_seconds = backend_dict.get("timeout_seconds", backend.timeout_seconds)
                        backend.max_retries = backend_dict.get("max_retries", backend.max_retries)
                        backend.retry_delay = backend_dict.get("retry_delay", backend.retry_delay)
                        backend.max_concurrent_requests = backend_dict.get("max_concurrent_requests", backend.max_concurrent_requests)
                        backend.batch_size = backend_dict.get("batch_size", backend.batch_size)
            
            # Legacy configuration (for backward compatibility)
            self._ollama_base_url = config.get("ollama_base_url", "http://localhost:11434")
            self._timeout_seconds = config.get("embedding_timeout_seconds", 30)
            self._max_retries = config.get("embedding_max_retries", 3)
            self._retry_delay = config.get("embedding_retry_delay", 1.0)
            self._batch_size = config.get("rag_ingest_batch_size_text", 16)
            self._max_concurrent_requests = config.get("rag_max_concurrent_requests", 8)

            if not self._enabled:
                logger.info("EmbeddingService disabled by config")
                return True

            # Check if we're in mock mode
            if self._backend_config and self._backend_config.mock_mode:
                logger.info("EmbeddingService in mock mode - all backends disabled")
                return True

            # Update limiters
            self._rate_limiter = asyncio.Semaphore(10)
            self._concurrency_limiter = asyncio.Semaphore(self._max_concurrent_requests)

            # Test available backends
            available_backends = await self._test_available_backends()

            if not available_backends:
                logger.warning("No embedding backends available, using mock embeddings")
            else:
                logger.info(f"EmbeddingService initialized with backends: {', '.join(available_backends)}")

            return True

        except Exception as e:
            logger.error(f"EmbeddingService initialization failed: {e}")
            return False

    async def _test_available_backends(self) -> List[str]:
        """Test all available backends and return list of working ones."""
        available_backends = []
        
        if not self._backend_config:
            # Fallback to legacy testing
            if await self._test_ollama_connection():
                available_backends.append("ollama")
            if await self._initialize_sentence_transformers():
                available_backends.append("sentence_transformers")
            return available_backends
        
        # Test each enabled backend
        for backend_name, backend_config in self._backend_config.backends.items():
            if not backend_config.enabled:
                continue
                
            if backend_config.provider == "ollama":
                if await self._test_ollama_connection(backend_config):
                    available_backends.append(backend_name)
            elif backend_config.provider == "sentence_transformers":
                if await self._initialize_sentence_transformers(backend_config):
                    available_backends.append(backend_name)
            elif backend_config.provider == "openai":
                if await self._test_openai_connection(backend_config):
                    available_backends.append(backend_name)
            elif backend_config.provider == "huggingface":
                if await self._test_huggingface_connection(backend_config):
                    available_backends.append(backend_name)
        
        return available_backends

    async def _test_ollama_connection(self, backend_config: Optional[EmbeddingBackendConfig] = None) -> bool:
        """Test connection to Ollama service."""
        try:
            import aiohttp
            
            # Use backend config if provided, otherwise use legacy config
            base_url = backend_config.base_url if backend_config else self._ollama_base_url
            timeout = backend_config.timeout_seconds if backend_config else 5

            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{base_url}/api/tags",
                    timeout=aiohttp.ClientTimeout(total=timeout),
                ) as response:
                    if response.status == 200:
                        logger.info(f"Ollama connection test successful: {base_url}")
                        return True
                    logger.warning(f"Ollama connection test failed: {response.status}")
                    return False
        except Exception as e:
            logger.warning(f"Ollama connection test failed: {e}")
            return False

    async def _initialize_sentence_transformers(self, backend_config: Optional[EmbeddingBackendConfig] = None) -> bool:
        """Initialize sentence-transformer models."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("sentence-transformers not available")
            return False

        try:
            # Load models in background
            await asyncio.get_event_loop().run_in_executor(
                None, self._load_sentence_transformer_models, backend_config
            )
        except Exception as e:
            logger.warning(f"Failed to load sentence-transformer models: {e}")
            return False
        else:
            logger.info("Sentence-transformer models loaded successfully")
            return True

    def _load_sentence_transformer_models(self, backend_config: Optional[EmbeddingBackendConfig] = None) -> None:
        """Load sentence-transformer models (blocking operation)."""
        try:
            # Use backend config models if provided, otherwise use default fallback models
            if backend_config and backend_config.supported_models:
                models_to_load = backend_config.supported_models
            else:
                models_to_load = [
                    "sentence-transformers/all-MiniLM-L6-v2",
                    "sentence-transformers/all-mpnet-base-v2"
                ]
            
            for model_name in models_to_load:
                try:
                    self._sentence_transformer_models[model_name] = SentenceTransformer(model_name)
                    logger.info(f"Loaded sentence-transformer model: {model_name}")
                except Exception as e:
                    logger.warning(f"Failed to load {model_name}: {e}")

        except Exception as e:
            logger.error(f"Failed to load sentence-transformer models: {e}")
            raise

    async def _test_openai_connection(self, backend_config: EmbeddingBackendConfig) -> bool:
        """Test connection to OpenAI API (placeholder for future implementation)."""
        # TODO: Implement OpenAI connection testing
        logger.info("OpenAI backend testing not yet implemented")
        return False

    async def _test_huggingface_connection(self, backend_config: EmbeddingBackendConfig) -> bool:
        """Test connection to Hugging Face API (placeholder for future implementation)."""
        # TODO: Implement Hugging Face connection testing
        logger.info("Hugging Face backend testing not yet implemented")
        return False

    def _generate_cache_key(self, text: str, model: str) -> str:
        """Generate cache key for text and model combination."""
        content = f"{model}:{text}"
        return hashlib.md5(content.encode()).hexdigest()

    async def embed_text(self, text: str, model: str = "embeddinggemma:latest") -> List[float]:
        """Generate embedding for a single text with caching and validation."""
        if not self._enabled:
            # Return mock embedding for testing
            return [0.1] * self._model_registry.get(model, {}).get("dim", 1024)

        # Check if we're in mock mode
        if self._backend_config and self._backend_config.mock_mode:
            return [0.1] * self._model_registry.get(model, {}).get("dim", 1024)

        # Check LRU cache first
        cache_key = self._generate_cache_key(text, model)
        cached_embedding = self.lru_cache.get(cache_key)
        if cached_embedding:
            return cached_embedding

        # Validate token limits
        if not self._is_text_within_limits(text, model):
            logger.warning(f"Text exceeds token limits for {model}, truncating")
            text = self._truncate_text_to_limit(text, model)

        try:
            start_time = time.time()
            
            # Use enhanced embedding with rate limiting and concurrency control
            embedding = await self._embed_with_enhanced_processing(text, model)
            
            # Cache the result
            self.lru_cache.put(cache_key, embedding)
            
            # Update metrics
            self._metrics["requests"] += 1
            self._metrics["last_ms"] = (time.time() - start_time) * 1000
            
            return embedding

        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            self._metrics["errors"] += 1
            raise

    async def embed_batch(self, texts: List[str], model: str = "embeddinggemma:latest") -> List[List[float]]:
        """Generate embeddings for a batch of texts with concurrent processing."""
        if not self._enabled:
            # Return mock embeddings for testing
            dim = self._model_registry.get(model, {}).get("dim", 1024)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

        # Check if we're in mock mode
        if self._backend_config and self._backend_config.mock_mode:
            dim = self._model_registry.get(model, {}).get("dim", 1024)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

        try:
            start_time = time.time()
            
            # Use concurrent batch processing
            embeddings = await self._embed_batch_concurrent(texts, model)
            
            # Update metrics
            self._metrics["requests"] += 1
            self._metrics["last_ms"] = (time.time() - start_time) * 1000
            
            return embeddings

        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            self._metrics["errors"] += 1
            raise

    async def _embed_with_enhanced_processing(self, text: str, model: str) -> List[float]:
        """Generate embedding with rate limiting and concurrency control."""
        async with self._concurrency_limiter:
            async with self._rate_limiter:
                # Use backend-aware embedding generation
                embedding = await self._embed_with_backend_chain(text, model)
                return embedding

    async def _embed_with_backend_chain(self, text: str, model: str) -> List[float]:
        """Generate embedding using backend chain with fallback support."""
        if not self._backend_config:
            # Fallback to legacy behavior
            embedding = await self._embed_with_ollama(text, model)
            if embedding is None:
                # Fallback to sentence-transformers
                embeddings = await self._embed_with_sentence_transformers(
                    [text], "sentence-transformers/all-MiniLM-L6-v2"
                )
                embedding = embeddings[0]
                self._metrics["sentence_transformer_requests"] += 1
            else:
                self._metrics["ollama_requests"] += 1
            return embedding

        # Get enabled backends sorted by priority
        enabled_backends = self._backend_config.get_enabled_backends()
        
        if not enabled_backends:
            # No backends available, return mock embedding
            dim = self._model_registry.get(model, {}).get("dim", 1024)
            return [0.1] * dim

        # Try each backend in priority order
        last_error = None
        for backend in enabled_backends:
            try:
                if backend.provider == "ollama":
                    embedding = await self._embed_with_ollama(text, model, backend)
                    if embedding is not None:
                        self._metrics["ollama_requests"] += 1
                        return embedding
                elif backend.provider == "sentence_transformers":
                    embeddings = await self._embed_with_sentence_transformers([text], model, backend)
                    if embeddings and embeddings[0] is not None:
                        self._metrics["sentence_transformer_requests"] += 1
                        return embeddings[0]
                elif backend.provider == "openai":
                    # TODO: Implement OpenAI embedding
                    logger.warning("OpenAI embedding not yet implemented")
                    continue
                elif backend.provider == "huggingface":
                    # TODO: Implement Hugging Face embedding
                    logger.warning("Hugging Face embedding not yet implemented")
                    continue
            except Exception as e:
                last_error = e
                logger.warning(f"Backend {backend.name} failed: {e}")
                continue

        # All backends failed, return mock embedding
        if last_error:
            logger.error(f"All embedding backends failed, last error: {last_error}")
        dim = self._model_registry.get(model, {}).get("dim", 1024)
        return [0.1] * dim

    async def _embed_batch_concurrent(self, texts: List[str], model: str) -> List[List[float]]:
        """Generate batch embeddings using concurrent processing."""
        # Adaptive concurrency based on system resources
        max_concurrent = min(self._max_concurrent_requests, len(texts), self._get_optimal_concurrency())
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def embed_single_with_retry(text: str, attempt: int = 0) -> List[float]:
            async with semaphore:
                async with self._rate_limiter:
                    try:
                        # Validate token limits
                        if not self._is_text_within_limits(text, model):
                            text = self._truncate_text_to_limit(text, model)
                        
                        return await self._embed_with_retry(text, model)
                    except Exception as e:
                        if attempt < 3:
                            await asyncio.sleep(2 ** attempt)  # Exponential backoff
                            return await embed_single_with_retry(text, attempt + 1)
                        raise e

        # Process in batches to avoid overwhelming the system
        results: List[List[float]] = []
        for i in range(0, len(texts), self._batch_size):
            batch = texts[i:i + self._batch_size]
            batch_tasks = [embed_single_with_retry(text) for text in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Handle exceptions in batch results
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    logger.error(f"Batch embedding failed for text {i + j}: {result}")
                    # Return mock embedding as fallback
                    dim = self._model_registry.get(model, {}).get("dim", 1024)
                    results.append([0.1] * dim)
                else:
                    results.append(result)
        
        return results

    async def _embed_with_retry(self, text: str, model: str, max_attempts: int = 3) -> List[float]:
        """Generate embedding with exponential backoff retry logic."""
        for attempt in range(max_attempts):
            try:
                return await self._embed_with_ollama(text, model)
            except Exception as e:
                if attempt < max_attempts - 1:
                    delay = 2 ** attempt  # Exponential backoff
                    logger.warning(f"Embedding attempt {attempt + 1} failed: {e}, retrying in {delay}s")
                    await asyncio.sleep(delay)
                else:
                    logger.error(f"All embedding attempts failed for {model}: {e}")
                    raise

    async def _embed_with_ollama(self, text: str, model: str, backend_config: Optional[EmbeddingBackendConfig] = None) -> List[float] | None:
        """Generate embedding using Ollama."""
        try:
            import aiohttp

            # Use backend config if provided, otherwise use legacy config
            base_url = backend_config.base_url if backend_config else self._ollama_base_url
            timeout = backend_config.timeout_seconds if backend_config else self._timeout_seconds

            async with aiohttp.ClientSession() as session:
                payload = {"model": model, "prompt": text}

                async with session.post(
                    f"{base_url}/api/embed",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=timeout),
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("embedding")
                    else:
                        logger.warning(f"Ollama embedding failed: {response.status}")
                        return None
        except Exception as e:
            logger.warning(f"Ollama embedding error: {e}")
            return None

    async def _embed_with_sentence_transformers(self, texts: List[str], model: str, backend_config: Optional[EmbeddingBackendConfig] = None) -> List[List[float]]:
        """Generate embeddings using sentence-transformers."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE or model not in self._sentence_transformer_models:
            # Return mock embeddings
            dim = self._model_registry.get(model, {}).get("dim", 384)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

        try:
            # Run in executor to avoid blocking
            def _encode() -> Any:
                return self._sentence_transformer_models[model].encode(
                    texts, convert_to_tensor=False
                )

            embeddings = await asyncio.get_event_loop().run_in_executor(None, _encode)
            return embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings
        except Exception as e:
            logger.warning(f"Sentence-transformer embedding error: {e}")
            # Return mock embeddings as fallback
            dim = self._model_registry.get(model, {}).get("dim", 384)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

    def _get_optimal_concurrency(self) -> int:
        """Determine optimal concurrency based on system resources."""
        try:
            cpu_count = psutil.cpu_count()
            memory_gb = psutil.virtual_memory().total / (1024**3)
            
            # Conservative: 1 per 2GB RAM, max 8, min 2
            optimal = min(8, max(2, int(memory_gb / 2)))
            
            # Adjust based on CPU cores
            optimal = min(optimal, cpu_count)
            
            return optimal
        except Exception as e:
            logger.warning(f"Failed to determine optimal concurrency: {e}")
            return 4  # Safe default

    def _is_text_within_limits(self, text: str, model: str) -> bool:
        """Check if text is within token limits for the model."""
        model_config = self._model_registry.get(model, {})
        max_tokens = model_config.get("max_tokens", 512)
        
        # Simple token estimation (words * 1.3)
        estimated_tokens = len(text.split()) * 1.3
        return estimated_tokens <= max_tokens

    def _truncate_text_to_limit(self, text: str, model: str) -> str:
        """Truncate text to fit within model token limits."""
        model_config = self._model_registry.get(model, {})
        max_tokens = model_config.get("max_tokens", 512)
        
        # Simple truncation by words
        words = text.split()
        max_words = int(max_tokens / 1.3)  # Convert tokens to words
        
        if len(words) <= max_words:
            return text
        
        truncated_words = words[:max_words]
        return " ".join(truncated_words)

    def get_model_info(self, model: str) -> Dict[str, Any] | None:
        """Get information about a specific model."""
        return self._model_registry.get(model)

    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return list(self._model_registry.keys())

    def get_best_model(self, model_type: str = "text") -> str:
        """Get the best available model based on priority and availability."""
        # Sort models by priority (lower number = higher priority)
        sorted_models = sorted(
            self._model_registry.items(),
            key=lambda x: x[1].get("priority", 999)
        )
        
        # Try to find the best available model
        for model_name, model_info in sorted_models:
            provider = model_info.get("provider", "ollama")
            
            # For Ollama models, we'll assume they're available if Ollama is running
            if provider == "ollama":
                return model_name
            
            # For sentence-transformer models, check if they're loaded
            if provider == "sentence_transformers" and model_name in self._sentence_transformer_models:
                return model_name
        
        # Fallback to default
        return "embeddinggemma:latest"

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
        stats = {
            "enabled": self._enabled,
            "requests": self._metrics["requests"],
            "errors": self._metrics["errors"],
            "last_request_ms": self._metrics["last_ms"],
            "ollama_requests": self._metrics["ollama_requests"],
            "sentence_transformer_requests": self._metrics["sentence_transformer_requests"],
            "openai_requests": self._metrics["openai_requests"],
            "huggingface_requests": self._metrics["huggingface_requests"],
            "cache_stats": self.lru_cache.get_stats(),
            "available_models": len(self._model_registry),
            "ollama_base_url": self._ollama_base_url,
            "sentence_transformers_available": SENTENCE_TRANSFORMERS_AVAILABLE,
            "numpy_available": NUMPY_AVAILABLE,
            "loaded_models": list(self._sentence_transformer_models.keys()),
            "best_model": self.get_best_model("text"),
            "max_concurrent_requests": self._max_concurrent_requests,
            "batch_size": self._batch_size,
        }
        
        # Add backend configuration stats if available
        if self._backend_config:
            stats["backend_config"] = {
                "enabled": self._backend_config.enabled,
                "mock_mode": self._backend_config.mock_mode,
                "allow_fallback": self._backend_config.allow_fallback,
                "default_backend": self._backend_config.default_backend,
                "enabled_backends": [backend.name for backend in self._backend_config.get_enabled_backends()],
                "backend_details": {
                    name: {
                        "enabled": backend.enabled,
                        "provider": backend.provider,
                        "priority": backend.priority,
                        "description": backend.description
                    }
                    for name, backend in self._backend_config.backends.items()
                }
            }
        
        return stats

    async def shutdown(self) -> None:
        """Shutdown the service."""
        self.lru_cache.cache.clear()
        self._sentence_transformer_models.clear()
        logger.info("EmbeddingService shutdown complete")
