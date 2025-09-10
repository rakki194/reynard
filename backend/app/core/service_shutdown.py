"""
Service Shutdown Module for Reynard Backend

This module contains all service shutdown functions for the Reynard backend,
implementing graceful shutdown procedures with proper resource cleanup and
error handling for each service component.

Services:
- Gatekeeper: Authentication service cleanup
- ComfyUI: Image generation service cleanup
- NLWeb: Natural language processing service cleanup

Each shutdown function follows the same pattern:
- Performs graceful resource cleanup
- Handles shutdown errors gracefully
- Provides detailed logging for monitoring
- Does not prevent application shutdown on failure
"""

import logging

# Service shutdown functions
from app.gatekeeper_config import shutdown_gatekeeper
from app.services.comfy import shutdown_comfy_service
from app.services.nlweb.service_initializer import shutdown_nlweb_service

logger = logging.getLogger(__name__)


async def shutdown_gatekeeper_service() -> None:
    """
    Gracefully shutdown the Gatekeeper authentication service.
    
    This function performs proper cleanup of the authentication service,
    including closing database connections, clearing cached tokens,
    and ensuring all authentication resources are properly released.
    
    Raises:
        Exception: Logged for monitoring purposes but does not prevent shutdown.
    """
    try:
        await shutdown_gatekeeper()
        logger.info("🔐 Gatekeeper service shutdown")
    except Exception as e:
        logger.error(f"❌ Gatekeeper shutdown failed: {e}")


async def shutdown_comfy_service_func() -> None:
    """
    Gracefully shutdown the ComfyUI service.
    
    This function performs proper cleanup of the ComfyUI service,
    including closing API connections, saving any pending workflows,
    and ensuring all image generation resources are properly released.
    
    Raises:
        Exception: Logged for monitoring purposes but does not prevent shutdown.
    """
    try:
        shutdown_comfy_service()
        logger.info("🎨 ComfyUI service shutdown")
    except Exception as e:
        logger.error(f"❌ ComfyUI shutdown failed: {e}")


async def shutdown_nlweb_service_func() -> None:
    """
    Gracefully shutdown the NLWeb service.
    
    This function performs proper cleanup of the NLWeb service,
    including closing network connections, clearing cached data,
    and ensuring all natural language processing resources are properly released.
    
    Raises:
        Exception: Logged for monitoring purposes but does not prevent shutdown.
    """
    try:
        shutdown_nlweb_service()
        logger.info("🌐 NLWeb service shutdown")
    except Exception as e:
        logger.error(f"❌ NLWeb shutdown failed: {e}")
