"""
Quality Assessment Models for Reynard Backend

Data models for content quality assessment.
"""

from enum import Enum

from pydantic import BaseModel, Field


class QualityLevel(str, Enum):
    """Content quality levels."""

    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


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
