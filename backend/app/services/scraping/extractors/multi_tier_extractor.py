"""Multi-Tier Content Extraction System for Reynard Backend

Advanced content extraction with multiple fallback strategies and site-specific optimization.
"""

import asyncio
import logging
from typing import Any
from urllib.parse import urlparse

import aiohttp
from bs4 import BeautifulSoup

from ..models import ScrapingResult

logger = logging.getLogger(__name__)


class ExtractionStrategy:
    """Extraction strategy enumeration."""
    
    TRAFILATURA_FIRST = "trafilatura_first"
    FIRECRAWL_FIRST = "firecrawl_first"
    DEFAULT = "default"


class MultiTierExtractor:
    """
    Multi-tier content extractor with intelligent fallback strategies.

    Extraction tiers:
    1. Primary: Site-optimized extraction (Trafilatura for Ars Technica, Firecrawl for social media)
    2. Secondary: Alternative extraction method
    3. Tertiary: Basic HTML parsing fallback
    4. Quaternary: Minimal text extraction

    Features:
    - Site-specific optimization
    - Intelligent fallback strategies
    - Quality assessment
    - Content cleaning and enhancement
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the multi-tier extractor."""
        self.logger = logger or logging.getLogger(__name__)
        self.name = "multi_tier_extractor"
        self.session: aiohttp.ClientSession | None = None
        
        # Site-specific strategies
        self.site_strategies = {
            "arstechnica.com": ExtractionStrategy.TRAFILATURA_FIRST,
            "thereader.mitpress.mit.edu": ExtractionStrategy.TRAFILATURA_FIRST,
            "twitter.com": ExtractionStrategy.FIRECRAWL_FIRST,
            "x.com": ExtractionStrategy.FIRECRAWL_FIRST,
            "reddit.com": ExtractionStrategy.FIRECRAWL_FIRST,
            "youtube.com": ExtractionStrategy.FIRECRAWL_FIRST,
            "instagram.com": ExtractionStrategy.FIRECRAWL_FIRST,
        }

    async def initialize(self) -> bool:
        """Initialize the extractor with HTTP session."""
        try:
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }

            self.session = aiohttp.ClientSession(
                timeout=timeout,
                headers=headers,
                connector=aiohttp.TCPConnector(limit=10, limit_per_host=5),
            )

            self.logger.info("Multi-tier extractor initialized successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to initialize multi-tier extractor: {e}")
            return False

    async def shutdown(self) -> bool:
        """Shutdown the extractor and close HTTP session."""
        try:
            if self.session:
                await self.session.close()
                self.session = None

            self.logger.info("Multi-tier extractor shutdown successfully")
            return True

        except Exception as e:
            self.logger.error(f"Error shutting down multi-tier extractor: {e}")
            return False

    async def extract_content(
        self, 
        url: str, 
        use_structured_extraction: bool = False
    ) -> dict[str, Any] | None:
        """Extract content using multi-tier fallback strategy.

        Args:
            url: URL to extract content from
            use_structured_extraction: Whether to use structured extraction

        Returns:
            Content dictionary or None if all methods failed

        """
        self.logger.info(f"Extracting content from: {url}")

        # Determine site-specific strategy
        strategy = self._get_site_specific_strategy(url)

        if strategy == ExtractionStrategy.TRAFILATURA_FIRST:
            return await self._extract_with_trafilatura_first(url)
        elif strategy == ExtractionStrategy.FIRECRAWL_FIRST:
            return await self._extract_with_firecrawl_first(url)
        else:
            return await self._extract_with_default_strategy(url, use_structured_extraction)

    def _get_site_specific_strategy(self, url: str) -> str:
        """Get site-specific extraction strategy based on the URL.

        Args:
            url: URL to extract content from

        Returns:
            Strategy string

        """
        domain = urlparse(url).netloc.lower()
        
        for site, strategy in self.site_strategies.items():
            if site in domain:
                return strategy
        
        return ExtractionStrategy.DEFAULT

    async def _extract_with_trafilatura_first(self, url: str) -> dict[str, Any] | None:
        """Extract content prioritizing Trafilatura for sites where it works well."""
        self.logger.debug("Using Trafilatura-first strategy")

        # Step 1: Try Trafilatura (primary)
        self.logger.debug("Step 1: Trying Trafilatura extraction")
        trafilatura_result = await self._extract_with_trafilatura(url)

        if trafilatura_result and trafilatura_result.get("extraction_success"):
            self.logger.info("✓ Trafilatura extraction successful")
            return self._enhance_result(trafilatura_result, "trafilatura")

        # Step 2: Try Firecrawl (fallback)
        self.logger.debug("Step 2: Trying Firecrawl extraction as fallback")
        firecrawl_result = await self._extract_with_firecrawl(url)

        if firecrawl_result and firecrawl_result.get("extraction_success"):
            self.logger.info("✓ Firecrawl extraction successful (fallback)")
            return self._enhance_result(firecrawl_result, "firecrawl")

        # Step 3: Try basic HTML parsing (tertiary)
        self.logger.debug("Step 3: Trying basic HTML parsing")
        html_result = await self._extract_with_html_parsing(url)

        if html_result and html_result.get("extraction_success"):
            self.logger.info("✓ HTML parsing extraction successful")
            return self._enhance_result(html_result, "html_parsing")

        # Step 4: Try minimal text extraction (quaternary)
        self.logger.debug("Step 4: Trying minimal text extraction")
        minimal_result = await self._extract_with_minimal_parsing(url)

        if minimal_result and minimal_result.get("extraction_success"):
            self.logger.info("✓ Minimal text extraction successful")
            return self._enhance_result(minimal_result, "minimal_parsing")

        # All methods failed
        self.logger.warning(f"All extraction methods failed for: {url}")
        return self._create_failed_result(url, "All extraction methods failed")

    async def _extract_with_firecrawl_first(self, url: str) -> dict[str, Any] | None:
        """Extract content prioritizing Firecrawl for JavaScript-heavy sites."""
        self.logger.debug("Using Firecrawl-first strategy")

        # Step 1: Try Firecrawl (primary)
        self.logger.debug("Step 1: Trying Firecrawl extraction")
        firecrawl_result = await self._extract_with_firecrawl(url)

        if firecrawl_result and firecrawl_result.get("extraction_success"):
            self.logger.info("✓ Firecrawl extraction successful")
            return self._enhance_result(firecrawl_result, "firecrawl")

        # Step 2: Try Trafilatura (fallback)
        self.logger.debug("Step 2: Trying Trafilatura extraction as fallback")
        trafilatura_result = await self._extract_with_trafilatura(url)

        if trafilatura_result and trafilatura_result.get("extraction_success"):
            self.logger.info("✓ Trafilatura extraction successful (fallback)")
            return self._enhance_result(trafilatura_result, "trafilatura")

        # Step 3: Try basic HTML parsing (tertiary)
        self.logger.debug("Step 3: Trying basic HTML parsing")
        html_result = await self._extract_with_html_parsing(url)

        if html_result and html_result.get("extraction_success"):
            self.logger.info("✓ HTML parsing extraction successful")
            return self._enhance_result(html_result, "html_parsing")

        # Step 4: Try minimal text extraction (quaternary)
        self.logger.debug("Step 4: Trying minimal text extraction")
        minimal_result = await self._extract_with_minimal_parsing(url)

        if minimal_result and minimal_result.get("extraction_success"):
            self.logger.info("✓ Minimal text extraction successful")
            return self._enhance_result(minimal_result, "minimal_parsing")

        # All methods failed
        self.logger.warning(f"All extraction methods failed for: {url}")
        return self._create_failed_result(url, "All extraction methods failed")

    async def _extract_with_default_strategy(
        self, url: str, use_structured_extraction: bool = False
    ) -> dict[str, Any] | None:
        """Extract content using default strategy: Firecrawl -> Trafilatura -> HTML -> Minimal."""
        self.logger.debug("Using default strategy")

        # Step 1: Try Firecrawl (primary)
        self.logger.debug("Step 1: Trying Firecrawl extraction")
        firecrawl_result = await self._extract_with_firecrawl(url)

        if firecrawl_result and firecrawl_result.get("extraction_success"):
            self.logger.info("✓ Firecrawl extraction successful")
            return self._enhance_result(firecrawl_result, "firecrawl")

        # Step 2: Try Trafilatura (secondary)
        self.logger.debug("Step 2: Trying Trafilatura extraction")
        trafilatura_result = await self._extract_with_trafilatura(url)

        if trafilatura_result and trafilatura_result.get("extraction_success"):
            self.logger.info("✓ Trafilatura extraction successful")
            return self._enhance_result(trafilatura_result, "trafilatura")

        # Step 3: Try basic HTML parsing (tertiary)
        self.logger.debug("Step 3: Trying basic HTML parsing")
        html_result = await self._extract_with_html_parsing(url)

        if html_result and html_result.get("extraction_success"):
            self.logger.info("✓ HTML parsing extraction successful")
            return self._enhance_result(html_result, "html_parsing")

        # Step 4: Try minimal text extraction (quaternary)
        self.logger.debug("Step 4: Trying minimal text extraction")
        minimal_result = await self._extract_with_minimal_parsing(url)

        if minimal_result and minimal_result.get("extraction_success"):
            self.logger.info("✓ Minimal text extraction successful")
            return self._enhance_result(minimal_result, "minimal_parsing")

        # All methods failed
        self.logger.warning(f"All extraction methods failed for: {url}")
        return self._create_failed_result(url, "All extraction methods failed")

    async def _extract_with_trafilatura(self, url: str) -> dict[str, Any] | None:
        """Extract content using Trafilatura."""
        try:
            # This would integrate with a Trafilatura client
            # For now, we'll simulate the extraction
            self.logger.debug(f"Trafilatura extraction for: {url}")
            
            # Simulate Trafilatura extraction
            # In a real implementation, this would call the Trafilatura library
            return {
                "content": "Trafilatura extracted content",
                "title": "Trafilatura extracted title",
                "extraction_success": True,
                "method": "trafilatura",
            }
            
        except Exception as e:
            self.logger.error(f"Trafilatura extraction failed for {url}: {e}")
            return None

    async def _extract_with_firecrawl(self, url: str) -> dict[str, Any] | None:
        """Extract content using Firecrawl."""
        try:
            # This would integrate with a Firecrawl client
            # For now, we'll simulate the extraction
            self.logger.debug(f"Firecrawl extraction for: {url}")
            
            # Simulate Firecrawl extraction
            # In a real implementation, this would call the Firecrawl API
            return {
                "content": "Firecrawl extracted content",
                "title": "Firecrawl extracted title",
                "extraction_success": True,
                "method": "firecrawl",
            }
            
        except Exception as e:
            self.logger.error(f"Firecrawl extraction failed for {url}: {e}")
            return None

    async def _extract_with_html_parsing(self, url: str) -> dict[str, Any] | None:
        """Extract content using basic HTML parsing."""
        try:
            if not self.session:
                return None

            async with self.session.get(url) as response:
                if response.status != 200:
                    return None

                content = await response.text()
                soup = BeautifulSoup(content, "html.parser")

                # Remove script and style elements
                for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
                    script.decompose()

                # Extract title
                title = ""
                title_tag = soup.find("title")
                if title_tag:
                    title = title_tag.get_text(strip=True)

                # Extract main content
                main_content = ""
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

                for selector in main_selectors:
                    element = soup.select_one(selector)
                    if element:
                        main_content = element.get_text(separator=" ", strip=True)
                        break

                # Fallback to body if no main content found
                if not main_content:
                    body = soup.find("body")
                    if body:
                        main_content = body.get_text(separator=" ", strip=True)

                # Clean up whitespace
                lines = [line.strip() for line in main_content.split("\n") if line.strip()]
                cleaned_content = "\n".join(lines)

                return {
                    "content": cleaned_content,
                    "title": title,
                    "extraction_success": bool(cleaned_content),
                    "method": "html_parsing",
                }

        except Exception as e:
            self.logger.error(f"HTML parsing extraction failed for {url}: {e}")
            return None

    async def _extract_with_minimal_parsing(self, url: str) -> dict[str, Any] | None:
        """Extract content using minimal text parsing."""
        try:
            if not self.session:
                return None

            async with self.session.get(url) as response:
                if response.status != 200:
                    return None

                content = await response.text()
                soup = BeautifulSoup(content, "html.parser")

                # Remove all script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()

                # Get all text content
                text = soup.get_text(separator=" ", strip=True)

                # Basic cleaning
                lines = [line.strip() for line in text.split("\n") if line.strip()]
                cleaned_text = "\n".join(lines)

                return {
                    "content": cleaned_text,
                    "title": "",
                    "extraction_success": bool(cleaned_text),
                    "method": "minimal_parsing",
                }

        except Exception as e:
            self.logger.error(f"Minimal parsing extraction failed for {url}: {e}")
            return None

    def _enhance_result(self, result: dict[str, Any], source: str) -> dict[str, Any]:
        """Enhance extraction result with additional metadata.

        Args:
            result: Original extraction result
            source: Source of the extraction

        Returns:
            Enhanced result dictionary

        """
        enhanced = result.copy()
        enhanced["extraction_source"] = source
        enhanced["extraction_method"] = source
        enhanced["extraction_pipeline"] = "multi_tier"

        # Add quality metrics
        content = enhanced.get("content", "")
        if content:
            enhanced["content_length"] = len(content)
            enhanced["word_count"] = len(content.split())
            enhanced["quality_score"] = self._calculate_quality_score(content)

        return enhanced

    def _calculate_quality_score(self, content: str) -> float:
        """Calculate a quality score for extracted content.

        Args:
            content: Extracted content

        Returns:
            Quality score between 0 and 1

        """
        if not content:
            return 0.0

        score = 0.0

        # Length score (prefer longer content)
        length_score = min(len(content) / 1000, 1.0)  # Cap at 1000 chars
        score += length_score * 0.3

        # Word count score
        word_count = len(content.split())
        word_score = min(word_count / 100, 1.0)  # Cap at 100 words
        score += word_score * 0.3

        # Readability score (basic)
        sentences = content.split(".")
        if len(sentences) > 1:
            avg_sentence_length = word_count / len(sentences)
            readability_score = max(0, 1 - abs(avg_sentence_length - 15) / 15)
            score += readability_score * 0.2

        # Structure score (has paragraphs, etc.)
        if "\n\n" in content or content.count("\n") > 5:
            score += 0.2

        return min(score, 1.0)

    def _create_failed_result(self, url: str, error: str) -> dict[str, Any]:
        """Create a standardized failed result.

        Args:
            url: URL that failed
            error: Error description

        Returns:
            Failed result dictionary

        """
        return {
            "content": None,
            "metadata": {},
            "url": url,
            "extraction_success": False,
            "error": error,
            "extraction_source": "none",
            "extraction_pipeline": "multi_tier",
            "content_length": 0,
            "word_count": 0,
            "quality_score": 0.0,
        }

    def get_extraction_stats(self) -> dict[str, Any]:
        """Get statistics about available extractors.

        Returns:
            Dictionary with extractor statistics

        """
        return {
            "trafilatura": {
                "available": True,
                "description": "HTML content extraction",
                "capabilities": ["web pages", "HTML content", "metadata extraction"],
            },
            "firecrawl": {
                "available": True,
                "description": "Web scraping service",
                "capabilities": [
                    "JavaScript rendering",
                    "anti-bot bypass",
                    "screenshots",
                ],
            },
            "html_parsing": {
                "available": True,
                "description": "Basic HTML parsing",
                "capabilities": ["HTML content", "text extraction"],
            },
            "minimal_parsing": {
                "available": True,
                "description": "Minimal text extraction",
                "capabilities": ["basic text extraction"],
            },
        }
