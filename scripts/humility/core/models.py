"""
Data models for the Enhanced Humility Detector.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Optional, Any
import json
from datetime import datetime


class SeverityLevel(Enum):
    """Severity levels for detected boastful language."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ConfidenceLevel(Enum):
    """Confidence levels for detection accuracy."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


class DetectionCategory(Enum):
    """Categories of boastful language detection."""
    SUPERLATIVES = "superlatives"
    EXAGGERATION = "exaggeration"
    SELF_PROMOTION = "self_promotion"
    DISMISSIVENESS = "dismissiveness"
    ABSOLUTE_CLAIMS = "absolute_claims"
    HYPE_LANGUAGE = "hype_language"
    COMPETITIVE_LANGUAGE = "competitive_language"
    EXCLUSIVITY_CLAIMS = "exclusivity_claims"
    EMOTIONAL_MANIPULATION = "emotional_manipulation"
    AUTHORITY_CLAIMS = "authority_claims"


@dataclass
class HumilityFinding:
    """Represents a single instance of boastful language with enhanced metadata."""
    file_path: str
    line_number: int
    category: DetectionCategory
    severity: SeverityLevel
    confidence: ConfidenceLevel
    original_text: str
    suggested_replacement: str
    context: str
    confidence_score: float
    hexaco_score: Optional[float] = None
    epistemic_humility_score: Optional[float] = None
    sentiment_score: Optional[float] = None
    linguistic_features: Dict[str, Any] = field(default_factory=dict)
    behavioral_indicators: List[str] = field(default_factory=list)
    cultural_context: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'file_path': self.file_path,
            'line_number': self.line_number,
            'category': self.category.value,
            'severity': self.severity.value,
            'confidence': self.confidence.value,
            'original_text': self.original_text,
            'suggested_replacement': self.suggested_replacement,
            'context': self.context,
            'confidence_score': self.confidence_score,
            'hexaco_score': self.hexaco_score,
            'epistemic_humility_score': self.epistemic_humility_score,
            'sentiment_score': self.sentiment_score,
            'linguistic_features': self.linguistic_features,
            'behavioral_indicators': self.behavioral_indicators,
            'cultural_context': self.cultural_context,
            'timestamp': self.timestamp.isoformat()
        }


@dataclass
class HumilityProfile:
    """Comprehensive humility profile for a document or text corpus."""
    overall_score: float
    hexaco_honesty_humility: float
    epistemic_humility: float
    linguistic_humility: float
    behavioral_humility: float
    cultural_adaptation: float
    findings: List[HumilityFinding]
    recommendations: List[str]
    improvement_areas: List[str]
    strengths: List[str]
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'overall_score': self.overall_score,
            'hexaco_honesty_humility': self.hexaco_honesty_humility,
            'epistemic_humility': self.epistemic_humility,
            'linguistic_humility': self.linguistic_humility,
            'behavioral_humility': self.behavioral_humility,
            'cultural_adaptation': self.cultural_adaptation,
            'findings': [finding.to_dict() for finding in self.findings],
            'recommendations': self.recommendations,
            'improvement_areas': self.improvement_areas,
            'strengths': self.strengths,
            'timestamp': self.timestamp.isoformat()
        }


@dataclass
class DetectionMetrics:
    """Metrics for evaluating detection performance."""
    precision: float
    recall: float
    f1_score: float
    accuracy: float
    false_positive_rate: float
    false_negative_rate: float
    true_positive_rate: float
    true_negative_rate: float
    auc_score: Optional[float] = None
    confusion_matrix: Optional[Dict[str, int]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'precision': self.precision,
            'recall': self.recall,
            'f1_score': self.f1_score,
            'accuracy': self.accuracy,
            'false_positive_rate': self.false_positive_rate,
            'false_negative_rate': self.false_negative_rate,
            'true_positive_rate': self.true_positive_rate,
            'true_negative_rate': self.true_negative_rate,
            'auc_score': self.auc_score,
            'confusion_matrix': self.confusion_matrix
        }


@dataclass
class CulturalContext:
    """Cultural context for humility assessment."""
    region: str
    language: str
    cultural_norms: Dict[str, Any]
    humility_indicators: List[str]
    boastful_indicators: List[str]
    adaptation_factors: Dict[str, float]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            'region': self.region,
            'language': self.language,
            'cultural_norms': self.cultural_norms,
            'humility_indicators': self.humility_indicators,
            'boastful_indicators': self.boastful_indicators,
            'adaptation_factors': self.adaptation_factors
        }

