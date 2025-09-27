"""Ars Technica Scraper for Reynard Backend

Specialized scraper for Ars Technica articles with WordPress API integration
and intelligent content extraction.
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


class ArsTechnicaScraper(BaseScraper):
    """Specialized scraper for Ars Technica articles.

    Features:
    - WordPress API integration for structured data
    - Homepage scraping fallback
    - Category filtering and search
    - Intelligent content extraction
    - Rate limiting and error handling
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the Ars Technica scraper."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.ARS_TECHNICA
        self.supported_domains = ["arstechnica.com"]
        self.name = "arstechnica_scraper"
        
        # Ars Technica specific URLs
        self.base_url = "https://arstechnica.com"
        self.api_base_url = "https://arstechnica.com/wp-json/wp/v2"
        
        # Session will be initialized in initialize()
        self.session: aiohttp.ClientSession | None = None

    async def initialize(self) -> bool:
        """Initialize the scraper with HTTP session."""
        try:
            # Create HTTP session with Ars Technica specific headers
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }

            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers,
                connector=aiohttp.TCPConnector(limit=10, limit_per_host=5),
            )

            logger.info("Ars Technica scraper initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Ars Technica scraper: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the scraper and close HTTP session."""
        try:
            if self.session:
                await self.session.close()
                self.session = None

            logger.info("Ars Technica scraper shutdown successfully")
            return True

        except Exception as e:
            logger.error(f"Error shutting down Ars Technica scraper: {e}")
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
        """Scrape content from an Ars Technica URL.

        Args:
            url: Ars Technica URL to scrape

        Returns:
            ScrapingResult with extracted content

        """
        if not self.session:
            raise RuntimeError("Scraper not initialized")

        try:
            # Validate URL
            if not await self.can_handle_url(url):
                raise ValueError(f"Invalid Ars Technica URL: {url}")

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
                    "source": "arstechnica",
                    "extraction_method": content_data.get("extraction_method", "unknown"),
                    "author": content_data.get("author", ""),
                    "date": content_data.get("date", ""),
                    "categories": content_data.get("categories", []),
                    "tags": content_data.get("tags", []),
                    "featured_image": content_data.get("featured_image"),
                    "excerpt": content_data.get("excerpt", ""),
                },
            )

            logger.info(f"Successfully scraped Ars Technica content from {url}")
            return result

        except Exception as e:
            logger.error(f"Error scraping Ars Technica content from {url}: {e}")
            raise

    async def get_latest_articles(
        self, 
        limit: int = 10, 
        category: str | None = None
    ) -> list[dict[str, Any]]:
        """Get latest articles from Ars Technica.

        Args:
            limit: Number of articles to fetch
            category: Optional category filter

        Returns:
            List of article dictionaries

        """
        try:
            # Try WordPress API first
            try:
                articles = await self._fetch_articles_from_api(limit, category)
                if articles:
                    logger.info(f"Fetched {len(articles)} articles from WordPress API")
                    return articles
            except Exception as api_error:
                logger.warning(f"WordPress API failed, falling back to homepage scraping: {api_error}")

            # Fallback to homepage scraping
            articles = await self._fetch_articles_from_homepage(limit)
            logger.info(f"Fetched {len(articles)} articles from homepage scraping")
            return articles

        except Exception as e:
            logger.error(f"Error fetching latest articles: {e}")
            return []

    async def search_articles(self, query: str, limit: int = 10) -> list[dict[str, Any]]:
        """Search articles on Ars Technica.

        Args:
            query: Search query
            limit: Number of articles to fetch

        Returns:
            List of matching article dictionaries

        """
        try:
            # Try WordPress API search first
            try:
                articles = await self._search_articles_from_api(query, limit)
                if articles:
                    logger.info(f"Found {len(articles)} articles matching '{query}' via API")
                    return articles
            except Exception as api_error:
                logger.warning(f"WordPress search API failed: {api_error}")

            # Fallback: get latest articles and filter by query
            all_articles = await self.get_latest_articles(limit * 3)
            filtered_articles = []

            query_lower = query.lower()
            for article in all_articles:
                title = article.get("title", "").lower()
                excerpt = article.get("excerpt", "").lower()

                if query_lower in title or query_lower in excerpt:
                    filtered_articles.append(article)
                    if len(filtered_articles) >= limit:
                        break

            logger.info(f"Found {len(filtered_articles)} articles matching '{query}' via filtering")
            return filtered_articles[:limit]

        except Exception as e:
            logger.error(f"Error searching articles: {e}")
            return []

    async def _scrape_with_api_fallback(self, url: str) -> dict[str, Any] | None:
        """Scrape content using API first, then fallback to web scraping."""
        try:
            # Try to extract post ID from URL and use API
            post_id = await self._extract_post_id_from_url(url)
            if post_id:
                api_result = await self._get_article_from_api(post_id)
                if api_result:
                    api_result["extraction_method"] = "wordpress_api"
                    return api_result

            # Fallback to direct web scraping
            web_result = await self._scrape_article_page(url)
            if web_result:
                web_result["extraction_method"] = "web_scraping"
                return web_result

            return None

        except Exception as e:
            logger.error(f"Error in API fallback scraping for {url}: {e}")
            return None

    async def _fetch_articles_from_api(
        self, 
        limit: int, 
        category: str | None = None
    ) -> list[dict[str, Any]]:
        """Fetch articles from WordPress API."""
        url = f"{self.api_base_url}/posts"
        params = {
            "per_page": min(limit, 100),  # WordPress API limit
            "orderby": "date",
            "order": "desc",
            "_embed": "1",  # Include featured images
        }

        if category:
            category_id = await self._get_category_id(category)
            if category_id:
                params["categories"] = category_id

        async with self.session.get(url, params=params) as response:
            if response.status != 200:
                raise ValueError(f"API request failed: {response.status}")

            articles = await response.json()
            return [self._parse_api_article(article) for article in articles]

    async def _fetch_articles_from_homepage(self, limit: int) -> list[dict[str, Any]]:
        """Fetch articles by scraping the homepage."""
        all_articles = []
        page = 1
        max_pages = max(1, (limit + 19) // 20)  # Assume ~20 articles per page

        while len(all_articles) < limit and page <= max_pages:
            try:
                if page == 1:
                    url = self.base_url
                else:
                    url = f"{self.base_url}/page/{page}/"

                async with self.session.get(url) as response:
                    if response.status != 200:
                        break

                    content = await response.text()
                    soup = BeautifulSoup(content, "html.parser")
                    page_articles = self._parse_homepage_articles(soup)

                    # Filter out duplicates
                    existing_urls = {article.get("url") for article in all_articles}
                    new_articles = []
                    for article in page_articles:
                        if article.get("url") not in existing_urls:
                            new_articles.append(article)
                            existing_urls.add(article.get("url"))

                    all_articles.extend(new_articles)

                    if not new_articles:
                        break

                    page += 1
                    await asyncio.sleep(1)  # Rate limiting

            except Exception as e:
                logger.warning(f"Failed to fetch page {page}: {e}")
                break

        return all_articles[:limit]

    async def _search_articles_from_api(self, query: str, limit: int) -> list[dict[str, Any]]:
        """Search articles using WordPress API."""
        url = f"{self.api_base_url}/posts"
        params = {
            "search": query,
            "per_page": min(limit, 100),
            "orderby": "relevance",
            "_embed": "1",
        }

        async with self.session.get(url, params=params) as response:
            if response.status != 200:
                raise ValueError(f"Search API request failed: {response.status}")

            articles = await response.json()
            return [self._parse_api_article(article) for article in articles]

    async def _get_article_from_api(self, post_id: int) -> dict[str, Any] | None:
        """Get article details from WordPress API."""
        url = f"{self.api_base_url}/posts/{post_id}"
        params = {"_embed": "1"}

        async with self.session.get(url, params=params) as response:
            if response.status != 200:
                return None

            article = await response.json()
            return self._parse_api_article(article)

    async def _extract_post_id_from_url(self, url: str) -> int | None:
        """Extract WordPress post ID from Ars Technica URL."""
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

    async def _scrape_article_page(self, url: str) -> dict[str, Any] | None:
        """Scrape article details directly from the page."""
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
            logger.error(f"Error scraping article page {url}: {e}")
            return None

    def _parse_api_article(self, article: dict[str, Any]) -> dict[str, Any]:
        """Parse WordPress API article into standardized format."""
        try:
            # Extract embedded data
            embedded = article.get("_embedded", {})
            featured_media = (
                embedded.get("wp:featuredmedia", [{}])[0]
                if embedded.get("wp:featuredmedia")
                else {}
            )

            return {
                "id": article.get("id"),
                "title": article.get("title", {}).get("rendered", ""),
                "content": article.get("content", {}).get("rendered", ""),
                "excerpt": article.get("excerpt", {}).get("rendered", ""),
                "author": self._extract_author_from_embedded(embedded),
                "date": article.get("date"),
                "modified": article.get("modified"),
                "categories": self._extract_categories_from_embedded(embedded),
                "tags": self._extract_tags_from_embedded(embedded),
                "featured_image": (
                    featured_media.get("source_url") if featured_media else None
                ),
                "url": article.get("link"),
                "slug": article.get("slug"),
                "status": article.get("status"),
            }

        except Exception as e:
            logger.error(f"Error parsing API article: {e}")
            return {}

    def _parse_homepage_articles(self, soup: BeautifulSoup) -> list[dict[str, Any]]:
        """Parse articles from the homepage."""
        articles = []

        try:
            # Look for article containers
            article_selectors = [
                "article",
                ".post",
                ".article",
                ".story",
                "[data-post-id]",
            ]

            for selector in article_selectors:
                elements = soup.select(selector)
                if elements:
                    for element in elements:
                        article = self._parse_homepage_article(element)
                        if article:
                            articles.append(article)
                    break

            return articles

        except Exception as e:
            logger.error(f"Error parsing homepage articles: {e}")
            return []

    def _parse_homepage_article(self, element) -> dict[str, Any] | None:
        """Parse a single article from the homepage."""
        try:
            # Extract title
            title_elem = element.select_one("h1, h2, h3, .title, .headline")
            title = title_elem.get_text(strip=True) if title_elem else ""

            # Extract link
            link_elem = element.select_one("a[href]")
            link = link_elem.get("href") if link_elem else ""
            if link and not link.startswith("http"):
                link = urljoin(self.base_url, link)

            # Extract excerpt
            excerpt_elem = element.select_one(".excerpt, .summary, p")
            excerpt = excerpt_elem.get_text(strip=True) if excerpt_elem else ""

            # Extract author
            author_elem = element.select_one(".author, .byline, [rel='author']")
            author = author_elem.get_text(strip=True) if author_elem else ""

            # Extract date
            date_elem = element.select_one(".date, time, .published")
            date = (
                date_elem.get("datetime") or date_elem.get_text(strip=True)
                if date_elem
                else ""
            )

            if title and link:
                return {
                    "title": title,
                    "url": link,
                    "excerpt": excerpt,
                    "author": author,
                    "date": date,
                }

            return None

        except Exception as e:
            logger.error(f"Error parsing homepage article: {e}")
            return None

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

    # HTML extraction methods
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract article title from BeautifulSoup object."""
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
        """Extract article content from BeautifulSoup object."""
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
        """Extract article excerpt from BeautifulSoup object."""
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
        """Extract article author from BeautifulSoup object."""
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
        """Extract article date from BeautifulSoup object."""
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
        """Extract article categories from BeautifulSoup object."""
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
        """Extract article tags from BeautifulSoup object."""
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
        """Get delay between requests for Ars Technica."""
        # Conservative rate limiting for Ars Technica
        return 2.0

