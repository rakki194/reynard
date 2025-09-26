"""NLWeb Service Initializer for Reynard Backend

Initializes and manages the NLWeb service instance for the Reynard backend.
"""

import logging
from typing import Any

from .models import NLWebConfiguration
from .nlweb_service import NLWebService

logger = logging.getLogger(__name__)

# Global service instance
_nlweb_service: NLWebService | None = None


def initialize_nlweb_service(config: dict[str, Any]) -> NLWebService:
    """Initialize the NLWeb service with the given configuration.

    Args:
        config: Configuration dictionary containing NLWeb settings

    Returns:
        Initialized NLWebService instance

    Raises:
        RuntimeError: If service initialization fails

    """
    global _nlweb_service

    try:
        # Extract NLWeb configuration from the main config
        nlweb_config = config.get("nlweb", {})

        # Create configuration object
        configuration = NLWebConfiguration(
            enabled=nlweb_config.get("enabled", True),
            base_url=nlweb_config.get("base_url"),
            suggest_timeout_s=nlweb_config.get("suggest_timeout_s", 1.5),
            cache_ttl_s=nlweb_config.get("cache_ttl_s", 10.0),
            cache_max_entries=nlweb_config.get("cache_max_entries", 64),
            allow_stale_on_error=nlweb_config.get("allow_stale_on_error", True),
            warm_timeout_s=nlweb_config.get("warm_timeout_s", 2.0),
            rate_limit_window_s=nlweb_config.get("rate_limit_window_s", 60.0),
            rate_limit_max_requests=nlweb_config.get("rate_limit_max_requests", 30),
            canary_enabled=nlweb_config.get("canary_enabled", False),
            canary_percentage=nlweb_config.get("canary_percentage", 5.0),
            rollback_enabled=nlweb_config.get("rollback_enabled", False),
            performance_monitoring_enabled=nlweb_config.get(
                "performance_monitoring_enabled",
                True,
            ),
            proxy_max_retries=nlweb_config.get("proxy_max_retries", 2),
            proxy_backoff_ms=nlweb_config.get("proxy_backoff_ms", 200),
            proxy_connect_timeout_ms=nlweb_config.get("proxy_connect_timeout_ms", 2000),
            proxy_read_timeout_ms=nlweb_config.get("proxy_read_timeout_ms", 10000),
            proxy_sse_idle_timeout_ms=nlweb_config.get(
                "proxy_sse_idle_timeout_ms",
                15000,
            ),
        )

        # Create service instance
        _nlweb_service = NLWebService(configuration)

        logger.info("NLWeb service initialized successfully")
        return _nlweb_service

    except Exception as e:
        logger.error(f"Failed to initialize NLWeb service: {e}")
        raise RuntimeError(f"NLWeb service initialization failed: {e}")


def get_nlweb_service() -> NLWebService | None:
    """Get the global NLWeb service instance.

    Returns:
        NLWebService instance if initialized, None otherwise

    """
    return _nlweb_service


async def shutdown_nlweb_service() -> bool:
    """Shutdown the NLWeb service.

    Returns:
        True if shutdown was successful, False otherwise

    """
    global _nlweb_service

    try:
        if _nlweb_service:
            success = await _nlweb_service.shutdown()
            _nlweb_service = None
            logger.info("NLWeb service shutdown successfully")
            return success
        logger.info("NLWeb service was not initialized")
        return True

    except Exception as e:
        logger.error(f"Error during NLWeb service shutdown: {e}")
        return False


def is_nlweb_service_available() -> bool:
    """Check if the NLWeb service is available and ready.

    Returns:
        True if service is available, False otherwise

    """
    return _nlweb_service is not None and _nlweb_service.is_available()


async def ensure_nlweb_service_initialized() -> bool:
    """Ensure the NLWeb service is initialized and ready.

    Returns:
        True if service is ready, False otherwise

    """
    global _nlweb_service

    if _nlweb_service is None:
        logger.warning(
            "NLWeb service not initialized, attempting to initialize with defaults",
        )
        try:
            # Initialize with default configuration
            default_config = {"nlweb": {"enabled": True}}
            _nlweb_service = initialize_nlweb_service(default_config)
            await _nlweb_service.initialize()
        except Exception as e:
            logger.error(f"Failed to initialize NLWeb service with defaults: {e}")
            return False

    if not _nlweb_service.initialized:
        try:
            await _nlweb_service.initialize()
        except Exception as e:
            logger.error(f"Failed to initialize NLWeb service: {e}")
            return False

    return _nlweb_service.is_available()
