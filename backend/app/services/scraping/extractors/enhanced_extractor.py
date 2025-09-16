"""
Enhanced content extraction pipeline with multi-tier fallback strategy.

This module provides a sophisticated content extraction system that tries
multiple extraction methods in order of preference, falling back to simpler
methods when more advanced ones fail.
"""

import logging
from typing import Any

from .base_scraper import BaseScraper
from ..models import ScrapingResult, ScrapingType


class EnhancedContentExtractor(BaseScraper):
    """
    Enhanced content extractor with multi-tier fallback strategy.

    Extraction strategy:
    1. Primary: Site-specific scrapers (Twitter, Wikipedia, GitHub, etc.)
    2. Secondary: General web scraping with BeautifulSoup
    3. Tertiary: Basic HTTP request with minimal parsing
    4. Quaternary: Fallback with just URL and basic metadata

    This extractor automatically selects the best extraction method
    based on the URL and available scrapers.
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the enhanced content extractor."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.ENHANCED
        self.supported_domains = []  # Supports all domains

        # Initialize specialized scrapers
        self._initialize_scrapers()

    def _initialize_scrapers(self) -> None:
        """Initialize all available specialized scrapers."""
        self.scrapers = {}

        try:
            from .twitter_scraper import TwitterScraper
            self.scrapers["twitter"] = TwitterScraper(self.logger)
        except ImportError:
            self.logger.warning("Twitter scraper not available")

        try:
            from .wikipedia_scraper import WikipediaScraper
            self.scrapers["wikipedia"] = WikipediaScraper(self.logger)
        except ImportError:
            self.logger.warning("Wikipedia scraper not available")

        try:
            from .hackernews_scraper import HackerNewsScraper
            self.scrapers["hackernews"] = HackerNewsScraper(self.logger)
        except ImportError:
            self.logger.warning("HackerNews scraper not available")

        try:
            from .github_scraper import GitHubScraper
            self.scrapers["github"] = GitHubScraper(self.logger)
        except ImportError:
            self.logger.warning("GitHub scraper not available")

        try:
            from .general_scraper import GeneralScraper
            self.scrapers["general"] = GeneralScraper(self.logger)
        except ImportError:
            self.logger.warning("General scraper not available")

        self.logger.info(f"Initialized {len(self.scrapers)} scrapers: {list(self.scrapers.keys())}")

    async def can_handle_url(self, url: str) -> bool:
        """Check if this extractor can handle the given URL."""
        return True  # Enhanced extractor can handle any URL

    async def scrape_content(self, url: str) -> ScrapingResult:
        """
        Extract content using multi-tier fallback strategy.

        Args:
            url: URL to extract content from

        Returns:
            ScrapingResult with extracted content
        """
        try:
            # Try specialized scrapers first
            for scraper_name, scraper in self.scrapers.items():
                if scraper_name == "general":
                    continue  # Skip general scraper for now

                if await scraper.can_handle_url(url):
                    self.logger.info(f"Using {scraper_name} scraper for {url}")
                    result = await scraper.scrape_content(url)

                    # If we got good content, return it
                    if result.quality["score"] > 0.3:
                        result.metadata["extraction_method"] = f"enhanced_{scraper_name}"
                        return result

            # Fallback to general scraper
            if "general" in self.scrapers:
                self.logger.info(f"Using general scraper for {url}")
                result = await self.scrapers["general"].scrape_content(url)
                result.metadata["extraction_method"] = "enhanced_general"
                return result

            # Final fallback
            return await self._fallback_extraction(url)

        except Exception as e:
            self.logger.error(f"Enhanced extraction failed for {url}: {e}")
            return await self._fallback_extraction(url)

    async def _fallback_extraction(self, url: str) -> ScrapingResult:
        """Final fallback extraction method."""
        try:
            response = await self._make_request(url)
            if not response:
                return ScrapingResult(
                    url=url,
                    title="Content",
                    content="",
                    metadata={
                        "source": "enhanced",
                        "extraction_method": "failed",
                        "error": "Failed to fetch content",
                    },
                    quality={"score": 0.0, "factors": {}},
                )

            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "Web Content"

            # Try to extract main content
            content_text = ""

            # Look for common content containers
            content_selectors = [
                "main",
                "article",
                "[role='main']",
                ".content",
                "#content",
                ".post-content",
                ".entry-content",
                ".article-content",
            ]

            for selector in content_selectors:
                content_element = soup.select_one(selector)
                if content_element:
                    content_text = content_element.get_text(separator="\n", strip=True)
                    break

            # If no content found, try to get body text
            if not content_text:
                body = soup.find("body")
                if body:
                    content_text = body.get_text(separator="\n", strip=True)

            # Clean up content
            if content_text:
                # Remove excessive whitespace
                import re
                content_text = re.sub(r'\n\s*\n', '\n\n', content_text)
                content_text = content_text.strip()

            return ScrapingResult(
                url=url,
                title=title_text,
                content=content_text,
                metadata={
                    "source": "enhanced",
                    "extraction_method": "fallback",
                    "limited_data": True,
                },
                quality={
                    "score": 0.4 if content_text else 0.1,
                    "factors": {
                        "content_length": len(content_text),
                        "extraction_method": "fallback",
                        "has_title": bool(title_text),
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Fallback extraction failed: {e}")
            return ScrapingResult(
                url=url,
                title="Content",
                content="",
                metadata={
                    "source": "enhanced",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )

    async def extract_with_method(self, url: str, method: str) -> ScrapingResult:
        """
        Extract content using a specific method.

        Args:
            url: URL to extract content from
            method: Extraction method to use

        Returns:
            ScrapingResult with extracted content
        """
        if method in self.scrapers:
            scraper = self.scrapers[method]
            if await scraper.can_handle_url(url):
                result = await scraper.scrape_content(url)
                result.metadata["extraction_method"] = f"enhanced_{method}"
                return result
            else:
                self.logger.warning(f"Scraper {method} cannot handle URL: {url}")
                return await self._fallback_extraction(url)
        else:
            self.logger.warning(f"Unknown extraction method: {method}")
            return await self._fallback_extraction(url)

    def get_available_methods(self) -> list[str]:
        """Get list of available extraction methods."""
        return list(self.scrapers.keys())

    def get_method_info(self, method: str) -> dict[str, Any]:
        """Get information about a specific extraction method."""
        if method in self.scrapers:
            scraper = self.scrapers[method]
            return {
                "name": method,
                "type": scraper.scraper_type,
                "supported_domains": scraper.supported_domains,
                "available": True,
            }
        else:
            return {
                "name": method,
                "available": False,
            }

    async def test_extraction_methods(self, url: str) -> dict[str, ScrapingResult]:
        """
        Test all available extraction methods on a URL.

        Args:
            url: URL to test

        Returns:
            Dictionary mapping method names to results
        """
        results = {}

        for method in self.get_available_methods():
            try:
                result = await self.extract_with_method(url, method)
                results[method] = result
            except Exception as e:
                self.logger.error(f"Method {method} failed for {url}: {e}")
                results[method] = ScrapingResult(
                    url=url,
                    title="Error",
                    content="",
                    metadata={
                        "source": "enhanced",
                        "extraction_method": method,
                        "error": str(e),
                    },
                    quality={"score": 0.0, "factors": {}},
                )

        return results

    async def get_best_method(self, url: str) -> str:
        """
        Determine the best extraction method for a URL.

        Args:
            url: URL to analyze

        Returns:
            Name of the best extraction method
        """
        # Test all methods
        results = await self.test_extraction_methods(url)

        # Find method with highest quality score
        best_method = "general"
        best_score = 0.0

        for method, result in results.items():
            score = result.quality["score"]
            if score > best_score:
                best_score = score
                best_method = method

        return best_method
