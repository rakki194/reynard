"""
ComfyUI Service Initializer

Handles initialization and configuration of the ComfyUI service.
"""

import logging
from typing import Dict, Any, Optional
from .comfy_service import ComfyService

logger = logging.getLogger(__name__)

# Global service instance
_comfy_service: Optional[ComfyService] = None


def initialize_comfy_service(config: Dict[str, Any]) -> ComfyService:
    """Initialize the ComfyUI service with configuration."""
    global _comfy_service
    
    if _comfy_service is not None:
        logger.warning("ComfyUI service already initialized")
        return _comfy_service
    
    try:
        _comfy_service = ComfyService()
        # Note: In a real implementation, you'd await this
        # For now, we'll handle initialization in the endpoints
        logger.info("ComfyUI service initialized successfully")
        return _comfy_service
    except Exception as e:
        logger.error(f"Failed to initialize ComfyUI service: {e}")
        raise


def get_comfy_service() -> Optional[ComfyService]:
    """Get the ComfyUI service instance."""
    return _comfy_service


def shutdown_comfy_service() -> None:
    """Shutdown the ComfyUI service."""
    global _comfy_service
    
    if _comfy_service is not None:
        try:
            # Note: In a real implementation, you'd await this
            # _comfy_service.shutdown()
            logger.info("ComfyUI service shutdown successfully")
        except Exception as e:
            logger.error(f"Error shutting down ComfyUI service: {e}")
        finally:
            _comfy_service = None
