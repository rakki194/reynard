"""
Specialized HackerNews scraper for handling HackerNews content and API integration.
"""

import logging
from typing import Any

from ..models import ScrapingResult, ScrapingType
from .base_scraper import BaseScraper


class HackerNewsScraper(BaseScraper):
    """
    Specialized HackerNews scraper with API integration and web scraping fallback.

    Features:
    - HackerNews API integration for stories, comments, and users
    - Web scraping fallback for dynamic content
    - Comment thread extraction
    - User profile scraping
    - Story metadata extraction (points, comments, time)
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the HackerNews scraper."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.HACKERNEWS
        self.supported_domains = ["news.ycombinator.com", "hackernews.com"]
        self.api_base_url = "https://hacker-news.firebaseio.com/v0"

    async def can_handle_url(self, url: str) -> bool:
        """Check if this scraper can handle the given URL."""
        return any(domain in url.lower() for domain in self.supported_domains)

    async def scrape_content(self, url: str) -> ScrapingResult:
        """
        Scrape content from a HackerNews URL.

        Args:
            url: HackerNews URL to scrape

        Returns:
            ScrapingResult with extracted content
        """
        try:
            # Extract item ID from URL
            item_id = self._extract_item_id(url)

            if item_id:
                # Try API first
                content = await self._scrape_with_api(item_id)

                if content:
                    return self._create_result_from_api_content(url, content)

            # Fallback to web scraping
            return await self._scrape_with_web(url)

        except Exception as e:
            self.logger.error(f"Failed to scrape HackerNews content from {url}: {e}")
            return await self._fallback_scraping(url)

    def _extract_item_id(self, url: str) -> str | None:
        """Extract HackerNews item ID from URL."""
        try:
            if "item?id=" in url:
                return url.split("item?id=")[1].split("&")[0]
            elif "/item/" in url:
                return url.split("/item/")[1].split("?")[0]
            return None
        except Exception:
            return None

    async def _scrape_with_api(self, item_id: str) -> dict[str, Any] | None:
        """Scrape content using HackerNews API."""
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_base_url}/item/{item_id}.json") as response:
                    if response.status == 200:
                        data = await response.json()

                        if data and data.get("type"):
                            return {
                                "id": data.get("id"),
                                "type": data.get("type"),
                                "title": data.get("title", ""),
                                "text": data.get("text", ""),
                                "url": data.get("url", ""),
                                "score": data.get("score", 0),
                                "by": data.get("by", ""),
                                "time": data.get("time", 0),
                                "descendants": data.get("descendants", 0),
                                "kids": data.get("kids", []),
                                "parent": data.get("parent"),
                                "method": "api"
                            }

            return None

        except Exception as e:
            self.logger.error(f"HackerNews API scraping failed: {e}")
            return None

    def _create_result_from_api_content(self, url: str, content: dict[str, Any]) -> ScrapingResult:
        """Create ScrapingResult from API content."""
        # Determine content text
        if content.get("text"):
            content_text = content["text"]
        elif content.get("title"):
            content_text = content["title"]
        else:
            content_text = ""

        # Get comments if available
        comments = []
        if content.get("kids"):
            comments = content["kids"][:10]  # Limit to first 10 comments

        return ScrapingResult(
            url=url,
            title=content.get("title", "HackerNews Item"),
            content=content_text,
            metadata={
                "source": "hackernews",
                "extraction_method": "api",
                "item_id": content.get("id"),
                "item_type": content.get("type"),
                "author": content.get("by"),
                "score": content.get("score", 0),
                "comments_count": content.get("descendants", 0),
                "timestamp": content.get("time"),
                "original_url": content.get("url"),
                "comment_ids": comments,
                "parent_id": content.get("parent"),
            },
            quality={
                "score": self._calculate_hn_quality_score(content),
                "factors": {
                    "content_length": len(content_text),
                    "has_score": content.get("score", 0) > 0,
                    "has_comments": content.get("descendants", 0) > 0,
                    "has_author": bool(content.get("by")),
                    "extraction_method": "api",
                },
            },
        )

    async def _scrape_with_web(self, url: str) -> ScrapingResult:
        """Scrape content using web scraping."""
        try:
            response = await self._make_request(url)
            if not response:
                return await self._fallback_scraping(url)

            soup = self._parse_html(response.text)

            # Extract story information
            title_element = soup.find("a", {"class": "storylink"})
            title = title_element.get_text() if title_element else "HackerNews Story"

            # Extract story URL
            story_url = title_element.get("href") if title_element else ""

            # Extract metadata
            score_element = soup.find("span", {"class": "score"})
            score = 0
            if score_element:
                score_text = score_element.get_text()
                try:
                    score = int(score_text.split()[0])
                except (ValueError, IndexError):
                    pass

            # Extract author
            author_element = soup.find("a", {"class": "hnuser"})
            author = author_element.get_text() if author_element else ""

            # Extract time
            time_element = soup.find("span", {"class": "age"})
            time_text = time_element.get("title") if time_element else ""

            # Extract comments count
            comments_element = soup.find("a", href=lambda x: x and "item?id=" in x and "comments" in x)
            comments_count = 0
            if comments_element:
                comments_text = comments_element.get_text()
                try:
                    comments_count = int(comments_text.split()[0])
                except (ValueError, IndexError):
                    pass

            # Extract story text (for Ask HN, Show HN, etc.)
            story_text = ""
            story_div = soup.find("div", {"class": "comment"})
            if story_div:
                story_text = story_div.get_text(separator="\n", strip=True)

            return ScrapingResult(
                url=url,
                title=title,
                content=story_text or title,
                metadata={
                    "source": "hackernews",
                    "extraction_method": "web",
                    "story_url": story_url,
                    "author": author,
                    "score": score,
                    "comments_count": comments_count,
                    "time": time_text,
                },
                quality={
                    "score": self._calculate_web_quality_score(score, comments_count, story_text),
                    "factors": {
                        "content_length": len(story_text or title),
                        "has_score": score > 0,
                        "has_comments": comments_count > 0,
                        "has_author": bool(author),
                        "extraction_method": "web",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"HackerNews web scraping failed: {e}")
            return await self._fallback_scraping(url)

    def _calculate_hn_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for HackerNews API content."""
        score = 0.0

        # Base score for having content
        if content.get("title") or content.get("text"):
            score += 0.3

        # Score bonus
        hn_score = content.get("score", 0)
        if hn_score > 100:
            score += 0.3
        elif hn_score > 50:
            score += 0.2
        elif hn_score > 10:
            score += 0.1

        # Comments bonus
        comments = content.get("descendants", 0)
        if comments > 50:
            score += 0.2
        elif comments > 10:
            score += 0.15
        elif comments > 0:
            score += 0.1

        # Author bonus
        if content.get("by"):
            score += 0.1

        # Content length bonus
        content_text = content.get("text", "") or content.get("title", "")
        if len(content_text) > 500:
            score += 0.1
        elif len(content_text) > 100:
            score += 0.05

        return min(score, 1.0)

    def _calculate_web_quality_score(self, score: int, comments: int, content: str) -> float:
        """Calculate quality score for web scraped content."""
        quality_score = 0.0

        # Base score
        if content:
            quality_score += 0.3

        # Score bonus
        if score > 100:
            quality_score += 0.3
        elif score > 50:
            quality_score += 0.2
        elif score > 10:
            quality_score += 0.1

        # Comments bonus
        if comments > 50:
            quality_score += 0.2
        elif comments > 10:
            quality_score += 0.15
        elif comments > 0:
            quality_score += 0.1

        # Content length bonus
        if len(content) > 500:
            quality_score += 0.1
        elif len(content) > 100:
            quality_score += 0.05

        return min(quality_score, 1.0)

    async def _fallback_scraping(self, url: str) -> ScrapingResult:
        """Fallback scraping method."""
        try:
            response = await self._make_request(url)
            if not response:
                return ScrapingResult(
                    url=url,
                    title="HackerNews Item",
                    content="",
                    metadata={
                        "source": "hackernews",
                        "extraction_method": "failed",
                        "error": "Failed to fetch content",
                    },
                    quality={"score": 0.0, "factors": {}},
                )

            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "HackerNews Item"

            return ScrapingResult(
                url=url,
                title=title_text,
                content="",
                metadata={
                    "source": "hackernews",
                    "extraction_method": "fallback",
                    "limited_data": True,
                },
                quality={
                    "score": 0.2,
                    "factors": {
                        "extraction_method": "fallback",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Fallback scraping failed: {e}")
            return ScrapingResult(
                url=url,
                title="HackerNews Item",
                content="",
                metadata={
                    "source": "hackernews",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )

    async def get_top_stories(self, limit: int = 30) -> list[dict[str, Any]]:
        """
        Get top stories from HackerNews.

        Args:
            limit: Maximum number of stories to return

        Returns:
            List of story information dictionaries
        """
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                # Get top story IDs
                async with session.get(f"{self.api_base_url}/topstories.json") as response:
                    if response.status == 200:
                        story_ids = await response.json()

                        # Get story details
                        stories = []
                        for story_id in story_ids[:limit]:
                            async with session.get(f"{self.api_base_url}/item/{story_id}.json") as item_response:
                                if item_response.status == 200:
                                    story_data = await item_response.json()
                                    if story_data and story_data.get("type") == "story":
                                        stories.append({
                                            "id": story_data.get("id"),
                                            "title": story_data.get("title", ""),
                                            "url": story_data.get("url", ""),
                                            "score": story_data.get("score", 0),
                                            "by": story_data.get("by", ""),
                                            "time": story_data.get("time", 0),
                                            "descendants": story_data.get("descendants", 0),
                                        })

                        return stories

            return []

        except Exception as e:
            self.logger.error(f"Failed to get top stories: {e}")
            return []

    async def get_user_profile(self, username: str) -> dict[str, Any] | None:
        """
        Get user profile information.

        Args:
            username: HackerNews username

        Returns:
            User profile dictionary or None
        """
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_base_url}/user/{username}.json") as response:
                    if response.status == 200:
                        data = await response.json()

                        if data:
                            return {
                                "id": data.get("id"),
                                "created": data.get("created"),
                                "karma": data.get("karma", 0),
                                "about": data.get("about", ""),
                                "submitted": data.get("submitted", []),
                            }

            return None

        except Exception as e:
            self.logger.error(f"Failed to get user profile for {username}: {e}")
            return None

    async def get_comments(self, item_id: str, limit: int = 20) -> list[dict[str, Any]]:
        """
        Get comments for a story or comment.

        Args:
            item_id: HackerNews item ID
            limit: Maximum number of comments to return

        Returns:
            List of comment dictionaries
        """
        try:
            import aiohttp

            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_base_url}/item/{item_id}.json") as response:
                    if response.status == 200:
                        data = await response.json()

                        if data and data.get("kids"):
                            comments = []
                            for comment_id in data["kids"][:limit]:
                                async with session.get(f"{self.api_base_url}/item/{comment_id}.json") as comment_response:
                                    if comment_response.status == 200:
                                        comment_data = await comment_response.json()
                                        if comment_data and comment_data.get("type") == "comment":
                                            comments.append({
                                                "id": comment_data.get("id"),
                                                "text": comment_data.get("text", ""),
                                                "by": comment_data.get("by", ""),
                                                "time": comment_data.get("time", 0),
                                                "parent": comment_data.get("parent"),
                                                "kids": comment_data.get("kids", []),
                                            })

                            return comments

            return []

        except Exception as e:
            self.logger.error(f"Failed to get comments for {item_id}: {e}")
            return []
