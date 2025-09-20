"""
Optimization Configuration
=========================

Default configuration for performance optimizations in the FastAPI ECS search system.
This ensures all optimizations are enabled by default with optimal settings.
"""

import os
from typing import Dict, Any

# Default optimization settings
DEFAULT_OPTIMIZATION_CONFIG = {
    # Cache optimization settings
    "cache": {
        "enabled": True,
        "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379/1"),
        "max_connections": int(os.getenv("REDIS_MAX_CONNECTIONS", "20")),
        "default_ttl": int(os.getenv("CACHE_TTL", "3600")),  # 1 hour
        "compression_threshold": int(os.getenv("CACHE_COMPRESSION_THRESHOLD", "1024")),  # 1KB
        "enable_metrics": True,
        "enable_namespacing": True,
        "fallback_to_legacy": True,
    },
    
    # Database optimization settings
    "database": {
        "enabled": True,
        "pool_size": int(os.getenv("DB_POOL_SIZE", "20")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "30")),
        "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
        "enable_health_checks": True,
        "enable_query_monitoring": True,
    },
    
    # HTTP connection optimization settings
    "http": {
        "enabled": True,
        "connection_limit": int(os.getenv("HTTP_CONNECTION_LIMIT", "100")),
        "connection_limit_per_host": int(os.getenv("HTTP_CONNECTION_LIMIT_PER_HOST", "30")),
        "dns_cache_ttl": int(os.getenv("HTTP_DNS_CACHE_TTL", "300")),
        "enable_dns_cache": True,
        "timeout_seconds": int(os.getenv("HTTP_TIMEOUT_SECONDS", "30")),
    },
    
    # Performance monitoring settings
    "monitoring": {
        "enabled": True,
        "enable_metrics_collection": True,
        "enable_performance_tracking": True,
        "enable_cache_analytics": True,
        "metrics_retention_hours": int(os.getenv("METRICS_RETENTION_HOURS", "24")),
    },
    
    # Search optimization settings
    "search": {
        "enable_parallel_processing": True,
        "enable_intelligent_caching": True,
        "cache_ttl_semantic": int(os.getenv("CACHE_TTL_SEMANTIC", "3600")),  # 1 hour
        "cache_ttl_syntax": int(os.getenv("CACHE_TTL_SYNTAX", "1800")),  # 30 minutes
        "cache_ttl_hybrid": int(os.getenv("CACHE_TTL_HYBRID", "1800")),  # 30 minutes
        "max_concurrent_searches": int(os.getenv("MAX_CONCURRENT_SEARCHES", "10")),
    }
}

def get_optimization_config() -> Dict[str, Any]:
    """Get the optimization configuration with environment variable overrides."""
    config = DEFAULT_OPTIMIZATION_CONFIG.copy()
    
    # Override with environment variables if present
    for section, settings in config.items():
        for key, default_value in settings.items():
            env_key = f"{section.upper()}_{key.upper()}"
            if env_key in os.environ:
                # Convert string values to appropriate types
                if isinstance(default_value, bool):
                    config[section][key] = os.environ[env_key].lower() in ('true', '1', 'yes', 'on')
                elif isinstance(default_value, int):
                    try:
                        config[section][key] = int(os.environ[env_key])
                    except ValueError:
                        pass  # Keep default value
                else:
                    config[section][key] = os.environ[env_key]
    
    return config

def is_optimization_enabled(component: str) -> bool:
    """Check if a specific optimization component is enabled."""
    config = get_optimization_config()
    return config.get(component, {}).get("enabled", False)

def get_cache_config() -> Dict[str, Any]:
    """Get cache-specific configuration."""
    return get_optimization_config()["cache"]

def get_database_config() -> Dict[str, Any]:
    """Get database-specific configuration."""
    return get_optimization_config()["database"]

def get_http_config() -> Dict[str, Any]:
    """Get HTTP-specific configuration."""
    return get_optimization_config()["http"]

def get_monitoring_config() -> Dict[str, Any]:
    """Get monitoring-specific configuration."""
    return get_optimization_config()["monitoring"]

def get_search_config() -> Dict[str, Any]:
    """Get search-specific configuration."""
    return get_optimization_config()["search"]
