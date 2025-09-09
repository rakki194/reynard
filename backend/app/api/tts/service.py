"""
TTS Service for Reynard Backend

Service layer for TTS operations.
"""

import logging
from typing import Any, Dict

from ...services.tts import TTSService

logger = logging.getLogger("uvicorn")

# Global service instance
_tts_service = None


def get_tts_service() -> TTSService:
    """Get the global TTS service instance."""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service


async def initialize_tts_service(config: Dict[str, Any]) -> bool:
    """Initialize the TTS service."""
    try:
        service = get_tts_service()
        return await service.initialize(config)
    except Exception as e:
        logger.error(f"Failed to initialize TTS service: {e}")
        return False
