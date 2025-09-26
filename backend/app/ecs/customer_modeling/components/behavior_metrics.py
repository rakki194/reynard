"""
Customer behavior metrics component for ECS customer modeling.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional


class MetricType(str, Enum):
    """Types of behavior metrics."""

    ENGAGEMENT = "engagement"
    PURCHASE = "purchase"
    BROWSING = "browsing"
    SOCIAL = "social"
    SUPPORT = "support"
    EMAIL = "email"
    MOBILE = "mobile"
    WEB = "web"


class DeviceType(str, Enum):
    """Device types."""

    MOBILE = "mobile"
    DESKTOP = "desktop"
    TABLET = "tablet"
    TV = "tv"
    IOT = "iot"


class Platform(str, Enum):
    """Platform types."""

    WEB = "web"
    IOS = "ios"
    ANDROID = "android"
    WINDOWS = "windows"
    MACOS = "macos"
    LINUX = "linux"


@dataclass
class BehaviorMetric:
    """Individual behavior metric."""

    metric_name: str
    metric_value: float
    metric_unit: str
    metric_type: MetricType
    context_data: Optional[Dict[str, Any]] = None
    recorded_at: datetime = None

    def __post_init__(self):
        """Initialize default values."""
        if self.recorded_at is None:
            self.recorded_at = datetime.utcnow()
        if self.context_data is None:
            self.context_data = {}


@dataclass
class BehaviorMetrics:
    """Customer behavior metrics component."""

    # Session Information
    session_id: Optional[str] = None
    device_type: Optional[DeviceType] = None
    platform: Optional[Platform] = None

    # Metrics Storage
    metrics: List[BehaviorMetric] = field(default_factory=list)

    # Aggregated Metrics
    engagement_score: float = 0.0
    activity_frequency: float = 0.0
    session_duration: float = 0.0
    page_views: int = 0
    bounce_rate: float = 0.0

    # Behavioral Patterns
    preferred_time_of_day: Optional[str] = None
    preferred_day_of_week: Optional[str] = None
    preferred_device: Optional[DeviceType] = None
    preferred_platform: Optional[Platform] = None

    # Timestamps
    first_activity: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def add_metric(self, metric: BehaviorMetric):
        """Add a new behavior metric."""
        self.metrics.append(metric)
        self._update_aggregated_metrics()
        self.updated_at = datetime.utcnow()

    def add_metrics(self, metrics: List[BehaviorMetric]):
        """Add multiple behavior metrics."""
        self.metrics.extend(metrics)
        self._update_aggregated_metrics()
        self.updated_at = datetime.utcnow()

    def _update_aggregated_metrics(self):
        """Update aggregated metrics based on individual metrics."""
        if not self.metrics:
            return

        # Calculate engagement score
        engagement_metrics = [
            m for m in self.metrics if m.metric_type == MetricType.ENGAGEMENT
        ]
        if engagement_metrics:
            self.engagement_score = sum(
                m.metric_value for m in engagement_metrics
            ) / len(engagement_metrics)

        # Calculate activity frequency
        if self.first_activity and self.last_activity:
            time_diff = (self.last_activity - self.first_activity).total_seconds()
            if time_diff > 0:
                self.activity_frequency = len(self.metrics) / (
                    time_diff / 3600
                )  # metrics per hour

        # Update timestamps
        if not self.first_activity:
            self.first_activity = min(m.recorded_at for m in self.metrics)
        self.last_activity = max(m.recorded_at for m in self.metrics)

        # Calculate page views
        page_view_metrics = [m for m in self.metrics if m.metric_name == "page_views"]
        self.page_views = sum(int(m.metric_value) for m in page_view_metrics)

        # Calculate session duration
        session_metrics = [
            m for m in self.metrics if m.metric_name == "session_duration"
        ]
        if session_metrics:
            self.session_duration = sum(m.metric_value for m in session_metrics)

    def get_metrics_by_type(self, metric_type: MetricType) -> List[BehaviorMetric]:
        """Get metrics filtered by type."""
        return [m for m in self.metrics if m.metric_type == metric_type]

    def get_recent_metrics(self, hours: int = 24) -> List[BehaviorMetric]:
        """Get metrics from the last N hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        return [m for m in self.metrics if m.recorded_at >= cutoff_time]

    def calculate_engagement_trend(self, days: int = 7) -> float:
        """Calculate engagement trend over the last N days."""
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        recent_metrics = [m for m in self.metrics if m.recorded_at >= cutoff_time]

        if not recent_metrics:
            return 0.0

        # Simple trend calculation (can be enhanced with more sophisticated algorithms)
        engagement_metrics = [
            m for m in recent_metrics if m.metric_type == MetricType.ENGAGEMENT
        ]
        if not engagement_metrics:
            return 0.0

        return sum(m.metric_value for m in engagement_metrics) / len(engagement_metrics)

    def get_behavioral_summary(self) -> Dict[str, Any]:
        """Get a summary of behavioral patterns."""
        return {
            "total_metrics": len(self.metrics),
            "engagement_score": self.engagement_score,
            "activity_frequency": self.activity_frequency,
            "session_duration": self.session_duration,
            "page_views": self.page_views,
            "bounce_rate": self.bounce_rate,
            "preferred_device": (
                self.preferred_device.value if self.preferred_device else None
            ),
            "preferred_platform": (
                self.preferred_platform.value if self.preferred_platform else None
            ),
            "first_activity": (
                self.first_activity.isoformat() if self.first_activity else None
            ),
            "last_activity": (
                self.last_activity.isoformat() if self.last_activity else None
            ),
            "engagement_trend_7d": self.calculate_engagement_trend(7),
            "engagement_trend_30d": self.calculate_engagement_trend(30),
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "session_id": self.session_id,
            "device_type": self.device_type.value if self.device_type else None,
            "platform": self.platform.value if self.platform else None,
            "metrics": [metric.__dict__ for metric in self.metrics],
            "engagement_score": self.engagement_score,
            "activity_frequency": self.activity_frequency,
            "session_duration": self.session_duration,
            "page_views": self.page_views,
            "bounce_rate": self.bounce_rate,
            "preferred_time_of_day": self.preferred_time_of_day,
            "preferred_day_of_week": self.preferred_day_of_week,
            "preferred_device": (
                self.preferred_device.value if self.preferred_device else None
            ),
            "preferred_platform": (
                self.preferred_platform.value if self.preferred_platform else None
            ),
            "first_activity": (
                self.first_activity.isoformat() if self.first_activity else None
            ),
            "last_activity": (
                self.last_activity.isoformat() if self.last_activity else None
            ),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
