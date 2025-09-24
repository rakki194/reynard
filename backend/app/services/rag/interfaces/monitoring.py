"""Monitoring service interfaces.

This module defines the interfaces for performance monitoring services.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from .base import BaseService


class AlertSeverity(Enum):
    """Severity levels for alerts."""
    
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class Metric:
    """Performance metric."""
    
    name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str]
    metadata: Dict[str, Any]


@dataclass
class Alert:
    """Performance alert."""
    
    id: str
    name: str
    severity: AlertSeverity
    message: str
    timestamp: datetime
    metric_name: str
    threshold_value: float
    actual_value: float
    metadata: Dict[str, Any]


class IPerformanceMonitor(BaseService, ABC):
    """Interface for performance monitoring services."""

    @abstractmethod
    async def record_metric(
        self,
        metric_name: str,
        value: float,
        metadata: Dict[str, Any] | None = None,
        tags: Dict[str, str] | None = None,
    ) -> None:
        """Record a performance metric."""
        pass

    @abstractmethod
    async def get_system_health(self) -> Dict[str, Any]:
        """Get current system health status."""
        pass

    @abstractmethod
    async def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for specified time period."""
        pass

    @abstractmethod
    async def generate_performance_report(self, hours: int = 24) -> str:
        """Generate a comprehensive performance report."""
        pass

    @abstractmethod
    def get_prometheus_metrics(self) -> str:
        """Get Prometheus metrics in text format."""
        pass


class MonitoringProvider(ABC):
    """Abstract base class for monitoring providers."""

    @abstractmethod
    async def record_metric(
        self,
        name: str,
        value: float,
        tags: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Record a metric."""
        pass

    @abstractmethod
    async def get_metrics(
        self,
        name: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
    ) -> List[Metric]:
        """Get metrics with optional filtering."""
        pass

    @abstractmethod
    async def create_alert(
        self,
        name: str,
        metric_name: str,
        threshold_value: float,
        comparison_operator: str,
        severity: AlertSeverity,
        description: str,
    ) -> str:
        """Create a new alert rule."""
        pass