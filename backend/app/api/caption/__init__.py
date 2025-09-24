"""Caption API module for Reynard Backend.

This module provides REST API endpoints for caption generation
with proper error handling and type safety.
"""

from .router import router

__all__ = ["router"]
