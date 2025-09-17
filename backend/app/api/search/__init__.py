"""
Search API Module
================

Advanced search capabilities for the Reynard codebase.
Provides semantic search, syntax search, and hybrid search functionality.
"""

from .endpoints import router
from .service import SearchService

__all__ = ["SearchService", "router"]
