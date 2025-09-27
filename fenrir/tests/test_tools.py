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
    # Fallback to backend directory if tools haven't been moved yet
    try:
        from backend.backend_analyzer import BackendAnalyzer
        from backend.database_debugger import DatabaseDebugger
        from backend.service_tracker import ServiceTracker
        from backend.monitoring_dashboard import MonitoringDashboard, create_monitoring_dashboard
        TOOLS_AVAILABLE = True
    except ImportError:
        TOOLS_AVAILABLE = False
        print(f"Warning: Backend tools not available for testing: {e}")


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestBackendAnalyzer:
    """Test the BackendAnalyzer class functionality."""
    
    def test_backend_analyzer_initialization(self):
        """Test BackendAnalyzer initializes correctly."""
        analyzer = BackendAnalyzer()
        
        assert analyzer is not None
        assert hasattr(analyzer, 'base_url')
        assert hasattr(analyzer, 'session')
    
    @pytest.mark.asyncio
    async def test_analyze_memory_usage(self):
        """Test memory usage analysis."""
        analyzer = BackendAnalyzer()
        
        # Mock the HTTP session
        with patch.object(analyzer.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "memory_usage": {
                    "rss": 100000000,
                    "vms": 200000000,
                    "percent": 5.2
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await analyzer.analyze_memory_usage()
            
            assert result is not None
            assert "memory_usage" in result
            assert result["memory_usage"]["rss"] == 100000000
    
    @pytest.mark.asyncio
    async def test_analyze_startup_performance(self):
        """Test startup performance analysis."""
        analyzer = BackendAnalyzer()
        
        # Mock the HTTP session
        with patch.object(analyzer.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "startup_time": 2.5,
                "services_loaded": 10,
                "memory_peak": 150000000
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await analyzer.analyze_startup_performance()
            
            assert result is not None
            assert "startup_time" in result
            assert result["startup_time"] == 2.5
    
    @pytest.mark.asyncio
    async def test_analyze_service_health(self):
        """Test service health analysis."""
        analyzer = BackendAnalyzer()
        
        # Mock the HTTP session
        with patch.object(analyzer.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "services": {
                    "rag": {"status": "healthy", "memory": 50000000},
                    "ai": {"status": "healthy", "memory": 30000000}
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await analyzer.analyze_service_health()
            
            assert result is not None
            assert "services" in result
            assert "rag" in result["services"]
            assert result["services"]["rag"]["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_analyze_database_performance(self):
        """Test database performance analysis."""
        analyzer = BackendAnalyzer()
        
        # Mock the HTTP session
        with patch.object(analyzer.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "database_stats": {
                    "connection_count": 5,
                    "active_queries": 2,
                    "slow_queries": []
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await analyzer.analyze_database_performance()
            
            assert result is not None
            assert "database_stats" in result
            assert result["database_stats"]["connection_count"] == 5
    
    @pytest.mark.asyncio
    async def test_analyze_cache_performance(self):
        """Test cache performance analysis."""
        analyzer = BackendAnalyzer()
        
        # Mock the HTTP session
        with patch.object(analyzer.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "cache_stats": {
                    "hit_rate": 0.85,
                    "miss_rate": 0.15,
                    "total_operations": 1000
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await analyzer.analyze_cache_performance()
            
            assert result is not None
            assert "cache_stats" in result
            assert result["cache_stats"]["hit_rate"] == 0.85
    
    @pytest.mark.asyncio
    async def test_generate_comprehensive_report(self):
        """Test generating a comprehensive analysis report."""
        analyzer = BackendAnalyzer()
        
        # Mock all the analysis methods
        with patch.object(analyzer, 'analyze_memory_usage') as mock_memory, \
             patch.object(analyzer, 'analyze_startup_performance') as mock_startup, \
             patch.object(analyzer, 'analyze_service_health') as mock_health, \
             patch.object(analyzer, 'analyze_database_performance') as mock_db, \
             patch.object(analyzer, 'analyze_cache_performance') as mock_cache:
            
            # Set up mock return values
            mock_memory.return_value = {"memory_usage": {"rss": 100000000}}
            mock_startup.return_value = {"startup_time": 2.5}
            mock_health.return_value = {"services": {"rag": {"status": "healthy"}}}
            mock_db.return_value = {"database_stats": {"connection_count": 5}}
            mock_cache.return_value = {"cache_stats": {"hit_rate": 0.85}}
            
            result = await analyzer.generate_comprehensive_report()
            
            assert result is not None
            assert "memory_analysis" in result
            assert "startup_analysis" in result
            assert "service_health" in result
            assert "database_analysis" in result
            assert "cache_analysis" in result
            
            # Verify all methods were called
            mock_memory.assert_called_once()
            mock_startup.assert_called_once()
            mock_health.assert_called_once()
            mock_db.assert_called_once()
            mock_cache.assert_called_once()


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestDatabaseDebugger:
    """Test the DatabaseDebugger class functionality."""
    
    def test_database_debugger_initialization(self):
        """Test DatabaseDebugger initializes correctly."""
        debugger = DatabaseDebugger()
        
        assert debugger is not None
        assert hasattr(debugger, 'base_url')
        assert hasattr(debugger, 'session')
    
    @pytest.mark.asyncio
    async def test_analyze_database_performance(self):
        """Test database performance analysis."""
        debugger = DatabaseDebugger()
        
        # Mock the HTTP session
        with patch.object(debugger.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "performance_metrics": {
                    "connection_count": 5,
                    "active_queries": 2,
                    "slow_queries": [],
                    "connection_pool_status": "healthy"
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await debugger.analyze_database_performance()
            
            assert result is not None
            assert "performance_metrics" in result
            assert result["performance_metrics"]["connection_count"] == 5
    
    @pytest.mark.asyncio
    async def test_analyze_query_performance(self):
        """Test query performance analysis."""
        debugger = DatabaseDebugger()
        
        # Mock the HTTP session
        with patch.object(debugger.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "query_metrics": {
                    "total_queries": 100,
                    "average_execution_time": 0.05,
                    "slow_queries": [
                        {"query": "SELECT * FROM users", "execution_time": 2.5}
                    ]
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await debugger.analyze_query_performance()
            
            assert result is not None
            assert "query_metrics" in result
            assert result["query_metrics"]["total_queries"] == 100
    
    @pytest.mark.asyncio
    async def test_analyze_connection_pool(self):
        """Test connection pool analysis."""
        debugger = DatabaseDebugger()
        
        # Mock the HTTP session
        with patch.object(debugger.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "connection_pool": {
                    "total_connections": 10,
                    "active_connections": 5,
                    "idle_connections": 5,
                    "pool_utilization": 0.5
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await debugger.analyze_connection_pool()
            
            assert result is not None
            assert "connection_pool" in result
            assert result["connection_pool"]["total_connections"] == 10
    
    @pytest.mark.asyncio
    async def test_analyze_database_health(self):
        """Test database health analysis."""
        debugger = DatabaseDebugger()
        
        # Mock the HTTP session
        with patch.object(debugger.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "health_status": {
                    "overall_health": "healthy",
                    "database_status": "online",
                    "connection_status": "stable",
                    "performance_status": "good"
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await debugger.analyze_database_health()
            
            assert result is not None
            assert "health_status" in result
            assert result["health_status"]["overall_health"] == "healthy"


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestServiceTracker:
    """Test the ServiceTracker class functionality."""
    
    def test_service_tracker_initialization(self):
        """Test ServiceTracker initializes correctly."""
        tracker = ServiceTracker()
        
        assert tracker is not None
        assert hasattr(tracker, 'base_url')
        assert hasattr(tracker, 'session')
    
    @pytest.mark.asyncio
    async def test_analyze_startup_sequence(self):
        """Test startup sequence analysis."""
        tracker = ServiceTracker()
        
        # Mock the HTTP session
        with patch.object(tracker.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "startup_sequence": {
                    "total_startup_time": 2.5,
                    "services_loaded": 10,
                    "startup_order": ["database", "cache", "rag", "ai"],
                    "memory_peak": 150000000
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await tracker.analyze_startup_sequence()
            
            assert result is not None
            assert "startup_sequence" in result
            assert result["startup_sequence"]["total_startup_time"] == 2.5
    
    @pytest.mark.asyncio
    async def test_track_service_lifecycle(self):
        """Test service lifecycle tracking."""
        tracker = ServiceTracker()
        
        # Mock the HTTP session
        with patch.object(tracker.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "service_lifecycle": {
                    "rag": {"status": "running", "uptime": 3600, "memory": 50000000},
                    "ai": {"status": "running", "uptime": 3600, "memory": 30000000}
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await tracker.track_service_lifecycle()
            
            assert result is not None
            assert "service_lifecycle" in result
            assert "rag" in result["service_lifecycle"]
            assert result["service_lifecycle"]["rag"]["status"] == "running"
    
    @pytest.mark.asyncio
    async def test_analyze_service_dependencies(self):
        """Test service dependency analysis."""
        tracker = ServiceTracker()
        
        # Mock the HTTP session
        with patch.object(tracker.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "service_dependencies": {
                    "rag": ["database", "cache"],
                    "ai": ["database"],
                    "database": [],
                    "cache": []
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await tracker.analyze_service_dependencies()
            
            assert result is not None
            assert "service_dependencies" in result
            assert "rag" in result["service_dependencies"]
            assert "database" in result["service_dependencies"]["rag"]


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestMonitoringDashboard:
    """Test the MonitoringDashboard class functionality."""
    
    def test_monitoring_dashboard_initialization(self):
        """Test MonitoringDashboard initializes correctly."""
        dashboard = MonitoringDashboard()
        
        assert dashboard is not None
        assert hasattr(dashboard, 'base_url')
        assert hasattr(dashboard, 'session')
    
    def test_create_monitoring_dashboard(self):
        """Test the create_monitoring_dashboard function."""
        dashboard = create_monitoring_dashboard()
        
        assert dashboard is not None
        assert isinstance(dashboard, MonitoringDashboard)
    
    @pytest.mark.asyncio
    async def test_get_system_overview(self):
        """Test getting system overview."""
        dashboard = MonitoringDashboard()
        
        # Mock the HTTP session
        with patch.object(dashboard.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "system_overview": {
                    "total_memory": 8000000000,
                    "used_memory": 2000000000,
                    "cpu_usage": 25.5,
                    "active_services": 5
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await dashboard.get_system_overview()
            
            assert result is not None
            assert "system_overview" in result
            assert result["system_overview"]["total_memory"] == 8000000000
    
    @pytest.mark.asyncio
    async def test_get_service_metrics(self):
        """Test getting service metrics."""
        dashboard = MonitoringDashboard()
        
        # Mock the HTTP session
        with patch.object(dashboard.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "service_metrics": {
                    "rag": {"memory": 50000000, "cpu": 10.5, "requests": 100},
                    "ai": {"memory": 30000000, "cpu": 5.2, "requests": 50}
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await dashboard.get_service_metrics()
            
            assert result is not None
            assert "service_metrics" in result
            assert "rag" in result["service_metrics"]
            assert result["service_metrics"]["rag"]["memory"] == 50000000
    
    @pytest.mark.asyncio
    async def test_get_database_metrics(self):
        """Test getting database metrics."""
        dashboard = MonitoringDashboard()
        
        # Mock the HTTP session
        with patch.object(dashboard.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "database_metrics": {
                    "connection_count": 5,
                    "active_queries": 2,
                    "query_performance": {"avg_time": 0.05, "slow_queries": 0}
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await dashboard.get_database_metrics()
            
            assert result is not None
            assert "database_metrics" in result
            assert result["database_metrics"]["connection_count"] == 5
    
    @pytest.mark.asyncio
    async def test_get_cache_metrics(self):
        """Test getting cache metrics."""
        dashboard = MonitoringDashboard()
        
        # Mock the HTTP session
        with patch.object(dashboard.session, 'get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {
                "cache_metrics": {
                    "hit_rate": 0.85,
                    "miss_rate": 0.15,
                    "total_operations": 1000,
                    "memory_usage": 10000000
                }
            }
            mock_response.status_code = 200
            mock_get.return_value = mock_response
            
            result = await dashboard.get_cache_metrics()
            
            assert result is not None
            assert "cache_metrics" in result
            assert result["cache_metrics"]["hit_rate"] == 0.85


@pytest.mark.skipif(not TOOLS_AVAILABLE, reason="Backend tools not available")
class TestToolsIntegration:
    """Test integration between different tools."""
    
    @pytest.mark.asyncio
    async def test_tools_workflow(self):
        """Test a complete workflow using all tools."""
        # Initialize all tools
        analyzer = BackendAnalyzer()
        debugger = DatabaseDebugger()
        tracker = ServiceTracker()
        dashboard = MonitoringDashboard()
        
        # Mock all HTTP sessions
        with patch.object(analyzer.session, 'get') as mock_analyzer_get, \
             patch.object(debugger.session, 'get') as mock_debugger_get, \
             patch.object(tracker.session, 'get') as mock_tracker_get, \
             patch.object(dashboard.session, 'get') as mock_dashboard_get:
            
            # Set up mock responses
            mock_analyzer_response = Mock()
            mock_analyzer_response.json.return_value = {"memory_usage": {"rss": 100000000}}
            mock_analyzer_response.status_code = 200
            mock_analyzer_get.return_value = mock_analyzer_response
            
            mock_debugger_response = Mock()
            mock_debugger_response.json.return_value = {"performance_metrics": {"connection_count": 5}}
            mock_debugger_response.status_code = 200
            mock_debugger_get.return_value = mock_debugger_response
            
            mock_tracker_response = Mock()
            mock_tracker_response.json.return_value = {"startup_sequence": {"total_startup_time": 2.5}}
            mock_tracker_response.status_code = 200
            mock_tracker_get.return_value = mock_tracker_response
            
            mock_dashboard_response = Mock()
            mock_dashboard_response.json.return_value = {"system_overview": {"total_memory": 8000000000}}
            mock_dashboard_response.status_code = 200
            mock_dashboard_get.return_value = mock_dashboard_response
            
            # Run analyses
            memory_result = await analyzer.analyze_memory_usage()
            db_result = await debugger.analyze_database_performance()
            startup_result = await tracker.analyze_startup_sequence()
            overview_result = await dashboard.get_system_overview()
            
            # Verify results
            assert memory_result is not None
            assert db_result is not None
            assert startup_result is not None
            assert overview_result is not None
            
            # Verify all HTTP calls were made
            mock_analyzer_get.assert_called()
            mock_debugger_get.assert_called()
            mock_tracker_get.assert_called()
            mock_dashboard_get.assert_called()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
