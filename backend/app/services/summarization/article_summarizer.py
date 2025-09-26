"""Article-specific summarizer for Reynard.

This module provides specialized summarization for articles, blog posts,
news content, and general web text with article-specific prompts and processing.
"""

import logging
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from .base import (
    BaseSummarizer,
    ContentType,
    SummarizationOptions,
    SummarizationResult,
    SummaryLevel,
)

logger = logging.getLogger(__name__)


class ArticleSummarizer(BaseSummarizer):
    """Specialized summarizer for articles and web content.

    This summarizer is optimized for articles, blog posts, news content,
    and general web text with specialized prompts and processing.
    """

    def __init__(self, ollama_service):
        """Initialize the article summarizer.

        Args:
            ollama_service: Instance of Reynard's OllamaService

        """
        super().__init__(
            name="article_summarizer",
            supported_content_types=[ContentType.ARTICLE, ContentType.GENERAL],
        )
        self.ollama_service = ollama_service
        self._default_model = "llama3.2:3b"

    async def initialize(self) -> bool:
        """Initialize the article summarizer."""
        try:
            if not self.ollama_service:
                logger.error("Ollama service not available")
                return False

            self._is_available = True
            logger.info("✅ ArticleSummarizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize ArticleSummarizer: {e}")
            return False

    async def summarize(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> SummarizationResult:
        """Summarize article text."""
        if not self._is_available:
            raise RuntimeError("ArticleSummarizer is not available")

        if not await self.validate_text(text):
            raise ValueError("Invalid article text for summarization")

        start_time = time.time()

        try:
            # Preprocess article text
            processed_text = self._preprocess_article(text)

            # Generate summary
            summary_text = await self._generate_article_summary(processed_text, options)

            processing_time = time.time() - start_time

            # Extract article-specific metadata
            title = self._extract_title(processed_text)
            abstract = self._extract_abstract(summary_text)

            # Create result
            result = SummarizationResult(
                id=str(uuid.uuid4()),
                original_text=text,
                summary=summary_text,
                content_type=ContentType.ARTICLE,
                summary_level=options.summary_level,
                model=options.model or self._default_model,
                processing_time=processing_time,
                word_count=len(text.split()),
                summary_word_count=len(summary_text.split()),
                title=title,
                abstract=abstract,
                metadata={
                    "summarizer": self.name,
                    "model_used": options.model or self._default_model,
                    "article_type": self._detect_article_type(processed_text),
                    "reading_time": self._estimate_reading_time(text),
                },
            )

            # Add optional fields
            if options.include_outline:
                result.outline = await self._extract_article_outline(summary_text)

            if options.include_highlights:
                result.highlights = await self._extract_article_highlights(
                    processed_text,
                )

            # Calculate quality score
            result.quality_score = await self._calculate_article_quality(
                text,
                summary_text,
            )

            return result

        except Exception as e:
            logger.error(f"Article summarization failed: {e}")
            raise

    async def summarize_stream(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> AsyncGenerator[dict[str, Any]]:
        """Stream article summarization progress."""
        if not self._is_available:
            yield {
                "event": "error",
                "data": {"message": "ArticleSummarizer is not available"},
            }
            return

        try:
            yield {
                "event": "start",
                "data": {"message": "Starting article summarization"},
            }

            # Preprocess article
            processed_text = self._preprocess_article(text)
            yield {"event": "preprocess", "data": {"message": "Article preprocessed"}}

            # Stream summary generation
            summary_text = ""
            async for chunk in self._generate_article_summary_stream(
                processed_text,
                options,
            ):
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
            logger.error(f"Streaming article summarization failed: {e}")
            yield {
                "event": "error",
                "data": {"message": str(e)},
            }

    async def validate_text(self, text: str) -> bool:
        """Validate article text."""
        if not text or not text.strip():
            return False

        # Check minimum length for articles
        if len(text.strip()) < 100:
            return False

        # Check maximum length
        if len(text) > 200000:  # ~50k tokens
            return False

        return True

    def _preprocess_article(self, text: str) -> str:
        """Preprocess article text for better summarization.

        Args:
            text: Raw article text

        Returns:
            Preprocessed text

        """
        # Remove excessive whitespace
        text = " ".join(text.split())

        # Remove common article artifacts
        artifacts = [
            "Advertisement",
            "Subscribe to our newsletter",
            "Follow us on",
            "Share this article",
            "Related articles:",
            "Read more:",
        ]

        for artifact in artifacts:
            text = text.replace(artifact, "")

        return text.strip()

    async def _generate_article_summary(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> str:
        """Generate article summary using specialized prompts."""
        system_prompt, user_prompt = self._get_article_prompts(text, options)

        model = options.model or self._default_model

        # Generate summary
        summary_text = ""
        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True,
        ):
            if event.type == "token":
                summary_text += event.data
            elif event.type == "error":
                raise RuntimeError(f"Ollama error: {event.data}")

        return summary_text.strip()

    async def _generate_article_summary_stream(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> AsyncGenerator[dict[str, Any]]:
        """Generate article summary with streaming."""
        system_prompt, user_prompt = self._get_article_prompts(text, options)

        model = options.model or self._default_model

        async for event in self.ollama_service.chat_stream(
            message=user_prompt,
            model=model,
            system_prompt=system_prompt,
            temperature=options.temperature,
            top_p=options.top_p,
            stream=True,
        ):
            yield {
                "type": event.type,
                "data": event.data,
                "timestamp": event.timestamp,
                "metadata": event.metadata,
            }

    def _get_article_prompts(
        self,
        text: str,
        options: SummarizationOptions,
    ) -> tuple[str, str]:
        """Get specialized prompts for article summarization."""
        # Article-specific system prompt
        system_prompt = """You are an expert article summarizer specializing in web content, news articles, and blog posts. 

Your task is to create high-quality summaries that:
- Capture the main arguments and key points
- Maintain the author's perspective and tone
- Identify the central thesis or main message
- Highlight important quotes and evidence
- Preserve the article's structure and flow
- Focus on actionable insights and takeaways

Guidelines:
- Use clear, engaging language
- Maintain objectivity while preserving the author's voice
- Include relevant context and background
- Highlight key statistics, quotes, or data points
- Ensure the summary is self-contained and informative"""

        # Add level-specific instructions
        level_instructions = {
            SummaryLevel.BRIEF: "Create a concise 2-3 sentence summary focusing on the main point.",
            SummaryLevel.EXECUTIVE: "Create an executive summary highlighting key findings and implications.",
            SummaryLevel.DETAILED: "Create a comprehensive summary covering all major sections and arguments.",
            SummaryLevel.COMPREHENSIVE: "Create an extensive summary with thorough analysis and context.",
            SummaryLevel.BULLET: "Create a bullet-point summary with key points and sub-points.",
            SummaryLevel.TTS_OPTIMIZED: "Create a summary optimized for speech with natural flow and clear pronunciation.",
        }

        system_prompt += (
            f"\n\nSummary Level: {level_instructions.get(options.summary_level, '')}"
        )

        if options.include_outline:
            system_prompt += (
                "\nInclude a structured outline with main sections and key points."
            )

        if options.include_highlights:
            system_prompt += (
                "\nInclude important highlights, key quotes, and notable statistics."
            )

        # User prompt
        user_prompt = f"Please summarize the following article:\n\n{text}"

        if options.max_length:
            user_prompt += (
                f"\n\nTarget length: approximately {options.max_length} words."
            )

        return system_prompt, user_prompt

    def _extract_title(self, text: str) -> str | None:
        """Extract or generate a title for the article."""
        # Try to find existing title patterns
        lines = text.split("\n")
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 10 and len(line) < 100 and not line.endswith("."):
                return line

        # Generate title from first sentence
        first_sentence = text.split(".")[0].strip()
        if len(first_sentence) < 100:
            return first_sentence

        return None

    def _extract_abstract(self, summary: str) -> str | None:
        """Extract abstract from summary."""
        # Use first paragraph as abstract
        paragraphs = summary.split("\n\n")
        if paragraphs:
            return paragraphs[0].strip()

        # Use first sentence if no paragraphs
        sentences = summary.split(".")
        if sentences:
            return sentences[0].strip() + "."

        return None

    def _detect_article_type(self, text: str) -> str:
        """Detect the type of article."""
        text_lower = text.lower()

        if any(
            keyword in text_lower
            for keyword in ["breaking", "news", "reports", "according to"]
        ):
            return "news"
        if any(
            keyword in text_lower
            for keyword in ["tutorial", "how to", "guide", "step by step"]
        ):
            return "tutorial"
        if any(
            keyword in text_lower
            for keyword in ["opinion", "viewpoint", "analysis", "commentary"]
        ):
            return "opinion"
        if any(
            keyword in text_lower
            for keyword in ["review", "evaluation", "assessment", "rating"]
        ):
            return "review"
        return "general"

    def _estimate_reading_time(self, text: str) -> int:
        """Estimate reading time in minutes."""
        words = len(text.split())
        # Average reading speed: 200 words per minute
        return max(1, words // 200)

    async def _extract_article_outline(self, summary: str) -> list[str]:
        """Extract outline points from article summary."""
        # Split by sentences and identify key points
        sentences = summary.split(".")
        outline = []

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 30 and any(
                keyword in sentence.lower()
                for keyword in [
                    "main",
                    "key",
                    "important",
                    "primary",
                    "major",
                    "central",
                    "core",
                ]
            ):
                outline.append(sentence)

        return outline[:6]  # Limit to 6 points

    async def _extract_article_highlights(self, text: str) -> list[str]:
        """Extract highlights from article text."""
        # Find sentences with important indicators
        sentences = text.split(".")
        highlights = []

        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 40 and any(
                indicator in sentence.lower()
                for indicator in [
                    "important",
                    "significant",
                    "notable",
                    "key finding",
                    "study shows",
                    "research indicates",
                ]
            ):
                highlights.append(sentence)

        return highlights[:4]  # Limit to 4 highlights

    async def _calculate_article_quality(
        self,
        original_text: str,
        summary: str,
    ) -> float:
        """Calculate quality score for article summary."""
        # Enhanced quality scoring for articles
        original_words = set(original_text.lower().split())
        summary_words = set(summary.lower().split())

        # Word overlap ratio
        overlap_ratio = (
            len(original_words.intersection(summary_words)) / len(original_words)
            if original_words
            else 0
        )

        # Length appropriateness for articles (15-25% of original)
        length_ratio = (
            len(summary.split()) / len(original_text.split())
            if original_text.split()
            else 0
        )
        length_score = 1.0 - abs(length_ratio - 0.2) / 0.1  # Optimal at 20%
        length_score = max(0.0, min(1.0, length_score))

        # Structure score (check for proper article structure)
        structure_score = 0.5  # Base score
        if any(
            keyword in summary.lower()
            for keyword in ["introduction", "conclusion", "main point"]
        ):
            structure_score += 0.3
        if len(summary.split(".")) >= 3:  # Multiple sentences
            structure_score += 0.2

        # Combine scores
        quality_score = overlap_ratio * 0.4 + length_score * 0.3 + structure_score * 0.3
        return min(1.0, max(0.0, quality_score))
