"""
RAG API Module for Reynard Backend

This module provides the RAG (Retrieval-Augmented Generation) API endpoints
for semantic search, document ingestion, and vector database operations.
"""

from .router import router

__all__ = ["router"]
