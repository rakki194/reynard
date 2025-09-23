"""
🦊 Reynard Diffusion Model Cache
===============================

Advanced model caching system for Diffusion-LLM service with intelligent
cache management, model validation, and performance optimization.

This module provides:
- Intelligent model caching with LRU eviction
- Model validation and health checking
- Cache statistics and monitoring
- Memory usage optimization
- Model preloading and warmup
- Cache invalidation strategies

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional, Tuple

from ...core.logging_config import get_service_logger

logger = get_service_logger("diffusion")


class ModelCacheEntry:
    """Represents a cached model entry with metadata."""

    def __init__(self, model_id: str, model_instance: Any, metadata: Dict[str, Any]):
        self.model_id = model_id
        self.model_instance = model_instance
        self.metadata = metadata
        self.created_at = time.time()
        self.last_accessed = time.time()
        self.access_count = 0
        self.is_healthy = True
        self.memory_usage = 0.0

    def access(self) -> None:
        """Update access statistics."""
        self.last_accessed = time.time()
        self.access_count += 1

    def update_health(self, is_healthy: bool) -> None:
        """Update model health status."""
        self.is_healthy = is_healthy

    def update_memory_usage(self, memory_usage: float) -> None:
        """Update memory usage information."""
        self.memory_usage = memory_usage

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "model_id": self.model_id,
            "created_at": self.created_at,
            "last_accessed": self.last_accessed,
            "access_count": self.access_count,
            "is_healthy": self.is_healthy,
            "memory_usage": self.memory_usage,
            "metadata": self.metadata,
        }


class DiffusionModelCache:
    """
    Intelligent model cache for Diffusion-LLM service.

    Provides advanced caching capabilities including:
    - LRU eviction policy
    - Model health monitoring
    - Memory usage tracking
    - Cache statistics
    - Automatic cleanup
    """

    def __init__(
        self,
        max_size: int = 5,
        max_memory_mb: float = 2048.0,
        health_check_interval: int = 300,
        cleanup_interval: int = 600,
    ):
        self.max_size = max_size
        self.max_memory_mb = max_memory_mb
        self.health_check_interval = health_check_interval
        self.cleanup_interval = cleanup_interval

        # Cache storage using OrderedDict for LRU behavior
        self._cache: OrderedDict[str, ModelCacheEntry] = OrderedDict()
        self._lock = asyncio.Lock()

        # Statistics
        self._stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "health_checks": 0,
            "cleanups": 0,
            "total_requests": 0,
        }

        # Background tasks
        self._health_check_task: Optional[asyncio.Task] = None
        self._cleanup_task: Optional[asyncio.Task] = None
        self._running = False

        logger.info(
            "DiffusionModelCache initialized",
            extra={
                "max_size": max_size,
                "max_memory_mb": max_memory_mb,
                "health_check_interval": health_check_interval,
                "cleanup_interval": cleanup_interval,
            },
        )

    async def start(self) -> None:
        """Start background tasks for cache management."""
        if self._running:
            return

        self._running = True
        self._health_check_task = asyncio.create_task(self._health_check_loop())
        self._cleanup_task = asyncio.create_task(self._cleanup_loop())

        logger.info("DiffusionModelCache background tasks started")

    async def stop(self) -> None:
        """Stop background tasks and cleanup cache."""
        if not self._running:
            return

        self._running = False

        if self._health_check_task:
            self._health_check_task.cancel()
            try:
                await self._health_check_task
            except asyncio.CancelledError:
                pass

        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

        # Clear cache
        async with self._lock:
            self._cache.clear()

        logger.info("DiffusionModelCache stopped and cleared")

    async def get_model(self, model_id: str) -> Optional[Any]:
        """Get a cached model instance."""
        async with self._lock:
            self._stats["total_requests"] += 1

            if model_id in self._cache:
                entry = self._cache[model_id]

                # Check if model is healthy
                if not entry.is_healthy:
                    logger.warning(
                        f"Model {model_id} is unhealthy, removing from cache"
                    )
                    del self._cache[model_id]
                    self._stats["misses"] += 1
                    return None

                # Move to end (most recently used)
                self._cache.move_to_end(model_id)
                entry.access()
                self._stats["hits"] += 1

                logger.debug(f"Cache hit for model {model_id}")
                return entry.model_instance
            else:
                self._stats["misses"] += 1
                logger.debug(f"Cache miss for model {model_id}")
                return None

    async def put_model(
        self,
        model_id: str,
        model_instance: Any,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Cache a model instance."""
        if metadata is None:
            metadata = {}

        async with self._lock:
            # Check if we need to evict
            await self._evict_if_needed()

            # Create cache entry
            entry = ModelCacheEntry(model_id, model_instance, metadata)

            # Add to cache
            self._cache[model_id] = entry

            logger.info(f"Model {model_id} cached successfully")

    async def remove_model(self, model_id: str) -> bool:
        """Remove a model from cache."""
        async with self._lock:
            if model_id in self._cache:
                del self._cache[model_id]
                logger.info(f"Model {model_id} removed from cache")
                return True
            return False

    async def validate_model(self, model_id: str) -> bool:
        """Validate that a cached model is still healthy."""
        async with self._lock:
            if model_id not in self._cache:
                return False

            entry = self._cache[model_id]

            try:
                # Perform health check on model
                # This would typically involve a simple inference test
                is_healthy = await self._perform_model_health_check(
                    entry.model_instance
                )
                entry.update_health(is_healthy)

                self._stats["health_checks"] += 1

                if not is_healthy:
                    logger.warning(f"Model {model_id} failed health check")
                    del self._cache[model_id]

                return is_healthy
            except Exception as e:
                logger.error(f"Health check failed for model {model_id}: {e}")
                entry.update_health(False)
                del self._cache[model_id]
                return False

    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        async with self._lock:
            hit_rate = (
                self._stats["hits"] / self._stats["total_requests"]
                if self._stats["total_requests"] > 0
                else 0.0
            )

            total_memory = sum(entry.memory_usage for entry in self._cache.values())

            return {
                "cache_size": len(self._cache),
                "max_size": self.max_size,
                "hit_rate": hit_rate,
                "total_memory_mb": total_memory,
                "max_memory_mb": self.max_memory_mb,
                "stats": self._stats.copy(),
                "models": [entry.to_dict() for entry in self._cache.values()],
            }

    async def _evict_if_needed(self) -> None:
        """Evict models if cache is full or memory limit exceeded."""
        # Check size limit
        while len(self._cache) >= self.max_size:
            # Remove least recently used
            model_id, entry = self._cache.popitem(last=False)
            self._stats["evictions"] += 1
            logger.info(f"Evicted model {model_id} due to size limit")

        # Check memory limit
        total_memory = sum(entry.memory_usage for entry in self._cache.values())
        while total_memory > self.max_memory_mb and self._cache:
            # Remove least recently used
            model_id, entry = self._cache.popitem(last=False)
            total_memory -= entry.memory_usage
            self._stats["evictions"] += 1
            logger.info(f"Evicted model {model_id} due to memory limit")

    async def _perform_model_health_check(self, model_instance: Any) -> bool:
        """Perform a health check on a model instance."""
        try:
            # This is a placeholder for actual health check logic
            # In a real implementation, this might involve:
            # - Testing model inference with a simple input
            # - Checking model weights integrity
            # - Verifying model can produce output

            # For now, we'll assume the model is healthy if it exists
            return model_instance is not None
        except Exception as e:
            logger.error(f"Model health check failed: {e}")
            return False

    async def _health_check_loop(self) -> None:
        """Background task for periodic health checks."""
        while self._running:
            try:
                await asyncio.sleep(self.health_check_interval)

                if not self._running:
                    break

                async with self._lock:
                    model_ids = list(self._cache.keys())

                # Check health of all cached models
                for model_id in model_ids:
                    await self.validate_model(model_id)

                logger.debug("Completed periodic health check")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Health check loop error: {e}")

    async def _cleanup_loop(self) -> None:
        """Background task for periodic cache cleanup."""
        while self._running:
            try:
                await asyncio.sleep(self.cleanup_interval)

                if not self._running:
                    break

                await self._cleanup_expired_models()
                self._stats["cleanups"] += 1

                logger.debug("Completed periodic cache cleanup")

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Cleanup loop error: {e}")

    async def _cleanup_expired_models(self) -> None:
        """Remove expired models from cache."""
        current_time = time.time()
        expired_models = []

        async with self._lock:
            for model_id, entry in self._cache.items():
                # Remove models that haven't been accessed in 1 hour
                if current_time - entry.last_accessed > 3600:
                    expired_models.append(model_id)

            for model_id in expired_models:
                del self._cache[model_id]
                logger.info(f"Removed expired model {model_id}")

        if expired_models:
            logger.info(f"Cleaned up {len(expired_models)} expired models")


# Global cache instance
_model_cache: Optional[DiffusionModelCache] = None


def get_model_cache() -> DiffusionModelCache:
    """Get the global model cache instance."""
    global _model_cache
    if _model_cache is None:
        _model_cache = DiffusionModelCache()
    return _model_cache


async def initialize_model_cache() -> None:
    """Initialize the global model cache."""
    cache = get_model_cache()
    await cache.start()
    logger.info("Model cache initialized")


async def shutdown_model_cache() -> None:
    """Shutdown the global model cache."""
    global _model_cache
    if _model_cache is not None:
        await _model_cache.stop()
        _model_cache = None
        logger.info("Model cache shutdown")
