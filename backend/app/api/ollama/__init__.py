"""
Ollama API module for Reynard backend.

This module provides API endpoints for Ollama local LLM integration
with YipYapAssistant, tool calling, and streaming responses.
"""

from .router import router

__all__ = ["router"]
