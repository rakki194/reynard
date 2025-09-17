"""
Summarization manager for Reynard.

This module provides a centralized manager for handling different types of
summarization requests and routing them to appropriate summarizers with
performance optimization features. Ported from Yipyap's battle-tested implementation.
"""

import logging
import time
from collections.abc import AsyncGenerator
from pathlib import Path
from typing import Any

from .base import (
    BaseSummarizer,
    ContentType,
    SummarizationOptions,
    SummarizationResult,
    SummaryLevel,
)

logger = logging.getLogger(__name__)


class SummarizationManager:
    """
    Manager for orchestrating multiple summarization services.

    This class provides a unified interface for summarization operations,
    automatically selecting the best summarizer for each request and
    providing fallback options when needed.
    """

    def __init__(self, cache_dir: Path | None = None):
        """
        Initialize the summarization manager.

        Args:
            cache_dir: Directory for cache storage (optional)
        """
        self._summarizers: dict[str, BaseSummarizer] = {}
        self._default_summarizer: str | None = None
        self._content_type_routing: dict[ContentType, list[str]] = {}
        self._initialized = False

        # Performance statistics
        self._performance_stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "average_processing_time": 0.0,
            "total_processing_time": 0.0,
        }

    async def initialize(self) -> bool:
        """
        Initialize the summarization manager.

        Returns:
            True if initialization was successful, False otherwise
        """
        try:
            # Initialize all registered summarizers
            for name, summarizer in self._summarizers.items():
                success = await summarizer.initialize()
                if success:
                    logger.info(f"✅ Summarizer '{name}' initialized successfully")
                else:
                    logger.warning(f"⚠️ Summarizer '{name}' failed to initialize")

            # Set default summarizer to the first available one
            available_summarizers = [
                name
                for name, summarizer in self._summarizers.items()
                if summarizer.is_available()
            ]

            if available_summarizers:
                self._default_summarizer = available_summarizers[0]
                logger.info(
                    f"✅ SummarizationManager initialized with default: {self._default_summarizer}"
                )
                self._initialized = True
                return True
            logger.error("❌ No summarizers available")
            return False

        except Exception as e:
            logger.error(f"Failed to initialize SummarizationManager: {e}")
            return False

    def register_summarizer(self, name: str, summarizer: BaseSummarizer) -> None:
        """
        Register a summarizer with the manager.

        Args:
            name: Name of the summarizer
            summarizer: Summarizer instance
        """
        self._summarizers[name] = summarizer

        # Update content type routing
        for content_type in summarizer.supported_content_types:
            if content_type not in self._content_type_routing:
                self._content_type_routing[content_type] = []
            self._content_type_routing[content_type].append(name)

        logger.info(
            f"Registered summarizer '{name}' with content types: {[ct.value for ct in summarizer.supported_content_types]}"
        )

    def get_available_summarizers(self) -> list[str]:
        """
        Get list of available summarizer names.

        Returns:
            List of available summarizer names
        """
        return [
            name
            for name, summarizer in self._summarizers.items()
            if summarizer.is_available()
        ]

    def get_summarizer(self, name: str) -> BaseSummarizer | None:
        """
        Get a specific summarizer by name.

        Args:
            name: Name of the summarizer

        Returns:
            Summarizer instance or None if not found
        """
        return self._summarizers.get(name)

    def select_summarizer(
        self, content_type: ContentType, preferred_summarizer: str | None = None
    ) -> BaseSummarizer | None:
        """
        Select the best summarizer for a given content type.

        Args:
            content_type: Type of content to summarize
            preferred_summarizer: Preferred summarizer name (optional)

        Returns:
            Selected summarizer or None if none available
        """
        # Check if preferred summarizer is available and supports content type
        if preferred_summarizer:
            summarizer = self._summarizers.get(preferred_summarizer)
            if (
                summarizer
                and summarizer.is_available()
                and summarizer.supports_content_type(content_type)
            ):
                return summarizer

        # Find available summarizers for this content type
        available_for_type = []
        for name in self._content_type_routing.get(content_type, []):
            summarizer = self._summarizers.get(name)
            if summarizer and summarizer.is_available():
                available_for_type.append(summarizer)

        if available_for_type:
            # Return the first available one (could be enhanced with ranking)
            return available_for_type[0]

        # Fallback to default summarizer if it supports the content type
        if self._default_summarizer:
            default = self._summarizers.get(self._default_summarizer)
            if (
                default
                and default.is_available()
                and default.supports_content_type(content_type)
            ):
                return default

        return None

    async def summarize(
        self, text: str, options: SummarizationOptions
    ) -> SummarizationResult:
        """
        Summarize text using the best available summarizer.

        Args:
            text: Text to summarize
            options: Summarization options

        Returns:
            SummarizationResult containing the summary

        Raises:
            RuntimeError: If no suitable summarizer is available
        """
        if not self._initialized:
            raise RuntimeError("SummarizationManager is not initialized")

        start_time = time.time()
        self._performance_stats["total_requests"] += 1

        try:
            # Select appropriate summarizer
            summarizer = self.select_summarizer(options.content_type)
            if not summarizer:
                raise RuntimeError(
                    f"No available summarizer for content type: {options.content_type.value}"
                )

            logger.info(
                f"Using summarizer '{summarizer.name}' for content type '{options.content_type.value}'"
            )

            # Perform summarization
            result = await summarizer.summarize(text, options)

            processing_time = time.time() - start_time
            self._update_performance_stats(processing_time)
            self._performance_stats["cache_misses"] += 1

            return result

        except Exception:
            processing_time = time.time() - start_time
            self._update_performance_stats(processing_time)
            raise

    async def summarize_stream(
        self, text: str, options: SummarizationOptions
    ) -> AsyncGenerator[dict[str, Any]]:
        """
        Stream summarization progress and results.

        Args:
            text: Text to summarize
            options: Summarization options

        Yields:
            Progress updates and final result
        """
        if not self._initialized:
            yield {
                "event": "error",
                "data": {"message": "SummarizationManager is not initialized"},
            }
            return

        # Select appropriate summarizer
        summarizer = self.select_summarizer(options.content_type)
        if not summarizer:
            yield {
                "event": "error",
                "data": {
                    "message": f"No available summarizer for content type: {options.content_type.value}"
                },
            }
            return

        logger.info(f"Using summarizer '{summarizer.name}' for streaming summarization")

        # Stream summarization
        async for event in summarizer.summarize_stream(text, options):
            yield event

    async def detect_content_type(self, text: str) -> ContentType:
        """
        Automatically detect the content type of the text.

        Args:
            text: Text to analyze

        Returns:
            Detected content type
        """
        # Simple heuristics for content type detection
        text_lower = text.lower()

        # Check for code indicators
        code_indicators = [
            "def ",
            "class ",
            "function ",
            "import ",
            "from ",
            "return ",
            "if __name__",
            "public class",
            "private ",
            "public ",
            "function(",
            "const ",
            "let ",
            "var ",
            "console.log",
            "print(",
            "printf(",
            "main(",
            "void ",
            "int ",
            "string ",
        ]

        if any(indicator in text_lower for indicator in code_indicators):
            return ContentType.CODE

        # Check for technical content
        technical_indicators = [
            "algorithm",
            "protocol",
            "api",
            "endpoint",
            "database",
            "architecture",
            "framework",
            "library",
            "dependency",
            "configuration",
            "deployment",
            "infrastructure",
        ]

        if any(indicator in text_lower for indicator in technical_indicators):
            return ContentType.TECHNICAL

        # Check for article content
        article_indicators = [
            "introduction",
            "conclusion",
            "abstract",
            "methodology",
            "results",
            "discussion",
            "references",
            "bibliography",
        ]

        if any(indicator in text_lower for indicator in article_indicators):
            return ContentType.ARTICLE

        # Default to general document
        return ContentType.GENERAL

    async def get_summary_quality_metrics(
        self, result: SummarizationResult
    ) -> dict[str, float]:
        """
        Get quality metrics for a summarization result.

        Args:
            result: Summarization result to evaluate

        Returns:
            Dictionary of quality metrics
        """
        # Find the summarizer that created this result
        for summarizer in self._summarizers.values():
            if summarizer.is_available():
                return await summarizer.get_quality_metrics(result)

        # Fallback to basic metrics
        return {
            "coherence": 0.0,
            "completeness": 0.0,
            "relevance": 0.0,
            "readability": 0.0,
        }

    def get_supported_content_types(self) -> dict[ContentType, list[str]]:
        """
        Get mapping of content types to supporting summarizers.

        Returns:
            Dictionary mapping content types to summarizer names
        """
        return {
            content_type: [
                name
                for name in summarizers
                if self._summarizers.get(name, {}).is_available()
            ]
            for content_type, summarizers in self._content_type_routing.items()
        }

    async def cleanup(self) -> None:
        """Clean up all summarizers."""
        # Clean up summarizers
        for summarizer in self._summarizers.values():
            await summarizer.cleanup()

        self._initialized = False
        logger.info("SummarizationManager cleaned up")

    def _update_performance_stats(self, processing_time: float) -> None:
        """Update performance statistics."""
        self._performance_stats["total_processing_time"] += processing_time
        total_requests = self._performance_stats["total_requests"]
        if total_requests > 0:
            self._performance_stats["average_processing_time"] = (
                self._performance_stats["total_processing_time"] / total_requests
            )

    def get_performance_stats(self) -> dict[str, Any]:
        """Get performance statistics."""
        stats = dict(self._performance_stats)

        # Calculate cache hit rate
        total_requests = stats["total_requests"]
        if total_requests > 0:
            stats["cache_hit_rate"] = stats["cache_hits"] / total_requests
        else:
            stats["cache_hit_rate"] = 0.0

        return stats

    def is_available(self) -> bool:
        """
        Check if the manager is available.

        Returns:
            True if available, False otherwise
        """
        return self._initialized and bool(self.get_available_summarizers())

    async def summarize_batch(
        self,
        requests: list[dict[str, Any]],
        enable_streaming: bool = False,
    ) -> AsyncGenerator[dict[str, Any]]:
        """
        Process a batch of summarization requests.

        Args:
            requests: List of request dictionaries
            enable_streaming: Whether to stream progress updates

        Yields:
            Progress updates and results
        """
        if not self._initialized:
            yield {
                "event": "error",
                "data": {"message": "SummarizationManager is not initialized"},
            }
            return

        total_requests = len(requests)
        completed_requests = 0

        yield {
            "event": "batch_start",
            "data": {"total_requests": total_requests},
        }

        for i, req in enumerate(requests):
            try:
                # Convert request to SummarizationOptions
                options_dict = req["options"].copy()
                if "content_type" in options_dict and isinstance(
                    options_dict["content_type"], str
                ):
                    options_dict["content_type"] = ContentType(
                        options_dict["content_type"]
                    )
                if "summary_level" in options_dict and isinstance(
                    options_dict["summary_level"], str
                ):
                    options_dict["summary_level"] = SummaryLevel(
                        options_dict["summary_level"]
                    )

                options = SummarizationOptions(**options_dict)

                # Process request
                if enable_streaming:
                    async for event in self.summarize_stream(req["text"], options):
                        yield {
                            "event": "request_progress",
                            "data": {
                                "request_id": req.get("id", f"req_{i}"),
                                "progress": event,
                            },
                        }
                else:
                    result = await self.summarize(req["text"], options)
                    yield {
                        "event": "request_complete",
                        "data": {
                            "request_id": req.get("id", f"req_{i}"),
                            "result": result.to_dict(),
                        },
                    }

                completed_requests += 1

                # Send progress update
                yield {
                    "event": "batch_progress",
                    "data": {
                        "completed": completed_requests,
                        "total": total_requests,
                        "progress_percentage": (completed_requests / total_requests)
                        * 100,
                    },
                }

            except Exception as e:
                logger.error(f"Batch request {i} failed: {e}")
                yield {
                    "event": "request_error",
                    "data": {
                        "request_id": req.get("id", f"req_{i}"),
                        "error": str(e),
                    },
                }

        yield {
            "event": "batch_complete",
            "data": {
                "completed": completed_requests,
                "total": total_requests,
                "success_rate": (
                    (completed_requests / total_requests) * 100
                    if total_requests > 0
                    else 0
                ),
            },
        }
