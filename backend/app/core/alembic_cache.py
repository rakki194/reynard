"""Alembic Cache Manager
====================

Cache manager specifically for Alembic operations to improve migration performance
and reduce database load during frequent migration operations.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any

from .cache_config import CacheConfig
from .cache_optimizer import IntelligentCacheManager

logger = logging.getLogger(__name__)


class AlembicCacheManager:
    """Cache manager specifically for Alembic operations."""

    def __init__(
        self, redis_enabled: bool = None, fallback_cache: dict | None = None,
    ):
        """Initialize the Alembic cache manager.

        Args:
            redis_enabled: Whether to use Redis caching (None for config default)
            fallback_cache: Fallback cache when Redis is unavailable

        """
        self.redis_enabled = (
            redis_enabled
            if redis_enabled is not None
            else CacheConfig.ALEMBIC_CACHE_ENABLED
        )
        self.fallback_cache = fallback_cache or {}
        self.cache_manager: IntelligentCacheManager | None = None

        # Cache configuration
        self.namespace = "alembic"
        self.migration_metadata_ttl = CacheConfig.get_cache_ttl("migration_metadata")
        self.migration_data_ttl = CacheConfig.get_cache_ttl("migration_data")
        self.schema_cache_ttl = CacheConfig.get_cache_ttl("schema_info")

        # Initialize cache manager if Redis is enabled
        if self.redis_enabled:
            asyncio.create_task(self._initialize_cache_manager())

    async def _initialize_cache_manager(self):
        """Initialize the Redis cache manager."""
        try:
            self.cache_manager = IntelligentCacheManager(
                redis_url=CacheConfig.get_alembic_redis_url(),
                max_connections=CacheConfig.REDIS_MAX_CONNECTIONS,
                default_ttl=CacheConfig.ALEMBIC_CACHE_TTL,
            )
            await self.cache_manager.initialize()
            logger.info("Alembic cache manager initialized with Redis")
        except Exception as e:
            logger.warning(f"Failed to initialize Redis cache manager: {e}")
            self.cache_manager = None
            self.redis_enabled = False

    def _get_cache_key(self, key_type: str, identifier: str) -> str:
        """Generate a cache key for Alembic operations.

        Args:
            key_type: Type of cache key (migration, schema, data)
            identifier: Unique identifier (revision, table name, etc.)

        Returns:
            Cache key string

        """
        return f"{self.namespace}:{key_type}:{identifier}"

    async def cache_migration_metadata(
        self, revision: str, metadata: dict[str, Any],
    ) -> None:
        """Cache migration metadata.

        Args:
            revision: Migration revision ID
            metadata: Migration metadata to cache

        """
        cache_key = self._get_cache_key("migration_metadata", revision)

        try:
            if self.cache_manager:
                await self.cache_manager.set(
                    cache_key, metadata, self.namespace, self.migration_metadata_ttl,
                )
                logger.debug(f"Cached migration metadata for revision {revision}")
            else:
                # Fallback to memory cache
                self.fallback_cache[cache_key] = {
                    "data": metadata,
                    "expires": datetime.now()
                    + timedelta(seconds=self.migration_metadata_ttl),
                }
        except Exception as e:
            logger.error(f"Failed to cache migration metadata for {revision}: {e}")

    async def get_cached_migration_metadata(
        self, revision: str,
    ) -> dict[str, Any] | None:
        """Get cached migration metadata.

        Args:
            revision: Migration revision ID

        Returns:
            Cached metadata or None if not found

        """
        cache_key = self._get_cache_key("migration_metadata", revision)

        try:
            if self.cache_manager:
                return await self.cache_manager.get(cache_key, self.namespace)
            # Check fallback cache
            cached_item = self.fallback_cache.get(cache_key)
            if cached_item and datetime.now() < cached_item["expires"]:
                return cached_item["data"]
            if cached_item:
                # Expired, remove it
                del self.fallback_cache[cache_key]
            return None
        except Exception as e:
            logger.error(f"Failed to get cached migration metadata for {revision}: {e}")
            return None

    async def cache_migration_data(
        self, revision: str, data: list[dict[str, Any]],
    ) -> None:
        """Cache migration data to avoid re-parsing.

        Args:
            revision: Migration revision ID
            data: Migration data to cache

        """
        cache_key = self._get_cache_key("migration_data", revision)

        try:
            if self.cache_manager:
                await self.cache_manager.set(
                    cache_key, data, self.namespace, self.migration_data_ttl,
                )
                logger.debug(f"Cached migration data for revision {revision}")
            else:
                # Fallback to memory cache
                self.fallback_cache[cache_key] = {
                    "data": data,
                    "expires": datetime.now()
                    + timedelta(seconds=self.migration_data_ttl),
                }
        except Exception as e:
            logger.error(f"Failed to cache migration data for {revision}: {e}")

    async def get_cached_migration_data(
        self, revision: str,
    ) -> list[dict[str, Any]] | None:
        """Get cached migration data.

        Args:
            revision: Migration revision ID

        Returns:
            Cached data or None if not found

        """
        cache_key = self._get_cache_key("migration_data", revision)

        try:
            if self.cache_manager:
                return await self.cache_manager.get(cache_key, self.namespace)
            # Check fallback cache
            cached_item = self.fallback_cache.get(cache_key)
            if cached_item and datetime.now() < cached_item["expires"]:
                return cached_item["data"]
            if cached_item:
                # Expired, remove it
                del self.fallback_cache[cache_key]
            return None
        except Exception as e:
            logger.error(f"Failed to get cached migration data for {revision}: {e}")
            return None

    async def cache_schema_info(
        self, table_name: str, schema_info: dict[str, Any],
    ) -> None:
        """Cache database schema information.

        Args:
            table_name: Name of the database table
            schema_info: Schema information to cache

        """
        cache_key = self._get_cache_key("schema", table_name)

        try:
            if self.cache_manager:
                await self.cache_manager.set(
                    cache_key, schema_info, self.namespace, self.schema_cache_ttl,
                )
                logger.debug(f"Cached schema info for table {table_name}")
            else:
                # Fallback to memory cache
                self.fallback_cache[cache_key] = {
                    "data": schema_info,
                    "expires": datetime.now()
                    + timedelta(seconds=self.schema_cache_ttl),
                }
        except Exception as e:
            logger.error(f"Failed to cache schema info for {table_name}: {e}")

    async def get_cached_schema_info(self, table_name: str) -> dict[str, Any] | None:
        """Get cached schema information.

        Args:
            table_name: Name of the database table

        Returns:
            Cached schema info or None if not found

        """
        cache_key = self._get_cache_key("schema", table_name)

        try:
            if self.cache_manager:
                return await self.cache_manager.get(cache_key, self.namespace)
            # Check fallback cache
            cached_item = self.fallback_cache.get(cache_key)
            if cached_item and datetime.now() < cached_item["expires"]:
                return cached_item["data"]
            if cached_item:
                # Expired, remove it
                del self.fallback_cache[cache_key]
            return None
        except Exception as e:
            logger.error(f"Failed to get cached schema info for {table_name}: {e}")
            return None

    async def invalidate_migration_cache(self, revision: str) -> None:
        """Invalidate cache when migration changes.

        Args:
            revision: Migration revision ID to invalidate

        """
        try:
            if self.cache_manager:
                # Invalidate all cache keys for this revision
                metadata_key = self._get_cache_key("migration_metadata", revision)
                data_key = self._get_cache_key("migration_data", revision)

                await self.cache_manager.delete(metadata_key, self.namespace)
                await self.cache_manager.delete(data_key, self.namespace)

                logger.info(f"Invalidated cache for migration {revision}")
            else:
                # Remove from fallback cache
                metadata_key = self._get_cache_key("migration_metadata", revision)
                data_key = self._get_cache_key("migration_data", revision)

                self.fallback_cache.pop(metadata_key, None)
                self.fallback_cache.pop(data_key, None)
        except Exception as e:
            logger.error(f"Failed to invalidate cache for migration {revision}: {e}")

    async def invalidate_all_cache(self) -> None:
        """Invalidate all Alembic cache."""
        try:
            if self.cache_manager:
                await self.cache_manager.clear_namespace(self.namespace)
                logger.info("Invalidated all Alembic cache")
            else:
                # Clear fallback cache
                self.fallback_cache.clear()
        except Exception as e:
            logger.error(f"Failed to invalidate all cache: {e}")

    async def get_cache_stats(self) -> dict[str, Any]:
        """Get cache statistics.

        Returns:
            Cache statistics dictionary

        """
        try:
            if self.cache_manager:
                return await self.cache_manager.get_metrics()
            return {
                "cache_type": "fallback_memory",
                "fallback_cache_size": len(self.fallback_cache),
                "redis_enabled": False,
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"error": str(e)}

    async def close(self) -> None:
        """Close the cache manager."""
        try:
            if self.cache_manager:
                await self.cache_manager.close()
                logger.info("Alembic cache manager closed")
        except Exception as e:
            logger.error(f"Error closing Alembic cache manager: {e}")


# Global instance
_alembic_cache_manager: AlembicCacheManager | None = None


def get_alembic_cache_manager() -> AlembicCacheManager:
    """Get the global Alembic cache manager instance.

    Returns:
        AlembicCacheManager instance

    """
    global _alembic_cache_manager
    if _alembic_cache_manager is None:
        _alembic_cache_manager = AlembicCacheManager()
    return _alembic_cache_manager


async def initialize_alembic_cache(redis_enabled: bool = True) -> AlembicCacheManager:
    """Initialize the global Alembic cache manager.

    Args:
        redis_enabled: Whether to use Redis caching

    Returns:
        Initialized AlembicCacheManager instance

    """
    global _alembic_cache_manager
    _alembic_cache_manager = AlembicCacheManager(redis_enabled=redis_enabled)
    await _alembic_cache_manager._initialize_cache_manager()
    return _alembic_cache_manager
