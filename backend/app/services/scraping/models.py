"""Scraping Models for Reynard Backend

Data models and schemas for the scraping service.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ScrapingType(str, Enum):
    """Types of scraping operations."""

    GENERAL = "general"
    ENHANCED = "enhanced"
    HACKER_NEWS = "hackernews"
    GITHUB = "github"
    STACKOVERFLOW = "stackoverflow"
    TWITTER = "twitter"
    WIKIPEDIA = "wikipedia"
    WIKIFUR = "wikifur"
    E621_WIKI = "e621_wiki"
    ARS_TECHNICA = "arstechnica"
    WORDPRESS = "wordpress"
    TECHCRUNCH = "techcrunch"
    WIRED = "wired"
    GALLERY_DL = "gallery_dl"
    MULTI_TIER = "multi_tier"


class ScrapingStatus(str, Enum):
    """Status of scraping jobs."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class QualityLevel(str, Enum):
    """Content quality levels."""

    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class CategoryType(str, Enum):
    """Content category types."""

    NEWS = "news"
    TECHNICAL = "technical"
    SOCIAL = "social"
    WIKI = "wiki"
    GALLERY = "gallery"
    FORUM = "forum"
    BLOG = "blog"
    DOCUMENTATION = "documentation"
    OTHER = "other"


class DownloadStatus(str, Enum):
    """Gallery download status."""

    PENDING = "pending"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScrapingEventType(str, Enum):
    """Types of scraping events."""

    JOB_CREATED = "job_created"
    JOB_STARTED = "job_started"
    JOB_PROGRESS = "job_progress"
    JOB_COMPLETED = "job_completed"
    JOB_FAILED = "job_failed"
    JOB_CANCELLED = "job_cancelled"
    RESULT_EXTRACTED = "result_extracted"
    QUALITY_ASSESSED = "quality_assessed"
    CONTENT_CATEGORIZED = "content_categorized"


class QualityFactor(BaseModel):
    """Quality assessment factor."""

    name: str
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1)
    description: str


class ContentQuality(BaseModel):
    """Content quality assessment."""

    score: float = Field(ge=0, le=100)
    factors: list[QualityFactor]
    overall: QualityLevel


class ContentCategory(BaseModel):
    """Content categorization."""

    type: CategoryType
    confidence: float = Field(ge=0, le=1)
    tags: list[str] = Field(default_factory=list)
    subcategories: list[str] | None = None


class ScrapingResult(BaseModel):
    """Scraping result data."""

    id: UUID = Field(default_factory=uuid4)
    job_id: UUID | None = None
    url: str
    title: str | None = None
    content: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    extracted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    quality: ContentQuality | dict[str, Any] = Field(default_factory=dict)
    category: ContentCategory | None = None


class RateLimitConfig(BaseModel):
    """Rate limiting configuration."""

    requests_per_minute: int = Field(default=60, ge=1)
    requests_per_hour: int = Field(default=1000, ge=1)
    delay_between_requests: float = Field(default=1.0, ge=0)
    respect_robots_txt: bool = Field(default=True)


class ExtractionConfig(BaseModel):
    """Content extraction configuration."""

    extract_images: bool = Field(default=True)
    extract_links: bool = Field(default=True)
    extract_metadata: bool = Field(default=True)
    clean_content: bool = Field(default=True)
    remove_ads: bool = Field(default=True)
    preserve_formatting: bool = Field(default=True)


class QualityConfig(BaseModel):
    """Quality assessment configuration."""

    min_score: float = Field(default=60, ge=0, le=100)
    enable_filtering: bool = Field(default=True)
    quality_factors: list[QualityFactor] = Field(default_factory=list)


class ScrapingConfig(BaseModel):
    """Scraping configuration."""

    name: str
    type: ScrapingType
    enabled: bool = Field(default=True)
    rate_limit: RateLimitConfig = Field(default_factory=RateLimitConfig)
    extraction: ExtractionConfig = Field(default_factory=ExtractionConfig)
    quality: QualityConfig = Field(default_factory=QualityConfig)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ScrapingJob(BaseModel):
    """Scraping job data."""

    id: UUID = Field(default_factory=uuid4)
    url: str
    type: ScrapingType
    status: ScrapingStatus = Field(default=ScrapingStatus.PENDING)
    progress: float = Field(default=0, ge=0, le=100)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    results: list[ScrapingResult] = Field(default_factory=list)
    config: ScrapingConfig | None = None


class DownloadProgress(BaseModel):
    """Download progress information."""

    percentage: float = Field(ge=0, le=100)
    current_file: str | None = None
    total_files: int = Field(ge=0)
    downloaded_files: int = Field(ge=0)
    total_bytes: int = Field(ge=0)
    downloaded_bytes: int = Field(ge=0)
    speed: float = Field(ge=0)  # bytes per second
    estimated_time: float | None = None  # seconds


class GalleryConfig(BaseModel):
    """Gallery download configuration."""

    output_directory: str = Field(default="./downloads")
    filename: str = Field(default="{title}_{id}")
    extractor_options: dict[str, Any] = Field(default_factory=dict)
    postprocessors: list[str] = Field(default_factory=list)
    quality: str = Field(default="best")
    format: str = Field(default="original")


class GalleryResult(BaseModel):
    """Gallery download result."""

    id: UUID = Field(default_factory=uuid4)
    url: str
    filename: str
    size: int = Field(ge=0)
    downloaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, Any] = Field(default_factory=dict)


class GalleryDownloadJob(BaseModel):
    """Gallery download job."""

    id: UUID = Field(default_factory=uuid4)
    url: str
    status: DownloadStatus = Field(default=DownloadStatus.PENDING)
    progress: DownloadProgress = Field(
        default_factory=lambda: DownloadProgress(
            percentage=0,
            total_files=0,
            downloaded_files=0,
            total_bytes=0,
            downloaded_bytes=0,
            speed=0,
        ),
    )
    config: GalleryConfig = Field(default_factory=GalleryConfig)
    results: list[GalleryResult] = Field(default_factory=list)
    error: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ScrapingEvent(BaseModel):
    """Scraping event data."""

    type: ScrapingEventType
    job_id: UUID
    data: dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CategoryStats(BaseModel):
    """Category statistics."""

    category: CategoryType
    count: int = Field(ge=0)
    average_quality: float = Field(ge=0, le=100)
    percentage: float = Field(ge=0, le=100)


class PerformanceMetrics(BaseModel):
    """Performance metrics."""

    average_processing_time: float = Field(ge=0)
    average_quality_score: float = Field(ge=0, le=100)
    success_rate: float = Field(ge=0, le=100)
    throughput: float = Field(ge=0)  # results per hour


class ScrapingStatistics(BaseModel):
    """Scraping statistics."""

    total_jobs: int = Field(ge=0)
    completed_jobs: int = Field(ge=0)
    failed_jobs: int = Field(ge=0)
    active_jobs: int = Field(ge=0)
    total_results: int = Field(ge=0)
    average_quality: float = Field(ge=0, le=100)
    top_categories: list[CategoryStats] = Field(default_factory=list)
    performance_metrics: PerformanceMetrics


class ScrapingApiRequest(BaseModel):
    """API request for scraping operations."""

    url: str
    type: ScrapingType | None = None
    config: dict[str, Any] | None = None
    options: dict[str, Any] | None = None


class ScrapingApiResponse(BaseModel):
    """API response wrapper."""

    success: bool
    data: Any | None = None
    error: str | None = None
    message: str | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProcessingStage(BaseModel):
    """Processing pipeline stage."""

    id: UUID = Field(default_factory=uuid4)
    name: str
    type: str
    order: int = Field(ge=0)
    config: dict[str, Any] = Field(default_factory=dict)
    status: str = Field(default="pending")
    results: dict[str, Any] | None = None


class PipelineConfig(BaseModel):
    """Processing pipeline configuration."""

    parallel: bool = Field(default=False)
    max_concurrency: int = Field(default=4, ge=1)
    timeout: int = Field(default=300, ge=1)  # seconds
    retry_attempts: int = Field(default=3, ge=0)
    quality_threshold: float = Field(default=60, ge=0, le=100)


class ProcessingPipeline(BaseModel):
    """Processing pipeline."""

    id: UUID = Field(default_factory=uuid4)
    name: str
    stages: list[ProcessingStage] = Field(default_factory=list)
    config: PipelineConfig = Field(default_factory=PipelineConfig)
    status: str = Field(default="idle")
