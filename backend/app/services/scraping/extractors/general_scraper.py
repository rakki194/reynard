"""
General Scraper for Reynard Backend

General-purpose web scraper that can handle most websites.
"""

import asyncio
import logging
from typing import Any
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

from ..models import ScrapingConfig, ScrapingType
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class GeneralScraper(BaseScraper):
    """
    General-purpose web scraper.

    Can handle most websites by extracting text content, links, and images.
    Uses BeautifulSoup for HTML parsing and aiohttp for async requests.
    """

    def __init__(self):
        """Initialize the general scraper."""
        super().__init__(ScrapingType.GENERAL, "general_scraper")
        self.session: aiohttp.ClientSession | None = None
        self.user_agent = "Mozilla/5.0 (compatible; ReynardScraper/1.0)"

    async def initialize(self) -> bool:
        """Initialize the scraper with HTTP session."""
        try:
            # Create HTTP session with timeout and headers
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            headers = {
                "User-Agent": self.user_agent,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }

            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers,
                connector=aiohttp.TCPConnector(limit=10, limit_per_host=5),
            )

            logger.info("General scraper initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize general scraper: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraper and close HTTP session."""
        try:
            if self.session:
                await self.session.close()
                self.session = None

            logger.info("General scraper shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down general scraper: {e}")
            return False

    def can_handle_url(self, url: str) -> bool:
        """
        Check if this scraper can handle the given URL.

        Args:
            url: URL to check

        Returns:
            True if URL is valid
        """
        try:
            parsed = urlparse(url)
            return parsed.scheme in ("http", "https") and parsed.netloc
        except Exception:
            return False

    async def scrape_url(
        self, url: str, config: ScrapingConfig | None = None
    ) -> list[dict[str, Any]]:
        """
        Scrape content from a URL.

        Args:
            url: URL to scrape
            config: Optional scraping configuration

        Returns:
            List of extracted content data
        """
        if not self.session:
            raise RuntimeError("Scraper not initialized")

        try:
            # Validate URL
            if not await self.validate_url(url):
                raise ValueError(f"Invalid URL: {url}")

            # Respect rate limiting
            delay = await self.get_rate_limit_delay()
            if delay > 0:
                await asyncio.sleep(delay)

            # Fetch the page
            async with self.session.get(url) as response:
                if response.status != 200:
                    raise ValueError(f"HTTP {response.status}: {response.reason}")

                content = await response.text()
                content_type = response.headers.get("content-type", "")

                # Only process HTML content
                if "text/html" not in content_type:
                    logger.warning(f"Non-HTML content type: {content_type}")
                    return []

                # Parse HTML
                soup = BeautifulSoup(content, "html.parser")

                # Extract content
                extracted_data = await self._extract_content(soup, url, config)

                logger.info(f"Successfully scraped {url}: {len(extracted_data)} items")
                return extracted_data

        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            raise

    async def _extract_content(
        self, soup: BeautifulSoup, base_url: str, config: ScrapingConfig | None = None
    ) -> list[dict[str, Any]]:
        """
        Extract content from parsed HTML.

        Args:
            soup: BeautifulSoup parsed HTML
            base_url: Base URL for resolving relative links
            config: Optional scraping configuration

        Returns:
            List of extracted content data
        """
        results = []

        # Extract main content
        main_content = await self._extract_main_content(soup)
        if main_content:
            results.append(
                {
                    "url": base_url,
                    "title": await self._extract_title(soup),
                    "content": main_content,
                    "metadata": {
                        "type": "main_content",
                        "extracted_at": "now",  # Will be replaced with actual timestamp
                        "scraper": self.name,
                    },
                }
            )

        # Extract images if configured
        if not config or config.extraction.extract_images:
            images = await self._extract_images(soup, base_url)
            results.extend(images)

        # Extract links if configured
        if not config or config.extraction.extract_links:
            links = await self._extract_links(soup, base_url)
            results.extend(links)

        return results

    async def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main text content from HTML."""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()

        # Try to find main content areas
        main_selectors = [
            "main",
            "article",
            "[role='main']",
            ".content",
            ".main-content",
            ".post-content",
            ".entry-content",
            "#content",
            "#main",
        ]

        main_content = None
        for selector in main_selectors:
            element = soup.select_one(selector)
            if element:
                main_content = element
                break

        # Fallback to body if no main content found
        if not main_content:
            main_content = soup.find("body")

        if not main_content:
            return ""

        # Get text content
        text = main_content.get_text(separator=" ", strip=True)

        # Clean up whitespace
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        return "\n".join(lines)

    async def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title."""
        title_tag = soup.find("title")
        if title_tag:
            return title_tag.get_text(strip=True)

        # Fallback to h1
        h1_tag = soup.find("h1")
        if h1_tag:
            return h1_tag.get_text(strip=True)

        return ""

    async def _extract_images(
        self, soup: BeautifulSoup, base_url: str
    ) -> list[dict[str, Any]]:
        """Extract image information."""
        images = []

        for img in soup.find_all("img"):
            src = img.get("src")
            if not src:
                continue

            # Resolve relative URLs
            img_url = urljoin(base_url, src)

            images.append(
                {
                    "url": img_url,
                    "title": img.get("alt", ""),
                    "content": f"Image: {img.get('alt', '')}",
                    "metadata": {
                        "type": "image",
                        "src": src,
                        "alt": img.get("alt", ""),
                        "width": img.get("width"),
                        "height": img.get("height"),
                        "extracted_at": "now",
                        "scraper": self.name,
                    },
                }
            )

        return images

    async def _extract_links(
        self, soup: BeautifulSoup, base_url: str
    ) -> list[dict[str, Any]]:
        """Extract link information."""
        links = []

        for link in soup.find_all("a", href=True):
            href = link.get("href")
            if not href:
                continue

            # Resolve relative URLs
            link_url = urljoin(base_url, href)

            # Skip external links for now (can be configured)
            if not link_url.startswith(
                base_url.split("/")[0] + "//" + urlparse(base_url).netloc
            ):
                continue

            link_text = link.get_text(strip=True)
            if not link_text:
                continue

            links.append(
                {
                    "url": link_url,
                    "title": link_text,
                    "content": f"Link: {link_text}",
                    "metadata": {
                        "type": "link",
                        "href": href,
                        "text": link_text,
                        "extracted_at": "now",
                        "scraper": self.name,
                    },
                }
            )

        return links

    async def get_rate_limit_delay(self) -> float:
        """Get delay between requests."""
        # Conservative rate limiting for general scraper
        return 2.0
