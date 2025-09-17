"""
EmbeddingService: text/code/caption embeddings via Ollama and sentence-transformers.

Responsibilities:
- Provide batch embedding API that calls Ollama embed endpoint
- Support sentence-transformers as alternative/fallback
- Record simple metrics (counts/timing) internally for now
- Fallback adapters (noop/random) if both unavailable (configurable later)
"""

import asyncio
import logging
import time
from typing import Any

logger = logging.getLogger("uvicorn")

# Optional imports for sentence-transformers
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


class EmbeddingService:
    """Service for generating embeddings via Ollama and sentence-transformers."""

    def __init__(self) -> None:
        self._enabled = True
        self._metrics: dict[str, Any] = {
            "requests": 0,
            "errors": 0,
            "last_ms": 0.0,
            "ollama_requests": 0,
            "sentence_transformer_requests": 0,
        }
        self._ollama_client = None
        # Simple in-memory cache for small inputs
        self._cache: dict[str, list[list[float]]] = {}

        # Registry of known models and their dims/metric
        self._registry: dict[str, dict[str, Any]] = {
            # Ollama models - EmbeddingGemma as priority
            "embeddinggemma:latest": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 1,
            },
            "embeddinggemma": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 1,
            },
            "mxbai-embed-large": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 2,
            },
            "nomic-embed-text": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
            },
            "bge-m3": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
            },
            "bge-large-en-v1.5": {
                "dim": 1024,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
            },
            "bge-base-en-v1.5": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
            },
            "bge-small-en-v1.5": {
                "dim": 384,
                "metric": "cosine",
                "max_tokens": 512,
                "provider": "ollama",
                "priority": 3,
            },
            # Sentence-transformer models (fallback)
            "all-MiniLM-L6-v2": {
                "dim": 384,
                "metric": "cosine",
                "max_tokens": 256,
                "provider": "sentence_transformers",
                "priority": 4,
            },
            "all-mpnet-base-v2": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 384,
                "provider": "sentence_transformers",
                "priority": 4,
            },
            "sentence-transformers/all-MiniLM-L6-v2": {
                "dim": 384,
                "metric": "cosine",
                "max_tokens": 256,
                "provider": "sentence_transformers",
                "priority": 4,
            },
            "sentence-transformers/all-mpnet-base-v2": {
                "dim": 768,
                "metric": "cosine",
                "max_tokens": 384,
                "provider": "sentence_transformers",
                "priority": 4,
            },
        }

        # Configuration
        self._ollama_base_url = "http://localhost:11434"
        self._timeout_seconds = 30
        self._max_retries = 3
        self._retry_delay = 1.0

        # Sentence-transformer models
        self._sentence_transformer_models: dict[str, SentenceTransformer] = {}
        self._default_text_model = "embeddinggemma:latest"  # Priority: EmbeddingGemma (Ollama)
        self._default_code_model = "embeddinggemma:latest"  # Priority: EmbeddingGemma (Ollama)
        self._fallback_text_model = "sentence-transformers/all-MiniLM-L6-v2"
        self._fallback_code_model = "sentence-transformers/all-mpnet-base-v2"
        self._batch_size = 16

    async def initialize(self, config: dict[str, Any]) -> bool:
        """Initialize the embedding service."""
        try:
            self._enabled = config.get("rag_enabled", False)
            self._ollama_base_url = config.get(
                "ollama_base_url", "http://localhost:11434"
            )
            self._timeout_seconds = config.get("embedding_timeout_seconds", 30)
            self._max_retries = config.get("embedding_max_retries", 3)
            self._retry_delay = config.get("embedding_retry_delay", 1.0)
            self._batch_size = config.get("rag_ingest_batch_size_text", 16)

            if not self._enabled:
                logger.info("EmbeddingService disabled by config")
                return True

            # Test Ollama connection
            ollama_available = await self._test_ollama_connection()

            # Initialize sentence-transformers if available
            st_available = await self._initialize_sentence_transformers()

            if not ollama_available and not st_available:
                logger.warning(
                    "Neither Ollama nor sentence-transformers available, using mock embeddings"
                )
            else:
                logger.info(
                    f"EmbeddingService initialized - Ollama: {ollama_available}, Sentence-transformers: {st_available}"
                )

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
                    timeout=aiohttp.ClientTimeout(total=5),
                ) as response:
                    if response.status == 200:
                        logger.info("Ollama connection test successful")
                        return True
                    logger.warning(f"Ollama connection test failed: {response.status}")
                    return False
        except Exception as e:
            logger.warning(f"Ollama connection test failed: {e}")
            return False

    async def _initialize_sentence_transformers(self) -> bool:
        """Initialize sentence-transformer models."""
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            logger.warning("sentence-transformers not available")
            return False

        try:
            # Load default models in background
            await asyncio.get_event_loop().run_in_executor(
                None, self._load_sentence_transformer_models
            )
        except Exception as e:
            logger.warning(f"Failed to load sentence-transformer models: {e}")
            return False
        else:
            logger.info("Sentence-transformer models loaded successfully")
            return True

    def _load_sentence_transformer_models(self) -> None:
        """Load sentence-transformer models (blocking operation)."""
        try:
            # Load fallback text model (sentence-transformer)
            self._sentence_transformer_models[self._fallback_text_model] = (
                SentenceTransformer(self._fallback_text_model)
            )

            # Load fallback code model (sentence-transformer)
            try:
                self._sentence_transformer_models[self._fallback_code_model] = (
                    SentenceTransformer(self._fallback_code_model)
                )
            except Exception as e:
                logger.warning(
                    f"Failed to load code model {self._fallback_code_model}: {e}"
                )
                # Use text model for code as fallback
                self._sentence_transformer_models[self._fallback_code_model] = (
                    self._sentence_transformer_models[self._fallback_text_model]
                )

        except Exception as e:
            logger.error(f"Failed to load sentence-transformer models: {e}")
            raise

    async def embed_text(
        self, text: str, model: str = "embeddinggemma:latest"
    ) -> list[float]:
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
            model_info = self._registry.get(model, {})
            provider = model_info.get("provider", "ollama")

            if provider == "sentence_transformers":
                embeddings = await self._embed_with_sentence_transformers([text], model)
                embedding = embeddings[0]
                self._metrics["sentence_transformer_requests"] += 1
            else:
                # Use Ollama or fallback to sentence-transformers
                embedding = await self._embed_with_ollama(text, model)
                if embedding is None:
                    # Fallback to sentence-transformers
                    embeddings = await self._embed_with_sentence_transformers(
                        [text], self._fallback_text_model
                    )
                    embedding = embeddings[0]
                    self._metrics["sentence_transformer_requests"] += 1
                else:
                    self._metrics["ollama_requests"] += 1

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
        self, texts: list[str], model: str = "embeddinggemma:latest"
    ) -> list[list[float]]:
        """Generate embeddings for a batch of texts."""
        if not self._enabled:
            # Return mock embeddings for testing
            dim = self._registry.get(model, {}).get("dim", 1024)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

        try:
            start_time = time.time()
            model_info = self._registry.get(model, {})
            provider = model_info.get("provider", "ollama")

            if provider == "sentence_transformers":
                embeddings = await self._embed_with_sentence_transformers(texts, model)
                self._metrics["sentence_transformer_requests"] += 1
            else:
                # Use Ollama or fallback to sentence-transformers
                embeddings = await self._embed_batch_with_ollama(texts, model)
                if embeddings is None:
                    # Fallback to sentence-transformers
                    embeddings = await self._embed_with_sentence_transformers(
                        texts, self._fallback_text_model
                    )
                    self._metrics["sentence_transformer_requests"] += 1
                else:
                    self._metrics["ollama_requests"] += 1

            # Update metrics
            self._metrics["requests"] += 1
            self._metrics["last_ms"] = (time.time() - start_time) * 1000

            return embeddings

        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            self._metrics["errors"] += 1
            raise

    async def _embed_with_ollama(self, text: str, model: str) -> list[float] | None:
        """Generate embedding using Ollama."""
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                payload = {"model": model, "prompt": text}

                async with session.post(
                    f"{self._ollama_base_url}/api/embed",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=self._timeout_seconds),
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

    async def _embed_batch_with_ollama(
        self, texts: list[str], model: str
    ) -> list[list[float]] | None:
        """Generate batch embeddings using Ollama."""
        try:
            # For now, process individually (Ollama doesn't have native batch support)
            embeddings = []
            for text in texts:
                embedding = await self._embed_with_ollama(text, model)
                if embedding is None:
                    return None
                embeddings.append(embedding)
            return embeddings
        except Exception as e:
            logger.warning(f"Ollama batch embedding error: {e}")
            return None

    async def _embed_with_sentence_transformers(
        self, texts: list[str], model: str
    ) -> list[list[float]]:
        """Generate embeddings using sentence-transformers."""
        if (
            not SENTENCE_TRANSFORMERS_AVAILABLE
            or model not in self._sentence_transformer_models
        ):
            # Return mock embeddings
            dim = self._registry.get(model, {}).get("dim", 384)
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
            dim = self._registry.get(model, {}).get("dim", 384)
            return [[0.1 + (i * 0.001) for i in range(dim)] for _ in texts]

    def get_model_info(self, model: str) -> dict[str, Any] | None:
        """Get information about a specific model."""
        return self._registry.get(model)

    def get_available_models(self) -> list[str]:
        """Get list of available models."""
        return list(self._registry.keys())

    def get_best_model(self, model_type: str = "text") -> str:
        """Get the best available model based on priority and availability."""
        # Sort models by priority (lower number = higher priority)
        sorted_models = sorted(
            self._registry.items(),
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
        return self._default_text_model if model_type == "text" else self._default_code_model

    async def health_check(self) -> bool:
        """Perform health check."""
        if not self._enabled:
            return True

        try:
            return await self._test_ollama_connection()
        except Exception as e:
            logger.warning(f"EmbeddingService health check failed: {e}")
            return False

    async def get_stats(self) -> dict[str, Any]:
        """Get embedding service statistics."""
        return {
            "enabled": self._enabled,
            "requests": self._metrics["requests"],
            "errors": self._metrics["errors"],
            "last_request_ms": self._metrics["last_ms"],
            "ollama_requests": self._metrics["ollama_requests"],
            "sentence_transformer_requests": self._metrics[
                "sentence_transformer_requests"
            ],
            "cache_size": len(self._cache),
            "available_models": len(self._registry),
            "ollama_base_url": self._ollama_base_url,
            "sentence_transformers_available": SENTENCE_TRANSFORMERS_AVAILABLE,
            "numpy_available": NUMPY_AVAILABLE,
            "loaded_models": list(self._sentence_transformer_models.keys()),
            "default_text_model": self._default_text_model,
            "default_code_model": self._default_code_model,
            "fallback_text_model": self._fallback_text_model,
            "fallback_code_model": self._fallback_code_model,
            "best_text_model": self.get_best_model("text"),
            "best_code_model": self.get_best_model("code"),
        }

    async def shutdown(self) -> None:
        """Shutdown the service."""
        self._cache.clear()
        self._sentence_transformer_models.clear()
        logger.info("EmbeddingService shutdown complete")
