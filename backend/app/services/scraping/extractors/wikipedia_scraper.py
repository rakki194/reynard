"""
Specialized Wikipedia scraper with optimized content extraction and filtering.
"""

import logging
import re
from typing import Any

from ..models import ScrapingResult, ScrapingType
from .base_scraper import BaseScraper


class WikipediaScraper(BaseScraper):
    """
    Specialized Wikipedia scraper with optimized content extraction and filtering.

    Features:
    - Wikipedia API integration
    - Content cleaning and normalization
    - Quality scoring for Wikipedia articles
    - Category and template processing
    - Reference extraction
    - Multi-language support
    """

    def __init__(self, logger: logging.Logger | None = None, language: str = "en"):
        """Initialize the Wikipedia scraper."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.WIKIPEDIA
        self.supported_domains = ["wikipedia.org", "wikimedia.org"]
        self.language = language
        self.api_base_url = f"https://{language}.wikipedia.org/w/api.php"

        # Wikipedia-specific patterns
        self.template_pattern = re.compile(r"\{\{[^}]*\}\}")
        self.category_pattern = re.compile(r"\[\[Category:[^\]]*\]\]")
        self.reference_pattern = re.compile(r"<ref[^>]*>.*?</ref>", re.DOTALL)
        self.external_link_pattern = re.compile(r"\[https?://[^\s\]]+\s[^\]]*\]")
        self.internal_link_pattern = re.compile(r"\[\[([^|\]]+)(?:\|[^\]]+)?\]\]")

    async def can_handle_url(self, url: str) -> bool:
        """Check if this scraper can handle the given URL."""
        return any(domain in url.lower() for domain in self.supported_domains)

    async def scrape_content(self, url: str) -> ScrapingResult:
        """
        Scrape content from a Wikipedia URL.

        Args:
            url: Wikipedia URL to scrape

        Returns:
            ScrapingResult with extracted content
        """
        try:
            # Extract page title from URL
            page_title = self._extract_page_title(url)
            if not page_title:
                return await self._fallback_scraping(url)

            # Try API first
            content = await self._scrape_with_api(page_title)

            if not content:
                # Fallback to web scraping
                content = await self._scrape_with_web(url)

            if not content:
                return await self._fallback_scraping(url)

            # Clean and process content
            cleaned_content = self._clean_wikipedia_content(content.get("text", ""))

            return ScrapingResult(
                url=url,
                title=content.get("title", page_title),
                content=cleaned_content,
                metadata={
                    "source": "wikipedia",
                    "extraction_method": content.get("method", "api"),
                    "page_id": content.get("page_id"),
                    "revision_id": content.get("revision_id"),
                    "language": self.language,
                    "categories": content.get("categories", []),
                    "references": content.get("references", []),
                    "external_links": content.get("external_links", []),
                    "internal_links": content.get("internal_links", []),
                    "word_count": len(cleaned_content.split()),
                    "last_modified": content.get("last_modified"),
                    "page_length": content.get("page_length", 0),
                },
                quality={
                    "score": self._calculate_wikipedia_quality_score(
                        content, cleaned_content
                    ),
                    "factors": {
                        "content_length": len(cleaned_content),
                        "has_references": len(content.get("references", [])) > 0,
                        "has_categories": len(content.get("categories", [])) > 0,
                        "page_length": content.get("page_length", 0),
                        "completeness": self._calculate_completeness_score(content),
                        "readability": self._calculate_readability_score(
                            cleaned_content
                        ),
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Failed to scrape Wikipedia content from {url}: {e}")
            return await self._fallback_scraping(url)

    def _extract_page_title(self, url: str) -> str | None:
        """Extract page title from Wikipedia URL."""
        try:
            # Handle different Wikipedia URL formats
            if "/wiki/" in url:
                title = url.split("/wiki/")[-1]
                # URL decode
                import urllib.parse

                title = urllib.parse.unquote(title)
                return title
            return None
        except Exception:
            return None

    async def _scrape_with_api(self, page_title: str) -> dict[str, Any] | None:
        """Scrape content using Wikipedia API."""
        try:
            import aiohttp

            params = {
                "action": "query",
                "format": "json",
                "titles": page_title,
                "prop": "extracts|info|categories|links|extlinks",
                "exintro": False,
                "explaintext": True,
                "inprop": "url|timestamp|length",
                "cllimit": 50,
                "lllimit": 50,
                "ellimit": 50,
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.api_base_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()

                        pages = data.get("query", {}).get("pages", {})
                        if not pages:
                            return None

                        page_data = list(pages.values())[0]
                        if "missing" in page_data:
                            return None

                        # Extract content
                        content = {
                            "title": page_data.get("title", page_title),
                            "text": page_data.get("extract", ""),
                            "page_id": page_data.get("pageid"),
                            "revision_id": page_data.get("lastrevid"),
                            "last_modified": page_data.get("touched"),
                            "page_length": page_data.get("length", 0),
                            "method": "api",
                        }

                        # Extract categories
                        categories = page_data.get("categories", [])
                        content["categories"] = [
                            cat["title"].replace("Category:", "") for cat in categories
                        ]

                        # Extract internal links
                        links = page_data.get("links", [])
                        content["internal_links"] = [link["title"] for link in links]

                        # Extract external links
                        extlinks = page_data.get("extlinks", [])
                        content["external_links"] = [link["*"] for link in extlinks]

                        return content

        except Exception as e:
            self.logger.error(f"Wikipedia API scraping failed: {e}")
            return None

    async def _scrape_with_web(self, url: str) -> dict[str, Any] | None:
        """Scrape content using web scraping as fallback."""
        try:
            response = await self._make_request(url)
            if not response:
                return None

            soup = self._parse_html(response.text)

            # Extract title
            title_element = soup.find("h1", {"class": "firstHeading"})
            title = title_element.get_text() if title_element else "Wikipedia Article"

            # Extract main content
            content_div = soup.find("div", {"id": "mw-content-text"})
            if not content_div:
                return None

            # Remove unwanted elements
            for element in content_div.find_all(
                ["div", "span"], class_=re.compile(r"navbox|infobox|sidebar|ambox")
            ):
                element.decompose()

            # Extract text content
            text_content = content_div.get_text(separator="\n", strip=True)

            # Extract categories
            categories = []
            cat_links = soup.find_all("a", href=re.compile(r"/wiki/Category:"))
            for link in cat_links:
                cat_name = link.get_text()
                if cat_name and cat_name not in categories:
                    categories.append(cat_name)

            # Extract references
            references = []
            ref_elements = soup.find_all("span", {"class": "reference"})
            for ref in ref_elements:
                ref_text = ref.get_text(strip=True)
                if ref_text:
                    references.append(ref_text)

            # Extract external links
            external_links = []
            ext_links = soup.find_all("a", {"class": "external"})
            for link in ext_links:
                href = link.get("href")
                if href and href.startswith("http"):
                    external_links.append(href)

            return {
                "title": title,
                "text": text_content,
                "categories": categories,
                "references": references,
                "external_links": external_links,
                "method": "web",
            }

        except Exception as e:
            self.logger.error(f"Wikipedia web scraping failed: {e}")
            return None

    def _clean_wikipedia_content(self, content: str) -> str:
        """Clean Wikipedia content by removing templates, categories, and formatting."""
        # Remove templates
        content = self.template_pattern.sub("", content)

        # Remove categories
        content = self.category_pattern.sub("", content)

        # Remove references
        content = self.reference_pattern.sub("", content)

        # Clean up external links
        content = self.external_link_pattern.sub("", content)

        # Convert internal links to plain text
        content = self.internal_link_pattern.sub(r"\1", content)

        # Remove multiple whitespace
        content = re.sub(r"\s+", " ", content)

        # Remove leading/trailing whitespace
        content = content.strip()

        return content

    def _calculate_wikipedia_quality_score(
        self, content: dict[str, Any], cleaned_text: str
    ) -> float:
        """Calculate quality score for Wikipedia content."""
        score = 0.0

        # Base score for having content
        if cleaned_text:
            score += 0.2

        # Length-based scoring
        word_count = len(cleaned_text.split())
        if word_count > 1000:
            score += 0.3
        elif word_count > 500:
            score += 0.2
        elif word_count > 100:
            score += 0.1

        # References bonus
        if content.get("references"):
            ref_count = len(content["references"])
            if ref_count > 10:
                score += 0.2
            elif ref_count > 5:
                score += 0.15
            elif ref_count > 0:
                score += 0.1

        # Categories bonus
        if content.get("categories"):
            cat_count = len(content["categories"])
            if cat_count > 5:
                score += 0.1
            elif cat_count > 0:
                score += 0.05

        # External links bonus
        if content.get("external_links"):
            score += 0.05

        # Page length bonus (for API method)
        if content.get("page_length", 0) > 10000:
            score += 0.1
        elif content.get("page_length", 0) > 5000:
            score += 0.05

        return min(score, 1.0)

    def _calculate_completeness_score(self, content: dict[str, Any]) -> float:
        """Calculate completeness score based on available metadata."""
        score = 0.0

        if content.get("text"):
            score += 0.4
        if content.get("title"):
            score += 0.2
        if content.get("categories"):
            score += 0.2
        if content.get("references"):
            score += 0.1
        if content.get("external_links"):
            score += 0.05
        if content.get("internal_links"):
            score += 0.05

        return score

    def _calculate_readability_score(self, text: str) -> float:
        """Calculate basic readability score."""
        if not text:
            return 0.0

        words = text.split()
        sentences = re.split(r"[.!?]+", text)

        if len(sentences) == 0 or len(words) == 0:
            return 0.0

        # Average words per sentence
        avg_words_per_sentence = len(words) / len(sentences)

        # Average characters per word
        avg_chars_per_word = sum(len(word) for word in words) / len(words)

        # Simple readability score (lower is better)
        readability = (
            (avg_words_per_sentence * 0.39) + (avg_chars_per_word * 11.8) - 15.59
        )

        # Convert to 0-1 scale (inverted)
        if readability < 30:
            return 1.0  # Very easy
        if readability < 50:
            return 0.8  # Easy
        if readability < 60:
            return 0.6  # Standard
        if readability < 70:
            return 0.4  # Fairly difficult
        if readability < 80:
            return 0.2  # Difficult
        return 0.0  # Very difficult

    async def _fallback_scraping(self, url: str) -> ScrapingResult:
        """Fallback scraping method."""
        try:
            response = await self._make_request(url)
            if not response:
                return ScrapingResult(
                    url=url,
                    title="Wikipedia Article",
                    content="",
                    metadata={
                        "source": "wikipedia",
                        "extraction_method": "failed",
                        "error": "Failed to fetch content",
                    },
                    quality={"score": 0.0, "factors": {}},
                )

            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "Wikipedia Article"

            # Try to extract some content
            content_div = soup.find("div", {"id": "mw-content-text"})
            content_text = (
                content_div.get_text(separator="\n", strip=True) if content_div else ""
            )

            return ScrapingResult(
                url=url,
                title=title_text,
                content=content_text[:1000] + "..."
                if len(content_text) > 1000
                else content_text,
                metadata={
                    "source": "wikipedia",
                    "extraction_method": "fallback",
                    "limited_data": True,
                },
                quality={
                    "score": 0.3,
                    "factors": {
                        "content_length": len(content_text),
                        "extraction_method": "fallback",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Fallback scraping failed: {e}")
            return ScrapingResult(
                url=url,
                title="Wikipedia Article",
                content="",
                metadata={
                    "source": "wikipedia",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )

    async def search_articles(
        self, query: str, limit: int = 10
    ) -> list[dict[str, Any]]:
        """
        Search for Wikipedia articles.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of article information dictionaries
        """
        try:
            import aiohttp

            params = {
                "action": "query",
                "format": "json",
                "list": "search",
                "srsearch": query,
                "srlimit": limit,
                "srprop": "size|timestamp|snippet",
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.api_base_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        search_results = data.get("query", {}).get("search", [])

                        return [
                            {
                                "title": result["title"],
                                "snippet": result.get("snippet", ""),
                                "size": result.get("size", 0),
                                "timestamp": result.get("timestamp", ""),
                                "url": f"https://{self.language}.wikipedia.org/wiki/{result['title'].replace(' ', '_')}",
                            }
                            for result in search_results
                        ]

            return []

        except Exception as e:
            self.logger.error(f"Wikipedia search failed: {e}")
            return []

    async def get_random_article(self) -> dict[str, Any] | None:
        """Get a random Wikipedia article."""
        try:
            import aiohttp

            params = {
                "action": "query",
                "format": "json",
                "list": "random",
                "rnnamespace": 0,
                "rnlimit": 1,
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.api_base_url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        random_results = data.get("query", {}).get("random", [])

                        if random_results:
                            result = random_results[0]
                            return {
                                "title": result["title"],
                                "url": f"https://{self.language}.wikipedia.org/wiki/{result['title'].replace(' ', '_')}",
                            }

            return None

        except Exception as e:
            self.logger.error(f"Failed to get random Wikipedia article: {e}")
            return None
