#!/usr/bin/env python3
"""
Web Scraping Service

Advanced web scraping using playwright and requests-html for prompt refinement research.
Replaces the pseudo-code web_search() functions with actual implementations.

🦊 Fox approach: Strategic web research with intelligent content extraction
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
import aiohttp
from requests_html import AsyncHTMLSession
from playwright.async_api import async_playwright, Browser, Page

logger = logging.getLogger(__name__)


@dataclass
class ScrapingResult:
    """Result of web scraping operation."""

    url: str
    title: str
    content: str
    summary: str
    keywords: List[str]
    quality_score: float
    source_type: str
    timestamp: float


class WebScrapingService:
    """
    Advanced web scraping service using playwright and requests-html.

    Provides intelligent content extraction for prompt refinement research.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the web scraping service."""
        self.config = config or {}
        self.session: Optional[AsyncHTMLSession] = None
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

        # Configuration
        self.max_concurrent_requests = self.config.get("max_concurrent_requests", 5)
        self.request_timeout = self.config.get("request_timeout", 30)
        self.user_agent = self.config.get(
            "user_agent",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )

        # Search engines and sources
        self.search_engines = {
            "google": "https://www.google.com/search?q={query}",
            "bing": "https://www.bing.com/search?q={query}",
            "duckduckgo": "https://duckduckgo.com/?q={query}",
        }

        self._initialized = False

    async def initialize(self) -> bool:
        """Initialize the web scraping service."""
        try:
            # Initialize requests-html session
            self.session = AsyncHTMLSession()

            # Initialize playwright browser
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(
                headless=True, args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            self.page = await self.browser.new_page()
            await self.page.set_extra_http_headers({"User-Agent": self.user_agent})

            self._initialized = True
            logger.info("Web scraping service initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize web scraping service: {e}")
            return False

    async def research_query_topic(
        self, query: str, key_concepts: List[str] = None
    ) -> Dict[str, Any]:
        """
        Research a query topic using multiple sources and methods.

        Replaces the pseudo-code conduct_subject_research() function.
        """
        if not self._initialized:
            await self.initialize()

        logger.info(f"Researching query topic: {query}")

        # Generate search queries
        search_queries = self._generate_search_queries(query, key_concepts)

        # Conduct searches
        search_results = await self._conduct_searches(search_queries)

        # Extract and analyze content
        content_results = await self._extract_content(search_results)

        # Analyze and score content
        analyzed_results = await self._analyze_content(content_results)

        return {
            "query": query,
            "key_concepts": key_concepts,
            "search_queries": search_queries,
            "search_results": search_results,
            "content_results": analyzed_results,
            "sources": self._extract_sources(analyzed_results),
            "trends": self._identify_trends(analyzed_results),
            "related_topics": self._identify_related_topics(analyzed_results),
        }

    def _generate_search_queries(
        self, query: str, key_concepts: List[str]
    ) -> List[str]:
        """Generate diverse search queries for comprehensive research."""
        queries = [query]  # Original query

        # Add concept-specific queries
        if key_concepts:
            for concept in key_concepts[:3]:  # Limit to top 3 concepts
                queries.append(f"{concept} {query}")
                queries.append(f"what is {concept}")
                queries.append(f"how to {concept}")

        # Add question-based queries
        question_words = ["how", "what", "why", "when", "where", "which"]
        for word in question_words[:2]:  # Limit to 2 question words
            queries.append(f"{word} {query}")

        # Add tutorial/guide queries
        queries.extend(
            [
                f"{query} tutorial",
                f"{query} guide",
                f"{query} best practices",
                f"{query} examples",
            ]
        )

        return list(set(queries))  # Remove duplicates

    async def _conduct_searches(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Conduct searches across multiple search engines."""
        all_results = []

        # Use semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.max_concurrent_requests)

        tasks = []
        for query in queries:
            for engine_name, engine_url in self.search_engines.items():
                task = self._search_with_semaphore(
                    semaphore, engine_name, engine_url, query
                )
                tasks.append(task)

        # Execute all searches concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions and collect results
        for result in results:
            if isinstance(result, dict) and "results" in result:
                all_results.extend(result["results"])

        return all_results

    async def _search_with_semaphore(
        self,
        semaphore: asyncio.Semaphore,
        engine_name: str,
        engine_url: str,
        query: str,
    ) -> Dict[str, Any]:
        """Search with semaphore for rate limiting."""
        async with semaphore:
            return await self._search_engine(engine_name, engine_url, query)

    async def _search_engine(
        self, engine_name: str, engine_url: str, query: str
    ) -> Dict[str, Any]:
        """Search a specific search engine."""
        try:
            search_url = engine_url.format(query=query)

            # Use playwright for JavaScript-heavy sites
            if engine_name == "google":
                return await self._search_with_playwright(
                    engine_name, search_url, query
                )
            else:
                return await self._search_with_requests_html(
                    engine_name, search_url, query
                )

        except Exception as e:
            logger.warning(f"Search failed for {engine_name}: {e}")
            return {
                "engine": engine_name,
                "query": query,
                "results": [],
                "error": str(e),
            }

    async def _search_with_playwright(
        self, engine_name: str, url: str, query: str
    ) -> Dict[str, Any]:
        """Search using playwright for JavaScript-heavy sites."""
        try:
            await self.page.goto(url, timeout=self.request_timeout * 1000)
            await self.page.wait_for_load_state("networkidle")

            # Extract search results
            results = await self.page.evaluate(
                """
                () => {
                    const results = [];
                    const links = document.querySelectorAll('a[href*="http"]');
                    
                    for (let i = 0; i < Math.min(links.length, 10); i++) {
                        const link = links[i];
                        const href = link.href;
                        const title = link.textContent?.trim() || '';
                        
                        if (href && title && !href.includes('google.com')) {
                            results.push({
                                url: href,
                                title: title,
                                snippet: ''
                            });
                        }
                    }
                    
                    return results;
                }
            """
            )

            return {"engine": engine_name, "query": query, "results": results}

        except Exception as e:
            logger.warning(f"Playwright search failed for {engine_name}: {e}")
            return {
                "engine": engine_name,
                "query": query,
                "results": [],
                "error": str(e),
            }

    async def _search_with_requests_html(
        self, engine_name: str, url: str, query: str
    ) -> Dict[str, Any]:
        """Search using requests-html for simpler sites."""
        try:
            response = await self.session.get(url, timeout=self.request_timeout)
            await response.html.arender(timeout=self.request_timeout * 1000)

            # Extract search results based on engine
            if engine_name == "bing":
                results = self._extract_bing_results(response.html)
            elif engine_name == "duckduckgo":
                results = self._extract_duckduckgo_results(response.html)
            else:
                results = []

            return {"engine": engine_name, "query": query, "results": results}

        except Exception as e:
            logger.warning(f"Requests-HTML search failed for {engine_name}: {e}")
            return {
                "engine": engine_name,
                "query": query,
                "results": [],
                "error": str(e),
            }

    def _extract_bing_results(self, html) -> List[Dict[str, str]]:
        """Extract search results from Bing."""
        results = []

        # Bing result selectors
        result_elements = html.find(".b_algo")

        for element in result_elements[:10]:  # Limit to 10 results
            try:
                title_elem = element.find("h2 a", first=True)
                snippet_elem = element.find(".b_caption p", first=True)

                if title_elem:
                    results.append(
                        {
                            "url": title_elem.attrs.get("href", ""),
                            "title": title_elem.text or "",
                            "snippet": snippet_elem.text if snippet_elem else "",
                        }
                    )
            except Exception as e:
                logger.warning(f"Failed to extract Bing result: {e}")
                continue

        return results

    def _extract_duckduckgo_results(self, html) -> List[Dict[str, str]]:
        """Extract search results from DuckDuckGo."""
        results = []

        # DuckDuckGo result selectors
        result_elements = html.find(".result")

        for element in result_elements[:10]:  # Limit to 10 results
            try:
                title_elem = element.find(".result__title a", first=True)
                snippet_elem = element.find(".result__snippet", first=True)

                if title_elem:
                    results.append(
                        {
                            "url": title_elem.attrs.get("href", ""),
                            "title": title_elem.text or "",
                            "snippet": snippet_elem.text if snippet_elem else "",
                        }
                    )
            except Exception as e:
                logger.warning(f"Failed to extract DuckDuckGo result: {e}")
                continue

        return results

    async def _extract_content(
        self, search_results: List[Dict[str, Any]]
    ) -> List[ScrapingResult]:
        """Extract content from search result URLs."""
        content_results = []

        # Use semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(self.max_concurrent_requests)

        tasks = []
        for result_group in search_results:
            for result in result_group.get("results", []):
                if result.get("url"):
                    task = self._extract_url_content(semaphore, result)
                    tasks.append(task)

        # Execute all extractions concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Filter out exceptions and collect results
        for result in results:
            if isinstance(result, ScrapingResult):
                content_results.append(result)

        return content_results

    async def _extract_url_content(
        self, semaphore: asyncio.Semaphore, result: Dict[str, str]
    ) -> Optional[ScrapingResult]:
        """Extract content from a single URL."""
        async with semaphore:
            try:
                url = result["url"]
                title = result.get("title", "")
                snippet = result.get("snippet", "")

                # Determine if we need JavaScript rendering
                needs_js = self._needs_javascript_rendering(url)

                if needs_js:
                    content = await self._extract_with_playwright(url)
                else:
                    content = await self._extract_with_requests_html(url)

                if content:
                    return ScrapingResult(
                        url=url,
                        title=title or self._extract_title_from_content(content),
                        content=content,
                        summary=snippet or self._generate_summary(content),
                        keywords=self._extract_keywords(content),
                        quality_score=self._calculate_quality_score(content, title),
                        source_type=self._classify_source_type(url),
                        timestamp=asyncio.get_event_loop().time(),
                    )

            except Exception as e:
                logger.warning(
                    f"Failed to extract content from {result.get('url', 'unknown')}: {e}"
                )
                return None

    def _needs_javascript_rendering(self, url: str) -> bool:
        """Determine if URL needs JavaScript rendering."""
        js_domains = [
            "spa",
            "app",
            "dashboard",
            "admin",
            "portal",
            "react",
            "vue",
            "angular",
            "svelte",
        ]

        domain = urlparse(url).netloc.lower()
        return any(js_domain in domain for js_domain in js_domains)

    async def _extract_with_playwright(self, url: str) -> Optional[str]:
        """Extract content using playwright."""
        try:
            await self.page.goto(url, timeout=self.request_timeout * 1000)
            await self.page.wait_for_load_state("networkidle")

            # Extract main content
            content = await self.page.evaluate(
                """
                () => {
                    // Try to find main content areas
                    const selectors = [
                        'main', 'article', '.content', '.post', '.entry',
                        '.main-content', '.article-content', '#content'
                    ];
                    
                    for (const selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            return element.innerText;
                        }
                    }
                    
                    // Fallback to body
                    return document.body.innerText;
                }
            """
            )

            return content.strip() if content else None

        except Exception as e:
            logger.warning(f"Playwright extraction failed for {url}: {e}")
            return None

    async def _extract_with_requests_html(self, url: str) -> Optional[str]:
        """Extract content using requests-html."""
        try:
            response = await self.session.get(url, timeout=self.request_timeout)
            await response.html.arender(timeout=self.request_timeout * 1000)

            # Try to find main content
            content_selectors = [
                "main",
                "article",
                ".content",
                ".post",
                ".entry",
                ".main-content",
                ".article-content",
                "#content",
            ]

            for selector in content_selectors:
                element = response.html.find(selector, first=True)
                if element:
                    return element.text.strip()

            # Fallback to body
            body = response.html.find("body", first=True)
            return body.text.strip() if body else None

        except Exception as e:
            logger.warning(f"Requests-HTML extraction failed for {url}: {e}")
            return None

    def _extract_title_from_content(self, content: str) -> str:
        """Extract title from content."""
        lines = content.split("\n")
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and len(line) < 100:  # Reasonable title length
                return line
        return "Untitled"

    def _generate_summary(self, content: str) -> str:
        """Generate a simple summary from content."""
        sentences = content.split(".")
        if len(sentences) > 1:
            return sentences[0].strip() + "."
        return content[:200] + "..." if len(content) > 200 else content

    def _extract_keywords(self, content: str) -> List[str]:
        """Extract keywords from content."""
        # Simple keyword extraction
        words = content.lower().split()

        # Filter out common words
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "can",
            "this",
            "that",
            "these",
            "those",
        }

        # Count word frequencies
        word_freq = {}
        for word in words:
            if len(word) > 3 and word not in stop_words:
                word_freq[word] = word_freq.get(word, 0) + 1

        # Return top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10]]

    def _calculate_quality_score(self, content: str, title: str) -> float:
        """Calculate quality score for content."""
        score = 0.5  # Base score

        # Length factor
        if len(content) > 500:
            score += 0.2
        elif len(content) < 100:
            score -= 0.2

        # Title factor
        if title and len(title) > 10:
            score += 0.1

        # Content structure factor
        if any(
            marker in content.lower()
            for marker in ["introduction", "conclusion", "summary"]
        ):
            score += 0.1

        # Technical content factor
        technical_indicators = ["api", "function", "method", "class", "code", "example"]
        if any(indicator in content.lower() for indicator in technical_indicators):
            score += 0.1

        return max(0.0, min(1.0, score))

    def _classify_source_type(self, url: str) -> str:
        """Classify the type of source."""
        domain = urlparse(url).netloc.lower()

        if any(edu in domain for edu in ["edu", "university", "college"]):
            return "academic"
        elif any(doc in domain for doc in ["docs", "documentation", "wiki"]):
            return "documentation"
        elif any(blog in domain for blog in ["blog", "medium", "dev.to"]):
            return "blog"
        elif any(news in domain for news in ["news", "reuters", "bbc"]):
            return "news"
        else:
            return "general"

    async def _analyze_content(
        self, content_results: List[ScrapingResult]
    ) -> List[ScrapingResult]:
        """Analyze and score content results."""
        # Sort by quality score
        analyzed_results = sorted(
            content_results, key=lambda x: x.quality_score, reverse=True
        )

        # Filter out low-quality results
        filtered_results = [
            result for result in analyzed_results if result.quality_score > 0.3
        ]

        return filtered_results[:20]  # Limit to top 20 results

    def _extract_sources(
        self, analyzed_results: List[ScrapingResult]
    ) -> List[Dict[str, Any]]:
        """Extract source information from analyzed results."""
        sources = []

        for result in analyzed_results:
            sources.append(
                {
                    "url": result.url,
                    "title": result.title,
                    "quality_score": result.quality_score,
                    "source_type": result.source_type,
                    "authority_score": self._calculate_authority_score(result.url),
                }
            )

        return sources

    def _calculate_authority_score(self, url: str) -> float:
        """Calculate authority score for a URL."""
        domain = urlparse(url).netloc.lower()

        # High authority domains
        high_authority = [
            "github.com",
            "stackoverflow.com",
            "wikipedia.org",
            "docs.python.org",
            "developer.mozilla.org",
            "nodejs.org",
            "reactjs.org",
            "vuejs.org",
        ]

        # Medium authority domains
        medium_authority = [
            "medium.com",
            "dev.to",
            "hashnode.com",
            "freecodecamp.org",
            "tutorialspoint.com",
            "w3schools.com",
            "geeksforgeeks.org",
        ]

        if any(auth_domain in domain for auth_domain in high_authority):
            return 0.9
        elif any(auth_domain in domain for auth_domain in medium_authority):
            return 0.7
        elif domain.endswith(".edu"):
            return 0.8
        elif domain.endswith(".gov"):
            return 0.8
        else:
            return 0.5

    def _identify_trends(self, analyzed_results: List[ScrapingResult]) -> List[str]:
        """Identify trends from analyzed results."""
        trends = []

        # Analyze keywords across results
        all_keywords = []
        for result in analyzed_results:
            all_keywords.extend(result.keywords)

        # Find common keywords
        keyword_freq = {}
        for keyword in all_keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1

        # Get trending keywords
        trending_keywords = sorted(
            keyword_freq.items(), key=lambda x: x[1], reverse=True
        )
        trends = [keyword for keyword, freq in trending_keywords[:5] if freq > 1]

        return trends

    def _identify_related_topics(
        self, analyzed_results: List[ScrapingResult]
    ) -> List[str]:
        """Identify related topics from analyzed results."""
        topics = set()

        # Extract topics from titles and content
        for result in analyzed_results:
            # Add keywords as topics
            topics.update(result.keywords[:3])  # Top 3 keywords per result

            # Extract topics from title
            title_words = result.title.lower().split()
            for word in title_words:
                if len(word) > 4 and word not in [
                    "this",
                    "that",
                    "with",
                    "from",
                    "they",
                    "have",
                ]:
                    topics.add(word)

        return list(topics)[:10]  # Limit to 10 topics

    async def initialize(self) -> bool:
        """Initialize the web scraping service."""
        try:
            logger.info("Web scraping service initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize web scraping service: {e}")
            return False

    async def research_query_topic_enhanced(
        self, query: str, key_concepts: List[str] = None
    ) -> Dict[str, Any]:
        """
        Research a query topic with key concepts.

        Enhanced version that accepts key concepts for better research.
        """
        logger.debug(f"Researching query topic: {query} with concepts: {key_concepts}")

        # Use the existing research_query_topic method
        results = await self.research_query_topic(query)

        # Enhance with key concepts if provided
        if key_concepts:
            results["key_concepts"] = key_concepts
            results["enhanced_search"] = True

        return results

    async def close(self):
        """Close the web scraping service."""
        if self.session:
            await self.session.close()

        if self.browser:
            await self.browser.close()

        logger.info("Web scraping service closed")
