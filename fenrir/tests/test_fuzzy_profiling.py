"""
Test suite for Fenrir Fuzzy class profiling integration.

Tests the integration of profiling capabilities into the main Fuzzy class
and the profiling mode functionality.
"""

import pytest
import asyncio
import tempfile
import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any
from datetime import datetime, timezone

from fenrir.core.fuzzy import Fuzzy
from fenrir.core.profiler import FenrirProfiler, ProfilingSession

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.core.fuzzy import Fuzzy
from fenrir.core.profiler import FenrirProfiler


class TestFuzzyProfilingIntegration:
    """Test the integration of profiling capabilities into the Fuzzy class."""
    
    def test_fuzzy_initialization_with_profiling(self):
        """Test Fuzzy class initializes with profiling attributes."""
        fuzzer = Fuzzy()
        
        assert hasattr(fuzzer, 'profiler')
        assert hasattr(fuzzer, 'profiling_enabled')
        assert fuzzer.profiler is None
        assert fuzzer.profiling_enabled is False
    
    def test_enable_profiling(self):
        """Test enabling profiling mode."""
        fuzzer = Fuzzy()
        
        fuzzer.enable_profiling("test_session")
        
        assert fuzzer.profiling_enabled is True
        assert fuzzer.profiler is not None
        assert isinstance(fuzzer.profiler, FenrirProfiler)
    
    def test_disable_profiling(self):
        """Test disabling profiling mode."""
        fuzzer = Fuzzy()
        
        # Enable first
        fuzzer.enable_profiling("test_session")
        assert fuzzer.profiling_enabled is True
        
        # Disable
        fuzzer.disable_profiling()
        
        assert fuzzer.profiling_enabled is False
        assert fuzzer.profiler is None
    
    @pytest.mark.asyncio
    async def test_run_memory_analysis(self):
        """Test running memory analysis through Fuzzy."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("test_session")
        
        # Mock the profiler's run_memory_analysis method
        with patch.object(fuzzer.profiler, 'run_memory_analysis') as mock_analysis:
            from fenrir.core.profiler import ProfilingSession
            from datetime import datetime, timezone
            
            mock_session = ProfilingSession("test_session", datetime.now(timezone.utc))
            mock_session.end_time = datetime.now(timezone.utc)
            mock_session.snapshots = []
            mock_session.results = []
            mock_session.backend_analysis = {"test": "data"}
            mock_session.database_analysis = {"test": "data"}
            mock_session.service_analysis = {"test": "data"}
            
            mock_analysis.return_value = mock_session
            
            result = await fuzzer.run_memory_analysis("test_session")
            
            assert result is not None
            assert isinstance(result, dict)
            assert "session_id" in result
            assert "duration" in result
            assert "snapshots" in result
            assert "issues_found" in result
            mock_analysis.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_run_startup_analysis(self):
        """Test running startup analysis through Fuzzy."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("test_session")
        
        # Mock the profiler's run_startup_profiling method
        with patch.object(fuzzer.profiler, 'run_startup_profiling') as mock_analysis:
            mock_analysis.return_value = {"startup_time": 2.5, "services": 10}
            
            result = await fuzzer.run_startup_analysis("test_session")
            
            assert result is not None
            assert isinstance(result, dict)
            mock_analysis.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_run_database_analysis(self):
        """Test running database analysis through Fuzzy."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("test_session")
        
        # Mock the profiler's run_database_profiling method
        with patch.object(fuzzer.profiler, 'run_database_profiling') as mock_analysis:
            mock_analysis.return_value = {"connections": 5, "queries": 100}
            
            result = await fuzzer.run_database_analysis("test_session")
            
            assert result is not None
            assert isinstance(result, dict)
            mock_analysis.assert_called_once()
    
    def test_save_profiling_session(self):
        """Test saving profiling session through Fuzzy."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("test_session")
        
        # Mock the profiler's save_last_session method
        with patch.object(fuzzer.profiler, 'save_last_session') as mock_save:
            mock_save.return_value = "/tmp/test_session.json"
            
            result = fuzzer.save_profiling_session()
            
            assert result is not None
            assert result == "/tmp/test_session.json"
            mock_save.assert_called_once()
    
    def test_save_profiling_session_no_profiler(self):
        """Test saving profiling session when profiler is not enabled."""
        fuzzer = Fuzzy()
        
        # Don't enable profiling
        result = fuzzer.save_profiling_session()
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_profiling_without_enabling(self):
        """Test running profiling methods without enabling profiling first."""
        fuzzer = Fuzzy()
        
        # Try to run analysis without enabling profiling
        result = await fuzzer.run_memory_analysis("test_session")
        
        # The Fuzzy class automatically enables profiling when run_memory_analysis is called
        # So we should get a result, not None
        assert result is not None
        assert isinstance(result, dict)
        assert "session_id" in result
    
    @pytest.mark.asyncio
    async def test_full_profiling_workflow(self):
        """Test a complete profiling workflow through Fuzzy."""
        fuzzer = Fuzzy()
        
        # Enable profiling
        fuzzer.enable_profiling("workflow_test")
        
        # Mock all the profiler methods
        with patch.object(fuzzer.profiler, 'run_memory_analysis') as mock_memory, \
             patch.object(fuzzer.profiler, 'run_startup_profiling') as mock_startup, \
             patch.object(fuzzer.profiler, 'run_database_profiling') as mock_database, \
             patch.object(fuzzer.profiler, 'save_last_session') as mock_save:
            
            # Set up mock return values
            mock_session = ProfilingSession("workflow_test", datetime.now(timezone.utc))
            mock_session.end_time = datetime.now(timezone.utc)
            mock_session.snapshots = []
            mock_session.results = []
            mock_session.backend_analysis = {"test": "data"}
            mock_session.database_analysis = {"test": "data"}
            mock_session.service_analysis = {"test": "data"}
            
            mock_memory.return_value = mock_session
            mock_startup.return_value = {"startup_time": 2.5}
            mock_database.return_value = {"connections": 5}
            mock_save.return_value = "/tmp/workflow_test.json"
            
            # Run all analyses
            memory_result = await fuzzer.run_memory_analysis("workflow_test")
            startup_result = await fuzzer.run_startup_analysis("workflow_test")
            database_result = await fuzzer.run_database_analysis("workflow_test")
            
            # Save the session
            save_result = fuzzer.save_profiling_session()
            
            # Verify all methods were called
            mock_memory.assert_called_once()
            mock_startup.assert_called_once()
            mock_database.assert_called_once()
            mock_save.assert_called_once()
            
            # Verify results
            assert memory_result is not None
            assert startup_result is not None
            assert database_result is not None
            assert save_result == "/tmp/workflow_test.json"


class TestFuzzyProfilingErrorHandling:
    """Test error handling in Fuzzy profiling methods."""
    
    @pytest.mark.asyncio
    async def test_memory_analysis_error_handling(self):
        """Test error handling in memory analysis."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("error_test")
        
        # Mock the profiler to raise an exception
        with patch.object(fuzzer.profiler, 'run_memory_analysis') as mock_analysis:
            mock_analysis.side_effect = Exception("Memory analysis failed")
            
            # Should handle the error gracefully
            with pytest.raises(Exception, match="Memory analysis failed"):
                await fuzzer.run_memory_analysis("error_test")
    
    @pytest.mark.asyncio
    async def test_startup_analysis_error_handling(self):
        """Test error handling in startup analysis."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("error_test")
        
        # Mock the profiler to raise an exception
        with patch.object(fuzzer.profiler, 'run_startup_profiling') as mock_analysis:
            mock_analysis.side_effect = Exception("Startup analysis failed")
            
            # Should handle the error gracefully
            with pytest.raises(Exception, match="Startup analysis failed"):
                await fuzzer.run_startup_analysis("error_test")
    
    @pytest.mark.asyncio
    async def test_database_analysis_error_handling(self):
        """Test error handling in database analysis."""
        fuzzer = Fuzzy()
        fuzzer.enable_profiling("error_test")
        
        # Mock the profiler to raise an exception
        with patch.object(fuzzer.profiler, 'run_database_profiling') as mock_analysis:
            mock_analysis.side_effect = Exception("Database analysis failed")
            
            # Should handle the error gracefully
            with pytest.raises(Exception, match="Database analysis failed"):
                await fuzzer.run_database_analysis("error_test")


class TestFuzzyProfilingContextManager:
    """Test Fuzzy profiling with context manager (async with)."""
    
    @pytest.mark.asyncio
    async def test_fuzzy_context_manager_with_profiling(self):
        """Test using Fuzzy as a context manager with profiling enabled."""
        async with Fuzzy() as fuzzer:
            fuzzer.enable_profiling("context_test")
            
            assert fuzzer.profiling_enabled is True
            assert fuzzer.profiler is not None
            
            # Mock the profiler methods
            with patch.object(fuzzer.profiler, 'run_memory_analysis') as mock_memory:
                mock_session = ProfilingSession("context_test", datetime.now(timezone.utc))
                mock_session.end_time = datetime.now(timezone.utc)
                mock_session.snapshots = []
                mock_session.results = []
                mock_session.backend_analysis = {"test": "data"}
                mock_session.database_analysis = {"test": "data"}
                mock_session.service_analysis = {"test": "data"}
                mock_memory.return_value = mock_session
                
                result = await fuzzer.run_memory_analysis("context_test")
                assert result is not None
                assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_fuzzy_context_manager_cleanup(self):
        """Test that Fuzzy context manager cleans up properly."""
        async with Fuzzy() as fuzzer:
            fuzzer.enable_profiling("cleanup_test")
            
            # Verify profiling is enabled
            assert fuzzer.profiling_enabled is True
        
        # After exiting the context, the fuzzer should be cleaned up
        # (This tests the context manager cleanup, not profiling specifically)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
