"""
Base Scraper for Reynard Backend

Abstract base class for all content scrapers.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any
import aiohttp
from bs4 import BeautifulSoup

from ..models import ScrapingResult, ScrapingType

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """
    Abstract base class for all content scrapers.

    Provides common functionality and defines the interface that all
    specialized scrapers must implement.
    """

    def __init__(self, logger: logging.Logger | None = None):
        """
        Initialize the base scraper.

        Args:
            logger: Logger instance
        """
        self.logger = logger or logging.getLogger(__name__)
        self.scraper_type = ScrapingType.GENERAL
        self.supported_domains = []
        self.enabled = True

    @abstractmethod
    async def scrape_content(self, url: str) -> ScrapingResult:
        """
        Scrape content from a URL.

        Args:
            url: URL to scrape

        Returns:
            ScrapingResult with extracted content

        Raises:
            NotImplementedError: Must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement scrape_content")

    @abstractmethod
    async def can_handle_url(self, url: str) -> bool:
        """
        Check if this scraper can handle the given URL.

        Args:
            url: URL to check

        Returns:
            True if this scraper can handle the URL

        Raises:
            NotImplementedError: Must be implemented by subclasses
        """
        raise NotImplementedError("Subclasses must implement can_handle_url")

    async def initialize(self) -> bool:
        """
        Initialize the scraper.

        Returns:
            True if initialization successful
        """
        try:
            logger.info(f"Initializing scraper: {self.name}")
            # Subclasses can override this for custom initialization
            return True
        except Exception as e:
            logger.error(f"Failed to initialize scraper {self.name}: {e}")
            return False

    async def shutdown(self) -> bool:
        """
        Shutdown the scraper.

        Returns:
            True if shutdown successful
        """
        try:
            logger.info(f"Shutting down scraper: {self.name}")
            # Subclasses can override this for custom shutdown
            return True
        except Exception as e:
            logger.error(f"Error shutting down scraper {self.name}: {e}")
            return False

    def get_info(self) -> dict[str, Any]:
        """
        Get scraper information.

        Returns:
            Dictionary with scraper information
        """
        return {
            "name": self.name,
            "type": self.scraper_type.value,
            "enabled": self.enabled,
        }

    def enable(self) -> None:
        """Enable the scraper."""
        self.enabled = True
        logger.info(f"Enabled scraper: {self.name}")

    def disable(self) -> None:
        """Disable the scraper."""
        self.enabled = False
        logger.info(f"Disabled scraper: {self.name}")

    async def validate_url(self, url: str) -> bool:
        """
        Validate a URL before scraping.

        Args:
            url: URL to validate

        Returns:
            True if URL is valid for this scraper
        """
        if not self.enabled:
            return False

        if not self.can_handle_url(url):
            return False

        # Additional validation can be added here
        return True

    async def get_rate_limit_delay(self) -> float:
        """
        Get the delay to wait before next request.

        Returns:
            Delay in seconds
        """
        # Default implementation - subclasses can override
        return 1.0

    async def respect_robots_txt(self, url: str) -> bool:
        """
        Check if we should respect robots.txt for the given URL.

        Args:
            url: URL to check

        Returns:
            True if we should respect robots.txt
        """
        # Default implementation - subclasses can override
        return True

    async def _make_request(self, url: str) -> aiohttp.ClientResponse | None:
        """
        Make an HTTP request to the given URL.

        Args:
            url: URL to request

        Returns:
            Response object or None if failed
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        return response
                    else:
                        self.logger.warning(f"HTTP {response.status} for {url}")
                        return None

        except Exception as e:
            self.logger.error(f"Request failed for {url}: {e}")
            return None

    def _parse_html(self, html_content: str) -> BeautifulSoup:
        """
        Parse HTML content using BeautifulSoup.

        Args:
            html_content: HTML content to parse

        Returns:
            BeautifulSoup object
        """
        return BeautifulSoup(html_content, "html.parser")
