"""
Scraping Services for Reynard Backend

This module provides comprehensive scraping and content extraction capabilities,
ported from Pawprint with enhanced integration for the Reynard ecosystem.
"""

from .extractors import (
    BaseScraper,
    GeneralScraper,
    GitHubScraper,
    HackerNewsScraper,
    TwitterScraper,
    WikipediaScraper,
)
from .models import (
    ContentQuality,
    GalleryDownloadJob,
    ProcessingPipeline,
    ScrapingApiRequest,
    ScrapingApiResponse,
    ScrapingConfig,
    ScrapingEvent,
    ScrapingJob,
    ScrapingResult,
    ScrapingStatistics,
)
from .pipeline import (
    ContentCategorizer,
    ContentCleaner,
    ContentDeduplicator,
    ContentExtractor,
    ProcessingPipelineManager,
)
from .quality import (
    ContentQualityScorer,
    QualityFactor,
    QualityLevel,
    WikipediaQualityScorer,
)
from .scraping_manager import ScrapingManager
from .scraping_router import ScrapingRouter
from .scraping_service import ScrapingService

__all__ = [
    "BaseScraper",
    "ContentCategorizer",
    "ContentCleaner",
    "ContentDeduplicator",
    "ContentExtractor",
    "ContentQuality",
    "ContentQualityScorer",
    "GalleryDownloadJob",
    "GeneralScraper",
    "GitHubScraper",
    "HackerNewsScraper",
    "ProcessingPipeline",
    "ProcessingPipelineManager",
    "QualityFactor",
    "QualityLevel",
    "ScrapingApiRequest",
    "ScrapingApiResponse",
    "ScrapingConfig",
    "ScrapingEvent",
    "ScrapingJob",
    "ScrapingManager",
    "ScrapingResult",
    "ScrapingRouter",
    "ScrapingService",
    "ScrapingStatistics",
    "TwitterScraper",
    "WikipediaQualityScorer",
    "WikipediaScraper",
]
