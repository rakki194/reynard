"""Intelligent Content Filter for Reynard Backend

ML-powered content filtering with semantic analysis and quality assessment.
"""

import logging
import re
import time
from dataclasses import dataclass
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class FilteringStrategy(Enum):
    """Content filtering strategies."""
    
    SEMANTIC = "semantic"
    STRUCTURAL = "structural"
    HYBRID = "hybrid"


class ContentType(Enum):
    """Content type classifications."""
    
    ARTICLE = "article"
    NAVIGATION = "navigation"
    ADVERTISEMENT = "advertisement"
    PRIVACY = "privacy"
    TECHNICAL = "technical"
    SOCIAL = "social"
    UNKNOWN = "unknown"


@dataclass
class FilteringConfig:
    """Configuration for intelligent content filtering."""
    
    strategy: FilteringStrategy = FilteringStrategy.HYBRID
    enabled_analyzers: list[str] = None
    thresholds: dict[str, float] = None
    
    def __post_init__(self):
        if self.enabled_analyzers is None:
            self.enabled_analyzers = ["semantic", "structural"]
        
        if self.thresholds is None:
            self.thresholds = {
                "article": 0.7,
                "navigation": 0.6,
                "advertisement": 0.5,
                "privacy": 0.8,
                "technical": 0.6,
            }


@dataclass
class FilteringResult:
    """Result of content filtering operation."""
    
    filtered_content: str
    quality_score: float
    processing_time: float
    metadata: dict[str, Any]
    removed_segments: list[dict[str, Any]]


class IntelligentContentFilter:
    """
    Intelligent content filter with ML-powered analysis.

    Features:
    - Semantic content analysis
    - Structural content analysis
    - Quality assessment
    - Content type classification
    - Noise removal
    - Content enhancement
    """

    def __init__(
        self, 
        config: FilteringConfig | None = None,
        logger: logging.Logger | None = None
    ):
        """Initialize the intelligent content filter.

        Args:
            config: Filtering configuration
            logger: Logger instance

        """
        self.logger = logger or logging.getLogger(__name__)
        self.config = config or FilteringConfig()
        
        # Initialize analyzers
        self.analyzers = self._initialize_analyzers()
        
        # Content patterns for classification
        self.content_patterns = self._initialize_content_patterns()

    def _initialize_analyzers(self) -> dict[str, Any]:
        """Initialize content analyzers."""
        analyzers = {}
        
        if "semantic" in self.config.enabled_analyzers:
            analyzers["semantic"] = SemanticAnalyzer(self.logger)
        
        if "structural" in self.config.enabled_analyzers:
            analyzers["structural"] = StructuralAnalyzer(self.logger)
        
        return analyzers

    def _initialize_content_patterns(self) -> dict[str, list[str]]:
        """Initialize content classification patterns."""
        return {
            "navigation": [
                r"menu",
                r"navigation",
                r"nav",
                r"sidebar",
                r"footer",
                r"header",
                r"breadcrumb",
                r"pagination",
            ],
            "advertisement": [
                r"advertisement",
                r"ad\s",
                r"sponsor",
                r"promoted",
                r"banner",
                r"popup",
                r"subscribe",
                r"newsletter",
            ],
            "privacy": [
                r"privacy\s+policy",
                r"terms\s+of\s+service",
                r"cookie\s+policy",
                r"legal",
                r"disclaimer",
                r"copyright",
            ],
            "technical": [
                r"javascript",
                r"css",
                r"html",
                r"api",
                r"server",
                r"database",
                r"error",
                r"debug",
            ],
            "social": [
                r"share",
                r"like",
                r"follow",
                r"comment",
                r"social\s+media",
                r"facebook",
                r"twitter",
                r"instagram",
            ],
        }

    async def filter_content(
        self,
        content: str,
        source: str = "",
        context: dict[str, Any] | None = None
    ) -> FilteringResult:
        """Filter content using intelligent analysis.

        Args:
            content: Content to filter
            source: Source domain for context
            context: Additional context information

        Returns:
            FilteringResult with filtered content and metadata

        """
        start_time = time.time()
        
        try:
            self.logger.info(f"Starting intelligent content filtering for {source}")
            
            # Initialize result
            result = FilteringResult(
                filtered_content=content,
                quality_score=0.0,
                processing_time=0.0,
                metadata={
                    "original_length": len(content),
                    "analyzers_used": [],
                    "content_types": [],
                },
                removed_segments=[],
            )
            
            # Apply filtering based on strategy
            if self.config.strategy == FilteringStrategy.SEMANTIC:
                result = await self._apply_semantic_filtering(result, content, source, context)
            elif self.config.strategy == FilteringStrategy.STRUCTURAL:
                result = await self._apply_structural_filtering(result, content, source, context)
            else:  # HYBRID
                result = await self._apply_hybrid_filtering(result, content, source, context)
            
            # Calculate final quality score
            result.quality_score = self._calculate_quality_score(result.filtered_content)
            
            # Update metadata
            result.metadata["filtered_length"] = len(result.filtered_content)
            result.metadata["compression_ratio"] = (
                len(result.filtered_content) / len(content) if content else 1.0
            )
            
            result.processing_time = time.time() - start_time
            
            self.logger.info(
                f"Content filtering completed: "
                f"quality={result.quality_score:.2f}, "
                f"compression={result.metadata['compression_ratio']:.1%}, "
                f"time={result.processing_time:.2f}s"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in content filtering: {e}")
            # Return original content if filtering fails
            return FilteringResult(
                filtered_content=content,
                quality_score=0.5,
                processing_time=time.time() - start_time,
                metadata={"error": str(e)},
                removed_segments=[],
            )

    async def _apply_semantic_filtering(
        self,
        result: FilteringResult,
        content: str,
        source: str,
        context: dict[str, Any] | None
    ) -> FilteringResult:
        """Apply semantic content filtering."""
        if "semantic" not in self.analyzers:
            return result
        
        analyzer = self.analyzers["semantic"]
        result.metadata["analyzers_used"].append("semantic")
        
        # Analyze content semantically
        analysis = await analyzer.analyze_content(content, source, context)
        
        # Filter based on semantic analysis
        filtered_content, removed_segments = self._filter_by_semantic_analysis(
            content, analysis
        )
        
        result.filtered_content = filtered_content
        result.removed_segments.extend(removed_segments)
        result.metadata["semantic_analysis"] = analysis
        
        return result

    async def _apply_structural_filtering(
        self,
        result: FilteringResult,
        content: str,
        source: str,
        context: dict[str, Any] | None
    ) -> FilteringResult:
        """Apply structural content filtering."""
        if "structural" not in self.analyzers:
            return result
        
        analyzer = self.analyzers["structural"]
        result.metadata["analyzers_used"].append("structural")
        
        # Analyze content structurally
        analysis = await analyzer.analyze_content(content, source, context)
        
        # Filter based on structural analysis
        filtered_content, removed_segments = self._filter_by_structural_analysis(
            content, analysis
        )
        
        result.filtered_content = filtered_content
        result.removed_segments.extend(removed_segments)
        result.metadata["structural_analysis"] = analysis
        
        return result

    async def _apply_hybrid_filtering(
        self,
        result: FilteringResult,
        content: str,
        source: str,
        context: dict[str, Any] | None
    ) -> FilteringResult:
        """Apply hybrid content filtering (semantic + structural)."""
        # Apply semantic filtering first
        result = await self._apply_semantic_filtering(result, content, source, context)
        
        # Then apply structural filtering on the semantically filtered content
        result = await self._apply_structural_filtering(
            result, result.filtered_content, source, context
        )
        
        return result

    def _filter_by_semantic_analysis(
        self, content: str, analysis: dict[str, Any]
    ) -> tuple[str, list[dict[str, Any]]]:
        """Filter content based on semantic analysis."""
        filtered_content = content
        removed_segments = []
        
        # Remove low-quality segments
        if "segments" in analysis:
            for segment in analysis["segments"]:
                if segment.get("quality_score", 0) < 0.3:
                    filtered_content = filtered_content.replace(segment["text"], "")
                    removed_segments.append({
                        "type": "low_quality",
                        "text": segment["text"][:100] + "...",
                        "reason": "Low semantic quality",
                    })
        
        # Remove non-article content
        if "content_types" in analysis:
            for content_type in analysis["content_types"]:
                if content_type["type"] in ["navigation", "advertisement", "privacy"]:
                    if content_type["confidence"] > 0.7:
                        # Remove content matching this type
                        pattern = self.content_patterns.get(content_type["type"], [])
                        for p in pattern:
                            filtered_content = re.sub(p, "", filtered_content, flags=re.IGNORECASE)
        
        return filtered_content, removed_segments

    def _filter_by_structural_analysis(
        self, content: str, analysis: dict[str, Any]
    ) -> tuple[str, list[dict[str, Any]]]:
        """Filter content based on structural analysis."""
        filtered_content = content
        removed_segments = []
        
        # Remove short paragraphs (likely navigation or ads)
        if "paragraphs" in analysis:
            for paragraph in analysis["paragraphs"]:
                if paragraph.get("length", 0) < 50:  # Less than 50 characters
                    filtered_content = filtered_content.replace(paragraph["text"], "")
                    removed_segments.append({
                        "type": "short_paragraph",
                        "text": paragraph["text"],
                        "reason": "Too short to be meaningful content",
                    })
        
        # Remove repetitive content
        if "repetitive_segments" in analysis:
            for segment in analysis["repetitive_segments"]:
                filtered_content = filtered_content.replace(segment["text"], "")
                removed_segments.append({
                    "type": "repetitive",
                    "text": segment["text"][:100] + "...",
                    "reason": "Repetitive content",
                })
        
        return filtered_content, removed_segments

    def _calculate_quality_score(self, content: str) -> float:
        """Calculate quality score for filtered content."""
        if not content:
            return 0.0
        
        score = 0.0
        
        # Length factor (0-0.3)
        length_score = min(len(content) / 2000, 1.0)  # Cap at 2000 chars
        score += length_score * 0.3
        
        # Word count factor (0-0.3)
        word_count = len(content.split())
        word_score = min(word_count / 300, 1.0)  # Cap at 300 words
        score += word_score * 0.3
        
        # Readability factor (0-0.2)
        sentences = content.split(".")
        if len(sentences) > 1:
            avg_sentence_length = word_count / len(sentences)
            readability_score = max(0, 1 - abs(avg_sentence_length - 20) / 20)
            score += readability_score * 0.2
        
        # Structure factor (0-0.2)
        if "\n\n" in content or content.count("\n") > 10:
            score += 0.2
        
        return min(score, 1.0)


class SemanticAnalyzer:
    """Semantic content analyzer."""
    
    def __init__(self, logger: logging.Logger | None = None):
        self.logger = logger or logging.getLogger(__name__)
    
    async def analyze_content(
        self, content: str, source: str, context: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Analyze content semantically."""
        # This would integrate with ML models for semantic analysis
        # For now, we'll provide a basic implementation
        
        return {
            "content_types": [
                {"type": "article", "confidence": 0.8},
            ],
            "segments": [
                {
                    "text": content[:100],
                    "quality_score": 0.7,
                }
            ],
            "semantic_score": 0.7,
        }


class StructuralAnalyzer:
    """Structural content analyzer."""
    
    def __init__(self, logger: logging.Logger | None = None):
        self.logger = logger or logging.getLogger(__name__)
    
    async def analyze_content(
        self, content: str, source: str, context: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Analyze content structurally."""
        # Basic structural analysis
        paragraphs = content.split("\n\n")
        
        return {
            "paragraphs": [
                {"text": p, "length": len(p)} for p in paragraphs if p.strip()
            ],
            "repetitive_segments": [],
            "structural_score": 0.8,
        }
