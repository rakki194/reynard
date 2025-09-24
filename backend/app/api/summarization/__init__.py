"""Summarization API module for Reynard.

This module provides REST API endpoints for text summarization,
including single text summarization, batch processing, and streaming support.
"""

from .router import router

__all__ = ["router"]
