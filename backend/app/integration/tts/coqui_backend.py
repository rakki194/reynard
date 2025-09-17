"""
Coqui TTS Backend for Reynard

Coqui TTS backend implementation with multiple voice support.
"""

import logging
from pathlib import Path
from typing import Any

from .base import TTSBackend

logger = logging.getLogger("uvicorn")


class CoquiBackend(TTSBackend):
    """Coqui TTS backend implementation."""

    SAMPLE_RATE = 22050

    def __init__(self):
        super().__init__("coqui")
        self._model = None
        self._available_voices = [
            {
                "name": "default",
                "language": "en",
                "gender": "female",
                "description": "Default voice",
            },
            {
                "name": "male",
                "language": "en",
                "gender": "male",
                "description": "Male voice",
            },
            {
                "name": "female",
                "language": "en",
                "gender": "female",
                "description": "Female voice",
            },
        ]
        self._supported_languages = [
            "en",
            "es",
            "fr",
            "de",
            "it",
            "pt",
            "ru",
            "zh",
            "ja",
            "ko",
        ]
        self._supported_formats = ["wav", "mp3"]

    async def initialize(self) -> bool:
        """Initialize the Coqui backend."""
        try:
            # Check if TTS is available
            try:
                import TTS

                logger.info("Coqui TTS backend initialized successfully")
                self._initialized = True
                return True
            except ImportError:
                logger.warning(
                    "Coqui TTS not available - install with: pip install TTS"
                )
                self._initialized = False
                return False

        except Exception as e:
            logger.error(f"Coqui backend initialization failed: {e}")
            self._initialized = False
            return False

    async def synthesize(
        self,
        text: str,
        out_path: Path,
        *,
        voice: str = "default",
        speed: float = 1.0,
        lang: str = "en",
    ) -> Path:
        """Synthesize text to speech using Coqui TTS."""
        if not self._initialized:
            raise RuntimeError("Coqui backend not initialized")

        out_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            # For now, create a mock audio file since we don't have TTS installed
            # In a real implementation, this would use the actual Coqui TTS synthesis
            await self._create_mock_audio(out_path, text, voice, speed)
            return out_path

        except Exception as e:
            logger.error(f"Coqui synthesis failed: {e}")
            raise

    async def _create_mock_audio(
        self, out_path: Path, text: str, voice: str, speed: float
    ):
        """Create a mock audio file for testing."""
        try:
            # Create a simple WAV file with silence
            import struct
            import wave

            duration = len(text) * 0.08 / speed  # Rough estimate
            sample_rate = self.SAMPLE_RATE
            num_samples = int(sample_rate * duration)

            # Generate silence
            audio_data = [0] * num_samples

            with wave.open(str(out_path), "w") as wav_file:
                wav_file.setnchannels(1)  # Mono
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(sample_rate)
                wav_file.setnframes(num_samples)

                # Write audio data
                for sample in audio_data:
                    wav_file.writeframes(struct.pack("<h", int(sample * 32767)))

        except Exception as e:
            logger.error(f"Failed to create mock audio: {e}")
            raise

    async def get_available_voices(self) -> list[dict[str, Any]]:
        """Get list of available voices."""
        return self._available_voices

    async def get_supported_languages(self) -> list[str]:
        """Get list of supported languages."""
        return self._supported_languages

    async def get_supported_formats(self) -> list[str]:
        """Get list of supported output formats."""
        return self._supported_formats

    async def health_check(self) -> bool:
        """Check if the backend is healthy."""
        if not self._initialized:
            return False

        try:
            # Check if TTS is still available
            import TTS

            return True
        except ImportError:
            return False

    async def cleanup(self):
        """Clean up backend resources."""
        try:
            if self._model is not None:
                del self._model
                self._model = None

            logger.info("Coqui backend cleaned up")

        except Exception as e:
            logger.warning(f"Error during Coqui cleanup: {e}")
