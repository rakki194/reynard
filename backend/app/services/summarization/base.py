"""Base summarization classes and interfaces for Reynard.

This module defines the core abstractions for the summarization system,
including the base summarizer class, result types, and configuration options.
Ported from Yipyap's battle-tested implementation.
"""

import logging
from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class ContentType(Enum):
    """Content type enumeration for summarization."""

    ARTICLE = "article"
    CODE = "code"
    DOCUMENT = "document"
    TECHNICAL = "technical"
    GENERAL = "general"


class SummaryLevel(Enum):
    """Summary level enumeration."""

    BRIEF = "brief"  # Concise summary
    EXECUTIVE = "executive"  # High-level overview
    DETAILED = "detailed"  # Comprehensive summary
    COMPREHENSIVE = "comprehensive"  # Very detailed summary
    BULLET = "bullet"  # Key points only
    TTS_OPTIMIZED = "tts_optimized"  # Optimized for speech synthesis


@dataclass
class SummarizationOptions:
    """Configuration options for summarization."""

    content_type: ContentType = ContentType.GENERAL
    summary_level: SummaryLevel = SummaryLevel.DETAILED
    max_length: int | None = None
    include_outline: bool = False
    include_highlights: bool = False
    temperature: float = 0.3
    top_p: float = 0.9
    model: str | None = None
    language: str | None = None  # Target language for summarization
    source_language: str | None = (
        None  # Source language (auto-detected if not provided)
    )
    context: dict[str, Any] | None = None
    user_preferences: dict[str, Any] | None = None


@dataclass
class SummarizationResult:
    """Result of a summarization operation."""

    id: str
    original_text: str
    summary: str
    content_type: ContentType
    summary_level: SummaryLevel
    language: str | None = None  # Language of the summary
    source_language: str | None = None  # Language of the original text
    quality_score: float | None = None
    processing_time: float | None = None
    model: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    # Optional fields for enhanced functionality
    title: str | None = None
    abstract: str | None = None
    short_summary: str | None = None
    long_summary: str | None = None
    outline: list[str] | None = None
    highlights: list[str] | None = None
    word_count: int | None = None
    summary_word_count: int | None = None
    model_used: str | None = None  # Alias for model field

    @property
    def summary_id(self) -> str:
        """Backward compatibility property for summary_id."""
        return self.id

    def to_dict(self) -> dict[str, Any]:
        """Convert the result to a dictionary."""
        return {
            "id": self.id,
            "original_text": self.original_text,
            "summary": self.summary,
            "content_type": (
                self.content_type.value
                if hasattr(self.content_type, "value")
                else str(self.content_type)
            ),
            "summary_level": (
                self.summary_level.value
                if hasattr(self.summary_level, "value")
                else str(self.summary_level)
            ),
            "language": self.language,
            "source_language": self.source_language,
            "quality_score": self.quality_score,
            "processing_time": self.processing_time,
            "model": self.model,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "title": self.title,
            "abstract": self.abstract,
            "short_summary": self.short_summary,
            "long_summary": self.long_summary,
            "outline": self.outline,
            "highlights": self.highlights,
            "word_count": self.word_count,
            "summary_word_count": self.summary_word_count,
            "model_used": self.model_used,
        }


class BaseSummarizer(ABC):
    """Abstract base class for summarization implementations.

    This class defines the interface that all summarizers must implement,
    providing a consistent API for different summarization strategies.
    """

    def __init__(self, name: str, supported_content_types: list[ContentType]):
        """Initialize the base summarizer.

        Args:
            name: Name of the summarizer
            supported_content_types: List of content types this summarizer supports

        """
        self.name = name
        self.supported_content_types = supported_content_types
        self._is_available = False

    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the summarizer.

        Returns:
            True if initialization was successful, False otherwise

        """

    @abstractmethod
    async def summarize(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> SummarizationResult:
        """Summarize the given text.

        Args:
            text: Text to summarize
            options: Summarization options

        Returns:
            SummarizationResult containing the summary and metadata

        Raises:
            ValueError: If text is empty or invalid
            RuntimeError: If summarizer is not available

        """

    @abstractmethod
    async def summarize_stream(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> AsyncGenerator[dict[str, Any]]:
        """Stream summarization progress and results.

        Args:
            text: Text to summarize
            options: Summarization options

        Yields:
            Progress updates and final result as dictionaries

        """

    @abstractmethod
    async def validate_text(self, text: str) -> bool:
        """Validate if the text is suitable for summarization.

        Args:
            text: Text to validate

        Returns:
            True if text is valid, False otherwise

        """

    def is_available(self) -> bool:
        """Check if the summarizer is available.

        Returns:
            True if available, False otherwise

        """
        return self._is_available

    def supports_content_type(self, content_type: ContentType) -> bool:
        """Check if this summarizer supports the given content type.

        Args:
            content_type: Content type to check

        Returns:
            True if supported, False otherwise

        """
        return content_type in self.supported_content_types

    async def get_quality_metrics(
        self,
        result: SummarizationResult,
    ) -> dict[str, float]:
        """Calculate quality metrics for a summarization result.

        Args:
            result: Summarization result to evaluate

        Returns:
            Dictionary of quality metrics

        """
        # Default implementation with basic heuristics
        metrics = {
            "coherence": 0.0,
            "completeness": 0.0,
            "relevance": 0.0,
            "readability": 0.0,
        }

        if result.summary:
            # Coherence: check for logical flow
            sentences = result.summary.split(".")
            if len(sentences) > 1:
                metrics["coherence"] = min(1.0, len(sentences) / 10.0)

            # Completeness: ratio of summary to original
            if result.word_count and result.summary_word_count:
                ratio = result.summary_word_count / result.word_count
                metrics["completeness"] = min(1.0, ratio * 5.0)

            # Relevance: check for key terms overlap
            original_words = set(result.original_text.lower().split())
            summary_words = set(result.summary.lower().split())
            if original_words:
                overlap = len(original_words.intersection(summary_words)) / len(
                    original_words,
                )
                metrics["relevance"] = min(1.0, overlap * 2.0)

            # Readability: simple sentence length heuristic
            avg_sentence_length = result.summary_word_count / max(1, len(sentences))
            metrics["readability"] = max(0.0, 1.0 - (avg_sentence_length - 15) / 10.0)

        return metrics

    async def cleanup(self) -> None:
        """Clean up resources used by the summarizer."""
