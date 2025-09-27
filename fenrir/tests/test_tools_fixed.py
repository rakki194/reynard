"""
Test suite for Fenrir tools (backend_analyzer, database_debugger, service_tracker, monitoring_dashboard).

Tests the functionality of the debugging and monitoring tools that have been
moved from the backend directory to fenrir/tools.
"""

import pytest
import asyncio
import tempfile
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any, List

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from fenrir.tools.backend_analyzer import BackendAnalyzer
    from fenrir.tools.database_debugger import DatabaseDebugger
    from fenrir.tools.service_tracker import ServiceTracker
    from fenrir.tools.monitoring_dashboard import MonitoringDashboard, create_monitoring_dashboard
    TOOLS_AVAILABLE = True
except ImportError as e:
    TOOLS_AVAILABLE = False
    print(f"Warning: Backend tools not available for testing: {e}")


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestBackendAnalyzer:
    """Test the BackendAnalyzer class functionality."""

    def test_backend_analyzer_initialization(self):
        """Test BackendAnalyzer initializes correctly."""
        analyzer = BackendAnalyzer()

        assert analyzer is not None
        assert hasattr(analyzer, 'snapshots')
        assert hasattr(analyzer, 'service_timings')
        assert hasattr(analyzer, 'database_calls')

    def test_take_snapshot(self):
        """Test snapshot functionality."""
        analyzer = BackendAnalyzer()

        snapshot = analyzer.take_snapshot("test_phase", "test_service")

        assert snapshot is not None
        assert "phase" in snapshot
        assert "service" in snapshot
        assert "memory_mb" in snapshot
        assert "timestamp" in snapshot
        assert snapshot["phase"] == "test_phase"
        assert snapshot["service"] == "test_service"

    @pytest.mark.asyncio
    async def test_analyze_import_costs(self):
        """Test import cost analysis."""
        analyzer = BackendAnalyzer()

        result = await analyzer.analyze_import_costs()

        assert result is not None
        assert "modules" in result
        assert "total_import_time" in result
        assert "memory_impact" in result
        assert "recommendations" in result

    @pytest.mark.asyncio
    async def test_analyze_memory_hotspots(self):
        """Test memory hotspot analysis."""
        analyzer = BackendAnalyzer()

        result = await analyzer.analyze_memory_hotspots()

        assert result is not None
        assert "high_memory_modules" in result
        assert "memory_by_category" in result
        assert "gc_analysis" in result
        assert "recommendations" in result


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestDatabaseDebugger:
    """Test the DatabaseDebugger class functionality."""

    def test_database_debugger_initialization(self):
        """Test DatabaseDebugger initializes correctly."""
        debugger = DatabaseDebugger()

        assert debugger is not None
        assert hasattr(debugger, 'connection_logs')
        assert hasattr(debugger, 'query_logs')

    @pytest.mark.asyncio
    async def test_analyze_connection_pools(self):
        """Test connection pool analysis."""
        debugger = DatabaseDebugger()

        result = await debugger.analyze_connection_pools()

        assert result is not None
        assert "databases" in result
        assert "connection_issues" in result
        assert "optimization_recommendations" in result

    @pytest.mark.asyncio
    async def test_analyze_query_performance(self):
        """Test query performance analysis."""
        debugger = DatabaseDebugger()

        result = await debugger.analyze_query_performance()

        assert result is not None
        assert "slow_queries" in result
        assert "frequent_queries" in result
        assert "connection_metrics" in result
        assert "recommendations" in result


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestServiceTracker:
    """Test the ServiceTracker class functionality."""

    def test_service_tracker_initialization(self):
        """Test ServiceTracker initializes correctly."""
        tracker = ServiceTracker()

        assert tracker is not None
        assert hasattr(tracker, 'service_registry')
        assert hasattr(tracker, 'startup_logs')

    @pytest.mark.asyncio
    async def test_track_service_startup(self):
        """Test service startup tracking."""
        tracker = ServiceTracker()

        result = await tracker.track_service_startup()

        assert result is not None
        assert "services" in result
        assert "startup_sequence" in result
        assert "performance_issues" in result


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestMonitoringDashboard:
    """Test the MonitoringDashboard class functionality."""

    def test_monitoring_dashboard_initialization(self):
        """Test MonitoringDashboard initializes correctly."""
        dashboard = MonitoringDashboard()

        assert dashboard is not None
        assert hasattr(dashboard, 'metrics')
        assert hasattr(dashboard, 'alerts')

    def test_create_monitoring_dashboard(self):
        """Test create_monitoring_dashboard function."""
        dashboard = create_monitoring_dashboard()

        assert dashboard is not None
        assert isinstance(dashboard, MonitoringDashboard)


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestToolsIntegration:
    """Test integration between different tools."""

    def test_tools_workflow(self):
        """Test that tools can work together."""
        analyzer = BackendAnalyzer()
        debugger = DatabaseDebugger()
        tracker = ServiceTracker()

        # Test that all tools can be instantiated together
        assert analyzer is not None
        assert debugger is not None
        assert tracker is not None

        # Test basic functionality
        snapshot = analyzer.take_snapshot("integration_test")
        assert snapshot is not None
