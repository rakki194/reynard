"""🦊 Reynard Summarization Router
==============================

Main router for summarization API endpoints with enterprise-grade patterns.
"""

from .endpoints import summarization_router

# Export the enhanced router
router = summarization_router.get_router()
