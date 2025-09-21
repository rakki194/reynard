"""
Redis Cache Optimization for FastAPI ECS Search

This module provides comprehensive caching optimization including:
- Redis connection pooling
- Intelligent cache strategies
- Cache performance monitoring
- Cache invalidation strategies
- Memory optimization
"""

import asyncio
import time
import json
import hashlib
import logging
from typing import Dict, List, Any, Optional, Union, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import pickle
import gzip

import redis.asyncio as redis
from redis.asyncio import ConnectionPool, Redis
from redis.exceptions import RedisError, ConnectionError, TimeoutError

logger = logging.getLogger(__name__)


class CacheStrategy(Enum):
    """Cache strategy types."""

    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used
    TTL = "ttl"  # Time To Live
    WRITE_THROUGH = "write_through"
    WRITE_BACK = "write_back"
    WRITE_AROUND = "write_around"


@dataclass
class CacheMetrics:
    """Cache performance metrics."""

    hits: int = 0
    misses: int = 0
    sets: int = 0
    deletes: int = 0
    evictions: int = 0
    total_requests: int = 0
    hit_rate: float = 0.0
    miss_rate: float = 0.0
    average_get_time_ms: float = 0.0
    average_set_time_ms: float = 0.0
    memory_usage_bytes: int = 0
    key_count: int = 0
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class CacheKey:
    """Cache key with metadata."""

    key: str
    namespace: str
    ttl: Optional[int] = None
    strategy: CacheStrategy = CacheStrategy.TTL
    created_at: datetime = field(default_factory=datetime.now)
    access_count: int = 0
    last_accessed: datetime = field(default_factory=datetime.now)


class CacheSerializer:
    """Intelligent cache serialization with compression."""

    @staticmethod
    def serialize(data: Any, compress: bool = True) -> bytes:
        """Serialize data with optional compression."""
        try:
            # Try JSON serialization first (for simple data)
            if isinstance(data, (dict, list, str, int, float, bool, type(None))):
                serialized = json.dumps(data, default=str).encode("utf-8")
            else:
                # Use pickle for complex objects
                serialized = pickle.dumps(data)

            # Compress if requested and beneficial
            if compress and len(serialized) > 1024:  # Only compress if > 1KB
                compressed = gzip.compress(serialized)
                if len(compressed) < len(serialized):
                    return b"gzip:" + compressed
                else:
                    return b"json:" + serialized
            else:
                return b"json:" + serialized

        except Exception as e:
            logger.error(f"Serialization failed: {e}")
            # Fallback to pickle
            return b"pickle:" + pickle.dumps(data)

    @staticmethod
    def deserialize(data: bytes) -> Any:
        """Deserialize data with automatic decompression."""
        try:
            if data.startswith(b"gzip:"):
                decompressed = gzip.decompress(data[5:])
                return CacheSerializer.deserialize(decompressed)
            elif data.startswith(b"json:"):
                return json.loads(data[5:].decode("utf-8"))
            elif data.startswith(b"pickle:"):
                return pickle.loads(data[7:])
            else:
                # Try JSON first, then pickle
                try:
                    return json.loads(data.decode("utf-8"))
                except:
                    return pickle.loads(data)
        except Exception as e:
            logger.error(f"Deserialization failed: {e}")
            raise


class IntelligentCacheManager:
    """Intelligent cache manager with advanced optimization features."""

    def __init__(
        self,
        redis_url: str = "redis://localhost:6379/0",
        max_connections: int = 50,
        retry_on_timeout: bool = True,
        socket_timeout: int = 5,
        socket_connect_timeout: int = 5,
        health_check_interval: int = 30,
        default_ttl: int = 3600,
        compression_threshold: int = 1024,
        enable_metrics: bool = True,
    ):
        self.redis_url = redis_url
        self.max_connections = max_connections
        self.default_ttl = default_ttl
        self.compression_threshold = compression_threshold
        self.enable_metrics = enable_metrics

        # Create connection pool
        self.pool = ConnectionPool.from_url(
            redis_url,
            max_connections=max_connections,
            retry_on_timeout=retry_on_timeout,
            socket_timeout=socket_timeout,
            socket_connect_timeout=socket_connect_timeout,
            health_check_interval=health_check_interval,
        )

        # Redis client
        self.redis: Optional[Redis] = None

        # Cache metadata
        self.cache_keys: Dict[str, CacheKey] = {}
        self.namespaces: Dict[str, Dict[str, Any]] = {}

        # Metrics
        self.metrics = CacheMetrics()
        self.operation_times: List[float] = []

        # Cache strategies
        self.strategies: Dict[str, CacheStrategy] = {}

        # Background tasks
        self.cleanup_task: Optional[asyncio.Task] = None
        self.metrics_task: Optional[asyncio.Task] = None

    async def initialize(self):
        """Initialize the cache manager."""
        try:
            self.redis = Redis(connection_pool=self.pool)

            # Test connection
            await self.redis.ping()
            logger.info("Redis cache manager initialized successfully")

            # Start background tasks
            if self.enable_metrics:
                self.cleanup_task = asyncio.create_task(self._cleanup_expired_keys())
                self.metrics_task = asyncio.create_task(self._update_metrics())

        except Exception as e:
            logger.error(f"Failed to initialize cache manager: {e}")
            raise

    async def close(self):
        """Close the cache manager and cleanup resources."""
        if self.cleanup_task:
            self.cleanup_task.cancel()
        if self.metrics_task:
            self.metrics_task.cancel()

        if self.redis:
            await self.redis.close()

        logger.info("Cache manager closed")

    def _generate_key(self, namespace: str, key: str) -> str:
        """Generate a namespaced cache key."""
        return f"{namespace}:{key}"

    def _get_cache_key_metadata(self, full_key: str) -> Optional[CacheKey]:
        """Get cache key metadata."""
        return self.cache_keys.get(full_key)

    def _update_cache_key_metadata(
        self, full_key: str, namespace: str, ttl: Optional[int] = None
    ):
        """Update cache key metadata."""
        if full_key in self.cache_keys:
            self.cache_keys[full_key].access_count += 1
            self.cache_keys[full_key].last_accessed = datetime.now()
        else:
            self.cache_keys[full_key] = CacheKey(
                key=full_key,
                namespace=namespace,
                ttl=ttl or self.default_ttl,
                strategy=self.strategies.get(namespace, CacheStrategy.TTL),
            )

    async def get(
        self, key: str, namespace: str = "default", default: Any = None
    ) -> Any:
        """Get a value from cache."""
        if not self.redis:
            return default

        full_key = self._generate_key(namespace, key)
        start_time = time.time()

        try:
            # Get value from Redis
            value = await self.redis.get(full_key)

            if value is None:
                # Cache miss
                self.metrics.misses += 1
                self.metrics.total_requests += 1
                return default

            # Cache hit
            self.metrics.hits += 1
            self.metrics.total_requests += 1

            # Update metadata
            self._update_cache_key_metadata(full_key, namespace)

            # Deserialize value
            deserialized_value = CacheSerializer.deserialize(value)

            # Update metrics
            operation_time = (time.time() - start_time) * 1000
            self.operation_times.append(operation_time)
            self.metrics.average_get_time_ms = sum(self.operation_times[-100:]) / min(
                len(self.operation_times), 100
            )

            return deserialized_value

        except Exception as e:
            logger.error(f"Cache get failed for key {full_key}: {e}")
            self.metrics.misses += 1
            self.metrics.total_requests += 1
            return default

    async def set(
        self,
        key: str,
        value: Any,
        namespace: str = "default",
        ttl: Optional[int] = None,
        strategy: Optional[CacheStrategy] = None,
    ) -> bool:
        """Set a value in cache."""
        if not self.redis:
            return False

        full_key = self._generate_key(namespace, key)
        start_time = time.time()

        try:
            # Serialize value
            serialized_value = CacheSerializer.serialize(
                value, compress=len(str(value)) > self.compression_threshold
            )

            # Determine TTL
            cache_ttl = ttl or self.default_ttl
            if strategy == CacheStrategy.TTL and cache_ttl:
                await self.redis.setex(full_key, cache_ttl, serialized_value)
            else:
                await self.redis.set(full_key, serialized_value)

            # Update metadata
            self._update_cache_key_metadata(full_key, namespace, cache_ttl)
            if strategy:
                self.strategies[namespace] = strategy

            # Update metrics
            self.metrics.sets += 1
            operation_time = (time.time() - start_time) * 1000
            self.operation_times.append(operation_time)
            self.metrics.average_set_time_ms = sum(self.operation_times[-100:]) / min(
                len(self.operation_times), 100
            )

            return True

        except Exception as e:
            logger.error(f"Cache set failed for key {full_key}: {e}")
            return False

    async def delete(self, key: str, namespace: str = "default") -> bool:
        """Delete a value from cache."""
        if not self.redis:
            return False

        full_key = self._generate_key(namespace, key)

        try:
            result = await self.redis.delete(full_key)

            # Remove from metadata
            if full_key in self.cache_keys:
                del self.cache_keys[full_key]

            self.metrics.deletes += 1
            return bool(result)

        except Exception as e:
            logger.error(f"Cache delete failed for key {full_key}: {e}")
            return False

    async def exists(self, key: str, namespace: str = "default") -> bool:
        """Check if a key exists in cache."""
        if not self.redis:
            return False

        full_key = self._generate_key(namespace, key)

        try:
            return bool(await self.redis.exists(full_key))
        except Exception as e:
            logger.error(f"Cache exists check failed for key {full_key}: {e}")
            return False

    async def clear_namespace(self, namespace: str) -> int:
        """Clear all keys in a namespace."""
        if not self.redis:
            return 0

        try:
            pattern = f"{namespace}:*"
            keys = await self.redis.keys(pattern)

            if keys:
                deleted_count = await self.redis.delete(*keys)

                # Remove from metadata
                keys_to_remove = [
                    k for k in self.cache_keys.keys() if k.startswith(f"{namespace}:")
                ]
                for key in keys_to_remove:
                    del self.cache_keys[key]

                return deleted_count

            return 0

        except Exception as e:
            logger.error(f"Cache namespace clear failed for {namespace}: {e}")
            return 0

    async def get_or_set(
        self,
        key: str,
        factory: Callable[[], Any],
        namespace: str = "default",
        ttl: Optional[int] = None,
    ) -> Any:
        """Get value from cache or set it using factory function."""
        # Try to get from cache first
        value = await self.get(key, namespace)

        if value is not None:
            return value

        # Generate value using factory
        try:
            if asyncio.iscoroutinefunction(factory):
                value = await factory()
            else:
                value = factory()

            # Set in cache
            await self.set(key, value, namespace, ttl)

            return value

        except Exception as e:
            logger.error(f"Cache get_or_set factory failed for key {key}: {e}")
            raise

    async def batch_get(
        self, keys: List[str], namespace: str = "default"
    ) -> Dict[str, Any]:
        """Get multiple values from cache in batch."""
        if not self.redis or not keys:
            return {}

        full_keys = [self._generate_key(namespace, key) for key in keys]

        try:
            values = await self.redis.mget(full_keys)
            result = {}

            for i, (key, value) in enumerate(zip(keys, values)):
                if value is not None:
                    try:
                        result[key] = CacheSerializer.deserialize(value)
                        self.metrics.hits += 1
                    except Exception as e:
                        logger.error(f"Failed to deserialize value for key {key}: {e}")
                        self.metrics.misses += 1
                else:
                    self.metrics.misses += 1

            self.metrics.total_requests += len(keys)
            return result

        except Exception as e:
            logger.error(f"Cache batch get failed: {e}")
            return {}

    async def batch_set(
        self,
        items: Dict[str, Any],
        namespace: str = "default",
        ttl: Optional[int] = None,
    ) -> int:
        """Set multiple values in cache in batch."""
        if not self.redis or not items:
            return 0

        try:
            pipe = self.redis.pipeline()

            for key, value in items.items():
                full_key = self._generate_key(namespace, key)
                serialized_value = CacheSerializer.serialize(
                    value, compress=len(str(value)) > self.compression_threshold
                )

                if ttl:
                    pipe.setex(full_key, ttl, serialized_value)
                else:
                    pipe.set(full_key, serialized_value)

                # Update metadata
                self._update_cache_key_metadata(full_key, namespace, ttl)

            results = await pipe.execute()
            self.metrics.sets += len(items)

            return sum(1 for r in results if r)

        except Exception as e:
            logger.error(f"Cache batch set failed: {e}")
            return 0

    async def get_metrics(self) -> CacheMetrics:
        """Get current cache metrics."""
        if self.redis:
            try:
                info = await self.redis.info("memory")
                self.metrics.memory_usage_bytes = info.get("used_memory", 0)
                self.metrics.key_count = await self.redis.dbsize()
            except Exception as e:
                logger.error(f"Failed to get Redis info: {e}")

        # Calculate rates
        if self.metrics.total_requests > 0:
            self.metrics.hit_rate = (
                self.metrics.hits / self.metrics.total_requests
            ) * 100
            self.metrics.miss_rate = (
                self.metrics.misses / self.metrics.total_requests
            ) * 100

        self.metrics.timestamp = datetime.now()
        return self.metrics

    async def _cleanup_expired_keys(self):
        """Background task to cleanup expired keys from metadata."""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes

                current_time = datetime.now()
                expired_keys = []

                for key, metadata in self.cache_keys.items():
                    if (
                        metadata.ttl
                        and (current_time - metadata.created_at).seconds > metadata.ttl
                    ):
                        expired_keys.append(key)

                for key in expired_keys:
                    del self.cache_keys[key]

                if expired_keys:
                    logger.info(
                        f"Cleaned up {len(expired_keys)} expired cache keys from metadata"
                    )

            except Exception as e:
                logger.error(f"Cache cleanup task failed: {e}")

    async def _update_metrics(self):
        """Background task to update cache metrics."""
        while True:
            try:
                await asyncio.sleep(60)  # Update every minute
                await self.get_metrics()
            except Exception as e:
                logger.error(f"Metrics update task failed: {e}")


class CacheOptimizationAnalyzer:
    """Analyze cache performance and provide optimization recommendations."""

    def __init__(self, cache_manager: IntelligentCacheManager):
        self.cache_manager = cache_manager

    async def analyze_cache_performance(self) -> Dict[str, Any]:
        """Analyze cache performance and generate recommendations."""
        metrics = await self.cache_manager.get_metrics()

        analysis = {
            "current_metrics": metrics,
            "recommendations": [],
            "performance_score": 0,
        }

        # Calculate performance score (0-100)
        score = 0

        # Hit rate scoring (40% of total score)
        if metrics.hit_rate >= 90:
            score += 40
        elif metrics.hit_rate >= 80:
            score += 30
        elif metrics.hit_rate >= 70:
            score += 20
        elif metrics.hit_rate >= 60:
            score += 10

        # Response time scoring (30% of total score)
        if metrics.average_get_time_ms <= 1:
            score += 30
        elif metrics.average_get_time_ms <= 5:
            score += 20
        elif metrics.average_get_time_ms <= 10:
            score += 10

        # Memory efficiency scoring (20% of total score)
        if metrics.memory_usage_bytes < 100 * 1024 * 1024:  # < 100MB
            score += 20
        elif metrics.memory_usage_bytes < 500 * 1024 * 1024:  # < 500MB
            score += 15
        elif metrics.memory_usage_bytes < 1024 * 1024 * 1024:  # < 1GB
            score += 10

        # Key distribution scoring (10% of total score)
        if metrics.key_count < 10000:
            score += 10
        elif metrics.key_count < 50000:
            score += 5

        analysis["performance_score"] = score

        # Generate recommendations
        if metrics.hit_rate < 80:
            analysis["recommendations"].append(
                "Improve cache hit rate - consider longer TTL or better key strategies"
            )

        if metrics.average_get_time_ms > 5:
            analysis["recommendations"].append(
                "Optimize cache response times - check Redis configuration"
            )

        if metrics.memory_usage_bytes > 1024 * 1024 * 1024:  # > 1GB
            analysis["recommendations"].append(
                "Reduce memory usage - implement cache eviction policies"
            )

        if metrics.key_count > 100000:
            analysis["recommendations"].append(
                "Too many cache keys - consider namespace cleanup"
            )

        return analysis


# Example usage
async def main():
    """Example usage of the cache optimizer."""
    cache_manager = IntelligentCacheManager()

    try:
        await cache_manager.initialize()

        # Example usage
        await cache_manager.set(
            "user:123", {"name": "John", "email": "john@example.com"}, ttl=3600
        )
        user = await cache_manager.get("user:123")
        print(f"Retrieved user: {user}")

        # Get metrics
        metrics = await cache_manager.get_metrics()
        print(f"Cache hit rate: {metrics.hit_rate:.2f}%")

        # Analyze performance
        analyzer = CacheOptimizationAnalyzer(cache_manager)
        analysis = await analyzer.analyze_cache_performance()
        print(f"Performance score: {analysis['performance_score']}/100")

    finally:
        await cache_manager.close()


if __name__ == "__main__":
    asyncio.run(main())
