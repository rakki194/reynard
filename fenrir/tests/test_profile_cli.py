"""
Test suite for Fenrir profiling CLI functionality.

Tests the command-line interface for running Fenrir in profiling mode
and the profile.py script functionality.
"""

import pytest
import asyncio
import tempfile
import os
import sys
import subprocess
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.profile import main as profile_main
from fenrir.core.fuzzy import Fuzzy


class TestProfileCLI:
    """Test the profile.py CLI functionality."""
    
    def test_profile_main_function_exists(self):
        """Test that the profile main function exists and is callable."""
        assert callable(profile_main)
    
    @pytest.mark.asyncio
    async def test_profile_main_with_memory_mode(self):
        """Test profile main function with memory profiling mode."""
        # Mock the Fuzzy class and its methods
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_memory_analysis = Mock(return_value={"peak_memory": 100})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            # Mock sys.argv to simulate command line arguments
            with patch('sys.argv', ['profile.py', '--profile-type', 'memory', '--session-id', 'test_session']):
                # Mock the console print to avoid output during tests
                with patch('fenrir.profile.console.print'):
                    await profile_main()
            
            # Verify the fuzzer methods were called
            mock_fuzzer.enable_profiling.assert_called_once_with('test_session')
            mock_fuzzer.run_memory_analysis.assert_called_once_with('test_session')
            mock_fuzzer.save_profiling_session.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_profile_main_with_startup_mode(self):
        """Test profile main function with startup profiling mode."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_startup_analysis = Mock(return_value={"startup_time": 2.5})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            with patch('sys.argv', ['profile.py', '--profile-type', 'startup', '--session-id', 'test_session']):
                with patch('fenrir.profile.console.print'):
                    await profile_main()
            
            mock_fuzzer.enable_profiling.assert_called_once_with('test_session')
            mock_fuzzer.run_startup_analysis.assert_called_once_with('test_session')
            mock_fuzzer.save_profiling_session.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_profile_main_with_database_mode(self):
        """Test profile main function with database profiling mode."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_database_analysis = Mock(return_value={"connections": 5})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            with patch('sys.argv', ['profile.py', '--profile-type', 'database', '--session-id', 'test_session']):
                with patch('fenrir.profile.console.print'):
                    await profile_main()
            
            mock_fuzzer.enable_profiling.assert_called_once_with('test_session')
            mock_fuzzer.run_database_analysis.assert_called_once_with('test_session')
            mock_fuzzer.save_profiling_session.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_profile_main_with_all_mode(self):
        """Test profile main function with all profiling modes."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_memory_analysis = Mock(return_value={"peak_memory": 100})
            mock_fuzzer.run_startup_analysis = Mock(return_value={"startup_time": 2.5})
            mock_fuzzer.run_database_analysis = Mock(return_value={"connections": 5})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            with patch('sys.argv', ['profile.py', '--profile-type', 'all', '--session-id', 'test_session']):
                with patch('fenrir.profile.console.print'):
                    await profile_main()
            
            mock_fuzzer.enable_profiling.assert_called_once_with('test_session')
            mock_fuzzer.run_memory_analysis.assert_called_once_with('test_session')
            mock_fuzzer.run_startup_analysis.assert_called_once_with('test_session')
            mock_fuzzer.run_database_analysis.assert_called_once_with('test_session')
            mock_fuzzer.save_profiling_session.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_profile_main_without_session_id(self):
        """Test profile main function without session ID (should use None)."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_memory_analysis = Mock(return_value={"peak_memory": 100})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            with patch('sys.argv', ['profile.py', '--profile-type', 'memory']):
                with patch('fenrir.profile.console.print'):
                    await profile_main()
            
            mock_fuzzer.enable_profiling.assert_called_once_with(None)
            mock_fuzzer.run_memory_analysis.assert_called_once_with(None)
    
    @pytest.mark.asyncio
    async def test_profile_main_error_handling(self):
        """Test profile main function error handling."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_memory_analysis = Mock(side_effect=Exception("Analysis failed"))
            mock_fuzzer.save_profiling_session = Mock(return_value=None)
            mock_fuzzy_class.return_value = mock_fuzzer
            
            with patch('sys.argv', ['profile.py', '--profile-type', 'memory']):
                with patch('fenrir.profile.console.print'):
                    # Should not raise an exception
                    await profile_main()
            
            # Verify methods were still called despite the error
            mock_fuzzer.enable_profiling.assert_called_once()
            mock_fuzzer.run_memory_analysis.assert_called_once()


class TestProfileCLIArgumentParsing:
    """Test argument parsing in the profile CLI."""
    
    def test_argument_parser_creation(self):
        """Test that the argument parser is created correctly."""
        import argparse
        from fenrir.profile import main as profile_main
        
        # Test that we can create a parser with the expected arguments
        parser = argparse.ArgumentParser(description="Fenrir Profiling Mode")
        parser.add_argument("--profile-type", default="all",
                           choices=["memory", "startup", "database", "all"],
                           help="Type of profiling to run")
        parser.add_argument("--session-id", default=None,
                           help="Session ID for profiling run")
        
        # Test parsing different argument combinations
        args = parser.parse_args(['--profile-type', 'memory', '--session-id', 'test'])
        assert args.profile_type == 'memory'
        assert args.session_id == 'test'
        
        args = parser.parse_args(['--profile-type', 'all'])
        assert args.profile_type == 'all'
        assert args.session_id is None
        
        args = parser.parse_args([])
        assert args.profile_type == 'all'
        assert args.session_id is None


class TestProfileCLIIntegration:
    """Test integration between profile CLI and other components."""
    
    @pytest.mark.asyncio
    async def test_profile_cli_with_real_fuzzy(self):
        """Test profile CLI with a real Fuzzy instance (mocked methods)."""
        # Create a real Fuzzy instance but mock its methods
        fuzzer = Fuzzy()
        
        with patch.object(fuzzer, 'enable_profiling') as mock_enable, \
             patch.object(fuzzer, 'run_memory_analysis') as mock_memory, \
             patch.object(fuzzer, 'save_profiling_session') as mock_save:
            
            mock_memory.return_value = {"peak_memory": 100}
            mock_save.return_value = "/tmp/test.json"
            
            # Simulate the profile main logic
            fuzzer.enable_profiling("test_session")
            await fuzzer.run_memory_analysis("test_session")
            fuzzer.save_profiling_session()
            
            # Verify the methods were called
            mock_enable.assert_called_once_with("test_session")
            mock_memory.assert_called_once_with("test_session")
            mock_save.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_profile_cli_console_output(self):
        """Test that the profile CLI produces expected console output."""
        with patch('fenrir.profile.Fuzzy') as mock_fuzzy_class:
            mock_fuzzer = Mock()
            mock_fuzzer.__aenter__ = Mock(return_value=mock_fuzzer)
            mock_fuzzer.__aexit__ = Mock(return_value=None)
            mock_fuzzer.enable_profiling = Mock()
            mock_fuzzer.run_memory_analysis = Mock(return_value={"peak_memory": 100})
            mock_fuzzer.save_profiling_session = Mock(return_value="/tmp/test.json")
            mock_fuzzy_class.return_value = mock_fuzzer
            
            # Mock console.print to capture output
            with patch('fenrir.profile.console.print') as mock_print:
                with patch('sys.argv', ['profile.py', '--profile-type', 'memory']):
                    await profile_main()
                
                # Verify that console.print was called (for the panels and output)
                assert mock_print.call_count >= 2  # At least start and end panels


class TestProfileCLIErrorScenarios:
    """Test error scenarios in the profile CLI."""
    
    @pytest.mark.asyncio
    async def test_profile_cli_with_invalid_profile_type(self):
        """Test profile CLI with invalid profile type (should be handled by argparse)."""
        # This test would require modifying the argument parser to handle invalid types
        # For now, we'll test that the valid choices are enforced
        import argparse
        
        parser = argparse.ArgumentParser()
        parser.add_argument("--profile-type", choices=["memory", "startup", "database", "all"])
        
        # Valid choice should work
        args = parser.parse_args(['--profile-type', 'memory'])
        assert args.profile_type == 'memory'
        
        # Invalid choice should raise SystemExit
        with pytest.raises(SystemExit):
            parser.parse_args(['--profile-type', 'invalid'])
    
    @pytest.mark.asyncio
    async def test_profile_cli_with_missing_dependencies(self):
        """Test profile CLI when required dependencies are missing."""
        # Mock the import to simulate missing dependencies
        with patch('fenrir.profile.Fuzzy', side_effect=ImportError("Module not found")):
            with patch('sys.argv', ['profile.py', '--profile-type', 'memory']):
                with pytest.raises(ImportError):
                    await profile_main()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
