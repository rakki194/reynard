"""🦊 Reynard AI Summarizer
=================================

AI summarizer that uses the AI service for text summarization
with different content types and summary levels. This module provides
sophisticated summarization capabilities across multiple model providers.

Key Features:
- Multi-Provider Support: Works with Ollama, vLLM, SGLang, LLaMA.cpp
- Content Type Specialization: Different prompts for articles, code, documents
- Summary Level Control: Brief, executive, detailed, comprehensive summaries
- Streaming Support: Real-time summarization with progress updates
- Quality Assessment: Confidence scoring and quality metrics
- Template System: Flexible summarization templates and customization

Author: Reynard Development Team
Version: 2.0.0 - AI Service Integration
"""

import logging
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any, Optional

from ..ai import AIService, ChatMessage, ProviderType
from ..ai.interfaces.model_provider import ModelCapability
from .base import (
    BaseSummarizer,
    ContentType,
    SummarizationOptions,
    SummarizationResult,
    SummaryLevel,
)

logger = logging.getLogger(__name__)


class AISummarizer(BaseSummarizer):
    """AI summarizer that uses the AI service.

    This summarizer uses the AI service to generate summaries
    for different content types with specialized prompts and configurations.
    Supports multiple providers: Ollama, vLLM, SGLang, LLaMA.cpp.
    """

    def __init__(self, ai_service: Optional[AIService] = None):
        """Initialize the AI summarizer.

        Args:
            ai_service: Instance of the AIService

        """
        super().__init__(
            name="ai_summarizer",
            supported_content_types=[
                ContentType.ARTICLE,
                ContentType.CODE,
                ContentType.DOCUMENT,
                ContentType.TECHNICAL,
                ContentType.GENERAL,
            ],
        )
        self.ai_service = ai_service
        self._default_model = "llama3.1:latest"  # Default model for summarization
        self._default_provider = ProviderType.OLLAMA
        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the AI summarizer.

        Returns:
            True if initialization was successful, False otherwise

        """
        try:
            if not self.ai_service:
                # Get AI service from global registry
                from ..ai import get_ai_service

                self.ai_service = get_ai_service()

            if not self.ai_service:
                logger.error("AI service not available")
                return False

            self._is_available = True
            self._initialized = True
            logger.info("✅ AISummarizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize AISummarizer: {e}")
            return False

    async def summarize(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> SummarizationResult:
        """Summarize text using AI service.

        Args:
            text: Text to summarize
            options: Summarization options

        Returns:
            SummarizationResult containing the summary

        Raises:
            ValueError: If text is empty or invalid
            RuntimeError: If summarizer is not available

        """
        if not self._is_available:
            await self.initialize()

        if not self._initialized or not self.ai_service:
            raise RuntimeError("AISummarizer is not available")

        if not await self.validate_text(text):
            raise ValueError("Invalid text for summarization")

        start_time = time.time()

        try:
            # Generate summary using AI service
            summary_text = await self._generate_summary(text, options)

            processing_time = time.time() - start_time

            # Create result
            result = SummarizationResult(
                id=str(uuid.uuid4()),
                original_text=text,
                summary=summary_text,
                content_type=options.content_type,
                summary_level=options.summary_level,
                model=options.model or self._default_model,
                processing_time=processing_time,
                word_count=len(text.split()),
                summary_word_count=len(summary_text.split()),
                metadata={
                    "summarizer": self.name,
                    "model_used": options.model or self._default_model,
                    "provider": self._default_provider,
                    "temperature": options.temperature,
                    "top_p": options.top_p,
                },
            )

            # Add optional fields based on options
            if options.include_outline:
                result.outline = await self._extract_outline(summary_text)

            if options.include_highlights:
                result.highlights = await self._extract_highlights(text, summary_text)

            # Calculate quality score
            result.quality_score = await self._calculate_quality_score(
                text,
                summary_text,
            )

            return result

        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            raise

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
            Progress updates and final result

        """
        if not self._is_available:
            await self.initialize()

        if not self._initialized or not self.ai_service:
            yield {
                "event": "error",
                "data": {"message": "AISummarizer is not available"},
            }
            return

        if not await self.validate_text(text):
            yield {
                "event": "error",
                "data": {"message": "Invalid text for summarization"},
            }
            return

        try:
            yield {"event": "start", "data": {"message": "Starting summarization"}}

            # Stream the summary generation
            summary_text = ""
            async for chunk in self._generate_summary_stream(text, options):
                if chunk.get("type") == "token":
                    summary_text += chunk.get("data", "")
                    yield {
                        "event": "token",
                        "data": {
                            "token": chunk.get("data", ""),
                            "partial_summary": summary_text,
                        },
                    }
                elif chunk.get("type") == "complete":
                    # Generate final result
                    result = await self.summarize(text, options)
                    yield {
                        "event": "complete",
                        "data": result.to_dict(),
                    }

        except Exception as e:
            logger.error(f"Streaming summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def validate_text(self, text: str) -> bool:
        """Validate if the text is suitable for summarization.

        Args:
            text: Text to validate

        Returns:
            True if text is valid, False otherwise

        """
        if not text or not text.strip():
            return False

        # Check minimum length
        if len(text.strip()) < 50:
            return False

        # Check maximum length (prevent token limit issues)
        if len(text) > 100000:  # ~25k tokens
            return False

        return True

    async def _generate_summary(self, text: str, options: SummarizationOptions) -> str:
        """Generate summary using AI service.

        Args:
            text: Text to summarize
            options: Summarization options

        Returns:
            Generated summary text

        """
        # Get specialized prompt for content type
        system_prompt, user_prompt = self._get_prompts(text, options)

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_prompt),
        ]

        model = options.model or self._default_model

        # Generate summary using AI service
        chat_result = await self.ai_service.generate_chat_completion(
            messages=messages,
            model=model,
            max_tokens=options.max_length or 1000,
            temperature=options.temperature,
            provider=self._default_provider,
        )

        return chat_result.message.content.strip()

    async def _generate_summary_stream(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> AsyncGenerator[dict[str, Any]]:
        """Generate summary with streaming support.

        Args:
            text: Text to summarize
            options: Summarization options

        Yields:
            Streaming events

        """
        # Get specialized prompt for content type
        system_prompt, user_prompt = self._get_prompts(text, options)

        # Create chat messages
        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_prompt),
        ]

        model = options.model or self._default_model

        # Stream summary generation using AI service
        async for message in self.ai_service.stream_chat_completion(
            messages=messages,
            model=model,
            max_tokens=options.max_length or 1000,
            temperature=options.temperature,
            provider=self._default_provider,
        ):
            yield {
                "type": "token",
                "data": message.content,
                "timestamp": time.time(),
                "metadata": {},
            }

        # Signal completion
        yield {
            "type": "complete",
            "data": "",
            "timestamp": time.time(),
            "metadata": {},
        }

    def _get_prompts(self, text: str, options: SummarizationOptions) -> tuple[str, str]:
        """Get specialized prompts for the content type and summary level.

        Args:
            text: Text to summarize
            options: Summarization options

        Returns:
            Tuple of (system_prompt, user_prompt)

        """
        # Base system prompt
        system_prompt = "You are an expert text summarizer. Generate high-quality, accurate summaries that capture the essential information from the input text."

        # Content type specific instructions
        content_instructions = {
            ContentType.ARTICLE: "Focus on the main arguments, key points, and conclusions. Maintain the author's perspective and tone.",
            ContentType.CODE: "Explain the functionality, purpose, and key components. Focus on what the code does and how it works.",
            ContentType.DOCUMENT: "Extract the main topics, key information, and important details. Maintain document structure and hierarchy.",
            ContentType.TECHNICAL: "Focus on technical concepts, methodologies, and implementation details. Use precise technical language.",
            ContentType.GENERAL: "Provide a clear, comprehensive overview of the main topics and key information.",
        }

        # Summary level specific instructions
        level_instructions = {
            SummaryLevel.BRIEF: "Create a concise summary in 2-3 sentences.",
            SummaryLevel.EXECUTIVE: "Create a high-level executive summary focusing on key outcomes and decisions.",
            SummaryLevel.DETAILED: "Create a comprehensive summary covering all major points and supporting details.",
            SummaryLevel.COMPREHENSIVE: "Create an extensive summary with thorough coverage of all aspects.",
            SummaryLevel.BULLET: "Create a bullet-point summary with key points and sub-points.",
            SummaryLevel.TTS_OPTIMIZED: "Create a summary optimized for text-to-speech with natural flow and pronunciation.",
        }

        # Build system prompt
        system_prompt += (
            f"\n\nContent Type: {content_instructions.get(options.content_type, '')}"
        )
        system_prompt += (
            f"\nSummary Level: {level_instructions.get(options.summary_level, '')}"
        )

        if options.include_outline:
            system_prompt += "\nInclude a structured outline with key points."

        if options.include_highlights:
            system_prompt += "\nInclude important highlights and key quotes."

        # User prompt
        user_prompt = (
            f"Please summarize the following {options.content_type.value}:\n\n{text}"
        )

        if options.max_length:
            user_prompt += (
                f"\n\nTarget length: approximately {options.max_length} words."
            )

        return system_prompt, user_prompt

    async def _extract_outline(self, summary: str) -> list[str]:
        """Extract outline points from summary.

        Args:
            summary: Summary text

        Returns:
            List of outline points

        """
        # Simple outline extraction - split by sentences and filter
        sentences = summary.split(".")
        outline = []

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20 and any(
                keyword in sentence.lower()
                for keyword in ["key", "main", "important", "primary", "major"]
            ):
                outline.append(sentence)

        return outline[:5]  # Limit to 5 points

    async def _extract_highlights(self, original_text: str, summary: str) -> list[str]:
        """Extract highlights from original text based on summary.

        Args:
            original_text: Original text
            summary: Generated summary

        Returns:
            List of highlights

        """
        # Simple highlight extraction - find sentences that contain key terms from summary
        summary_words = set(summary.lower().split())
        sentences = original_text.split(".")
        highlights = []

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 30:
                sentence_words = set(sentence.lower().split())
                overlap = len(summary_words.intersection(sentence_words))
                if overlap >= 3:  # At least 3 words overlap
                    highlights.append(sentence)

        return highlights[:3]  # Limit to 3 highlights

    async def _calculate_quality_score(self, original_text: str, summary: str) -> float:
        """Calculate quality score for the summary.

        Args:
            original_text: Original text
            summary: Generated summary

        Returns:
            Quality score between 0.0 and 1.0

        """
        # Simple quality scoring based on length ratio and word overlap
        original_words = set(original_text.lower().split())
        summary_words = set(summary.lower().split())

        # Word overlap ratio
        overlap_ratio = (
            len(original_words.intersection(summary_words)) / len(original_words)
            if original_words
            else 0
        )

        # Length appropriateness (summary should be 10-30% of original)
        length_ratio = (
            len(summary.split()) / len(original_text.split())
            if original_text.split()
            else 0
        )
        length_score = 1.0 - abs(length_ratio - 0.2) / 0.2  # Optimal at 20%
        length_score = max(0.0, min(1.0, length_score))

        # Combine scores
        quality_score = overlap_ratio * 0.6 + length_score * 0.4
        return min(1.0, max(0.0, quality_score))


# Global summarizer instance
_ai_summarizer = None


def get_ai_summarizer() -> AISummarizer:
    """Get the AI summarizer instance with lazy initialization.

    Returns:
        AISummarizer: The initialized summarizer instance

    """
    global _ai_summarizer
    if _ai_summarizer is None:
        _ai_summarizer = AISummarizer()
    return _ai_summarizer


async def initialize_ai_summarizer() -> bool:
    """Initialize the AI summarizer.

    Returns:
        bool: True if initialization was successful, False otherwise

    """
    try:
        global _ai_summarizer
        if _ai_summarizer is None:
            _ai_summarizer = AISummarizer()
            await _ai_summarizer.initialize()
            logger.info("✅ AI summarizer initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ AI summarizer initialization failed: {e}")
        return False


async def shutdown_ai_summarizer() -> None:
    """Shutdown the AI summarizer."""
    try:
        global _ai_summarizer
        if _ai_summarizer is not None:
            _ai_summarizer = None
            logger.info("✅ AI summarizer shutdown successfully")
    except Exception as e:
        logger.error(f"❌ AI summarizer shutdown error: {e}")


async def health_check_ai_summarizer() -> bool:
    """Health check for the AI summarizer.

    Returns:
        bool: True if service is healthy, False otherwise

    """
    try:
        global _ai_summarizer
        if _ai_summarizer is None:
            return False

        # Check if the service is initialized and AI service is available
        if not _ai_summarizer._initialized:
            return False

        if not _ai_summarizer.ai_service:
            return False

        # Check AI service health
        health_status = _ai_summarizer.ai_service.get_health_status()
        return (
            health_status["service_initialized"]
            and health_status["healthy_providers"] > 0
        )

    except Exception as e:
        logger.error(f"❌ AI summarizer health check error: {e}")
        return False
