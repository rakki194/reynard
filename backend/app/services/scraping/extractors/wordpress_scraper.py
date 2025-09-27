"""WordPress API Scraper for Reynard Backend

Configurable scraper for WordPress sites with REST API integration.
"""

import asyncio
import logging
from typing import Any
from urllib.parse import urljoin, urlparse

import aiohttp
from bs4 import BeautifulSoup

from ..models import ScrapingResult, ScrapingType
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class WordPressScraper(BaseScraper):
    """Configurable scraper for WordPress sites.

    Features:
    - WordPress REST API integration
    - Configurable API endpoints
    - Category and tag filtering
    - Search functionality
    - Custom post type support
    - Fallback to web scraping
    """

    def __init__(
        self, 
        base_url: str,
        api_path: str = "/wp-json/wp/v2",
        logger: logging.Logger | None = None
    ):
        """Initialize the WordPress scraper.

        Args:
            base_url: Base URL of the WordPress site
            api_path: Path to WordPress REST API (default: /wp-json/wp/v2)
            logger: Logger instance

        """
        super().__init__(logger)
        self.scraper_type = ScrapingType.GENERAL
        self.name = "wordpress_scraper"
        
        # WordPress specific configuration
        self.base_url = base_url.rstrip("/")
        self.api_base_url = f"{self.base_url}{api_path}"
        
        # Extract domain for supported_domains
        parsed = urlparse(base_url)
        self.supported_domains = [parsed.netloc]
        
        # Session will be initialized in initialize()
        self.session: aiohttp.ClientSession | None = None

    async def initialize(self) -> bool:
        """Initialize the scraper with HTTP session."""
        try:
            # Create HTTP session with WordPress specific headers
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }

            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers,
                connector=aiohttp.TCPConnector(limit=10, limit_per_host=5),
            )

            # Test API availability
            if await self._test_api_availability():
                logger.info(f"WordPress scraper initialized successfully for {self.base_url}")
                return True
            else:
                logger.warning(f"WordPress API not available for {self.base_url}, using web scraping only")
                return True

        except Exception as e:
            logger.error(f"Failed to initialize WordPress scraper: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraper and close HTTP session."""
        try:
            if self.session:
                await self.session.close()
                self.session = None

            logger.info("WordPress scraper shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down WordPress scraper: {e}")
            return False

    async def can_handle_url(self, url: str) -> bool:
        """Check if this scraper can handle the given URL."""
        try:
            parsed = urlparse(url)
            return (
                parsed.scheme in ("http", "https") 
                and any(domain in parsed.netloc.lower() for domain in self.supported_domains)
            )
        except Exception:
            return False

    async def scrape_content(self, url: str) -> ScrapingResult:
        """Scrape content from a WordPress URL.

        Args:
            url: WordPress URL to scrape

        Returns:
            ScrapingResult with extracted content

        """
        if not self.session:
            raise RuntimeError("Scraper not initialized")

        try:
            # Validate URL
            if not await self.can_handle_url(url):
                raise ValueError(f"Invalid WordPress URL: {url}")

            # Respect rate limiting
            delay = await self.get_rate_limit_delay()
            if delay > 0:
                await asyncio.sleep(delay)

            # Try WordPress API first, then fallback to web scraping
            content_data = await self._scrape_with_api_fallback(url)

            if not content_data:
                raise ValueError(f"Failed to extract content from {url}")

            # Create ScrapingResult
            result = ScrapingResult(
                url=url,
                title=content_data.get("title", ""),
                content=content_data.get("content", ""),
                metadata={
                    "source": "wordpress",
                    "extraction_method": content_data.get("extraction_method", "unknown"),
                    "author": content_data.get("author", ""),
                    "date": content_data.get("date", ""),
                    "categories": content_data.get("categories", []),
                    "tags": content_data.get("tags", []),
                    "featured_image": content_data.get("featured_image"),
                    "excerpt": content_data.get("excerpt", ""),
                    "post_type": content_data.get("post_type", "post"),
                    "slug": content_data.get("slug", ""),
                },
            )

            logger.info(f"Successfully scraped WordPress content from {url}")
            return result

        except Exception as e:
            logger.error(f"Error scraping WordPress content from {url}: {e}")
            raise

    async def get_posts(
        self,
        post_type: str = "posts",
        limit: int = 10,
        category: str | None = None,
        tag: str | None = None,
        search: str | None = None,
        orderby: str = "date",
        order: str = "desc"
    ) -> list[dict[str, Any]]:
        """Get posts from WordPress API.

        Args:
            post_type: Post type (posts, pages, custom post types)
            limit: Number of posts to fetch
            category: Category slug to filter by
            tag: Tag slug to filter by
            search: Search query
            orderby: Order by field (date, title, etc.)
            order: Order direction (asc, desc)

        Returns:
            List of post dictionaries

        """
        try:
            # Build API URL
            if post_type == "posts":
                url = f"{self.api_base_url}/posts"
            else:
                url = f"{self.api_base_url}/{post_type}"

            params = {
                "per_page": min(limit, 100),  # WordPress API limit
                "orderby": orderby,
                "order": order,
                "_embed": "1",  # Include embedded data
            }

            # Add filters
            if category:
                category_id = await self._get_category_id(category)
                if category_id:
                    params["categories"] = category_id

            if tag:
                tag_id = await self._get_tag_id(tag)
                if tag_id:
                    params["tags"] = tag_id

            if search:
                params["search"] = search

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    logger.warning(f"API request failed: {response.status}")
                    return []

                posts = await response.json()
                return [self._parse_api_post(post) for post in posts]

        except Exception as e:
            logger.error(f"Error fetching posts: {e}")
            return []

    async def get_post_by_id(self, post_id: int, post_type: str = "posts") -> dict[str, Any] | None:
        """Get a specific post by ID.

        Args:
            post_id: WordPress post ID
            post_type: Post type (posts, pages, custom post types)

        Returns:
            Post dictionary or None if not found

        """
        try:
            if post_type == "posts":
                url = f"{self.api_base_url}/posts/{post_id}"
            else:
                url = f"{self.api_base_url}/{post_type}/{post_id}"

            params = {"_embed": "1"}

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None

                post = await response.json()
                return self._parse_api_post(post)

        except Exception as e:
            logger.error(f"Error fetching post {post_id}: {e}")
            return None

    async def search_posts(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Search posts using WordPress API.

        Args:
            query: Search query
            limit: Number of results to return

        Returns:
            List of matching post dictionaries

        """
        return await self.get_posts(limit=limit, search=query)

    async def get_categories(self) -> list[dict[str, Any]]:
        """Get all categories from WordPress API."""
        try:
            url = f"{self.api_base_url}/categories"
            params = {"per_page": 100}

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return []

                categories = await response.json()
                return [
                    {
                        "id": cat.get("id"),
                        "name": cat.get("name"),
                        "slug": cat.get("slug"),
                        "description": cat.get("description"),
                        "count": cat.get("count"),
                    }
                    for cat in categories
                ]

        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
            return []

    async def get_tags(self) -> list[dict[str, Any]]:
        """Get all tags from WordPress API."""
        try:
            url = f"{self.api_base_url}/tags"
            params = {"per_page": 100}

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return []

                tags = await response.json()
                return [
                    {
                        "id": tag.get("id"),
                        "name": tag.get("name"),
                        "slug": tag.get("slug"),
                        "description": tag.get("description"),
                        "count": tag.get("count"),
                    }
                    for tag in tags
                ]

        except Exception as e:
            logger.error(f"Error fetching tags: {e}")
            return []

    async def _test_api_availability(self) -> bool:
        """Test if WordPress REST API is available."""
        try:
            url = f"{self.api_base_url}/posts"
            params = {"per_page": 1}

            async with self.session.get(url, params=params) as response:
                return response.status == 200

        except Exception:
            return False

    async def _scrape_with_api_fallback(self, url: str) -> dict[str, Any] | None:
        """Scrape content using API first, then fallback to web scraping."""
        try:
            # Try to extract post ID from URL and use API
            post_id = await self._extract_post_id_from_url(url)
            if post_id:
                api_result = await self.get_post_by_id(post_id)
                if api_result:
                    api_result["extraction_method"] = "wordpress_api"
                    return api_result

            # Fallback to direct web scraping
            web_result = await self._scrape_post_page(url)
            if web_result:
                web_result["extraction_method"] = "web_scraping"
                return web_result

            return None

        except Exception as e:
            logger.error(f"Error in API fallback scraping for {url}: {e}")
            return None

    async def _extract_post_id_from_url(self, url: str) -> int | None:
        """Extract WordPress post ID from URL."""
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return None

                content = await response.text()
                soup = BeautifulSoup(content, "html.parser")

                # Look for post ID in various places
                post_id_selectors = [
                    'meta[name="post-id"]',
                    'meta[property="article:post_id"]',
                    "[data-post-id]",
                    ".post-id",
                    'meta[name="generator"][content*="WordPress"]',
                ]

                for selector in post_id_selectors:
                    element = soup.select_one(selector)
                    if element:
                        content_value = (
                            element.get("content")
                            or element.get("data-post-id")
                            or element.text
                        )
                        if content_value and content_value.isdigit():
                            return int(content_value)

                return None

        except Exception as e:
            logger.error(f"Error extracting post ID from URL {url}: {e}")
            return None

    async def _scrape_post_page(self, url: str) -> dict[str, Any] | None:
        """Scrape post details directly from the page."""
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return None

                content = await response.text()
                soup = BeautifulSoup(content, "html.parser")

                return {
                    "title": self._extract_title(soup),
                    "content": self._extract_content(soup),
                    "excerpt": self._extract_excerpt(soup),
                    "author": self._extract_author(soup),
                    "date": self._extract_date(soup),
                    "categories": self._extract_categories(soup),
                    "tags": self._extract_tags(soup),
                    "featured_image": self._extract_featured_image(soup),
                    "url": url,
                }

        except Exception as e:
            logger.error(f"Error scraping post page {url}: {e}")
            return None

    def _parse_api_post(self, post: dict[str, Any]) -> dict[str, Any]:
        """Parse WordPress API post into standardized format."""
        try:
            # Extract embedded data
            embedded = post.get("_embedded", {})
            featured_media = (
                embedded.get("wp:featuredmedia", [{}])[0]
                if embedded.get("wp:featuredmedia")
                else {}
            )

            return {
                "id": post.get("id"),
                "title": post.get("title", {}).get("rendered", ""),
                "content": post.get("content", {}).get("rendered", ""),
                "excerpt": post.get("excerpt", {}).get("rendered", ""),
                "author": self._extract_author_from_embedded(embedded),
                "date": post.get("date"),
                "modified": post.get("modified"),
                "categories": self._extract_categories_from_embedded(embedded),
                "tags": self._extract_tags_from_embedded(embedded),
                "featured_image": (
                    featured_media.get("source_url") if featured_media else None
                ),
                "url": post.get("link"),
                "slug": post.get("slug"),
                "status": post.get("status"),
                "post_type": post.get("type", "post"),
            }

        except Exception as e:
            logger.error(f"Error parsing API post: {e}")
            return {}

    async def _get_category_id(self, category_slug: str) -> int | None:
        """Get WordPress category ID from slug."""
        try:
            url = f"{self.api_base_url}/categories"
            params = {"slug": category_slug}

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None

                categories = await response.json()
                if categories:
                    return categories[0].get("id")

                return None

        except Exception as e:
            logger.error(f"Error getting category ID for {category_slug}: {e}")
            return None

    async def _get_tag_id(self, tag_slug: str) -> int | None:
        """Get WordPress tag ID from slug."""
        try:
            url = f"{self.api_base_url}/tags"
            params = {"slug": tag_slug}

            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None

                tags = await response.json()
                if tags:
                    return tags[0].get("id")

                return None

        except Exception as e:
            logger.error(f"Error getting tag ID for {tag_slug}: {e}")
            return None

    # HTML extraction methods (similar to ArsTechnicaScraper)
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract post title from BeautifulSoup object."""
        selectors = [
            "h1.entry-title",
            "h1.title",
            "h1",
            ".entry-title",
            ".title",
            "title",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)

        return ""

    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract post content from BeautifulSoup object."""
        selectors = [
            ".entry-content",
            ".post-content",
            ".article-content",
            ".content",
            "article",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)

        return ""

    def _extract_excerpt(self, soup: BeautifulSoup) -> str:
        """Extract post excerpt from BeautifulSoup object."""
        selectors = [
            ".entry-summary",
            ".excerpt",
            ".summary",
            "meta[name='description']",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == "meta":
                    return element.get("content", "")
                else:
                    return element.get_text(strip=True)

        return ""

    def _extract_author(self, soup: BeautifulSoup) -> str:
        """Extract post author from BeautifulSoup object."""
        selectors = [
            ".author",
            ".byline",
            "[rel='author']",
            ".entry-author",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text(strip=True)

        return ""

    def _extract_date(self, soup: BeautifulSoup) -> str:
        """Extract post date from BeautifulSoup object."""
        selectors = [
            "time",
            ".date",
            ".published",
            ".entry-date",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get("datetime") or element.get_text(strip=True)

        return ""

    def _extract_categories(self, soup: BeautifulSoup) -> list[str]:
        """Extract post categories from BeautifulSoup object."""
        categories = []
        selectors = [
            ".category a",
            ".categories a",
            ".entry-categories a",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                category = element.get_text(strip=True)
                if category:
                    categories.append(category)

        return categories

    def _extract_tags(self, soup: BeautifulSoup) -> list[str]:
        """Extract post tags from BeautifulSoup object."""
        tags = []
        selectors = [
            ".tags a",
            ".tag a",
            ".entry-tags a",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                tag = element.get_text(strip=True)
                if tag:
                    tags.append(tag)

        return tags

    def _extract_featured_image(self, soup: BeautifulSoup) -> str | None:
        """Extract featured image URL from BeautifulSoup object."""
        selectors = [
            ".featured-image img",
            ".entry-image img",
            ".post-image img",
            "meta[property='og:image']",
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == "meta":
                    return element.get("content")
                else:
                    return element.get("src")

        return None

    def _extract_author_from_embedded(self, embedded: dict[str, Any]) -> str:
        """Extract author from WordPress embedded data."""
        authors = embedded.get("author", [])
        if authors:
            return authors[0].get("name", "")
        return ""

    def _extract_categories_from_embedded(self, embedded: dict[str, Any]) -> list[str]:
        """Extract categories from WordPress embedded data."""
        categories = embedded.get("wp:term", [])
        result = []
        for category_group in categories:
            for category in category_group:
                if category.get("taxonomy") == "category":
                    result.append(category.get("name", ""))
        return result

    def _extract_tags_from_embedded(self, embedded: dict[str, Any]) -> list[str]:
        """Extract tags from WordPress embedded data."""
        tags = embedded.get("wp:term", [])
        result = []
        for tag_group in tags:
            for tag in tag_group:
                if tag.get("taxonomy") == "post_tag":
                    result.append(tag.get("name", ""))
        return result

    async def get_rate_limit_delay(self) -> float:
        """Get delay between requests for WordPress sites."""
        # Conservative rate limiting for WordPress sites
        return 1.5



