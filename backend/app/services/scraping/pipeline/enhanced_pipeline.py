"""Enhanced content processing pipeline with multiple stages and quality assessment.

This module provides a comprehensive pipeline for processing scraped content
through multiple stages including cleaning, deduplication, quality scoring,
and categorization.
"""

import hashlib
import logging
import re
from datetime import datetime
from typing import Any

from ..models import ScrapingResult


class EnhancedContentPipeline:
    """Enhanced content processing pipeline with multiple stages.

    Pipeline stages:
    1. Content Cleaning - Remove unwanted elements and normalize formatting
    2. Content Deduplication - Identify and handle duplicate content
    3. Quality Assessment - Score content quality based on multiple factors
    4. Content Categorization - Classify content into categories
    5. Content Enrichment - Add metadata and enhance content
    """

    def __init__(self, logger: logging.Logger | None = None):
        """Initialize the enhanced content pipeline."""
        self.logger = logger or logging.getLogger(__name__)
        self.content_fingerprints = set()
        self.processing_stats = {
            "total_processed": 0,
            "duplicates_found": 0,
            "quality_scores": [],
            "categories": {},
        }

    async def process_content(self, result: ScrapingResult) -> ScrapingResult:
        """Process content through the complete pipeline.

        Args:
            result: ScrapingResult to process

        Returns:
            Processed ScrapingResult

        """
        try:
            self.logger.info(f"Processing content from {result.url}")

            # Stage 1: Content Cleaning
            result = await self._clean_content(result)

            # Stage 2: Content Deduplication
            result = await self._deduplicate_content(result)

            # Stage 3: Quality Assessment
            result = await self._assess_quality(result)

            # Stage 4: Content Categorization
            result = await self._categorize_content(result)

            # Stage 5: Content Enrichment
            result = await self._enrich_content(result)

            # Update statistics
            self.processing_stats["total_processed"] += 1
            if result.metadata.get("is_duplicate"):
                self.processing_stats["duplicates_found"] += 1

            quality_score = result.quality.get("score", 0)
            self.processing_stats["quality_scores"].append(quality_score)

            # Update category statistics
            category = result.metadata.get("category", "unknown")
            self.processing_stats["categories"][category] = (
                self.processing_stats["categories"].get(category, 0) + 1
            )

            self.logger.info(f"Content processing completed for {result.url}")
            return result

        except Exception as e:
            self.logger.error(f"Content processing failed for {result.url}: {e}")
            result.metadata["processing_error"] = str(e)
            return result

    async def _clean_content(self, result: ScrapingResult) -> ScrapingResult:
        """Clean and normalize content."""
        try:
            content = result.content

            # Remove HTML tags if present
            content = re.sub(r"<[^>]+>", "", content)

            # Remove excessive whitespace
            content = re.sub(r"\s+", " ", content)

            # Remove common unwanted patterns
            unwanted_patterns = [
                r"Advertisement",
                r"Subscribe to.*?newsletter",
                r"Follow us on.*?social media",
                r"Share this.*?article",
                r"Read more.*?stories",
                r"Related.*?articles",
                r"You may also like",
                r"Recommended for you",
                r"Sponsored content",
                r"This content is sponsored",
            ]

            for pattern in unwanted_patterns:
                content = re.sub(pattern, "", content, flags=re.IGNORECASE)

            # Remove URLs (but keep the original URL in metadata)
            content = re.sub(r"https?://[^\s]+", "", content)

            # Clean up title
            title = result.title
            title = re.sub(r"\s+", " ", title)
            title = title.strip()

            # Update result
            result.content = content.strip()
            result.title = title

            # Add cleaning metadata
            result.metadata["cleaning_applied"] = True
            result.metadata["original_content_length"] = len(result.content)

            return result

        except Exception as e:
            self.logger.error(f"Content cleaning failed: {e}")
            result.metadata["cleaning_error"] = str(e)
            return result

    async def _deduplicate_content(self, result: ScrapingResult) -> ScrapingResult:
        """Check for and handle duplicate content."""
        try:
            # Create content fingerprint
            content_hash = self._create_content_fingerprint(result)

            # Check if we've seen this content before
            if content_hash in self.content_fingerprints:
                result.metadata["is_duplicate"] = True
                result.metadata["duplicate_hash"] = content_hash
                result.quality["score"] = (
                    result.quality.get("score", 0) * 0.5
                )  # Reduce quality for duplicates
                self.logger.info(f"Duplicate content detected for {result.url}")
            else:
                result.metadata["is_duplicate"] = False
                self.content_fingerprints.add(content_hash)

            result.metadata["content_fingerprint"] = content_hash
            return result

        except Exception as e:
            self.logger.error(f"Content deduplication failed: {e}")
            result.metadata["deduplication_error"] = str(e)
            return result

    def _create_content_fingerprint(self, result: ScrapingResult) -> str:
        """Create a fingerprint for content deduplication."""
        # Combine title and content for fingerprinting
        fingerprint_data = f"{result.title}|{result.content}"

        # Normalize for fingerprinting
        fingerprint_data = re.sub(r"\s+", " ", fingerprint_data.lower())
        fingerprint_data = re.sub(r"[^\w\s]", "", fingerprint_data)

        # Create hash
        return hashlib.md5(fingerprint_data.encode()).hexdigest()

    async def _assess_quality(self, result: ScrapingResult) -> ScrapingResult:
        """Assess content quality and update quality score."""
        try:
            quality_factors = result.quality.get("factors", {})

            # Content length factor
            content_length = len(result.content)
            if content_length > 1000:
                quality_factors["content_length_score"] = 1.0
            elif content_length > 500:
                quality_factors["content_length_score"] = 0.8
            elif content_length > 100:
                quality_factors["content_length_score"] = 0.6
            elif content_length > 50:
                quality_factors["content_length_score"] = 0.4
            else:
                quality_factors["content_length_score"] = 0.2

            # Title quality factor
            title_length = len(result.title)
            if 10 <= title_length <= 100:
                quality_factors["title_quality_score"] = 1.0
            elif 5 <= title_length <= 150:
                quality_factors["title_quality_score"] = 0.8
            else:
                quality_factors["title_quality_score"] = 0.5

            # Metadata completeness factor
            metadata_score = 0.0
            if result.metadata.get("author"):
                metadata_score += 0.2
            if result.metadata.get("timestamp"):
                metadata_score += 0.2
            if result.metadata.get("source"):
                metadata_score += 0.2
            if result.metadata.get("extraction_method"):
                metadata_score += 0.2
            if result.metadata.get("categories"):
                metadata_score += 0.2

            quality_factors["metadata_completeness_score"] = metadata_score

            # Readability factor (simple word/sentence ratio)
            sentences = re.split(r"[.!?]+", result.content)
            words = result.content.split()

            if len(sentences) > 0 and len(words) > 0:
                avg_words_per_sentence = len(words) / len(sentences)
                if 10 <= avg_words_per_sentence <= 20:
                    quality_factors["readability_score"] = 1.0
                elif 5 <= avg_words_per_sentence <= 30:
                    quality_factors["readability_score"] = 0.8
                else:
                    quality_factors["readability_score"] = 0.6
            else:
                quality_factors["readability_score"] = 0.0

            # Calculate overall quality score
            scores = [
                quality_factors.get("content_length_score", 0),
                quality_factors.get("title_quality_score", 0),
                quality_factors.get("metadata_completeness_score", 0),
                quality_factors.get("readability_score", 0),
            ]

            # Weight the scores
            weights = [0.3, 0.2, 0.2, 0.3]
            overall_score = sum(
                score * weight for score, weight in zip(scores, weights, strict=False)
            )

            # Apply duplicate penalty
            if result.metadata.get("is_duplicate"):
                overall_score *= 0.5

            result.quality["score"] = min(overall_score, 1.0)
            result.quality["factors"] = quality_factors

            return result

        except Exception as e:
            self.logger.error(f"Quality assessment failed: {e}")
            result.metadata["quality_assessment_error"] = str(e)
            return result

    async def _categorize_content(self, result: ScrapingResult) -> ScrapingResult:
        """Categorize content based on various factors."""
        try:
            category = "general"
            confidence = 0.5

            # Analyze URL for category hints
            url = result.url.lower()
            if any(
                domain in url
                for domain in ["github.com", "gitlab.com", "bitbucket.org"]
            ):
                category = "development"
                confidence = 0.9
            elif any(domain in url for domain in ["wikipedia.org", "wikimedia.org"]):
                category = "encyclopedia"
                confidence = 0.9
            elif any(domain in url for domain in ["twitter.com", "x.com"]):
                category = "social_media"
                confidence = 0.9
            elif any(domain in url for domain in ["news.ycombinator.com"]):
                category = "tech_news"
                confidence = 0.8
            elif any(
                domain in url for domain in ["stackoverflow.com", "stackexchange.com"]
            ):
                category = "programming_qa"
                confidence = 0.9

            # Analyze content for category hints
            content = result.content.lower()
            title = result.title.lower()

            # Programming/Development keywords
            dev_keywords = [
                "code",
                "programming",
                "software",
                "development",
                "api",
                "function",
                "class",
                "variable",
            ]
            if any(keyword in content or keyword in title for keyword in dev_keywords):
                if category == "general":
                    category = "development"
                    confidence = 0.7

            # News keywords
            news_keywords = [
                "news",
                "breaking",
                "report",
                "announces",
                "launches",
                "releases",
            ]
            if any(keyword in content or keyword in title for keyword in news_keywords):
                if category == "general":
                    category = "news"
                    confidence = 0.7

            # Technical keywords
            tech_keywords = [
                "technology",
                "tech",
                "innovation",
                "startup",
                "ai",
                "machine learning",
            ]
            if any(keyword in content or keyword in title for keyword in tech_keywords):
                if category == "general":
                    category = "technology"
                    confidence = 0.7

            result.metadata["category"] = category
            result.metadata["category_confidence"] = confidence

            return result

        except Exception as e:
            self.logger.error(f"Content categorization failed: {e}")
            result.metadata["categorization_error"] = str(e)
            return result

    async def _enrich_content(self, result: ScrapingResult) -> ScrapingResult:
        """Enrich content with additional metadata and processing information."""
        try:
            # Add processing timestamp
            result.metadata["processed_at"] = datetime.now().isoformat()

            # Add content statistics
            result.metadata["word_count"] = len(result.content.split())
            result.metadata["character_count"] = len(result.content)
            result.metadata["sentence_count"] = len(re.split(r"[.!?]+", result.content))

            # Add processing pipeline information
            result.metadata["pipeline_version"] = "1.0"
            result.metadata["processing_stages"] = [
                "cleaning",
                "deduplication",
                "quality_assessment",
                "categorization",
                "enrichment",
            ]

            # Add quality summary
            quality_score = result.quality.get("score", 0)
            if quality_score >= 0.8:
                result.metadata["quality_level"] = "high"
            elif quality_score >= 0.6:
                result.metadata["quality_level"] = "medium"
            elif quality_score >= 0.4:
                result.metadata["quality_level"] = "low"
            else:
                result.metadata["quality_level"] = "very_low"

            return result

        except Exception as e:
            self.logger.error(f"Content enrichment failed: {e}")
            result.metadata["enrichment_error"] = str(e)
            return result

    def get_processing_stats(self) -> dict[str, Any]:
        """Get processing statistics."""
        quality_scores = self.processing_stats["quality_scores"]

        stats = {
            "total_processed": self.processing_stats["total_processed"],
            "duplicates_found": self.processing_stats["duplicates_found"],
            "duplicate_rate": (
                self.processing_stats["duplicates_found"]
                / max(self.processing_stats["total_processed"], 1)
            ),
            "categories": self.processing_stats["categories"],
            "unique_content_fingerprints": len(self.content_fingerprints),
        }

        if quality_scores:
            stats["quality_stats"] = {
                "average_quality": sum(quality_scores) / len(quality_scores),
                "min_quality": min(quality_scores),
                "max_quality": max(quality_scores),
                "high_quality_count": len([s for s in quality_scores if s >= 0.8]),
                "medium_quality_count": len(
                    [s for s in quality_scores if 0.6 <= s < 0.8],
                ),
                "low_quality_count": len([s for s in quality_scores if s < 0.6]),
            }

        return stats

    def reset_stats(self) -> None:
        """Reset processing statistics."""
        self.processing_stats = {
            "total_processed": 0,
            "duplicates_found": 0,
            "quality_scores": [],
            "categories": {},
        }
        self.content_fingerprints.clear()
        self.logger.info("Processing statistics reset")
