"""Core RAG Services: Essential RAG functionality implementations.

This module provides the core service implementations that form the foundation
of the RAG system.

Core Services:
- OllamaEmbeddingService: Text embedding generation using Ollama
- PostgreSQLVectorStore: Vector storage using PostgreSQL with pgvector
- HybridSearchEngine: Advanced search combining semantic and keyword matching
- ASTDocumentProcessor: Intelligent document processing with AST-aware chunking

Author: Reynard Development Team
Version: 1.0.0
"""

from .ai_embedding import AIEmbeddingService as EmbeddingService
from .vector_store import PostgreSQLVectorStore as VectorStoreService
from .search import HybridSearchEngine as SearchEngine
from .document_processor import ASTDocumentProcessor as DocumentIndexer
from .codebase_scanner import CodebaseScanner

__all__ = [
    "EmbeddingService",
    "VectorStoreService",
    "SearchEngine", 
    "DocumentIndexer",
    "CodebaseScanner",
]
