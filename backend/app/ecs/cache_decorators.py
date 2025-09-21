"""
ECS Cache Decorators
===================

Cache decorators for ECS database queries to improve performance and reduce database load.
"""

import asyncio
import hashlib
import logging
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, Union

from app.core.cache_config import CacheConfig
from app.core.cache_optimizer import CacheStrategy, IntelligentCacheManager

logger = logging.getLogger(__name__)


class ECSCacheManager:
    """Cache manager for ECS database operations."""

    def __init__(self, redis_enabled: bool = None):
        """Initialize the ECS cache manager.

        Args:
            redis_enabled: Whether to use Redis caching (None for config default)
        """
        self.redis_enabled = (
            redis_enabled
            if redis_enabled is not None
            else CacheConfig.ECS_CACHE_ENABLED
        )
        self.cache_manager: Optional[IntelligentCacheManager] = None
        self.fallback_cache: Dict[str, Dict[str, Any]] = {}

        # Cache configuration
        self.namespace = "ecs"
        self.default_ttl = CacheConfig.ECS_CACHE_TTL
        self.short_ttl = 300  # 5 minutes
        self.long_ttl = 3600  # 1 hour

        # Initialize cache manager if Redis is enabled
        if self.redis_enabled:
            asyncio.create_task(self._initialize_cache_manager())

    async def _initialize_cache_manager(self):
        """Initialize the Redis cache manager."""
        try:
            self.cache_manager = IntelligentCacheManager(
                redis_url=CacheConfig.get_ecs_redis_url(),
                max_connections=CacheConfig.REDIS_MAX_CONNECTIONS,
                default_ttl=CacheConfig.ECS_CACHE_TTL,
            )
            await self.cache_manager.initialize()
            logger.info("ECS cache manager initialized with Redis")
        except Exception as e:
            logger.warning(f"Failed to initialize Redis cache manager: {e}")
            self.cache_manager = None
            self.redis_enabled = False

    def _generate_cache_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate a cache key for a function call.

        Args:
            func_name: Name of the function
            args: Function arguments
            kwargs: Function keyword arguments

        Returns:
            Cache key string
        """
        # Create a hash of the function name and arguments
        key_data = f"{func_name}:{str(args)}:{str(sorted(kwargs.items()))}"
        key_hash = hashlib.md5(key_data.encode()).hexdigest()
        return f"{self.namespace}:{func_name}:{key_hash}"

    async def get(self, key: str) -> Optional[Any]:
        """Get a value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        try:
            if self.cache_manager:
                return await self.cache_manager.get(key, self.namespace)
            else:
                # Check fallback cache
                cached_item = self.fallback_cache.get(key)
                if cached_item and not self._is_expired(cached_item):
                    return cached_item["data"]
                elif cached_item:
                    # Expired, remove it
                    del self.fallback_cache[key]
                return None
        except Exception as e:
            logger.error(f"Failed to get from cache: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = None) -> None:
        """Set a value in cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
        """
        ttl = ttl or self.default_ttl

        try:
            if self.cache_manager:
                await self.cache_manager.set(key, value, self.namespace, ttl)
            else:
                # Store in fallback cache
                self.fallback_cache[key] = {
                    "data": value,
                    "expires": asyncio.get_event_loop().time() + ttl,
                }
        except Exception as e:
            logger.error(f"Failed to set cache: {e}")

    def _is_expired(self, cached_item: Dict[str, Any]) -> bool:
        """Check if a cached item is expired.

        Args:
            cached_item: Cached item dictionary

        Returns:
            True if expired, False otherwise
        """
        return asyncio.get_event_loop().time() > cached_item["expires"]

    async def delete(self, key: str) -> None:
        """Delete a value from cache.

        Args:
            key: Cache key to delete
        """
        try:
            if self.cache_manager:
                await self.cache_manager.delete(key, self.namespace)
            else:
                self.fallback_cache.pop(key, None)
        except Exception as e:
            logger.error(f"Failed to delete from cache: {e}")

    async def clear_namespace(self) -> None:
        """Clear all cache in the ECS namespace."""
        try:
            if self.cache_manager:
                await self.cache_manager.clear_namespace(self.namespace)
            else:
                self.fallback_cache.clear()
        except Exception as e:
            logger.error(f"Failed to clear cache namespace: {e}")

    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics.

        Returns:
            Cache statistics dictionary
        """
        try:
            if self.cache_manager:
                return await self.cache_manager.get_metrics()
            else:
                return {
                    "cache_type": "fallback_memory",
                    "fallback_cache_size": len(self.fallback_cache),
                    "redis_enabled": False,
                }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"error": str(e)}


# Global ECS cache manager instance
_ecs_cache_manager: Optional[ECSCacheManager] = None


def get_ecs_cache_manager() -> ECSCacheManager:
    """Get the global ECS cache manager instance.

    Returns:
        ECSCacheManager instance
    """
    global _ecs_cache_manager
    if _ecs_cache_manager is None:
        _ecs_cache_manager = ECSCacheManager()
    return _ecs_cache_manager


def cache_ecs_query(
    namespace: str = "ecs", ttl: int = 1800, cache_key_prefix: str = None
):
    """Decorator for caching ECS database queries.

    Args:
        namespace: Cache namespace
        ttl: Time to live in seconds
        cache_key_prefix: Optional prefix for cache keys

    Returns:
        Decorator function
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_manager = get_ecs_cache_manager()

            # Generate cache key
            func_name = func.__name__
            if cache_key_prefix:
                func_name = f"{cache_key_prefix}:{func_name}"

            cache_key = cache_manager._generate_cache_key(func_name, args, kwargs)

            # Try to get from cache
            try:
                cached_result = await cache_manager.get(cache_key)
                if cached_result is not None:
                    logger.debug(f"Cache hit for {func_name}")
                    return cached_result
            except Exception as e:
                logger.warning(f"Cache get failed for {func_name}: {e}")

            # Execute function and cache result
            try:
                result = await func(*args, **kwargs)
                await cache_manager.set(cache_key, result, ttl)
                logger.debug(f"Cached result for {func_name}")
                return result
            except Exception as e:
                logger.error(f"Function execution failed for {func_name}: {e}")
                raise

        return wrapper

    return decorator


def cache_naming_spirits(ttl: int = 1800):
    """Decorator specifically for caching naming spirits queries.

    Args:
        ttl: Time to live in seconds

    Returns:
        Decorator function
    """
    return cache_ecs_query(
        namespace="naming_spirits", ttl=ttl, cache_key_prefix="spirits"
    )


def cache_naming_components(ttl: int = 1800):
    """Decorator specifically for caching naming components queries.

    Args:
        ttl: Time to live in seconds

    Returns:
        Decorator function
    """
    return cache_ecs_query(
        namespace="naming_components", ttl=ttl, cache_key_prefix="components"
    )


def cache_naming_config(ttl: int = 3600):
    """Decorator specifically for caching naming config queries.

    Args:
        ttl: Time to live in seconds

    Returns:
        Decorator function
    """
    return cache_ecs_query(
        namespace="naming_config", ttl=ttl, cache_key_prefix="config"
    )


def cache_agent_data(ttl: int = 300):
    """Decorator specifically for caching agent data queries.

    Args:
        ttl: Time to live in seconds (shorter for dynamic data)

    Returns:
        Decorator function
    """
    return cache_ecs_query(namespace="agent_data", ttl=ttl, cache_key_prefix="agents")


def invalidate_ecs_cache(pattern: str = None):
    """Decorator for invalidating ECS cache after data modifications.

    Args:
        pattern: Cache key pattern to invalidate (None for all)

    Returns:
        Decorator function
    """

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Execute the function first
            result = await func(*args, **kwargs)

            # Invalidate cache
            try:
                cache_manager = get_ecs_cache_manager()
                if pattern:
                    # Invalidate specific pattern
                    if cache_manager.cache_manager:
                        keys = await cache_manager.cache_manager.get_keys(
                            f"{cache_manager.namespace}:{pattern}"
                        )
                        for key in keys:
                            await cache_manager.delete(key)
                    else:
                        # Remove from fallback cache
                        keys_to_remove = [
                            k
                            for k in cache_manager.fallback_cache.keys()
                            if pattern in k
                        ]
                        for key in keys_to_remove:
                            del cache_manager.fallback_cache[key]
                else:
                    # Invalidate all ECS cache
                    await cache_manager.clear_namespace()

                logger.debug(f"Invalidated cache after {func.__name__}")
            except Exception as e:
                logger.warning(f"Cache invalidation failed for {func.__name__}: {e}")

            return result

        return wrapper

    return decorator


async def initialize_ecs_cache(redis_enabled: bool = True) -> ECSCacheManager:
    """Initialize the global ECS cache manager.

    Args:
        redis_enabled: Whether to use Redis caching

    Returns:
        Initialized ECSCacheManager instance
    """
    global _ecs_cache_manager
    _ecs_cache_manager = ECSCacheManager(redis_enabled=redis_enabled)
    await _ecs_cache_manager._initialize_cache_manager()
    return _ecs_cache_manager
