"""
🔐 Key Cache Service with Redis

Redis-based caching service for cryptographic keys to improve performance
and reduce database load. Provides secure key caching with expiration
and automatic cache invalidation.

Key Features:
- Redis-based key caching with TTL
- Secure key serialization/deserialization
- Cache invalidation on key rotation
- Performance monitoring and metrics
- Fallback to database on cache miss

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import base64
import json
import logging
import os
import pickle
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

import redis
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)


class KeyCacheService:
    """
    Redis-based key caching service for improved performance.

    Provides secure caching of cryptographic keys with automatic
    expiration and cache invalidation capabilities.
    """

    def __init__(
        self,
        redis_client: Optional[redis.Redis] = None,
        cache_ttl_seconds: int = 3600,  # 1 hour default TTL
        encryption_key: Optional[bytes] = None,
    ):
        """
        Initialize the key cache service.

        Args:
            redis_client: Redis client instance (optional)
            cache_ttl_seconds: Cache TTL in seconds
            encryption_key: Key for encrypting cached data
        """
        self.redis_client = redis_client or self._get_redis_client()
        self.cache_ttl = cache_ttl_seconds
        self.encryption_key = encryption_key or self._get_encryption_key()
        self.fernet = Fernet(self.encryption_key)

        # Cache key prefixes
        self.KEY_PREFIX = "key_cache:"
        self.METADATA_PREFIX = "key_metadata:"
        self.USAGE_PREFIX = "key_usage:"

    def _get_redis_client(self) -> redis.Redis:
        """Get Redis client instance."""
        try:
            # Try to connect to Redis
            client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", "6379")),
                db=int(os.getenv("REDIS_DB", "0")),
                password=os.getenv("REDIS_PASSWORD"),
                decode_responses=False,  # We need bytes for encryption
            )
            # Test connection
            client.ping()
            logger.info("Connected to Redis for key caching")
            return client
        except Exception as e:
            logger.warning(f"Could not connect to Redis: {e}. Key caching disabled.")
            return None

    def _get_encryption_key(self) -> bytes:
        """Get or generate encryption key for cached data."""
        import os
        import secrets

        # Try to get from environment
        key_str = os.getenv("KEY_CACHE_ENCRYPTION_KEY")
        if key_str:
            try:
                return base64.urlsafe_b64decode(key_str.encode())
            except Exception:
                logger.warning("Invalid KEY_CACHE_ENCRYPTION_KEY, generating new one")

        # Generate new key
        key = Fernet.generate_key()
        logger.warning(
            f"Generated new key cache encryption key. "
            f"Set KEY_CACHE_ENCRYPTION_KEY={base64.urlsafe_b64encode(key).decode()} "
            f"for production use."
        )
        return key

    def _get_cache_key(self, key_id: str, prefix: str = None) -> str:
        """Get Redis cache key for a key ID."""
        if prefix is None:
            prefix = self.KEY_PREFIX
        return f"{prefix}{key_id}"

    def _encrypt_cache_data(self, data: bytes) -> bytes:
        """Encrypt data for caching."""
        return self.fernet.encrypt(data)

    def _decrypt_cache_data(self, encrypted_data: bytes) -> bytes:
        """Decrypt cached data."""
        return self.fernet.decrypt(encrypted_data)

    def cache_key(
        self,
        key_id: str,
        key_data: bytes,
        metadata: Dict[str, Any],
        ttl_seconds: Optional[int] = None,
    ) -> bool:
        """
        Cache a key in Redis.

        Args:
            key_id: Key identifier
            key_data: Key data to cache
            metadata: Key metadata
            ttl_seconds: TTL override (optional)

        Returns:
            True if cached successfully, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            ttl = ttl_seconds or self.cache_ttl

            # Encrypt and cache key data
            encrypted_data = self._encrypt_cache_data(key_data)
            key_cache_key = self._get_cache_key(key_id)

            # Cache key data
            self.redis_client.setex(key_cache_key, ttl, encrypted_data)

            # Cache metadata
            metadata_cache_key = self._get_cache_key(key_id, self.METADATA_PREFIX)
            metadata_json = json.dumps(metadata, default=str)
            self.redis_client.setex(metadata_cache_key, ttl, metadata_json.encode())

            logger.debug(f"Cached key {key_id} with TTL {ttl}s")
            return True

        except Exception as e:
            logger.error(f"Failed to cache key {key_id}: {e}")
            return False

    def get_cached_key(self, key_id: str) -> Optional[Tuple[bytes, Dict[str, Any]]]:
        """
        Get a cached key from Redis.

        Args:
            key_id: Key identifier

        Returns:
            Tuple of (key_data, metadata) if found, None otherwise
        """
        if not self.redis_client:
            return None

        try:
            # Get key data
            key_cache_key = self._get_cache_key(key_id)
            encrypted_data = self.redis_client.get(key_cache_key)

            if not encrypted_data:
                return None

            # Decrypt key data
            key_data = self._decrypt_cache_data(encrypted_data)

            # Get metadata
            metadata_cache_key = self._get_cache_key(key_id, self.METADATA_PREFIX)
            metadata_json = self.redis_client.get(metadata_cache_key)

            metadata = {}
            if metadata_json:
                metadata = json.loads(metadata_json.decode())

            logger.debug(f"Retrieved cached key {key_id}")
            return key_data, metadata

        except Exception as e:
            logger.error(f"Failed to get cached key {key_id}: {e}")
            return None

    def invalidate_key(self, key_id: str) -> bool:
        """
        Invalidate a cached key.

        Args:
            key_id: Key identifier

        Returns:
            True if invalidated successfully, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            # Remove key data and metadata
            key_cache_key = self._get_cache_key(key_id)
            metadata_cache_key = self._get_cache_key(key_id, self.METADATA_PREFIX)
            usage_cache_key = self._get_cache_key(key_id, self.USAGE_PREFIX)

            self.redis_client.delete(key_cache_key, metadata_cache_key, usage_cache_key)

            logger.debug(f"Invalidated cached key {key_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to invalidate cached key {key_id}: {e}")
            return False

    def update_key_usage(self, key_id: str, usage_count: int) -> bool:
        """
        Update key usage statistics in cache.

        Args:
            key_id: Key identifier
            usage_count: New usage count

        Returns:
            True if updated successfully, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            usage_cache_key = self._get_cache_key(key_id, self.USAGE_PREFIX)
            usage_data = {
                "usage_count": usage_count,
                "last_used": datetime.now(timezone.utc).isoformat(),
            }

            self.redis_client.setex(
                usage_cache_key, self.cache_ttl, json.dumps(usage_data).encode()
            )

            return True

        except Exception as e:
            logger.error(f"Failed to update usage for key {key_id}: {e}")
            return False

    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache statistics
        """
        if not self.redis_client:
            return {"error": "Redis not available"}

        try:
            # Get key count
            key_pattern = f"{self.KEY_PREFIX}*"
            key_count = len(self.redis_client.keys(key_pattern))

            # Get memory usage
            info = self.redis_client.info("memory")
            memory_used = info.get("used_memory_human", "unknown")

            return {
                "cached_keys": key_count,
                "memory_used": memory_used,
                "cache_ttl": self.cache_ttl,
                "redis_connected": True,
            }

        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"error": str(e), "redis_connected": False}

    def clear_all_cache(self) -> bool:
        """
        Clear all cached keys.

        Returns:
            True if cleared successfully, False otherwise
        """
        if not self.redis_client:
            return False

        try:
            # Get all cache keys
            key_pattern = f"{self.KEY_PREFIX}*"
            metadata_pattern = f"{self.METADATA_PREFIX}*"
            usage_pattern = f"{self.USAGE_PREFIX}*"

            all_keys = (
                self.redis_client.keys(key_pattern)
                + self.redis_client.keys(metadata_pattern)
                + self.redis_client.keys(usage_pattern)
            )

            if all_keys:
                self.redis_client.delete(*all_keys)

            logger.info(f"Cleared {len(all_keys)} cached keys")
            return True

        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return False


# Global key cache service instance
_key_cache_service: Optional[KeyCacheService] = None


def get_key_cache_service() -> KeyCacheService:
    """Get the global key cache service instance."""
    global _key_cache_service
    if _key_cache_service is None:
        _key_cache_service = KeyCacheService()
    return _key_cache_service
