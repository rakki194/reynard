"""Document processing service interfaces.

This module defines the interfaces for document indexing and processing services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .base import BaseService


@dataclass
class Document:
    """Document to be processed."""
    
    id: str
    content: str
    file_path: str
    file_type: str
    language: str
    metadata: Dict[str, Any]


@dataclass
class DocumentChunk:
    """Chunk of a document."""
    
    id: str
    content: str
    start_line: int
    end_line: int
    chunk_type: str
    metadata: Dict[str, Any]


@dataclass
class ChunkMetadata:
    """Metadata for document chunks."""
    
    file_path: str
    language: str
    chunk_type: str
    start_line: int
    end_line: int
    parent_function: Optional[str] = None
    parent_class: Optional[str] = None
    complexity_score: float = 0.0


class IDocumentIndexer(BaseService, ABC):
    """Interface for document indexing services."""

    @abstractmethod
    async def index_documents(
        self, documents: List[Dict[str, Any]],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Index documents with streaming progress."""
        pass

    @abstractmethod
    async def pause(self) -> None:
        """Pause the document indexer."""
        pass

    @abstractmethod
    async def resume(self) -> None:
        """Resume the document indexer."""
        pass

    @abstractmethod
    def get_supported_languages(self) -> List[str]:
        """Get list of supported languages for chunking."""
        pass

    @abstractmethod
    def is_language_supported(self, language: str) -> bool:
        """Check if language is supported for chunking."""
        pass


class DocumentProcessor(ABC):
    """Abstract base class for document processors."""

    @abstractmethod
    async def process_document(
        self, document: Document,
    ) -> List[DocumentChunk]:
        """Process a document into chunks."""
        pass

    @abstractmethod
    def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types."""
        pass

    @abstractmethod
    def is_file_type_supported(self, file_type: str) -> bool:
        """Check if file type is supported."""
        pass