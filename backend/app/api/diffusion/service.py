"""
Service layer integration for Diffusion-LLM API.
"""

import logging
from typing import Any, Dict

from ...services.diffusion import DiffusionLLMService

logger = logging.getLogger(__name__)

# Global service instance
_diffusion_service: DiffusionLLMService = None


def get_diffusion_service() -> DiffusionLLMService:
    """Get the global diffusion service instance."""
    global _diffusion_service
    if _diffusion_service is None:
        _diffusion_service = DiffusionLLMService()
    return _diffusion_service


async def initialize_diffusion_service(config: Dict[str, Any]) -> bool:
    """Initialize the diffusion service with configuration."""
    try:
        service = get_diffusion_service()
        await service.initialize(config)
        logger.info("Diffusion service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize diffusion service: {e}")
        return False
