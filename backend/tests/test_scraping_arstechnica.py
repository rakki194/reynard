"""Tests for Ars Technica scraper implementation."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import aiohttp
from bs4 import BeautifulSoup

from app.services.scraping.extractors.arstechnica_scraper import ArsTechnicaScraper
from app.services.scraping.models import ScrapingResult, ScrapingType


class TestArsTechnicaScraper:
    """Test cases for Ars Technica scraper."""

    @pytest.fixture
    def scraper(self):
        """Create a test scraper instance."""
        return ArsTechnicaScraper()

    @pytest.fixture
    def mock_session(self):
        """Create a mock HTTP session."""
        session = AsyncMock(spec=aiohttp.ClientSession)
        return session

    @pytest.fixture
    def sample_article_data(self):
        """Sample article data for testing."""
        return {
            "id": 12345,
            "title": {"rendered": "Test Article Title"},
            "content": {"rendered": "<p>Test article content here.</p>"},
            "excerpt": {"rendered": "Test excerpt"},
            "author": 1,
            "date": "2024-01-15T10:00:00",
            "link": "https://arstechnica.com/gadgets/2024/01/test-article/",
            "categories": [1, 2],
            "tags": [3, 4],
            "featured_media": 567,
            "_embedded": {
                "author": [{"name": "Test Author"}],
                "wp:term": [
                    [{"name": "Gadgets", "taxonomy": "category"}],
                    [{"name": "Technology", "taxonomy": "post_tag"}]
                ],
                "wp:featuredmedia": [{"source_url": "https://example.com/image.jpg"}]
            }
        }

    @pytest.mark.asyncio
    async def test_initialization(self, scraper):
        """Test scraper initialization."""
        with patch('aiohttp.ClientSession') as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session
            
            # Mock API availability test
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await scraper.initialize()
            
            assert result is True
            assert scraper.session is not None
            assert scraper.scraper_type == ScrapingType.ARS_TECHNICA
            assert "arstechnica.com" in scraper.supported_domains

    @pytest.mark.asyncio
    async def test_can_handle_url(self, scraper):
        """Test URL handling capability."""
        # Valid Ars Technica URL
        valid_url = "https://arstechnica.com/gadgets/2024/01/test-article/"
        assert await scraper.can_handle_url(valid_url) is True
        
        # Invalid URL
        invalid_url = "https://example.com/article"
        assert await scraper.can_handle_url(invalid_url) is False

    @pytest.mark.asyncio
    async def test_scrape_content_with_api(self, scraper, sample_article_data):
        """Test content scraping with WordPress API."""
        # Initialize the scraper first
        scraper.session = AsyncMock()
        
        with patch.object(scraper, '_scrape_with_api_fallback') as mock_api:
            mock_api.return_value = {
                "title": "Test Article Title",
                "content": "Test article content here.",
                "author": "Test Author",
                "date": "2024-01-15T10:00:00",
                "categories": ["Gadgets"],
                "tags": ["Technology"],
                "featured_image": "https://example.com/image.jpg",
                "excerpt": "Test excerpt",
                "extraction_method": "wordpress_api"
            }
            
            with patch.object(scraper, 'get_rate_limit_delay', return_value=0):
                result = await scraper.scrape_content("https://arstechnica.com/gadgets/2024/01/test-article/")
                
                assert isinstance(result, ScrapingResult)
                assert result.title == "Test Article Title"
                assert result.content == "Test article content here."
                assert result.metadata["extraction_method"] == "wordpress_api"
                assert result.metadata["author"] == "Test Author"

    @pytest.mark.asyncio
    async def test_get_latest_articles(self, scraper, sample_article_data):
        """Test getting latest articles from WordPress API."""
        with patch.object(scraper, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json = AsyncMock(return_value=[sample_article_data])
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            articles = await scraper.get_latest_articles(limit=5)
            
            assert len(articles) == 1
            assert articles[0]["title"] == "Test Article Title"
            assert articles[0]["content"] == "<p>Test article content here.</p>"

    @pytest.mark.asyncio
    async def test_search_articles(self, scraper, sample_article_data):
        """Test searching articles."""
        with patch.object(scraper, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.json = AsyncMock(return_value=[sample_article_data])
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            results = await scraper.search_articles("test query", limit=10)
            
            assert len(results) == 1
            assert results[0]["title"] == "Test Article Title"

    @pytest.mark.asyncio
    async def test_extract_post_id_from_url(self, scraper):
        """Test extracting post ID from URL."""
        with patch.object(scraper, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head>
                        <meta name="post-id" content="12345">
                    </head>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            post_id = await scraper._extract_post_id_from_url("https://arstechnica.com/test/")
            
            assert post_id == 12345

    @pytest.mark.asyncio
    async def test_scrape_article_page(self, scraper):
        """Test scraping article page directly."""
        with patch.object(scraper, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head><title>Test Article</title></head>
                    <body>
                        <article class="entry-content">
                            <h1>Test Article Title</h1>
                            <p>Test article content here.</p>
                        </article>
                    </body>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await scraper._scrape_article_page("https://arstechnica.com/test/")
            
            assert result is not None
            assert result["title"] == "Test Article Title"
            assert "Test article content here." in result["content"]

    @pytest.mark.asyncio
    async def test_shutdown(self, scraper):
        """Test scraper shutdown."""
        mock_session = AsyncMock()
        scraper.session = mock_session
        
        result = await scraper.shutdown()
        
        assert result is True
        mock_session.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_handling(self, scraper):
        """Test error handling in various scenarios."""
        # Test initialization failure
        with patch('aiohttp.ClientSession', side_effect=Exception("Connection error")):
            result = await scraper.initialize()
            assert result is False

        # Test scraping failure
        with patch.object(scraper, 'session', None):
            with pytest.raises(RuntimeError, match="Scraper not initialized"):
                await scraper.scrape_content("https://arstechnica.com/test/")

    @pytest.mark.asyncio
    async def test_rate_limiting(self, scraper):
        """Test rate limiting functionality."""
        delay = await scraper.get_rate_limit_delay()
        assert delay == 2.0  # Ars Technica specific rate limit
