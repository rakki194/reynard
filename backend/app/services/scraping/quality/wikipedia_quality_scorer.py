"""Wikipedia Quality Scorer for Reynard Backend

Specialized quality assessment for Wikipedia content.
"""

import logging
from typing import Any

from .content_quality_scorer import ContentQualityScorer
from .models import ContentQuality

logger = logging.getLogger(__name__)


class WikipediaQualityScorer(ContentQualityScorer):
    """Specialized quality scorer for Wikipedia content.

    Extends the base quality scorer with Wikipedia-specific
    quality assessment criteria.
    """

    def __init__(self):
        """Initialize the Wikipedia quality scorer."""
        super().__init__()

    async def assess_quality(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> ContentQuality:
        """Assess the quality of Wikipedia content.

        Args:
            content: Wikipedia content to assess
            metadata: Optional metadata about the content

        Returns:
            Quality assessment result

        """
        try:
            # Get base quality assessment
            base_quality = await super().assess_quality(content, metadata)

            # Apply Wikipedia-specific adjustments
            wikipedia_score = await self._calculate_wikipedia_score(content, metadata)

            # Combine scores (weighted average)
            combined_score = (base_quality.score * 0.7) + (wikipedia_score * 0.3)

            # Update the result
            base_quality.score = combined_score
            base_quality.overall = self._get_quality_level(combined_score)

            return base_quality

        except Exception as e:
            logger.error(f"Error assessing Wikipedia content quality: {e}")
            return await super().assess_quality(content, metadata)

    async def _calculate_wikipedia_score(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> float:
        """Calculate Wikipedia-specific quality score.

        Args:
            content: Wikipedia content
            metadata: Optional metadata

        Returns:
            Wikipedia-specific quality score

        """
        try:
            score = 50.0  # Base score

            # Check for Wikipedia-specific elements
            if "{{" in content and "}}" in content:
                score += 10.0  # Has templates

            if "==" in content:
                score += 15.0  # Has sections

            if "[[Category:" in content:
                score += 10.0  # Has categories

            if "{{cite" in content.lower():
                score += 15.0  # Has citations

            if "{{stub}}" in content.lower():
                score -= 20.0  # Is a stub

            if "{{disambiguation}}" in content.lower():
                score -= 10.0  # Is disambiguation page

            # Check metadata for Wikipedia-specific fields
            if metadata:
                if metadata.get("revision_id"):
                    score += 5.0
                if metadata.get("page_id"):
                    score += 5.0
                if metadata.get("namespace") == 0:  # Main namespace
                    score += 10.0

            return max(0.0, min(100.0, score))

        except Exception as e:
            logger.error(f"Error calculating Wikipedia score: {e}")
            return 50.0
