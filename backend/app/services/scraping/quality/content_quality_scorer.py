"""Content Quality Scorer for Reynard Backend

Assesses the quality of scraped content using various metrics.
"""

import logging
import re
from typing import Any

from .models import ContentQuality, QualityFactor, QualityLevel

logger = logging.getLogger(__name__)


class ContentQualityScorer:
    """Scores content quality based on various factors.

    Evaluates content on multiple dimensions including length,
    readability, structure, and completeness.
    """

    def __init__(self):
        """Initialize the content quality scorer."""
        self.initialized = False
        self.quality_factors = self._get_default_quality_factors()

    async def initialize(self) -> bool:
        """Initialize the quality scorer."""
        try:
            if self.initialized:
                return True

            self.initialized = True
            logger.info("Content quality scorer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize content quality scorer: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the quality scorer."""
        try:
            self.initialized = False
            logger.info("Content quality scorer shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down content quality scorer: {e}")
            return False

    async def assess_quality(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ContentQuality:
        """Assess the quality of content.

        Args:
            content: Content to assess
            metadata: Optional metadata about the content

        Returns:
            Quality assessment result

        """
        try:
            if not content or not content.strip():
                return self._create_quality_result(0, "No content provided")

            # Calculate quality factors
            factors = []
            total_score = 0
            total_weight = 0

            for factor_template in self.quality_factors:
                score = await self._calculate_factor_score(
                    factor_template.name,
                    content,
                    metadata,
                )
                factor = QualityFactor(
                    name=factor_template.name,
                    score=score,
                    weight=factor_template.weight,
                    description=factor_template.description,
                )
                factors.append(factor)

                total_score += score * factor.weight
                total_weight += factor.weight

            # Calculate overall score
            overall_score = total_score / total_weight if total_weight > 0 else 0
            overall_level = self._get_quality_level(overall_score)

            return ContentQuality(
                score=overall_score,
                factors=factors,
                overall=overall_level,
            )

        except Exception as e:
            logger.error(f"Error assessing content quality: {e}")
            return self._create_quality_result(0, f"Error: {e!s}")

    async def _calculate_factor_score(
        self,
        factor_name: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> float:
        """Calculate score for a specific quality factor.

        Args:
            factor_name: Name of the quality factor
            content: Content to assess
            metadata: Optional metadata

        Returns:
            Score for the factor (0-100)

        """
        try:
            if factor_name == "Content Length":
                return self._score_content_length(content)
            if factor_name == "Readability":
                return self._score_readability(content)
            if factor_name == "Relevance":
                return self._score_relevance(content, metadata)
            if factor_name == "Structure":
                return self._score_structure(content)
            if factor_name == "Completeness":
                return self._score_completeness(content, metadata)
            return 50.0  # Default score for unknown factors

        except Exception as e:
            logger.error(f"Error calculating {factor_name} score: {e}")
            return 0.0

    def _score_content_length(self, content: str) -> float:
        """Score based on content length."""
        word_count = len(content.split())

        if word_count < 50:
            return 20.0
        if word_count < 200:
            return 40.0
        if word_count < 500:
            return 70.0
        if word_count < 1000:
            return 85.0
        return 95.0

    def _score_readability(self, content: str) -> float:
        """Score based on readability metrics."""
        try:
            # Simple readability metrics
            sentences = re.split(r"[.!?]+", content)
            words = content.split()

            if not sentences or not words:
                return 0.0

            avg_sentence_length = len(words) / len(sentences)
            avg_word_length = sum(len(word) for word in words) / len(words)

            # Simple scoring based on sentence and word length
            sentence_score = max(0, 100 - (avg_sentence_length - 15) * 2)
            word_score = max(0, 100 - (avg_word_length - 5) * 10)

            return (sentence_score + word_score) / 2

        except Exception:
            return 50.0

    def _score_relevance(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> float:
        """Score based on content relevance."""
        # This is a simplified implementation
        # In a real system, this would use more sophisticated NLP

        if not metadata:
            return 60.0

        # Check for key indicators of relevance
        relevance_indicators = ["title", "description", "keywords", "tags", "category"]

        score = 50.0
        for indicator in relevance_indicators:
            if metadata.get(indicator):
                score += 10.0

        return min(100.0, score)

    def _score_structure(self, content: str) -> float:
        """Score based on content structure."""
        try:
            # Check for structural elements
            has_paragraphs = len(content.split("\n\n")) > 1
            has_sentences = "." in content or "!" in content or "?" in content
            has_capitalization = any(c.isupper() for c in content)
            has_punctuation = any(c in content for c in ".,!?;:")

            score = 0.0
            if has_paragraphs:
                score += 25.0
            if has_sentences:
                score += 25.0
            if has_capitalization:
                score += 25.0
            if has_punctuation:
                score += 25.0

            return score

        except Exception:
            return 50.0

    def _score_completeness(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> float:
        """Score based on content completeness."""
        try:
            # Check for completeness indicators
            has_title = metadata and metadata.get("title")
            has_content = len(content.strip()) > 0
            has_metadata = metadata and len(metadata) > 0

            score = 0.0
            if has_title:
                score += 40.0
            if has_content:
                score += 40.0
            if has_metadata:
                score += 20.0

            return score

        except Exception:
            return 50.0

    def _get_quality_level(self, score: float) -> QualityLevel:
        """Get quality level from score."""
        if score >= 90:
            return QualityLevel.EXCELLENT
        if score >= 75:
            return QualityLevel.GOOD
        if score >= 60:
            return QualityLevel.FAIR
        return QualityLevel.POOR

    def _create_quality_result(
        self,
        score: float,
        error_message: str,
    ) -> ContentQuality:
        """Create a quality result with error information."""
        return ContentQuality(
            score=score,
            factors=[
                QualityFactor(
                    name="Error",
                    score=0,
                    weight=1.0,
                    description=error_message,
                ),
            ],
            overall=self._get_quality_level(score),
        )

    def _get_default_quality_factors(self) -> list[QualityFactor]:
        """Get default quality factors."""
        return [
            QualityFactor(
                name="Content Length",
                score=0,
                weight=0.2,
                description="Length and depth of content",
            ),
            QualityFactor(
                name="Readability",
                score=0,
                weight=0.25,
                description="Clarity and readability of text",
            ),
            QualityFactor(
                name="Relevance",
                score=0,
                weight=0.2,
                description="Relevance to search query or topic",
            ),
            QualityFactor(
                name="Structure",
                score=0,
                weight=0.15,
                description="Well-structured content with proper formatting",
            ),
            QualityFactor(
                name="Completeness",
                score=0,
                weight=0.2,
                description="Completeness of information",
            ),
        ]

    def get_info(self) -> dict[str, Any]:
        """Get scorer information."""
        return {
            "initialized": self.initialized,
            "quality_factors": len(self.quality_factors),
            "factors": [factor.dict() for factor in self.quality_factors],
        }
