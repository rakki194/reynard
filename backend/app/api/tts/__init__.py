"""
TTS API for Reynard Backend

Text-to-Speech integration with multiple backends including Kokoro, Coqui, and XTTS.
"""

from .router import router

__all__ = ["router"]
