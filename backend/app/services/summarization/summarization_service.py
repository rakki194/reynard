"""
Main summarization service for Reynard.

This service integrates with the existing Ollama service and provides
a unified interface for text summarization with multiple content types
and specialized summarizers.
"""

import logging
from collections.abc import AsyncGenerator
from typing import Any

from .article_summarizer import ArticleSummarizer
from .base import ContentType, SummarizationOptions, SummaryLevel
from .code_summarizer import CodeSummarizer
from .document_summarizer import DocumentSummarizer
from .manager import SummarizationManager
from .ollama_summarizer import OllamaSummarizer
from .technical_summarizer import TechnicalSummarizer

logger = logging.getLogger(__name__)


class SummarizationService:
    """
    Main summarization service that orchestrates all summarization operations.

    This service provides a unified interface for text summarization,
    integrating with the existing Ollama service and providing specialized
    summarizers for different content types.
    """

    def __init__(self, ollama_service=None):
        """
        Initialize the summarization service.

        Args:
            ollama_service: Instance of Reynard's OllamaService
        """
        self.ollama_service = ollama_service
        self.manager = SummarizationManager()
        self._initialized = False

    async def initialize(self) -> bool:
        """
        Initialize the summarization service.

        Returns:
            True if initialization was successful, False otherwise
        """
        try:
            if not self.ollama_service:
                logger.warning(
                    "⚠️ Ollama service not available - summarization will be limited"
                )
                return False

            # Register summarizers
            await self._register_summarizers()

            # Initialize the manager
            success = await self.manager.initialize()
            if success:
                self._initialized = True
                logger.info("✅ SummarizationService initialized successfully")
                return True
            logger.error("❌ Failed to initialize SummarizationManager")
            return False

        except Exception as e:
            logger.error(f"Failed to initialize SummarizationService: {e}")
            return False

    async def _register_summarizers(self) -> None:
        """Register all available summarizers with the manager."""
        try:
            # Register Ollama summarizer (general purpose)
            ollama_summarizer = OllamaSummarizer(self.ollama_service)
            self.manager.register_summarizer("ollama", ollama_summarizer)

            # Register specialized summarizers
            article_summarizer = ArticleSummarizer(self.ollama_service)
            self.manager.register_summarizer("article", article_summarizer)

            code_summarizer = CodeSummarizer(self.ollama_service)
            self.manager.register_summarizer("code", code_summarizer)

            document_summarizer = DocumentSummarizer(self.ollama_service)
            self.manager.register_summarizer("document", document_summarizer)

            technical_summarizer = TechnicalSummarizer(self.ollama_service)
            self.manager.register_summarizer("technical", technical_summarizer)

            logger.info("✅ All summarizers registered successfully")

        except Exception as e:
            logger.error(f"Failed to register summarizers: {e}")
            raise

    async def summarize_text(
        self,
        text: str,
        content_type: str = "general",
        summary_level: str = "detailed",
        max_length: int | None = None,
        include_outline: bool = False,
        include_highlights: bool = False,
        model: str | None = None,
        temperature: float = 0.3,
        top_p: float = 0.9,
    ) -> dict[str, Any]:
        """
        Summarize text with specified options.

        Args:
            text: Text to summarize
            content_type: Type of content (article, code, document, technical, general)
            summary_level: Level of detail (brief, executive, detailed, comprehensive, bullet, tts_optimized)
            max_length: Maximum length of summary in words
            include_outline: Whether to include outline
            include_highlights: Whether to include highlights
            model: Specific model to use
            temperature: Temperature for generation
            top_p: Top-p for generation

        Returns:
            Dictionary containing summarization result

        Raises:
            RuntimeError: If service is not initialized
            ValueError: If parameters are invalid
        """
        if not self._initialized:
            raise RuntimeError("SummarizationService is not initialized")

        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        try:
            # Create summarization options
            options = SummarizationOptions(
                content_type=ContentType(content_type),
                summary_level=SummaryLevel(summary_level),
                max_length=max_length,
                include_outline=include_outline,
                include_highlights=include_highlights,
                model=model,
                temperature=temperature,
                top_p=top_p,
            )

            # Perform summarization
            result = await self.manager.summarize(text, options)

            return {
                "success": True,
                "result": result.to_dict(),
                "processing_time": result.processing_time,
                "model_used": result.model,
            }

        except Exception as e:
            logger.error(f"Text summarization failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "processing_time": 0.0,
            }

    async def summarize_text_stream(
        self,
        text: str,
        content_type: str = "general",
        summary_level: str = "detailed",
        max_length: int | None = None,
        include_outline: bool = False,
        include_highlights: bool = False,
        model: str | None = None,
        temperature: float = 0.3,
        top_p: float = 0.9,
    ) -> AsyncGenerator[dict[str, Any]]:
        """
        Stream text summarization with progress updates.

        Args:
            text: Text to summarize
            content_type: Type of content
            summary_level: Level of detail
            max_length: Maximum length of summary
            include_outline: Whether to include outline
            include_highlights: Whether to include highlights
            model: Specific model to use
            temperature: Temperature for generation
            top_p: Top-p for generation

        Yields:
            Progress updates and final result
        """
        if not self._initialized:
            yield {
                "event": "error",
                "data": {"message": "SummarizationService is not initialized"},
            }
            return

        try:
            # Create summarization options
            options = SummarizationOptions(
                content_type=ContentType(content_type),
                summary_level=SummaryLevel(summary_level),
                max_length=max_length,
                include_outline=include_outline,
                include_highlights=include_highlights,
                model=model,
                temperature=temperature,
                top_p=top_p,
            )

            # Stream summarization
            async for event in self.manager.summarize_stream(text, options):
                yield event

        except Exception as e:
            logger.error(f"Streaming text summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def summarize_batch(
        self,
        requests: list[dict[str, Any]],
        enable_streaming: bool = False,
    ) -> AsyncGenerator[dict[str, Any]]:
        """
        Process a batch of summarization requests.

        Args:
            requests: List of summarization requests
            enable_streaming: Whether to stream progress updates

        Yields:
            Progress updates and results
        """
        if not self._initialized:
            yield {
                "event": "error",
                "data": {"message": "SummarizationService is not initialized"},
            }
            return

        try:
            # Process batch through manager
            async for event in self.manager.summarize_batch(requests, enable_streaming):
                yield event

        except Exception as e:
            logger.error(f"Batch summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def detect_content_type(self, text: str) -> str:
        """
        Automatically detect the content type of text.

        Args:
            text: Text to analyze

        Returns:
            Detected content type
        """
        if not self._initialized:
            return "general"

        try:
            content_type = await self.manager.detect_content_type(text)
            return content_type.value
        except Exception as e:
            logger.error(f"Content type detection failed: {e}")
            return "general"

    def get_available_models(self) -> list[str]:
        """
        Get list of available models for summarization.

        Returns:
            List of available model names
        """
        if not self.ollama_service:
            return []

        try:
            # This would need to be implemented in the Ollama service
            # For now, return default models
            return ["llama3.2:3b", "codellama:7b", "mistral:7b"]
        except Exception as e:
            logger.error(f"Failed to get available models: {e}")
            return []

    def get_supported_content_types(self) -> dict[str, list[str]]:
        """
        Get supported content types and their summarizers.

        Returns:
            Dictionary mapping content types to summarizer names
        """
        if not self._initialized:
            return {}

        try:
            supported_types = self.manager.get_supported_content_types()
            return {
                content_type.value: summarizers
                for content_type, summarizers in supported_types.items()
            }
        except Exception as e:
            logger.error(f"Failed to get supported content types: {e}")
            return {}

    def get_supported_summary_levels(self) -> list[str]:
        """
        Get supported summary levels.

        Returns:
            List of supported summary level names
        """
        return [level.value for level in SummaryLevel]

    def get_performance_stats(self) -> dict[str, Any]:
        """
        Get performance statistics.

        Returns:
            Dictionary containing performance statistics
        """
        if not self._initialized:
            return {}

        try:
            return self.manager.get_performance_stats()
        except Exception as e:
            logger.error(f"Failed to get performance stats: {e}")
            return {}

    def is_available(self) -> bool:
        """
        Check if the service is available.

        Returns:
            True if available, False otherwise
        """
        return self._initialized and self.manager.is_available()

    async def health_check(self) -> dict[str, Any]:
        """
        Perform health check on the service.

        Returns:
            Health check results
        """
        try:
            # Check if service is initialized
            if not self._initialized:
                return {
                    "status": "unhealthy",
                    "message": "Service not initialized",
                    "details": {
                        "initialized": False,
                        "ollama_available": self.ollama_service is not None,
                    },
                }

            # Check if manager is available
            if not self.manager.is_available():
                return {
                    "status": "unhealthy",
                    "message": "Manager not available",
                    "details": {
                        "initialized": True,
                        "manager_available": False,
                        "available_summarizers": [],
                    },
                }

            # Get available summarizers
            available_summarizers = self.manager.get_available_summarizers()

            return {
                "status": "healthy",
                "message": "Service is operational",
                "details": {
                    "initialized": True,
                    "manager_available": True,
                    "available_summarizers": available_summarizers,
                    "supported_content_types": self.get_supported_content_types(),
                    "performance_stats": self.get_performance_stats(),
                },
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "status": "unhealthy",
                "message": f"Health check failed: {e!s}",
                "details": {
                    "error": str(e),
                },
            }

    async def cleanup(self) -> None:
        """Clean up the service."""
        try:
            if self.manager:
                await self.manager.cleanup()

            self._initialized = False
            logger.info("SummarizationService cleaned up")

        except Exception as e:
            logger.error(f"Failed to cleanup SummarizationService: {e}")


# Global service instance
_summarization_service: SummarizationService | None = None


def get_summarization_service() -> SummarizationService:
    """Get the global summarization service instance."""
    global _summarization_service
    if _summarization_service is None:
        _summarization_service = SummarizationService()
    return _summarization_service
