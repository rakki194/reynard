"""Tests for multi-tier content extractor implementation."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import aiohttp

from app.services.scraping.extractors.multi_tier_extractor import (
    MultiTierExtractor,
    ExtractionStrategy,
)


class TestMultiTierExtractor:
    """Test cases for multi-tier content extractor."""

    @pytest.fixture
    def extractor(self):
        """Create a test extractor instance."""
        return MultiTierExtractor()

    @pytest.fixture
    def mock_session(self):
        """Create a mock HTTP session."""
        session = AsyncMock(spec=aiohttp.ClientSession)
        return session

    @pytest.mark.asyncio
    async def test_initialization(self, extractor):
        """Test extractor initialization."""
        with patch('aiohttp.ClientSession') as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session
            
            result = await extractor.initialize()
            
            assert result is True
            assert extractor.session is not None

    @pytest.mark.asyncio
    async def test_shutdown(self, extractor):
        """Test extractor shutdown."""
        mock_session = AsyncMock()
        extractor.session = mock_session
        
        result = await extractor.shutdown()
        
        assert result is True
        mock_session.close.assert_called_once()
        assert extractor.session is None

    def test_get_site_specific_strategy(self, extractor):
        """Test site-specific strategy detection."""
        # Test Ars Technica (should use Trafilatura first)
        ars_url = "https://arstechnica.com/gadgets/2024/01/test-article/"
        strategy = extractor._get_site_specific_strategy(ars_url)
        assert strategy == ExtractionStrategy.TRAFILATURA_FIRST
        
        # Test Twitter (should use Firecrawl first)
        twitter_url = "https://twitter.com/user/status/123456789"
        strategy = extractor._get_site_specific_strategy(twitter_url)
        assert strategy == ExtractionStrategy.FIRECRAWL_FIRST
        
        # Test Reddit (should use Firecrawl first)
        reddit_url = "https://reddit.com/r/technology/comments/abc123/"
        strategy = extractor._get_site_specific_strategy(reddit_url)
        assert strategy == ExtractionStrategy.FIRECRAWL_FIRST
        
        # Test unknown site (should use default)
        unknown_url = "https://example.com/article"
        strategy = extractor._get_site_specific_strategy(unknown_url)
        assert strategy == ExtractionStrategy.DEFAULT

    @pytest.mark.asyncio
    async def test_extract_content_trafilatura_first(self, extractor):
        """Test extraction with Trafilatura-first strategy."""
        with patch.object(extractor, '_extract_with_trafilatura') as mock_trafilatura:
            mock_trafilatura.return_value = {
                "content": "Trafilatura extracted content",
                "title": "Trafilatura extracted title",
                "extraction_success": True,
                "method": "trafilatura"
            }
            
            result = await extractor.extract_content("https://arstechnica.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert result["extraction_method"] == "trafilatura"
            assert result["extraction_source"] == "trafilatura"
            mock_trafilatura.assert_called_once()

    @pytest.mark.asyncio
    async def test_extract_content_firecrawl_first(self, extractor):
        """Test extraction with Firecrawl-first strategy."""
        with patch.object(extractor, '_extract_with_firecrawl') as mock_firecrawl:
            mock_firecrawl.return_value = {
                "content": "Firecrawl extracted content",
                "title": "Firecrawl extracted title",
                "extraction_success": True,
                "method": "firecrawl"
            }
            
            result = await extractor.extract_content("https://twitter.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert result["extraction_method"] == "firecrawl"
            assert result["extraction_source"] == "firecrawl"
            mock_firecrawl.assert_called_once()

    @pytest.mark.asyncio
    async def test_extract_content_default_strategy(self, extractor):
        """Test extraction with default strategy."""
        with patch.object(extractor, '_extract_with_firecrawl') as mock_firecrawl:
            mock_firecrawl.return_value = {
                "content": "Firecrawl extracted content",
                "title": "Firecrawl extracted title",
                "extraction_success": True,
                "method": "firecrawl"
            }
            
            result = await extractor.extract_content("https://example.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert result["extraction_method"] == "firecrawl"
            mock_firecrawl.assert_called_once()

    @pytest.mark.asyncio
    async def test_extract_with_trafilatura_first_fallback(self, extractor):
        """Test Trafilatura-first strategy with fallback."""
        with patch.object(extractor, '_extract_with_trafilatura') as mock_trafilatura:
            with patch.object(extractor, '_extract_with_firecrawl') as mock_firecrawl:
                with patch.object(extractor, '_extract_with_html_parsing') as mock_html:
                    # Trafilatura fails
                    mock_trafilatura.return_value = None
                    
                    # Firecrawl succeeds
                    mock_firecrawl.return_value = {
                        "content": "Firecrawl content",
                        "title": "Firecrawl title",
                        "extraction_success": True,
                        "method": "firecrawl"
                    }
                    
                    result = await extractor._extract_with_trafilatura_first("https://arstechnica.com/test/")
                    
                    assert result is not None
                    assert result["extraction_success"] is True
                    assert result["extraction_method"] == "firecrawl"
                    mock_trafilatura.assert_called_once()
                    mock_firecrawl.assert_called_once()

    @pytest.mark.asyncio
    async def test_extract_with_firecrawl_first_fallback(self, extractor):
        """Test Firecrawl-first strategy with fallback."""
        with patch.object(extractor, '_extract_with_firecrawl') as mock_firecrawl:
            with patch.object(extractor, '_extract_with_trafilatura') as mock_trafilatura:
                with patch.object(extractor, '_extract_with_html_parsing') as mock_html:
                    # Firecrawl fails
                    mock_firecrawl.return_value = None
                    
                    # Trafilatura succeeds
                    mock_trafilatura.return_value = {
                        "content": "Trafilatura content",
                        "title": "Trafilatura title",
                        "extraction_success": True,
                        "method": "trafilatura"
                    }
                    
                    result = await extractor._extract_with_firecrawl_first("https://twitter.com/test/")
                    
                    assert result is not None
                    assert result["extraction_success"] is True
                    assert result["extraction_method"] == "trafilatura"
                    mock_firecrawl.assert_called_once()
                    mock_trafilatura.assert_called_once()

    @pytest.mark.asyncio
    async def test_extract_with_html_parsing(self, extractor):
        """Test HTML parsing extraction."""
        with patch.object(extractor, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head><title>Test Article</title></head>
                    <body>
                        <main>
                            <h1>Article Title</h1>
                            <p>This is the main content of the article.</p>
                            <p>More content here.</p>
                        </main>
                    </body>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await extractor._extract_with_html_parsing("https://example.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert result["method"] == "html_parsing"
            assert "Test Article" in result["title"]
            assert "main content of the article" in result["content"]

    @pytest.mark.asyncio
    async def test_extract_with_minimal_parsing(self, extractor):
        """Test minimal parsing extraction."""
        with patch.object(extractor, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head><title>Test Article</title></head>
                    <body>
                        <script>console.log('script');</script>
                        <style>body { color: red; }</style>
                        <p>This is the content.</p>
                        <p>More content here.</p>
                    </body>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await extractor._extract_with_minimal_parsing("https://example.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert result["method"] == "minimal_parsing"
            assert "This is the content" in result["content"]
            assert "console.log" not in result["content"]  # Scripts removed
            assert "color: red" not in result["content"]  # Styles removed

    def test_enhance_result(self, extractor):
        """Test result enhancement."""
        original_result = {
            "content": "Test content here",
            "title": "Test Title",
            "extraction_success": True,
            "method": "test_method"
        }
        
        enhanced = extractor._enhance_result(original_result, "test_source")
        
        assert enhanced["extraction_source"] == "test_source"
        assert enhanced["extraction_method"] == "test_source"
        assert enhanced["extraction_pipeline"] == "multi_tier"
        assert enhanced["content_length"] == len("Test content here")
        assert enhanced["word_count"] == 3
        assert "quality_score" in enhanced

    def test_calculate_quality_score(self, extractor):
        """Test quality score calculation."""
        # Test with good content
        good_content = "This is a well-structured article with multiple sentences. " * 10
        score = extractor._calculate_quality_score(good_content)
        assert 0.0 <= score <= 1.0
        assert score > 0.5  # Should be good quality
        
        # Test with empty content
        empty_score = extractor._calculate_quality_score("")
        assert empty_score == 0.0
        
        # Test with short content
        short_score = extractor._calculate_quality_score("Short")
        assert short_score < 0.5

    def test_create_failed_result(self, extractor):
        """Test failed result creation."""
        result = extractor._create_failed_result("https://example.com/test", "Test error")
        
        assert result["content"] is None
        assert result["url"] == "https://example.com/test"
        assert result["extraction_success"] is False
        assert result["error"] == "Test error"
        assert result["extraction_source"] == "none"
        assert result["quality_score"] == 0.0

    def test_get_extraction_stats(self, extractor):
        """Test extraction statistics."""
        stats = extractor.get_extraction_stats()
        
        assert "trafilatura" in stats
        assert "firecrawl" in stats
        assert "html_parsing" in stats
        assert "minimal_parsing" in stats
        
        # Check that all extractors are marked as available
        for extractor_name, extractor_info in stats.items():
            assert extractor_info["available"] is True
            assert "description" in extractor_info
            assert "capabilities" in extractor_info

    @pytest.mark.asyncio
    async def test_all_methods_fail(self, extractor):
        """Test when all extraction methods fail."""
        with patch.object(extractor, '_extract_with_trafilatura', return_value=None):
            with patch.object(extractor, '_extract_with_firecrawl', return_value=None):
                with patch.object(extractor, '_extract_with_html_parsing', return_value=None):
                    with patch.object(extractor, '_extract_with_minimal_parsing', return_value=None):
                        
                        result = await extractor._extract_with_trafilatura_first("https://arstechnica.com/test/")
                        
                        assert result is not None
                        assert result["extraction_success"] is False
                        assert result["error"] == "All extraction methods failed"

    @pytest.mark.asyncio
    async def test_error_handling(self, extractor):
        """Test error handling in various scenarios."""
        # Test initialization failure
        with patch('aiohttp.ClientSession', side_effect=Exception("Connection error")):
            result = await extractor.initialize()
            assert result is False

        # Test extraction with no session
        extractor.session = None
        result = await extractor._extract_with_html_parsing("https://example.com/test/")
        assert result is None

    @pytest.mark.asyncio
    async def test_html_parsing_with_no_main_content(self, extractor):
        """Test HTML parsing when no main content is found."""
        with patch.object(extractor, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head><title>Test Article</title></head>
                    <body>
                        <div>Some content without main tags</div>
                    </body>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await extractor._extract_with_html_parsing("https://example.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert "Some content without main tags" in result["content"]

    @pytest.mark.asyncio
    async def test_html_parsing_with_script_removal(self, extractor):
        """Test HTML parsing removes scripts and styles."""
        with patch.object(extractor, 'session') as mock_session:
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text = AsyncMock(return_value="""
                <html>
                    <head><title>Test Article</title></head>
                    <body>
                        <script>alert('test');</script>
                        <style>body { margin: 0; }</style>
                        <nav>Navigation</nav>
                        <footer>Footer</footer>
                        <aside>Sidebar</aside>
                        <main>Main content here</main>
                    </body>
                </html>
            """)
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            result = await extractor._extract_with_html_parsing("https://example.com/test/")
            
            assert result is not None
            assert result["extraction_success"] is True
            assert "Main content here" in result["content"]
            assert "alert('test')" not in result["content"]
            assert "margin: 0" not in result["content"]
            assert "Navigation" not in result["content"]
            assert "Footer" not in result["content"]
            assert "Sidebar" not in result["content"]
