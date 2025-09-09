"""
Service layer integration for Ollama API.
"""

import logging
from typing import Any, Dict

from ...services.ollama import OllamaService

logger = logging.getLogger(__name__)

# Global service instance
_ollama_service: OllamaService = None


def get_ollama_service() -> OllamaService:
    """Get the global Ollama service instance."""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service


async def initialize_ollama_service(config: Dict[str, Any]) -> bool:
    """Initialize the Ollama service with configuration."""
    try:
        service = get_ollama_service()
        await service.initialize(config)
        logger.info("Ollama service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Ollama service: {e}")
        return False
