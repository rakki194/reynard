"""
Cache Configuration
==================

Configuration settings for Redis caching and fallback mechanisms.
"""

import os
from typing import Any, Dict


class CacheConfig:
    """Configuration for caching systems."""

    # Redis Configuration
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "true").lower() == "true"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_MAX_CONNECTIONS: int = int(os.getenv("REDIS_MAX_CONNECTIONS", "20"))

    # Cache Fallback Configuration
    CACHE_FALLBACK: str = os.getenv("CACHE_FALLBACK", "memory")  # memory, none
    CACHE_DEFAULT_TTL: int = int(os.getenv("CACHE_DEFAULT_TTL", "1800"))  # 30 minutes
    CACHE_COMPRESSION: bool = os.getenv("CACHE_COMPRESSION", "true").lower() == "true"

    # Alembic Cache Configuration
    ALEMBIC_CACHE_ENABLED: bool = (
        os.getenv("ALEMBIC_CACHE_ENABLED", "true").lower() == "true"
    )
    ALEMBIC_CACHE_TTL: int = int(os.getenv("ALEMBIC_CACHE_TTL", "3600"))  # 1 hour
    ALEMBIC_REDIS_DB: int = int(os.getenv("ALEMBIC_REDIS_DB", "2"))

    # ECS Cache Configuration
    ECS_CACHE_ENABLED: bool = os.getenv("ECS_CACHE_ENABLED", "true").lower() == "true"
    ECS_CACHE_TTL: int = int(os.getenv("ECS_CACHE_TTL", "1800"))  # 30 minutes
    ECS_REDIS_DB: int = int(os.getenv("ECS_REDIS_DB", "3"))

    # Cache TTL Settings
    CACHE_TTL_SETTINGS: Dict[str, int] = {
        "naming_spirits": 1800,  # 30 minutes
        "naming_components": 1800,  # 30 minutes
        "naming_config": 3600,  # 1 hour
        "agent_data": 300,  # 5 minutes (dynamic data)
        "migration_metadata": 3600,  # 1 hour
        "migration_data": 7200,  # 2 hours
        "schema_info": 1800,  # 30 minutes
    }

    @classmethod
    def get_redis_url(cls, db_number: int) -> str:
        """Get Redis URL for specific database number.

        Args:
            db_number: Redis database number

        Returns:
            Redis URL with database number
        """
        base_url = cls.REDIS_URL.rstrip("/")
        if "?" in base_url:
            return f"{base_url}&db={db_number}"
        else:
            return f"{base_url}/{db_number}"

    @classmethod
    def get_alembic_redis_url(cls) -> str:
        """Get Redis URL for Alembic cache.

        Returns:
            Redis URL for Alembic database
        """
        return cls.get_redis_url(cls.ALEMBIC_REDIS_DB)

    @classmethod
    def get_ecs_redis_url(cls) -> str:
        """Get Redis URL for ECS cache.

        Returns:
            Redis URL for ECS database
        """
        return cls.get_redis_url(cls.ECS_REDIS_DB)

    @classmethod
    def get_cache_ttl(cls, cache_type: str) -> int:
        """Get TTL for specific cache type.

        Args:
            cache_type: Type of cache

        Returns:
            TTL in seconds
        """
        return cls.CACHE_TTL_SETTINGS.get(cache_type, cls.CACHE_DEFAULT_TTL)

    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        """Convert configuration to dictionary.

        Returns:
            Configuration dictionary
        """
        return {
            "redis_enabled": cls.REDIS_ENABLED,
            "redis_url": cls.REDIS_URL,
            "redis_max_connections": cls.REDIS_MAX_CONNECTIONS,
            "cache_fallback": cls.CACHE_FALLBACK,
            "cache_default_ttl": cls.CACHE_DEFAULT_TTL,
            "cache_compression": cls.CACHE_COMPRESSION,
            "alembic_cache_enabled": cls.ALEMBIC_CACHE_ENABLED,
            "alembic_cache_ttl": cls.ALEMBIC_CACHE_TTL,
            "alembic_redis_db": cls.ALEMBIC_REDIS_DB,
            "ecs_cache_enabled": cls.ECS_CACHE_ENABLED,
            "ecs_cache_ttl": cls.ECS_CACHE_TTL,
            "ecs_redis_db": cls.ECS_REDIS_DB,
            "cache_ttl_settings": cls.CACHE_TTL_SETTINGS,
        }
