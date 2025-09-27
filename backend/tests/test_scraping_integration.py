"""Integration tests for the complete scraping system."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import asyncio

from app.services.scraping.extractors import (
    ArsTechnicaScraper,
    WordPressScraper,
    MultiTierExtractor,
    IntelligentContentFilter,
    ContentExtractor,
)
from app.services.scraping.models import ScrapingType
from app.services.scraping.scraping_service import ScrapingService
from app.services.scraping.scraping_router import ScrapingRouter


class TestScrapingIntegration:
    """Integration tests for the complete scraping system."""

    @pytest.fixture
    def scraping_service(self):
        """Create a test scraping service."""
        return ScrapingService()

    @pytest.fixture
    def scraping_router(self):
        """Create a test scraping router."""
        return ScrapingRouter()

    @pytest.mark.asyncio
    async def test_service_initialization(self, scraping_service):
        """Test scraping service initialization."""
        with patch.object(scraping_service, '_register_default_scrapers') as mock_register:
            with patch.object(scraping_service.manager, 'initialize', return_value=True):
                with patch.object(scraping_service.router, 'initialize', return_value=True):
                    with patch.object(scraping_service.quality_scorer, 'initialize', return_value=True):
                        with patch.object(scraping_service.pipeline_manager, 'initialize', return_value=True):
                            
                            result = await scraping_service.initialize()
                            
                            assert result is True
                            assert scraping_service.initialized is True
                            mock_register.assert_called_once()

    @pytest.mark.asyncio
    async def test_router_initialization(self, scraping_router):
        """Test scraping router initialization."""
        result = await scraping_router.initialize()
        
        assert result is True
        assert scraping_router.initialized is True
        assert len(scraping_router.url_patterns) > 0

    @pytest.mark.asyncio
    async def test_scraper_registration(self, scraping_router):
        """Test scraper registration with router."""
        await scraping_router.initialize()
        
        # Mock scraper
        mock_scraper = AsyncMock()
        mock_scraper.initialize = AsyncMock(return_value=True)
        mock_scraper.name = "test_scraper"
        
        result = await scraping_router.register_scraper(ScrapingType.GENERAL, mock_scraper)
        
        assert result is True
        assert ScrapingType.GENERAL in scraping_router.scrapers

    @pytest.mark.asyncio
    async def test_url_routing(self, scraping_router):
        """Test URL routing to appropriate scrapers."""
        await scraping_router.initialize()
        
        # Mock scrapers
        mock_arstechnica = AsyncMock()
        mock_arstechnica.validate_url = AsyncMock(return_value=True)
        mock_arstechnica.can_handle_url = AsyncMock(return_value=True)
        
        mock_general = AsyncMock()
        mock_general.validate_url = AsyncMock(return_value=True)
        mock_general.can_handle_url = AsyncMock(return_value=True)
        
        # Register scrapers
        await scraping_router.register_scraper(ScrapingType.ARS_TECHNICA, mock_arstechnica)
        await scraping_router.register_scraper(ScrapingType.GENERAL, mock_general)
        
        # Test Ars Technica URL routing
        ars_url = "https://arstechnica.com/gadgets/2024/01/test-article/"
        scraper = await scraping_router.find_scraper_for_url(ars_url)
        assert scraper == mock_arstechnica
        
        # Test general URL routing
        general_url = "https://example.com/article"
        scraper = await scraping_router.find_scraper_for_url(general_url)
        assert scraper == mock_general

    @pytest.mark.asyncio
    async def test_arstechnica_scraper_integration(self):
        """Test Ars Technica scraper integration."""
        scraper = ArsTechnicaScraper()
        
        with patch('aiohttp.ClientSession') as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session
            
            # Mock API availability
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            # Initialize scraper
            result = await scraper.initialize()
            assert result is True
            
            # Test URL handling
            can_handle = await scraper.can_handle_url("https://arstechnica.com/test/")
            assert can_handle is True
            
            # Shutdown
            await scraper.shutdown()

    @pytest.mark.asyncio
    async def test_wordpress_scraper_integration(self):
        """Test WordPress scraper integration."""
        scraper = WordPressScraper("https://example.com")
        
        with patch('aiohttp.ClientSession') as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session
            
            # Mock API availability
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_session.get.return_value.__aenter__.return_value = mock_response
            
            # Initialize scraper
            result = await scraper.initialize()
            assert result is True
            
            # Test URL handling
            can_handle = await scraper.can_handle_url("https://example.com/test/")
            assert can_handle is True
            
            # Shutdown
            await scraper.shutdown()

    @pytest.mark.asyncio
    async def test_multi_tier_extractor_integration(self):
        """Test multi-tier extractor integration."""
        extractor = MultiTierExtractor()
        
        with patch('aiohttp.ClientSession') as mock_session_class:
            mock_session = AsyncMock()
            mock_session_class.return_value = mock_session
            
            # Initialize extractor
            result = await extractor.initialize()
            assert result is True
            
            # Test strategy detection
            strategy = extractor._get_site_specific_strategy("https://arstechnica.com/test/")
            assert strategy is not None
            
            # Test extraction stats
            stats = extractor.get_extraction_stats()
            assert len(stats) > 0
            
            # Shutdown
            await extractor.shutdown()

    @pytest.mark.asyncio
    async def test_intelligent_content_filter_integration(self):
        """Test intelligent content filter integration."""
        filter_instance = IntelligentContentFilter()
        
        test_content = """
        This is a test article with meaningful content.
        
        It should be filtered and processed correctly.
        
        Navigation and advertisement content should be removed.
        """
        
        result = await filter_instance.filter_content(test_content, source="test.com")
        
        assert result.filtered_content is not None
        assert result.quality_score >= 0.0
        assert result.processing_time >= 0.0

    @pytest.mark.asyncio
    async def test_content_extractor_integration(self):
        """Test content extractor integration."""
        extractor = ContentExtractor()
        
        # Initialize extractor
        result = await extractor.initialize()
        assert result is True
        
        # Test URL handling
        can_handle = await extractor.can_handle_url("https://example.com/test/")
        assert can_handle is True
        
        # Shutdown
        await extractor.shutdown()

    @pytest.mark.asyncio
    async def test_end_to_end_scraping_workflow(self, scraping_service):
        """Test complete end-to-end scraping workflow."""
        with patch.object(scraping_service, '_register_default_scrapers') as mock_register:
            with patch.object(scraping_service.manager, 'initialize', return_value=True):
                with patch.object(scraping_service.router, 'initialize', return_value=True):
                    with patch.object(scraping_service.quality_scorer, 'initialize', return_value=True):
                        with patch.object(scraping_service.pipeline_manager, 'initialize', return_value=True):
                            
                            # Initialize service
                            await scraping_service.initialize()
                            
                            # Mock scraper for the workflow
                            mock_scraper = AsyncMock()
                            mock_scraper.scrape_content = AsyncMock(return_value=AsyncMock(
                                url="https://example.com/test",
                                title="Test Article",
                                content="Test content",
                                metadata={"extraction_method": "test"}
                            ))
                            
                            # Mock router to return our scraper
                            scraping_service.router.find_scraper_for_url = AsyncMock(return_value=mock_scraper)
                            
                            # Test scraping workflow
                            result = await scraping_service.scrape_url("https://example.com/test")
                            
                            assert result is not None
                            mock_scraper.scrape_content.assert_called_once()

    @pytest.mark.asyncio
    async def test_error_handling_integration(self, scraping_service):
        """Test error handling across the system."""
        with patch.object(scraping_service.manager, 'initialize', side_effect=Exception("Test error")):
            result = await scraping_service.initialize()
            assert result is False

    @pytest.mark.asyncio
    async def test_service_shutdown(self, scraping_service):
        """Test service shutdown."""
        scraping_service.initialized = True
        scraping_service.active_jobs = {}
        
        with patch.object(scraping_service.manager, 'shutdown', return_value=True):
            with patch.object(scraping_service.router, 'shutdown', return_value=True):
                with patch.object(scraping_service.quality_scorer, 'shutdown', return_value=True):
                    with patch.object(scraping_service.pipeline_manager, 'shutdown', return_value=True):
                        
                        result = await scraping_service.shutdown()
                        
                        assert result is True
                        assert scraping_service.initialized is False

    @pytest.mark.asyncio
    async def test_router_shutdown(self, scraping_router):
        """Test router shutdown."""
        await scraping_router.initialize()
        
        # Add a mock scraper
        mock_scraper = AsyncMock()
        mock_scraper.shutdown = AsyncMock(return_value=True)
        scraping_router.scrapers[ScrapingType.GENERAL] = mock_scraper
        
        result = await scraping_router.shutdown()
        
        assert result is True
        assert scraping_router.initialized is False
        assert len(scraping_router.scrapers) == 0

    @pytest.mark.asyncio
    async def test_concurrent_scraping(self, scraping_service):
        """Test concurrent scraping operations."""
        with patch.object(scraping_service, '_register_default_scrapers'):
            with patch.object(scraping_service.manager, 'initialize', return_value=True):
                with patch.object(scraping_service.router, 'initialize', return_value=True):
                    with patch.object(scraping_service.quality_scorer, 'initialize', return_value=True):
                        with patch.object(scraping_service.pipeline_manager, 'initialize', return_value=True):
                            
                            await scraping_service.initialize()
                            
                            # Mock scraper
                            mock_scraper = AsyncMock()
                            mock_scraper.scrape_content = AsyncMock(return_value=AsyncMock(
                                url="https://example.com/test",
                                title="Test Article",
                                content="Test content",
                                metadata={"extraction_method": "test"}
                            ))
                            scraping_service.router.find_scraper_for_url = AsyncMock(return_value=mock_scraper)
                            
                            # Test concurrent scraping
                            urls = [
                                "https://example.com/test1",
                                "https://example.com/test2",
                                "https://example.com/test3"
                            ]
                            
                            tasks = [scraping_service.scrape_url(url) for url in urls]
                            results = await asyncio.gather(*tasks, return_exceptions=True)
                            
                            assert len(results) == 3
                            assert all(not isinstance(result, Exception) for result in results)

    def test_service_info(self, scraping_service):
        """Test service information retrieval."""
        scraping_service.initialized = True
        scraping_service.total_jobs = 10
        scraping_service.successful_jobs = 8
        scraping_service.failed_jobs = 2
        
        info = scraping_service.get_info()
        
        assert info["name"] == "Scraping Service"
        assert info["initialized"] is True
        assert info["total_jobs"] == 10
        assert info["successful_jobs"] == 8
        assert info["failed_jobs"] == 2

    def test_router_info(self, scraping_router):
        """Test router information retrieval."""
        scraping_router.initialized = True
        scraping_router.scrapers = {ScrapingType.GENERAL: AsyncMock()}
        scraping_router.url_patterns = {"test": ScrapingType.GENERAL}
        
        info = scraping_router.get_info()
        
        assert info["initialized"] is True
        assert info["registered_scrapers"] == 1
        assert info["url_patterns"] == 1
