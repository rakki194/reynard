"""
Base TTS Backend for Reynard

Abstract base class for TTS backend implementations.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List


class TTSBackend(ABC):
    """Abstract base class for TTS backends."""
    
    def __init__(self, name: str):
        self.name = name
        self._initialized = False
        self._enabled = True

    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the TTS backend."""
        pass

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        out_path: Path,
        *,
        voice: str = "default",
        speed: float = 1.0,
        lang: str = "en",
    ) -> Path:
        """Synthesize text to speech."""
        pass

    @abstractmethod
    async def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices."""
        pass

    @abstractmethod
    async def get_supported_languages(self) -> List[str]:
        """Get list of supported languages."""
        pass

    @abstractmethod
    async def get_supported_formats(self) -> List[str]:
        """Get list of supported output formats."""
        pass

    async def health_check(self) -> bool:
        """Check if the backend is healthy."""
        return self._initialized and self._enabled

    async def cleanup(self):
        """Clean up backend resources."""
        pass

    def is_initialized(self) -> bool:
        """Check if backend is initialized."""
        return self._initialized

    def is_enabled(self) -> bool:
        """Check if backend is enabled."""
        return self._enabled

    def set_enabled(self, enabled: bool):
        """Enable or disable the backend."""
        self._enabled = enabled
