"""Specialized Twitter/X scraper for handling Twitter's dynamic content and rate limiting."""

import logging
import os
from typing import Any

from ..models import ScrapingResult, ScrapingType
from .base_scraper import BaseScraper


class TwitterScraper(BaseScraper):
    """Specialized Twitter/X scraper for handling Twitter's dynamic content.

    Features:
    - Dynamic content extraction using Playwright
    - Tweet metadata extraction (likes, retweets, replies, timestamps)
    - Media detection and gallery-dl integration
    - Retweet handling
    - Timeline scraping with pagination
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the Twitter scraper."""
        super().__init__(logger)
        self.scraper_type = ScrapingType.TWITTER
        self.supported_domains = ["twitter.com", "x.com"]
        self.name = "twitter_scraper"
        self.playwright_available = self._check_playwright_available()
        self.gallery_dl_available = self._check_gallery_dl_available()

    def _check_playwright_available(self) -> bool:
        """Check if Playwright is available."""
        try:
            import playwright

            return True
        except ImportError:
            self.logger.warning(
                "Playwright not available. Install with: pip install playwright && playwright install chromium",
            )
            return False

    def _check_gallery_dl_available(self) -> bool:
        """Check if gallery-dl is available."""
        try:
            import gallery_dl

            self.logger.info(f"gallery-dl library available: {gallery_dl.__version__}")
            return True
        except ImportError:
            self.logger.warning(
                "gallery-dl library not found. Install with: pip install gallery-dl",
            )
            return False

    async def can_handle_url(self, url: str) -> bool:
        """Check if this scraper can handle the given URL."""
        return any(domain in url.lower() for domain in self.supported_domains)

    async def scrape_content(self, url: str) -> ScrapingResult:
        """Scrape content from a Twitter URL.

        Args:
            url: Twitter URL to scrape

        Returns:
            ScrapingResult with extracted content

        """
        try:
            if not self.playwright_available:
                return await self._fallback_scraping(url)

            # Use Playwright for dynamic content
            content = await self._scrape_with_playwright(url)

            if not content:
                # Fallback to basic scraping
                return await self._fallback_scraping(url)

            return ScrapingResult(
                url=url,
                title=content.get("title", ""),
                content=content.get("text", ""),
                metadata={
                    "source": "twitter",
                    "extraction_method": "playwright",
                    "tweet_id": content.get("tweet_id"),
                    "author": content.get("author"),
                    "timestamp": content.get("timestamp"),
                    "likes": content.get("likes", 0),
                    "retweets": content.get("retweets", 0),
                    "replies": content.get("replies", 0),
                    "has_media": content.get("has_media", False),
                    "media_urls": content.get("media_urls", []),
                    "is_retweet": content.get("is_retweet", False),
                    "retweet_author": content.get("retweet_author"),
                },
                quality={
                    "score": self._calculate_quality_score(content),
                    "factors": {
                        "content_length": len(content.get("text", "")),
                        "has_media": content.get("has_media", False),
                        "engagement": self._calculate_engagement_score(content),
                        "completeness": self._calculate_completeness_score(content),
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Failed to scrape Twitter content from {url}: {e}")
            return await self._fallback_scraping(url)

    async def _scrape_with_playwright(self, url: str) -> dict[str, Any] | None:
        """Scrape content using Playwright."""
        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                )
                page = await context.new_page()

                # Navigate to the URL
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Wait for content to load
                await page.wait_for_timeout(3000)

                # Extract tweet content
                content = await page.evaluate(
                    """
                    () => {
                        const result = {};

                        // Extract tweet text
                        const tweetText = document.querySelector('[data-testid="tweetText"]');
                        if (tweetText) {
                            result.text = tweetText.innerText;
                        }

                        // Extract author
                        const author = document.querySelector('[data-testid="User-Name"]');
                        if (author) {
                            result.author = author.innerText;
                        }

                        // Extract timestamp
                        const time = document.querySelector('time');
                        if (time) {
                            result.timestamp = time.getAttribute('datetime');
                        }

                        // Extract engagement metrics
                        const likeButton = document.querySelector('[data-testid="like"]');
                        if (likeButton) {
                            const likeText = likeButton.querySelector('[role="button"]');
                            if (likeText) {
                                result.likes = parseInt(likeText.innerText.replace(/[^0-9]/g, '')) || 0;
                            }
                        }

                        const retweetButton = document.querySelector('[data-testid="retweet"]');
                        if (retweetButton) {
                            const retweetText = retweetButton.querySelector('[role="button"]');
                            if (retweetText) {
                                result.retweets = parseInt(retweetText.innerText.replace(/[^0-9]/g, '')) || 0;
                            }
                        }

                        const replyButton = document.querySelector('[data-testid="reply"]');
                        if (replyButton) {
                            const replyText = replyButton.querySelector('[role="button"]');
                            if (replyText) {
                                result.replies = parseInt(replyText.innerText.replace(/[^0-9]/g, '')) || 0;
                            }
                        }

                        // Check for media
                        const mediaContainer = document.querySelector('[data-testid="tweetPhoto"]');
                        if (mediaContainer) {
                            result.has_media = true;
                            const images = mediaContainer.querySelectorAll('img');
                            result.media_urls = Array.from(images).map(img => img.src);
                        }

                        // Check if it's a retweet
                        const retweetIndicator = document.querySelector('[data-testid="socialContext"]');
                        if (retweetIndicator) {
                            result.is_retweet = true;
                            result.retweet_author = retweetIndicator.innerText;
                        }

                        // Extract tweet ID from URL
                        const urlParts = window.location.pathname.split('/');
                        if (urlParts.length >= 4) {
                            result.tweet_id = urlParts[3];
                        }

                        result.title = result.text ? result.text[:100] + "..." : "Twitter Post";

                        return result;
                    }
                """,
                )

                await browser.close()
                return content

        except Exception as e:
            self.logger.error(f"Playwright scraping failed: {e}")
            return None

    async def _fallback_scraping(self, url: str) -> ScrapingResult:
        """Fallback scraping method when Playwright is not available."""
        try:
            response = await self._make_request(url)
            if not response:
                return ScrapingResult(
                    url=url,
                    title="Twitter Post",
                    content="",
                    metadata={
                        "source": "twitter",
                        "extraction_method": "fallback",
                        "error": "Failed to fetch content",
                    },
                    quality={"score": 0.0, "factors": {}},
                )

            # Basic content extraction
            soup = self._parse_html(response.text)

            # Extract basic information
            title = soup.find("title")
            title_text = title.get_text() if title else "Twitter Post"

            # Try to extract tweet text from meta tags
            tweet_text = ""
            meta_description = soup.find("meta", {"name": "description"})
            if meta_description:
                tweet_text = meta_description.get("content", "")

            return ScrapingResult(
                url=url,
                title=title_text,
                content=tweet_text,
                metadata={
                    "source": "twitter",
                    "extraction_method": "fallback",
                    "limited_data": True,
                },
                quality={
                    "score": 0.3,  # Lower score for fallback method
                    "factors": {
                        "content_length": len(tweet_text),
                        "extraction_method": "fallback",
                    },
                },
            )

        except Exception as e:
            self.logger.error(f"Fallback scraping failed: {e}")
            return ScrapingResult(
                url=url,
                title="Twitter Post",
                content="",
                metadata={
                    "source": "twitter",
                    "extraction_method": "failed",
                    "error": str(e),
                },
                quality={"score": 0.0, "factors": {}},
            )

    async def scrape_user_timeline(
        self,
        username: str,
        limit: int = 20,
    ) -> list[ScrapingResult]:
        """Scrape a user's timeline.

        Args:
            username: Twitter username (without @)
            limit: Maximum number of tweets to scrape

        Returns:
            List of ScrapingResult objects

        """
        if not self.playwright_available:
            self.logger.warning("Playwright not available for timeline scraping")
            return []

        try:
            from playwright.async_api import async_playwright

            url = f"https://twitter.com/{username}"
            results = []

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                )
                page = await context.new_page()

                await page.goto(url, wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(3000)

                # Scroll and collect tweets
                tweets_collected = 0
                while tweets_collected < limit:
                    # Extract tweets from current view
                    tweets = await page.evaluate(
                        """
                        () => {
                            const tweets = [];
                            const tweetElements = document.querySelectorAll('[data-testid="tweet"]');

                            tweetElements.forEach(tweet => {
                                const textElement = tweet.querySelector('[data-testid="tweetText"]');
                                const authorElement = tweet.querySelector('[data-testid="User-Name"]');
                                const timeElement = tweet.querySelector('time');

                                if (textElement) {
                                    tweets.push({
                                        text: textElement.innerText,
                                        author: authorElement ? authorElement.innerText : '',
                                        timestamp: timeElement ? timeElement.getAttribute('datetime') : '',
                                        url: window.location.href
                                    });
                                }
                            });

                            return tweets;
                        }
                    """,
                    )

                    for tweet in tweets:
                        if tweets_collected >= limit:
                            break

                        result = ScrapingResult(
                            url=url,
                            title=(
                                tweet["text"][:100] + "..."
                                if len(tweet["text"]) > 100
                                else tweet["text"]
                            ),
                            content=tweet["text"],
                            metadata={
                                "source": "twitter",
                                "extraction_method": "timeline",
                                "author": tweet["author"],
                                "timestamp": tweet["timestamp"],
                                "username": username,
                            },
                            quality={
                                "score": 0.7,
                                "factors": {
                                    "content_length": len(tweet["text"]),
                                    "extraction_method": "timeline",
                                },
                            },
                        )
                        results.append(result)
                        tweets_collected += 1

                    # Scroll down to load more tweets
                    await page.evaluate(
                        "window.scrollTo(0, document.body.scrollHeight)",
                    )
                    await page.wait_for_timeout(2000)

                await browser.close()

            return results

        except Exception as e:
            self.logger.error(f"Failed to scrape timeline for {username}: {e}")
            return []

    def _calculate_quality_score(self, content: dict[str, Any]) -> float:
        """Calculate quality score for Twitter content."""
        score = 0.0

        # Base score for having content
        if content.get("text"):
            score += 0.3

        # Bonus for engagement metrics
        if content.get("likes", 0) > 0:
            score += 0.2
        if content.get("retweets", 0) > 0:
            score += 0.2
        if content.get("replies", 0) > 0:
            score += 0.1

        # Bonus for media
        if content.get("has_media"):
            score += 0.1

        # Bonus for complete metadata
        if content.get("author") and content.get("timestamp"):
            score += 0.1

        return min(score, 1.0)

    def _calculate_engagement_score(self, content: dict[str, Any]) -> float:
        """Calculate engagement score based on likes, retweets, and replies."""
        likes = content.get("likes", 0)
        retweets = content.get("retweets", 0)
        replies = content.get("replies", 0)

        total_engagement = likes + retweets + replies

        if total_engagement == 0:
            return 0.0
        if total_engagement < 10:
            return 0.3
        if total_engagement < 100:
            return 0.6
        if total_engagement < 1000:
            return 0.8
        return 1.0

    def _calculate_completeness_score(self, content: dict[str, Any]) -> float:
        """Calculate completeness score based on available metadata."""
        score = 0.0

        if content.get("text"):
            score += 0.4
        if content.get("author"):
            score += 0.2
        if content.get("timestamp"):
            score += 0.2
        if content.get("tweet_id"):
            score += 0.1
        if content.get("likes") is not None:
            score += 0.05
        if content.get("retweets") is not None:
            score += 0.05

        return score

    async def download_media(
        self,
        url: str,
        output_dir: str = "downloads",
    ) -> list[str]:
        """Download media from a Twitter URL using gallery-dl.

        Args:
            url: Twitter URL with media
            output_dir: Directory to save media files

        Returns:
            List of downloaded file paths

        """
        if not self.gallery_dl_available:
            self.logger.warning("gallery-dl not available for media download")
            return []

        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)

            # Import gallery-dl library
            from gallery_dl import config, job

            # Configure gallery-dl
            config.set((), "base-directory", output_dir)
            config.set((), "skip", True)  # Skip existing files
            config.set((), "retries", 3)
            config.set((), "timeout", 30)

            # Create download job
            download_job = job.DownloadJob(url)
            downloaded_files = []

            # Execute download
            for msg in download_job.run():
                if msg[0] == job.Message.Url:
                    # File download message
                    file_info = msg[1]
                    filename = file_info.get("filename", "")
                    if filename:
                        filepath = os.path.join(output_dir, filename)
                        if os.path.exists(filepath):
                            downloaded_files.append(filepath)

            self.logger.info(
                f"Downloaded {len(downloaded_files)} media files from {url}",
            )
            return downloaded_files

        except Exception as e:
            self.logger.error(f"Media download failed: {e}")
            return []
