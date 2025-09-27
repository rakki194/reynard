"""Scraping Router for Reynard Backend

Routes scraping requests to appropriate scrapers based on URL patterns.
"""

import logging
from typing import Any

from .extractors import BaseScraper
from .models import ScrapingType

logger = logging.getLogger(__name__)


class ScrapingRouter:
    """Routes scraping requests to appropriate scrapers.

    Maintains a registry of scrapers and routes requests based on
    URL patterns and scraper capabilities.
    """

    def __init__(self):
        """Initialize the scraping router."""
        self.initialized = False
        self.scrapers: dict[ScrapingType, BaseScraper] = {}
        self.url_patterns: dict[str, ScrapingType] = {}

    async def initialize(self) -> bool:
        """Initialize the scraping router."""
        try:
            if self.initialized:
                return True

            # Initialize URL patterns
            await self._initialize_url_patterns()

            self.initialized = True
            logger.info("Scraping router initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize scraping router: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraping router."""
        try:
            # Shutdown all scrapers
            for scraper in self.scrapers.values():
                await scraper.shutdown()

            self.scrapers.clear()
            self.url_patterns.clear()
            self.initialized = False

            logger.info("Scraping router shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down scraping router: {e}")
            return False

    async def register_scraper(
        self,
        scraper_type: ScrapingType,
        scraper: BaseScraper,
    ) -> bool:
        """Register a scraper.

        Args:
            scraper_type: Type of scraper
            scraper: Scraper instance

        Returns:
            True if registration successful

        """
        try:
            # Initialize the scraper
            if not await scraper.initialize():
                logger.error(f"Failed to initialize scraper {scraper.name}")
                return False

            self.scrapers[scraper_type] = scraper
            logger.info(f"Registered scraper: {scraper.name} ({scraper_type.value})")
            return True

        except Exception as e:
            logger.error(f"Error registering scraper {scraper.name}: {e}")
            return False

    async def unregister_scraper(self, scraper_type: ScrapingType) -> bool:
        """Unregister a scraper.

        Args:
            scraper_type: Type of scraper to unregister

        Returns:
            True if unregistration successful

        """
        try:
            if scraper_type in self.scrapers:
                scraper = self.scrapers[scraper_type]
                await scraper.shutdown()
                del self.scrapers[scraper_type]
                logger.info(f"Unregistered scraper: {scraper.name}")
                return True

            return False

        except Exception as e:
            logger.error(f"Error unregistering scraper {scraper_type.value}: {e}")
            return False

    async def get_scraper(self, scraper_type: ScrapingType) -> BaseScraper | None:
        """Get a scraper by type.

        Args:
            scraper_type: Type of scraper

        Returns:
            Scraper instance if found

        """
        return self.scrapers.get(scraper_type)

    async def find_scraper_for_url(self, url: str) -> BaseScraper | None:
        """Find the best scraper for a URL.

        Args:
            url: URL to find scraper for

        Returns:
            Best scraper for the URL

        """
        try:
            # First, try to match URL patterns
            for pattern, scraper_type in self.url_patterns.items():
                if pattern in url.lower():
                    scraper = self.scrapers.get(scraper_type)
                    if scraper and await scraper.validate_url(url):
                        return scraper

            # Fallback: check each scraper's can_handle_url method
            for scraper in self.scrapers.values():
                if await scraper.validate_url(url) and scraper.can_handle_url(url):
                    return scraper

            # Default to general scraper if available
            general_scraper = self.scrapers.get(ScrapingType.GENERAL)
            if general_scraper:
                return general_scraper

            return None

        except Exception as e:
            logger.error(f"Error finding scraper for URL {url}: {e}")
            return None

    async def get_available_scrapers(self) -> list[dict[str, Any]]:
        """Get list of available scrapers."""
        scrapers = []
        for scraper_type, scraper in self.scrapers.items():
            scrapers.append(
                {
                    "type": scraper_type.value,
                    "name": scraper.name,
                    "enabled": scraper.enabled,
                    "info": scraper.get_info(),
                },
            )
        return scrapers

    async def _initialize_url_patterns(self) -> None:
        """Initialize URL patterns for scraper routing."""
        self.url_patterns = {
            "hackernews": ScrapingType.HACKER_NEWS,
            "news.ycombinator.com": ScrapingType.HACKER_NEWS,
            "github.com": ScrapingType.GITHUB,
            "stackoverflow.com": ScrapingType.STACKOVERFLOW,
            "stackexchange.com": ScrapingType.STACKOVERFLOW,
            "twitter.com": ScrapingType.TWITTER,
            "x.com": ScrapingType.TWITTER,
            "wikipedia.org": ScrapingType.WIKIPEDIA,
            "wikifur.com": ScrapingType.WIKIFUR,
            "e621.net": ScrapingType.E621_WIKI,
            "arstechnica.com": ScrapingType.ARS_TECHNICA,
            "techcrunch.com": ScrapingType.TECHCRUNCH,
            "wired.com": ScrapingType.WIRED,
            # WordPress sites (will be handled by WordPress scraper)
            "wordpress.com": ScrapingType.WORDPRESS,
            "wp.com": ScrapingType.WORDPRESS,
            # Multi-tier extraction for complex sites
            "reddit.com": ScrapingType.MULTI_TIER,
            "youtube.com": ScrapingType.MULTI_TIER,
            "instagram.com": ScrapingType.MULTI_TIER,
        }

    def get_info(self) -> dict[str, Any]:
        """Get router information."""
        return {
            "initialized": self.initialized,
            "registered_scrapers": len(self.scrapers),
            "url_patterns": len(self.url_patterns),
            "scrapers": [scraper.get_info() for scraper in self.scrapers.values()],
        }
