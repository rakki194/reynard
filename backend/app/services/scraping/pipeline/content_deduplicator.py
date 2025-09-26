"""Content Deduplicator for Reynard Backend

Identifies and removes duplicate content.
"""

import hashlib
import logging
from typing import Any

logger = logging.getLogger(__name__)


class ContentDeduplicator:
    """Identifies and removes duplicate content.

    Uses various techniques to detect duplicate or similar
    content and remove redundancies.
    """

    def __init__(self):
        """Initialize the content deduplicator."""
        self.initialized = False
        self.content_hashes: set[str] = set()
        self.similarity_threshold = 0.8

    async def initialize(self) -> bool:
        """Initialize the content deduplicator."""
        try:
            if self.initialized:
                return True

            self.initialized = True
            logger.info("Content deduplicator initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize content deduplicator: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the content deduplicator."""
        try:
            self.initialized = False
            self.content_hashes.clear()
            logger.info("Content deduplicator shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down content deduplicator: {e}")
            return False

    async def deduplicate_content(
        self,
        content_list: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Remove duplicate content from a list.

        Args:
            content_list: List of content items to deduplicate

        Returns:
            List of unique content items

        """
        try:
            unique_content = []
            seen_hashes = set()

            for content_item in content_list:
                content = content_item.get("content", "")
                content_hash = self._generate_content_hash(content)

                if content_hash not in seen_hashes:
                    seen_hashes.add(content_hash)
                    unique_content.append(content_item)
                else:
                    logger.debug(f"Removed duplicate content: {content_hash[:8]}...")

            return unique_content

        except Exception as e:
            logger.error(f"Error deduplicating content: {e}")
            return content_list

    async def is_duplicate(self, content: str) -> bool:
        """Check if content is a duplicate.

        Args:
            content: Content to check

        Returns:
            True if content is a duplicate

        """
        try:
            content_hash = self._generate_content_hash(content)
            return content_hash in self.content_hashes

        except Exception as e:
            logger.error(f"Error checking for duplicate: {e}")
            return False

    async def add_content(self, content: str) -> str:
        """Add content to the deduplication index.

        Args:
            content: Content to add

        Returns:
            Content hash

        """
        try:
            content_hash = self._generate_content_hash(content)
            self.content_hashes.add(content_hash)
            return content_hash

        except Exception as e:
            logger.error(f"Error adding content: {e}")
            return ""

    def _generate_content_hash(self, content: str) -> str:
        """Generate a hash for content."""
        try:
            # Normalize content for hashing
            normalized = content.lower().strip()
            normalized = " ".join(normalized.split())  # Remove extra whitespace

            # Generate SHA-256 hash
            return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

        except Exception as e:
            logger.error(f"Error generating content hash: {e}")
            return ""

    def _calculate_similarity(self, content1: str, content2: str) -> float:
        """Calculate similarity between two content strings.

        Args:
            content1: First content string
            content2: Second content string

        Returns:
            Similarity score (0-1)

        """
        try:
            # Simple similarity calculation based on common words
            words1 = set(content1.lower().split())
            words2 = set(content2.lower().split())

            if not words1 or not words2:
                return 0.0

            intersection = words1.intersection(words2)
            union = words1.union(words2)

            return len(intersection) / len(union) if union else 0.0

        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0

    def get_info(self) -> dict[str, Any]:
        """Get deduplicator information."""
        return {
            "initialized": self.initialized,
            "name": "ContentDeduplicator",
            "indexed_content": len(self.content_hashes),
            "similarity_threshold": self.similarity_threshold,
        }
