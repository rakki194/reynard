"""
Reynard Codebase Scanner Service

Comprehensive codebase analysis and monitoring service for the Reynard ecosystem.
"""

from .analysis_engine import CodebaseAnalysisEngine
from .integration_features import ExportManager, MCPIntegration, RealTimeMonitor
from .metrics_insights import CodebaseMetricsInsights
from .service import CodebaseScannerService

__version__ = "1.0.0"
__author__ = "Reynard Team"

__all__ = [
    "CodebaseAnalysisEngine",
    "CodebaseMetricsInsights",
    "CodebaseScannerService",
    "ExportManager",
    "MCPIntegration",
    "RealTimeMonitor",
]
