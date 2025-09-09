"""
Lazy Loading API module for Reynard Backend.

This module provides REST API endpoints for managing lazy loading of ML packages
with proper error handling and type safety.
"""

from .router import router

__all__ = ["router"]
