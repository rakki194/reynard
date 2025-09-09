"""
Diffusion-LLM API module for Reynard backend.

This module provides API endpoints for diffusion-based text generation
using DreamOn and LLaDA models with streaming support.
"""

from .router import router

__all__ = ["router"]
