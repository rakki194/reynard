"""
Content Categorizer for Reynard Backend

Categorizes scraped content based on various criteria.
"""

import logging
from typing import Any

from ..models import CategoryType

logger = logging.getLogger(__name__)


class ContentCategorizer:
    """
    Categorizes scraped content based on various criteria.

    Analyzes content and assigns appropriate categories
    based on content type, keywords, and other factors.
    """

    def __init__(self):
        """Initialize the content categorizer."""
        self.initialized = False
        self.category_keywords = self._get_category_keywords()

    async def initialize(self) -> bool:
        """Initialize the content categorizer."""
        try:
            if self.initialized:
                return True

            self.initialized = True
            logger.info("Content categorizer initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize content categorizer: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the content categorizer."""
        try:
            self.initialized = False
            logger.info("Content categorizer shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down content categorizer: {e}")
            return False

    async def categorize_content(
        self, content: str, metadata: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Categorize content based on analysis.

        Args:
            content: Content to categorize
            metadata: Optional metadata about the content

        Returns:
            Categorization result
        """
        try:
            if not content:
                return {
                    "type": CategoryType.OTHER,
                    "confidence": 0.0,
                    "tags": [],
                    "subcategories": [],
                }

            # Analyze content for category indicators
            category_scores = {}
            for category, keywords in self.category_keywords.items():
                score = self._calculate_category_score(content, keywords)
                category_scores[category] = score

            # Find best category
            best_category = max(category_scores.items(), key=lambda x: x[1])

            # Generate tags
            tags = self._generate_tags(content, metadata)

            return {
                "type": best_category[0],
                "confidence": best_category[1],
                "tags": tags,
                "subcategories": [],
            }

        except Exception as e:
            logger.error(f"Error categorizing content: {e}")
            return {
                "type": CategoryType.OTHER,
                "confidence": 0.0,
                "tags": [],
                "subcategories": [],
            }

    def _calculate_category_score(self, content: str, keywords: list[str]) -> float:
        """Calculate category score based on keyword matches."""
        try:
            content_lower = content.lower()
            matches = sum(1 for keyword in keywords if keyword.lower() in content_lower)
            return min(1.0, matches / len(keywords) * 2)  # Normalize to 0-1

        except Exception:
            return 0.0

    def _generate_tags(
        self, content: str, metadata: dict[str, Any] | None = None
    ) -> list[str]:
        """Generate tags for content."""
        tags = []

        # Extract tags from metadata
        if metadata:
            if "tags" in metadata:
                tags.extend(metadata["tags"])
            if "keywords" in metadata:
                tags.extend(metadata["keywords"])

        # Simple keyword extraction (placeholder)
        # In a real implementation, this would use more sophisticated NLP
        words = content.lower().split()
        common_words = [
            "the",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
        ]
        potential_tags = [
            word for word in words if word not in common_words and len(word) > 3
        ]

        # Add most common words as tags
        from collections import Counter

        word_counts = Counter(potential_tags)
        tags.extend([word for word, count in word_counts.most_common(5)])

        return list(set(tags))  # Remove duplicates

    def _get_category_keywords(self) -> dict[CategoryType, list[str]]:
        """Get keywords for each category."""
        return {
            CategoryType.NEWS: [
                "news",
                "breaking",
                "report",
                "announcement",
                "update",
                "latest",
                "today",
                "yesterday",
                "recent",
                "developing",
                "alert",
            ],
            CategoryType.TECHNICAL: [
                "code",
                "programming",
                "software",
                "development",
                "api",
                "database",
                "algorithm",
                "function",
                "class",
                "method",
                "variable",
                "debug",
            ],
            CategoryType.SOCIAL: [
                "social",
                "community",
                "discussion",
                "forum",
                "chat",
                "message",
                "comment",
                "reply",
                "like",
                "share",
                "follow",
                "friend",
            ],
            CategoryType.WIKI: [
                "wiki",
                "encyclopedia",
                "article",
                "reference",
                "information",
                "knowledge",
                "fact",
                "definition",
                "explanation",
                "history",
            ],
            CategoryType.GALLERY: [
                "image",
                "photo",
                "picture",
                "gallery",
                "album",
                "collection",
                "artwork",
                "illustration",
                "screenshot",
                "thumbnail",
            ],
            CategoryType.FORUM: [
                "forum",
                "discussion",
                "thread",
                "post",
                "topic",
                "reply",
                "question",
                "answer",
                "help",
                "support",
                "community",
            ],
            CategoryType.BLOG: [
                "blog",
                "post",
                "article",
                "entry",
                "update",
                "personal",
                "opinion",
                "review",
                "tutorial",
                "guide",
                "tips",
            ],
            CategoryType.DOCUMENTATION: [
                "documentation",
                "manual",
                "guide",
                "tutorial",
                "reference",
                "api",
                "help",
                "instructions",
                "how-to",
                "example",
            ],
        }

    def get_info(self) -> dict[str, Any]:
        """Get categorizer information."""
        return {
            "initialized": self.initialized,
            "name": "ContentCategorizer",
            "categories": len(self.category_keywords),
        }
