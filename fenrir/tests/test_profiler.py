"""
Test suite for Fenrir profiling capabilities.

Tests the MemoryProfiler, ProfilingSession, and FenrirProfiler classes
along with their integration with backend analysis tools.
"""

import pytest
import asyncio
import tempfile
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.core.profiler import (
    MemoryProfiler,
    ProfilingSession,
    FenrirProfiler,
    MemorySnapshot,
    ProfilingResult,
    BACKEND_TOOLS_AVAILABLE
)


class TestMemoryProfiler:
    """Test the MemoryProfiler class functionality."""
    
    def test_memory_profiler_initialization(self):
        """Test MemoryProfiler initializes correctly."""
        profiler = MemoryProfiler()
        assert profiler is not None
        assert hasattr(profiler, 'session')
        assert hasattr(profiler, 'process')
        assert profiler.session is not None
        assert profiler.session_id is not None
    
    def test_take_memory_snapshot(self):
        """Test taking memory snapshots."""
        profiler = MemoryProfiler()
        initial_count = len(profiler.session.snapshots)
        
        snapshot = profiler.take_memory_snapshot("test_snapshot")
        
        assert snapshot is not None
        assert len(profiler.session.snapshots) == initial_count + 1
        assert snapshot.context == "test_snapshot"
        assert snapshot.timestamp is not None
        assert snapshot.rss_mb > 0
        assert snapshot.vms_mb > 0
    
    def test_start_stop_tracemalloc(self):
        """Test starting and stopping tracemalloc."""
        profiler = MemoryProfiler()
        
        assert profiler.tracemalloc_enabled is False
        
        profiler.start_tracemalloc()
        assert profiler.tracemalloc_enabled is True
        
        profiler.stop_tracemalloc()
        assert profiler.tracemalloc_enabled is False
    
    def test_memory_snapshot_with_tracemalloc(self):
        """Test taking memory snapshot with tracemalloc enabled."""
        profiler = MemoryProfiler()
        profiler.start_tracemalloc()
        
        snapshot = profiler.take_memory_snapshot("test_with_tracemalloc")
        
        assert snapshot is not None
        assert snapshot.tracemalloc_mb >= 0
        assert snapshot.gc_objects > 0
        
        profiler.stop_tracemalloc()
    
    def test_session_management(self):
        """Test session management functionality."""
        profiler = MemoryProfiler("test_session")
        
        assert profiler.session_id == "test_session"
        assert profiler.session.session_id == "test_session"
        assert profiler.session.start_time is not None
        assert profiler.session.end_time is None


class TestProfilingSession:
    """Test the ProfilingSession class functionality."""
    
    def test_profiling_session_initialization(self):
        """Test ProfilingSession initializes correctly."""
        from datetime import datetime, timezone
        session = ProfilingSession("test_session", datetime.now(timezone.utc))
        
        assert session.session_id == "test_session"
        assert session.start_time is not None
        assert session.end_time is None
        assert session.snapshots == []
        assert session.results == []
    
    def test_session_lifecycle(self):
        """Test session start and end lifecycle."""
        from datetime import datetime, timezone
        session = ProfilingSession("test_session", datetime.now(timezone.utc))
        
        assert session.end_time is None
        
        session.end_time = datetime.now(timezone.utc)
        
        assert session.end_time is not None
        assert (session.end_time - session.start_time).total_seconds() >= 0
    
    def test_session_data_structures(self):
        """Test session data structures."""
        from datetime import datetime, timezone
        session = ProfilingSession("test_session", datetime.now(timezone.utc))
        
        # Test that we can add snapshots and results
        snapshot = MemorySnapshot(
            timestamp=datetime.now(timezone.utc),
            rss_mb=100.0,
            vms_mb=200.0,
            percent=5.0,
            available_mb=8000.0
        )
        session.snapshots.append(snapshot)
        
        result = ProfilingResult(
            category="test",
            severity="low",
            issue="Test issue",
            recommendation="Test recommendation"
        )
        session.results.append(result)
        
        assert len(session.snapshots) == 1
        assert len(session.results) == 1
        assert session.snapshots[0].rss_mb == 100.0
        assert session.results[0].category == "test"


class TestFenrirProfiler:
    """Test the FenrirProfiler class functionality."""
    
    def test_fenrir_profiler_initialization(self):
        """Test FenrirProfiler initializes correctly."""
        profiler = FenrirProfiler()
        
        assert profiler is not None
        assert hasattr(profiler, 'profiler')
        assert profiler.profiler is None
    
    @pytest.mark.asyncio
    async def test_run_memory_analysis(self):
        """Test running memory analysis."""
        profiler = FenrirProfiler()
        
        # Mock the backend tools if not available
        if not BACKEND_TOOLS_AVAILABLE:
            with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', True):
                with patch('fenrir.core.profiler.BackendAnalyzer') as mock_analyzer, \
                     patch('fenrir.core.profiler.DatabaseDebugger') as mock_debugger, \
                     patch('fenrir.core.profiler.ServiceTracker') as mock_tracker:
                    
                    # Mock the analyzer methods
                    mock_analyzer.return_value.analyze_import_costs.return_value = {"imports": []}
                    mock_analyzer.return_value.analyze_memory_hotspots.return_value = {"hotspots": []}
                    mock_debugger.return_value.analyze_connection_pools.return_value = {"pools": []}
                    mock_debugger.return_value.analyze_query_performance.return_value = {"queries": []}
                    mock_debugger.return_value.check_connection_health.return_value = {"health": "good"}
                    mock_debugger.return_value.get_optimization_recommendations.return_value = {"recommendations": []}
                    mock_tracker.return_value.track_service_startup.return_value = {"services": []}
                    mock_tracker.return_value.get_service_status.return_value = {"status": "running"}
                    
                    result = await profiler.run_memory_analysis("test_session")
                    
                    assert result is not None
                    assert hasattr(result, 'session_id')
                    assert result.session_id == "test_session"
        else:
            # If backend tools are available, run the actual analysis
            result = await profiler.run_memory_analysis("test_session")
            assert result is not None
    
    @pytest.mark.asyncio
    async def test_run_startup_profiling(self):
        """Test running startup profiling."""
        profiler = FenrirProfiler()
        
        # Mock the backend tools if not available
        if not BACKEND_TOOLS_AVAILABLE:
            with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', True):
                with patch('fenrir.core.profiler.BackendAnalyzer') as mock_analyzer, \
                     patch('fenrir.core.profiler.ServiceTracker') as mock_tracker:
                    
                    # Mock the analyzer methods
                    mock_analyzer.return_value.analyze_import_costs.return_value = {"imports": []}
                    mock_analyzer.return_value.analyze_memory_hotspots.return_value = {"hotspots": []}
                    mock_tracker.return_value.track_service_startup.return_value = {"services": []}
                    
                    result = await profiler.run_startup_profiling("test_session")
                    
                    assert result is not None
                    assert isinstance(result, dict)
        else:
            # If backend tools are available, run the actual analysis
            result = await profiler.run_startup_profiling("test_session")
            assert result is not None
    
    @pytest.mark.asyncio
    async def test_run_database_profiling(self):
        """Test running database profiling."""
        profiler = FenrirProfiler()
        
        # Mock the backend tools if not available
        if not BACKEND_TOOLS_AVAILABLE:
            with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', True):
                with patch('fenrir.core.profiler.DatabaseDebugger') as mock_debugger:
                    
                    # Mock the debugger methods
                    mock_debugger.return_value.analyze_connection_pools.return_value = {"pools": []}
                    mock_debugger.return_value.analyze_query_performance.return_value = {"queries": []}
                    mock_debugger.return_value.check_connection_health.return_value = {"health": "good"}
                    mock_debugger.return_value.get_optimization_recommendations.return_value = {"recommendations": []}
                    
                    result = await profiler.run_database_profiling("test_session")
                    
                    assert result is not None
                    assert isinstance(result, dict)
        else:
            # If backend tools are available, run the actual analysis
            result = await profiler.run_database_profiling("test_session")
            assert result is not None
    
    def test_save_last_session(self):
        """Test saving the last session."""
        profiler = FenrirProfiler()
        
        # Create a mock profiler with a session
        with patch('fenrir.core.profiler.MemoryProfiler') as mock_memory_profiler:
            mock_profiler_instance = Mock()
            mock_profiler_instance.save_session.return_value = Path("/tmp/test.json")
            mock_profiler_instance.session = Mock()
            
            profiler.profiler = mock_profiler_instance
            
            result = profiler.save_last_session()
            
            assert result is not None
            # The result should be the return value of the mock
            assert result == Path("/tmp/test.json")
            mock_profiler_instance.save_session.assert_called_once()
    
    def test_save_last_session_no_profiler(self):
        """Test saving when no profiler exists."""
        profiler = FenrirProfiler()
        
        result = profiler.save_last_session()
        
        assert result is None


class TestFenrirProfilerIntegration:
    """Test integration between FenrirProfiler and backend tools."""
    
    @pytest.mark.asyncio
    async def test_full_profiling_workflow(self):
        """Test a complete profiling workflow."""
        profiler = FenrirProfiler()
        
        try:
            # Run all analysis types
            if BACKEND_TOOLS_AVAILABLE:
                result = await profiler.run_memory_analysis("integration_test")
                assert result is not None
            else:
                # Mock the tools for testing
                with patch('fenrir.core.profiler.BACKEND_TOOLS_AVAILABLE', True):
                    with patch('fenrir.core.profiler.BackendAnalyzer') as mock_analyzer, \
                         patch('fenrir.core.profiler.DatabaseDebugger') as mock_debugger, \
                         patch('fenrir.core.profiler.ServiceTracker') as mock_tracker:
                        
                        # Mock all the methods
                        mock_analyzer.return_value.analyze_import_costs.return_value = {"imports": []}
                        mock_analyzer.return_value.analyze_memory_hotspots.return_value = {"hotspots": []}
                        mock_debugger.return_value.analyze_connection_pools.return_value = {"pools": []}
                        mock_debugger.return_value.analyze_query_performance.return_value = {"queries": []}
                        mock_debugger.return_value.check_connection_health.return_value = {"health": "good"}
                        mock_debugger.return_value.get_optimization_recommendations.return_value = {"recommendations": []}
                        mock_tracker.return_value.track_service_startup.return_value = {"services": []}
                        mock_tracker.return_value.get_service_status.return_value = {"status": "running"}
                        
                        result = await profiler.run_memory_analysis("integration_test")
                        assert result is not None
                        
        except Exception as e:
            pytest.fail(f"Integration test failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])