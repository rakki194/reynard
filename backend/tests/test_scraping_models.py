"""Tests for scraping models"""

from datetime import datetime

import pytest
from pydantic import ValidationError

from app.services.scraping.models import (
    ContentQuality,
    GalleryDownloadJob,
    ProcessingPipeline,
    QualityFactor,
    ScrapingApiRequest,
    ScrapingApiResponse,
    ScrapingConfig,
    ScrapingEvent,
    ScrapingJob,
    ScrapingResult,
    ScrapingStatistics,
    ScrapingStatus,
    ScrapingType,
)


class TestScrapingJob:
    """Test cases for ScrapingJob model"""

    def test_valid_job_creation(self):
        """Test creating a valid scraping job"""
        job = ScrapingJob(
            id="test-job-1",
            url="https://example.com",
            type=ScrapingType.GENERAL,
            status=ScrapingStatus.PENDING,
            progress=0,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
        )

        assert job.id == "test-job-1"
        assert job.url == "https://example.com"
        assert job.type == ScrapingType.GENERAL
        assert job.status == ScrapingStatus.PENDING
        assert job.progress == 0
        assert job.createdAt is not None
        assert job.updatedAt is not None

    def test_job_with_optional_fields(self):
        """Test creating a job with optional fields"""
        job = ScrapingJob(
            id="test-job-1",
            url="https://example.com",
            type=ScrapingType.GENERAL,
            status=ScrapingStatus.COMPLETED,
            progress=100,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
            error="Test error",
            result=ScrapingResult(
                content="Test content",
                metadata={"title": "Test Title"},
                quality=ContentQuality(
                    score=0.8,
                    factors={
                        QualityFactor.LENGTH: 0.9,
                        QualityFactor.READABILITY: 0.7,
                    },
                ),
            ),
        )

        assert job.error == "Test error"
        assert job.result is not None
        assert job.result.content == "Test content"
        assert job.result.metadata["title"] == "Test Title"
        assert job.result.quality.score == 0.8

    def test_invalid_job_creation(self):
        """Test creating an invalid scraping job"""
        with pytest.raises(ValidationError):
            ScrapingJob(
                id="test-job-1",
                url="invalid-url",  # Invalid URL
                type=ScrapingType.GENERAL,
                status=ScrapingStatus.PENDING,
                progress=0,
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )

    def test_progress_validation(self):
        """Test progress field validation"""
        with pytest.raises(ValidationError):
            ScrapingJob(
                id="test-job-1",
                url="https://example.com",
                type=ScrapingType.GENERAL,
                status=ScrapingStatus.PENDING,
                progress=150,  # Invalid progress > 100
                createdAt=datetime.now(),
                updatedAt=datetime.now(),
            )


class TestScrapingConfig:
    """Test cases for ScrapingConfig model"""

    def test_valid_config_creation(self):
        """Test creating a valid scraping configuration"""
        config = ScrapingConfig(
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

        assert config.maxDepth == 3
        assert config.concurrency == 5
        assert config.userAgent == "Reynard Test Scraper"
        assert config.timeout == 30000
        assert config.retryAttempts == 3
        assert config.retryDelay == 1000
        assert config.respectRobotsTxt is True
        assert config.followRedirects is True
        assert config.extractImages is True
        assert config.extractLinks is True
        assert config.extractMetadata is True
        assert config.qualityThreshold == 0.7
        assert config.enableCaching is True
        assert config.cacheExpiry == 3600

    def test_config_with_defaults(self):
        """Test creating config with default values"""
        config = ScrapingConfig()

        assert config.maxDepth == 3
        assert config.concurrency == 5
        assert config.userAgent == "Reynard Scraper"
        assert config.timeout == 30000
        assert config.retryAttempts == 3
        assert config.retryDelay == 1000
        assert config.respectRobotsTxt is True
        assert config.followRedirects is True
        assert config.extractImages is True
        assert config.extractLinks is True
        assert config.extractMetadata is True
        assert config.qualityThreshold == 0.7
        assert config.enableCaching is True
        assert config.cacheExpiry == 3600

    def test_invalid_config_values(self):
        """Test creating config with invalid values"""
        with pytest.raises(ValidationError):
            ScrapingConfig(
                maxDepth=-1,  # Invalid negative depth
                concurrency=0,  # Invalid zero concurrency
                timeout=-1000,  # Invalid negative timeout
            )


class TestScrapingResult:
    """Test cases for ScrapingResult model"""

    def test_valid_result_creation(self):
        """Test creating a valid scraping result"""
        result = ScrapingResult(
            content="Test content",
            metadata={"title": "Test Title", "author": "Test Author"},
            quality=ContentQuality(
                score=0.85,
                factors={
                    QualityFactor.LENGTH: 0.9,
                    QualityFactor.READABILITY: 0.8,
                    QualityFactor.RELEVANCE: 0.85,
                },
            ),
        )

        assert result.content == "Test content"
        assert result.metadata["title"] == "Test Title"
        assert result.metadata["author"] == "Test Author"
        assert result.quality.score == 0.85
        assert result.quality.factors[QualityFactor.LENGTH] == 0.9

    def test_result_with_minimal_data(self):
        """Test creating result with minimal required data"""
        result = ScrapingResult(
            content="Minimal content",
            metadata={},
            quality=ContentQuality(score=0.5, factors={}),
        )

        assert result.content == "Minimal content"
        assert result.metadata == {}
        assert result.quality.score == 0.5
        assert result.quality.factors == {}


class TestScrapingEvent:
    """Test cases for ScrapingEvent model"""

    def test_valid_event_creation(self):
        """Test creating a valid scraping event"""
        event = ScrapingEvent(
            jobId="test-job-1",
            type="job_completed",
            data={"status": "completed", "progress": 100},
            timestamp=datetime.now(),
        )

        assert event.jobId == "test-job-1"
        assert event.type == "job_completed"
        assert event.data["status"] == "completed"
        assert event.data["progress"] == 100
        assert event.timestamp is not None

    def test_event_with_minimal_data(self):
        """Test creating event with minimal data"""
        event = ScrapingEvent(
            jobId="test-job-1",
            type="job_started",
            data={},
            timestamp=datetime.now(),
        )

        assert event.jobId == "test-job-1"
        assert event.type == "job_started"
        assert event.data == {}
        assert event.timestamp is not None


class TestContentQuality:
    """Test cases for ContentQuality model"""

    def test_valid_quality_creation(self):
        """Test creating valid content quality"""
        quality = ContentQuality(
            score=0.85,
            factors={
                QualityFactor.LENGTH: 0.9,
                QualityFactor.READABILITY: 0.8,
                QualityFactor.RELEVANCE: 0.85,
                QualityFactor.COMPLETENESS: 0.9,
                QualityFactor.ACCURACY: 0.8,
            },
        )

        assert quality.score == 0.85
        assert quality.factors[QualityFactor.LENGTH] == 0.9
        assert quality.factors[QualityFactor.READABILITY] == 0.8
        assert quality.factors[QualityFactor.RELEVANCE] == 0.85
        assert quality.factors[QualityFactor.COMPLETENESS] == 0.9
        assert quality.factors[QualityFactor.ACCURACY] == 0.8

    def test_quality_score_validation(self):
        """Test quality score validation"""
        with pytest.raises(ValidationError):
            ContentQuality(
                score=1.5,  # Invalid score > 1.0
                factors={},
            )

        with pytest.raises(ValidationError):
            ContentQuality(
                score=-0.1,  # Invalid negative score
                factors={},
            )

    def test_quality_factors_validation(self):
        """Test quality factors validation"""
        with pytest.raises(ValidationError):
            ContentQuality(
                score=0.8,
                factors={
                    QualityFactor.LENGTH: 1.5,  # Invalid factor > 1.0
                },
            )


class TestProcessingPipeline:
    """Test cases for ProcessingPipeline model"""

    def test_valid_pipeline_creation(self):
        """Test creating valid processing pipeline"""
        pipeline = ProcessingPipeline(
            stages=["extraction", "cleaning", "categorization", "quality_assessment"],
            config={
                "extraction": {"method": "beautifulsoup"},
                "cleaning": {"remove_scripts": True},
                "categorization": {"use_ml": True},
                "quality_assessment": {"threshold": 0.7},
            },
        )

        assert pipeline.stages == [
            "extraction",
            "cleaning",
            "categorization",
            "quality_assessment",
        ]
        assert pipeline.config["extraction"]["method"] == "beautifulsoup"
        assert pipeline.config["cleaning"]["remove_scripts"] is True
        assert pipeline.config["categorization"]["use_ml"] is True
        assert pipeline.config["quality_assessment"]["threshold"] == 0.7

    def test_pipeline_with_empty_config(self):
        """Test creating pipeline with empty config"""
        pipeline = ProcessingPipeline(
            stages=["extraction"],
            config={},
        )

        assert pipeline.stages == ["extraction"]
        assert pipeline.config == {}


class TestGalleryDownloadJob:
    """Test cases for GalleryDownloadJob model"""

    def test_valid_gallery_job_creation(self):
        """Test creating valid gallery download job"""
        job = GalleryDownloadJob(
            id="gallery-job-1",
            url="https://example.com/gallery",
            status=ScrapingStatus.PENDING,
            progress=0,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
            galleryDlConfig={
                "extractor": "generic",
                "output": "/downloads",
                "format": "jpg",
            },
        )

        assert job.id == "gallery-job-1"
        assert job.url == "https://example.com/gallery"
        assert job.status == ScrapingStatus.PENDING
        assert job.progress == 0
        assert job.galleryDlConfig["extractor"] == "generic"
        assert job.galleryDlConfig["output"] == "/downloads"
        assert job.galleryDlConfig["format"] == "jpg"

    def test_gallery_job_with_result(self):
        """Test creating gallery job with result"""
        job = GalleryDownloadJob(
            id="gallery-job-1",
            url="https://example.com/gallery",
            status=ScrapingStatus.COMPLETED,
            progress=100,
            createdAt=datetime.now(),
            updatedAt=datetime.now(),
            galleryDlConfig={},
            result={
                "files_downloaded": 25,
                "total_size_bytes": 1024000,
                "download_path": "/downloads/gallery",
            },
        )

        assert job.status == ScrapingStatus.COMPLETED
        assert job.progress == 100
        assert job.result["files_downloaded"] == 25
        assert job.result["total_size_bytes"] == 1024000
        assert job.result["download_path"] == "/downloads/gallery"


class TestScrapingApiRequest:
    """Test cases for ScrapingApiRequest model"""

    def test_valid_api_request_creation(self):
        """Test creating valid API request"""
        request = ScrapingApiRequest(
            url="https://example.com",
            type=ScrapingType.GENERAL,
            config=ScrapingConfig(),
        )

        assert request.url == "https://example.com"
        assert request.type == ScrapingType.GENERAL
        assert request.config is not None

    def test_api_request_without_config(self):
        """Test creating API request without config"""
        request = ScrapingApiRequest(
            url="https://example.com",
            type=ScrapingType.GENERAL,
        )

        assert request.url == "https://example.com"
        assert request.type == ScrapingType.GENERAL
        assert request.config is None


class TestScrapingApiResponse:
    """Test cases for ScrapingApiResponse model"""

    def test_valid_api_response_creation(self):
        """Test creating valid API response"""
        response = ScrapingApiResponse(
            success=True,
            data={"jobId": "test-job-1", "status": "created"},
            message="Job created successfully",
        )

        assert response.success is True
        assert response.data["jobId"] == "test-job-1"
        assert response.data["status"] == "created"
        assert response.message == "Job created successfully"

    def test_api_response_with_error(self):
        """Test creating API response with error"""
        response = ScrapingApiResponse(
            success=False,
            error="Invalid URL provided",
            message="Failed to create job",
        )

        assert response.success is False
        assert response.error == "Invalid URL provided"
        assert response.message == "Failed to create job"
        assert response.data is None


class TestScrapingStatistics:
    """Test cases for ScrapingStatistics model"""

    def test_valid_statistics_creation(self):
        """Test creating valid scraping statistics"""
        stats = ScrapingStatistics(
            totalJobs=100,
            completedJobs=85,
            failedJobs=10,
            runningJobs=5,
            averageDurationMs=5000,
            dataExtractedBytes=1024000,
            mostActiveScraper="general",
            performanceMetrics={
                "successRate": 0.85,
                "averageQuality": 0.78,
                "throughputPerHour": 20,
                "errorRate": 0.1,
            },
            lastUpdated=datetime.now(),
        )

        assert stats.totalJobs == 100
        assert stats.completedJobs == 85
        assert stats.failedJobs == 10
        assert stats.runningJobs == 5
        assert stats.averageDurationMs == 5000
        assert stats.dataExtractedBytes == 1024000
        assert stats.mostActiveScraper == "general"
        assert stats.performanceMetrics["successRate"] == 0.85
        assert stats.performanceMetrics["averageQuality"] == 0.78
        assert stats.performanceMetrics["throughputPerHour"] == 20
        assert stats.performanceMetrics["errorRate"] == 0.1
        assert stats.lastUpdated is not None

    def test_statistics_with_minimal_data(self):
        """Test creating statistics with minimal data"""
        stats = ScrapingStatistics(
            totalJobs=0,
            completedJobs=0,
            failedJobs=0,
            runningJobs=0,
            averageDurationMs=0,
            dataExtractedBytes=0,
            mostActiveScraper="none",
            performanceMetrics={},
            lastUpdated=datetime.now(),
        )

        assert stats.totalJobs == 0
        assert stats.completedJobs == 0
        assert stats.failedJobs == 0
        assert stats.runningJobs == 0
        assert stats.averageDurationMs == 0
        assert stats.dataExtractedBytes == 0
        assert stats.mostActiveScraper == "none"
        assert stats.performanceMetrics == {}
        assert stats.lastUpdated is not None
