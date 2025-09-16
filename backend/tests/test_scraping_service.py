"""
Tests for the scraping service
"""

from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest

from app.services.scraping.extractors.general_scraper import GeneralScraper
from app.services.scraping.models import (
    ScrapingConfig,
    ScrapingEvent,
    ScrapingJob,
    ScrapingStatus,
    ScrapingType,
)
from app.services.scraping.scraping_service import ScrapingService


class TestScrapingService:
    """Test cases for ScrapingService"""

    @pytest.fixture
    def service(self):
        """Create a ScrapingService instance for testing"""
        return ScrapingService()

    @pytest.fixture
    def sample_job(self):
        """Create a sample scraping job"""
        return ScrapingJob(
            id="test-job-1",
            url="https://example.com",
            type=ScrapingType.GENERAL,
            status=ScrapingStatus.PENDING,
            progress=0,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

    @pytest.fixture
    def sample_config(self):
        """Create a sample scraping configuration"""
        return ScrapingConfig(
            maxDepth=3,
            concurrency=5,
            userAgent="Reynard Test Scraper",
            timeout=30000,
            retryAttempts=3,
            retryDelay=1000,
            respectRobotsTxt=True,
            followRedirects=True,
            extractImages=True,
            extractLinks=True,
            extractMetadata=True,
            qualityThreshold=0.7,
            enableCaching=True,
            cacheExpiry=3600,
        )

    @pytest.mark.asyncio
    async def test_initialize(self, service):
        """Test service initialization"""
        await service.initialize()
        assert service.is_initialized is True
        assert service.scraping_manager is not None
        assert service.scraping_router is not None

    @pytest.mark.asyncio
    async def test_shutdown(self, service):
        """Test service shutdown"""
        await service.initialize()
        await service.shutdown()
        assert service.is_initialized is False

    @pytest.mark.asyncio
    async def test_create_job(self, service, sample_job):
        """Test job creation"""
        await service.initialize()

        with patch.object(
            service.scraping_manager, "create_job", return_value=sample_job
        ) as mock_create:
            result = await service.create_job(
                url="https://example.com", scraping_type=ScrapingType.GENERAL
            )

            assert result == sample_job
            mock_create.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_job(self, service, sample_job):
        """Test job retrieval"""
        await service.initialize()

        with patch.object(
            service.scraping_manager, "get_job", return_value=sample_job
        ) as mock_get:
            result = await service.get_job("test-job-1")

            assert result == sample_job
            mock_get.assert_called_once_with("test-job-1")

    @pytest.mark.asyncio
    async def test_get_jobs(self, service, sample_job):
        """Test job list retrieval"""
        await service.initialize()

        jobs = [sample_job]
        with patch.object(
            service.scraping_manager, "get_jobs", return_value=jobs
        ) as mock_get:
            result = await service.get_jobs()

            assert result == jobs
            mock_get.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_job(self, service):
        """Test job cancellation"""
        await service.initialize()

        with patch.object(
            service.scraping_manager, "cancel_job", return_value=True
        ) as mock_cancel:
            result = await service.cancel_job("test-job-1")

            assert result is True
            mock_cancel.assert_called_once_with("test-job-1")

    @pytest.mark.asyncio
    async def test_delete_job(self, service):
        """Test job deletion"""
        await service.initialize()

        with patch.object(
            service.scraping_manager, "delete_job", return_value=True
        ) as mock_delete:
            result = await service.delete_job("test-job-1")

            assert result is True
            mock_delete.assert_called_once_with("test-job-1")

    @pytest.mark.asyncio
    async def test_get_config(self, service, sample_config):
        """Test configuration retrieval"""
        await service.initialize()

        with patch.object(service, "config", sample_config):
            result = await service.get_config()

            assert result == sample_config

    @pytest.mark.asyncio
    async def test_update_config(self, service, sample_config):
        """Test configuration update"""
        await service.initialize()

        new_config = ScrapingConfig(
            maxDepth=5,
            concurrency=10,
            userAgent="Updated Scraper",
            timeout=60000,
            retryAttempts=5,
            retryDelay=2000,
            respectRobotsTxt=True,
            followRedirects=True,
            extractImages=True,
            extractLinks=True,
            extractMetadata=True,
            qualityThreshold=0.8,
            enableCaching=True,
            cacheExpiry=7200,
        )

        with patch.object(service, "config", new_config):
            result = await service.update_config(new_config)

            assert result == new_config

    @pytest.mark.asyncio
    async def test_get_statistics(self, service):
        """Test statistics retrieval"""
        await service.initialize()

        expected_stats = {
            "totalJobs": 100,
            "completedJobs": 85,
            "failedJobs": 10,
            "runningJobs": 5,
            "averageDurationMs": 5000,
            "dataExtractedBytes": 1024000,
            "mostActiveScraper": "general",
        }

        with patch.object(
            service.scraping_manager, "get_statistics", return_value=expected_stats
        ) as mock_stats:
            result = await service.get_statistics()

            assert result == expected_stats
            mock_stats.assert_called_once()

    @pytest.mark.asyncio
    async def test_emit_event(self, service):
        """Test event emission"""
        await service.initialize()

        event = ScrapingEvent(
            jobId="test-job-1",
            type="job_completed",
            data={"status": "completed"},
            timestamp=datetime.now(),
        )

        with patch.object(service, "event_emitter") as mock_emitter:
            await service.emit_event(event)
            mock_emitter.emit.assert_called_once_with("scraping_event", event)

    @pytest.mark.asyncio
    async def test_health_check(self, service):
        """Test health check"""
        await service.initialize()

        result = await service.health_check()

        assert result["status"] == "healthy"
        assert result["service"] == "scraping"
        assert result["initialized"] is True

    @pytest.mark.asyncio
    async def test_health_check_not_initialized(self, service):
        """Test health check when not initialized"""
        result = await service.health_check()

        assert result["status"] == "unhealthy"
        assert result["service"] == "scraping"
        assert result["initialized"] is False


class TestGeneralScraper:
    """Test cases for GeneralScraper"""

    @pytest.fixture
    def scraper(self):
        """Create a GeneralScraper instance for testing"""
        return GeneralScraper()

    @pytest.mark.asyncio
    async def test_can_handle_url(self, scraper):
        """Test URL handling capability"""
        assert await scraper.can_handle_url("https://example.com") is True
        assert await scraper.can_handle_url("http://test.com") is True
        assert await scraper.can_handle_url("ftp://example.com") is False

    @pytest.mark.asyncio
    async def test_scrape_content(self, scraper):
        """Test content scraping"""
        with patch("aiohttp.ClientSession.get") as mock_get:
            # Mock the response
            mock_response = AsyncMock()
            mock_response.status = 200
            mock_response.text.return_value = """
            <html>
                <head><title>Test Page</title></head>
                <body>
                    <h1>Test Content</h1>
                    <p>This is test content.</p>
                    <img src="test.jpg" alt="Test Image">
                    <a href="test.html">Test Link</a>
                </body>
            </html>
            """
            mock_get.return_value.__aenter__.return_value = mock_response

            result = await scraper.scrape_content("https://example.com")

            assert result is not None
            assert result.url == "https://example.com"
            assert "Test Content" in result.content
            assert result.metadata["title"] == "Test Page"

    @pytest.mark.asyncio
    async def test_scrape_content_error(self, scraper):
        """Test content scraping with error"""
        with patch("aiohttp.ClientSession.get") as mock_get:
            mock_get.side_effect = Exception("Network error")

            with pytest.raises(Exception, match="Network error"):
                await scraper.scrape_content("https://example.com")

    @pytest.mark.asyncio
    async def test_scrape_content_http_error(self, scraper):
        """Test content scraping with HTTP error"""
        with patch("aiohttp.ClientSession.get") as mock_get:
            mock_response = AsyncMock()
            mock_response.status = 404
            mock_response.text.return_value = "Not Found"
            mock_get.return_value.__aenter__.return_value = mock_response

            with pytest.raises(Exception, match="HTTP 404"):
                await scraper.scrape_content("https://example.com")


class TestScrapingManager:
    """Test cases for ScrapingManager"""

    @pytest.fixture
    def manager(self):
        """Create a ScrapingManager instance for testing"""
        from app.services.scraping.scraping_manager import ScrapingManager

        return ScrapingManager()

    @pytest.mark.asyncio
    async def test_create_job(self, manager):
        """Test job creation in manager"""
        job = await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )

        assert job is not None
        assert job.url == "https://example.com"
        assert job.type == ScrapingType.GENERAL
        assert job.status == ScrapingStatus.PENDING

    @pytest.mark.asyncio
    async def test_get_job(self, manager):
        """Test job retrieval from manager"""
        job = await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )

        retrieved_job = await manager.get_job(job.id)
        assert retrieved_job == job

    @pytest.mark.asyncio
    async def test_get_jobs(self, manager):
        """Test job list retrieval from manager"""
        job1 = await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )
        job2 = await manager.create_job(
            url="https://test.com", scraping_type=ScrapingType.GENERAL
        )

        jobs = await manager.get_jobs()
        assert len(jobs) == 2
        assert job1 in jobs
        assert job2 in jobs

    @pytest.mark.asyncio
    async def test_cancel_job(self, manager):
        """Test job cancellation in manager"""
        job = await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )

        result = await manager.cancel_job(job.id)
        assert result is True

        updated_job = await manager.get_job(job.id)
        assert updated_job.status == ScrapingStatus.CANCELLED

    @pytest.mark.asyncio
    async def test_delete_job(self, manager):
        """Test job deletion in manager"""
        job = await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )

        result = await manager.delete_job(job.id)
        assert result is True

        with pytest.raises(ValueError, match="Job not found"):
            await manager.get_job(job.id)

    @pytest.mark.asyncio
    async def test_get_statistics(self, manager):
        """Test statistics retrieval from manager"""
        await manager.create_job(
            url="https://example.com", scraping_type=ScrapingType.GENERAL
        )

        stats = await manager.get_statistics()
        assert stats["totalJobs"] == 1
        assert stats["pendingJobs"] == 1
        assert stats["completedJobs"] == 0
        assert stats["failedJobs"] == 0
        assert stats["runningJobs"] == 0
