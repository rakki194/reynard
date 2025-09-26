"""Content Cleaner for Reynard Backend

Cleans and normalizes scraped content.
"""

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


class ContentCleaner:
    """Cleans and normalizes scraped content.

    Removes unwanted elements, normalizes formatting,
    and prepares content for further processing.
    """

    def __init__(self):
        """Initialize the content cleaner."""
        self.initialized = False

    async def initialize(self) -> bool:
        """Initialize the content cleaner."""
        try:
            if self.initialized:
                return True

            self.initialized = True
            logger.info("Content cleaner initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize content cleaner: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the content cleaner."""
        try:
            self.initialized = False
            logger.info("Content cleaner shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down content cleaner: {e}")
            return False

    async def clean_content(
        self,
        content: str,
        config: dict[str, Any] | None = None,
    ) -> str:
        """Clean content by removing unwanted elements.

        Args:
            content: Content to clean
            config: Optional cleaning configuration

        Returns:
            Cleaned content

        """
        try:
            if not content:
                return ""

            cleaned = content

            # Remove HTML tags if configured
            if not config or config.get("remove_html", True):
                cleaned = re.sub(r"<[^>]+>", "", cleaned)

            # Remove extra whitespace
            cleaned = re.sub(r"\s+", " ", cleaned)
            cleaned = cleaned.strip()

            # Remove common unwanted patterns
            unwanted_patterns = [
                r"Advertisement",
                r"Ad\s*$",
                r"Sponsored\s*content",
                r"Click\s*here",
                r"Read\s*more",
            ]

            for pattern in unwanted_patterns:
                cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

            return cleaned

        except Exception as e:
            logger.error(f"Error cleaning content: {e}")
            return content

    def get_info(self) -> dict[str, Any]:
        """Get cleaner information."""
        return {"initialized": self.initialized, "name": "ContentCleaner"}
