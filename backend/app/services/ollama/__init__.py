"""
Ollama services for Reynard backend.

This module provides services for Ollama local LLM integration
with YipYapAssistant, tool calling, and streaming responses.
"""

from .ollama_service import OllamaService

__all__ = ["OllamaService"]
