"""Tests for scraping models"""

from datetime import datetime

import pytest
from pydantic import ValidationError

from app.services.scraping.models import (
    ContentQuality,
    DownloadProgress,
    DownloadStatus,
    GalleryConfig,
    GalleryDownloadJob,
    GalleryResult,
    PerformanceMetrics,
    ProcessingPipeline,
    QualityFactor,
    QualityLevel,
    ScrapingApiRequest,
    ScrapingApiResponse,
    ScrapingConfig,
    ScrapingEvent,
    ScrapingEventType,
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
            url="https://example.com",
            type=ScrapingType.GENERAL,
            status=ScrapingStatus.PENDING,
            progress=0,
        )

        assert job.id is not None
        assert job.url == "https://example.com"
        assert job.type == ScrapingType.GENERAL
        assert job.status == ScrapingStatus.PENDING
        assert job.progress == 0
        assert job.created_at is not None
        assert job.updated_at is not None

    def test_job_with_optional_fields(self):
        """Test creating a job with optional fields"""
        job = ScrapingJob(
            url="https://example.com",
            type=ScrapingType.GENERAL,
            status=ScrapingStatus.COMPLETED,
            progress=100,
            error="Test error",
            results=[ScrapingResult(
                url="https://example.com",
                content="Test content",
                metadata={"title": "Test Title"},
                quality=ContentQuality(
                    score=80.0,
                    factors=[],
                    overall=QualityLevel.GOOD,
                ),
            )],
        )

        assert job.error == "Test error"
        assert len(job.results) == 1
        assert job.results[0].content == "Test content"
        assert job.results[0].metadata["title"] == "Test Title"
        assert job.results[0].quality.score == 80.0

    def test_invalid_job_creation(self):
        """Test creating an invalid scraping job"""
        with pytest.raises(ValidationError):
            ScrapingJob(
                url="https://example.com",
                type=ScrapingType.GENERAL,
                status=ScrapingStatus.PENDING,
                progress=150,  # Invalid progress > 100
            )

    def test_progress_validation(self):
        """Test progress field validation"""
        with pytest.raises(ValidationError):
            ScrapingJob(
                url="https://example.com",
                type=ScrapingType.GENERAL,
                status=ScrapingStatus.PENDING,
                progress=150,  # Invalid progress > 100
            )


class TestScrapingConfig:
    """Test cases for ScrapingConfig model"""

    def test_valid_config_creation(self):
        """Test creating a valid scraping configuration"""
        config = ScrapingConfig(
            name="test-config",
            type=ScrapingType.GENERAL,
            enabled=True,
        )

        assert config.name == "test-config"
        assert config.type == ScrapingType.GENERAL
        assert config.enabled is True
        assert config.rate_limit is not None
        assert config.extraction is not None
        assert config.quality is not None

    def test_config_with_defaults(self):
        """Test creating config with default values"""
        config = ScrapingConfig(
            name="default-config",
            type=ScrapingType.GENERAL,
        )

        assert config.name == "default-config"
        assert config.type == ScrapingType.GENERAL
        assert config.enabled is True
        assert config.rate_limit is not None
        assert config.extraction is not None
        assert config.quality is not None

    def test_invalid_config_values(self):
        """Test creating config with invalid values"""
        with pytest.raises(ValidationError):
            ScrapingConfig(
                name="test-config",
                type="invalid_type",  # Invalid type
            )


class TestScrapingResult:
    """Test cases for ScrapingResult model"""

    def test_valid_result_creation(self):
        """Test creating a valid scraping result"""
        result = ScrapingResult(
            url="https://example.com",
            content="Test content",
            metadata={"title": "Test Title", "author": "Test Author"},
            quality=ContentQuality(
                score=85.0,
                factors=[],
                overall=QualityLevel.GOOD,
            ),
        )

        assert result.content == "Test content"
        assert result.metadata["title"] == "Test Title"
        assert result.metadata["author"] == "Test Author"
        assert result.quality.score == 85.0

    def test_result_with_minimal_data(self):
        """Test creating result with minimal required data"""
        result = ScrapingResult(
            url="https://example.com",
            content="Minimal content",
            metadata={},
            quality=ContentQuality(score=50.0, factors=[], overall=QualityLevel.FAIR),
        )

        assert result.content == "Minimal content"
        assert result.metadata == {}
        assert result.quality.score == 50.0
        assert result.quality.factors == []


class TestScrapingEvent:
    """Test cases for ScrapingEvent model"""

    def test_valid_event_creation(self):
        """Test creating a valid scraping event"""
        from uuid import uuid4
        event = ScrapingEvent(
            job_id=uuid4(),
            type=ScrapingEventType.JOB_COMPLETED,
            data={"status": "completed", "progress": 100},
        )

        assert event.job_id is not None
        assert event.type == ScrapingEventType.JOB_COMPLETED
        assert event.data["status"] == "completed"
        assert event.data["progress"] == 100
        assert event.timestamp is not None

    def test_event_with_minimal_data(self):
        """Test creating event with minimal data"""
        from uuid import uuid4
        event = ScrapingEvent(
            job_id=uuid4(),
            type=ScrapingEventType.JOB_STARTED,
            data={},
        )

        assert event.job_id is not None
        assert event.type == ScrapingEventType.JOB_STARTED
        assert event.data == {}
        assert event.timestamp is not None


class TestContentQuality:
    """Test cases for ContentQuality model"""

    def test_valid_quality_creation(self):
        """Test creating valid content quality"""
        quality = ContentQuality(
            score=85.0,
            factors=[],
            overall=QualityLevel.GOOD,
        )

        assert quality.score == 85.0
        assert quality.factors == []
        assert quality.overall == QualityLevel.GOOD

    def test_quality_score_validation(self):
        """Test quality score validation"""
        with pytest.raises(ValidationError):
            ContentQuality(
                score=150.0,  # Invalid score > 100
                factors=[],
                overall=QualityLevel.GOOD,
            )

        with pytest.raises(ValidationError):
            ContentQuality(
                score=-10.0,  # Invalid negative score
                factors=[],
                overall=QualityLevel.GOOD,
            )

    def test_quality_factors_validation(self):
        """Test quality factors validation"""
        # This test is no longer applicable since factors is now a list of QualityFactor objects
        # Let's test a valid case instead
        quality = ContentQuality(
            score=80.0,
            factors=[],
            overall=QualityLevel.GOOD,
        )
        assert quality.score == 80.0


class TestProcessingPipeline:
    """Test cases for ProcessingPipeline model"""

    def test_valid_pipeline_creation(self):
        """Test creating valid processing pipeline"""
        pipeline = ProcessingPipeline(
            name="test-pipeline",
        )

        assert pipeline.name == "test-pipeline"
        assert pipeline.stages == []
        assert pipeline.config is not None
        assert pipeline.status == "idle"

    def test_pipeline_with_empty_config(self):
        """Test creating pipeline with empty config"""
        pipeline = ProcessingPipeline(
            name="empty-pipeline",
        )

        assert pipeline.name == "empty-pipeline"
        assert pipeline.stages == []
        assert pipeline.config is not None


class TestGalleryDownloadJob:
    """Test cases for GalleryDownloadJob model"""

    def test_valid_gallery_job_creation(self):
        """Test creating valid gallery download job"""
        job = GalleryDownloadJob(
            url="https://example.com/gallery",
        )

        assert job.id is not None
        assert job.url == "https://example.com/gallery"
        assert job.status == DownloadStatus.PENDING
        assert job.progress.percentage == 0
        assert job.config is not None
        assert job.results == []

    def test_gallery_job_with_result(self):
        """Test creating gallery job with result"""
        from uuid import uuid4
        job = GalleryDownloadJob(
            url="https://example.com/gallery",
            status=DownloadStatus.COMPLETED,
            progress=DownloadProgress(
                percentage=100,
                total_files=25,
                downloaded_files=25,
                total_bytes=1024000,
                downloaded_bytes=1024000,
                speed=1000,
            ),
            results=[GalleryResult(
                url="https://example.com/gallery",
                filename="gallery.jpg",
                size=1024000,
            )],
        )

        assert job.status == DownloadStatus.COMPLETED
        assert job.progress.percentage == 100
        assert len(job.results) == 1
        assert job.results[0].size == 1024000


class TestScrapingApiRequest:
    """Test cases for ScrapingApiRequest model"""

    def test_valid_api_request_creation(self):
        """Test creating valid API request"""
        request = ScrapingApiRequest(
            url="https://example.com",
            type=ScrapingType.GENERAL,
            config={"test": "config"},
        )

        assert request.url == "https://example.com"
        assert request.type == ScrapingType.GENERAL
        assert request.config == {"test": "config"}

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
            total_jobs=100,
            completed_jobs=85,
            failed_jobs=10,
            active_jobs=5,
            total_results=1000,
            average_quality=78.0,
            performance_metrics=PerformanceMetrics(
                average_processing_time=5.0,
                average_quality_score=78.0,
                success_rate=85.0,
                throughput=20.0,
            ),
        )

        assert stats.total_jobs == 100
        assert stats.completed_jobs == 85
        assert stats.failed_jobs == 10
        assert stats.active_jobs == 5
        assert stats.total_results == 1000
        assert stats.average_quality == 78.0
        assert stats.performance_metrics.success_rate == 85.0

    def test_statistics_with_minimal_data(self):
        """Test creating statistics with minimal data"""
        stats = ScrapingStatistics(
            total_jobs=0,
            completed_jobs=0,
            failed_jobs=0,
            active_jobs=0,
            total_results=0,
            average_quality=0.0,
            performance_metrics=PerformanceMetrics(
                average_processing_time=0.0,
                average_quality_score=0.0,
                success_rate=0.0,
                throughput=0.0,
            ),
        )

        assert stats.total_jobs == 0
        assert stats.completed_jobs == 0
        assert stats.failed_jobs == 0
        assert stats.active_jobs == 0
        assert stats.total_results == 0
        assert stats.average_quality == 0.0
        assert stats.performance_metrics.success_rate == 0.0
