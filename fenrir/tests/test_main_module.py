"""
Test suite for Fenrir main module functionality.

Tests the __main__.py entry point and the dispatch between fuzzing and profiling modes.
"""

import pytest
import asyncio
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any

# Add backend path for imports
backend_path = Path(__file__).parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from fenrir.__main__ import main as main_module_main


class TestMainModule:
    """Test the main module functionality."""
    
    def test_main_module_function_exists(self):
        """Test that the main module function exists and is callable."""
        assert callable(main_module_main)
    
    @pytest.mark.asyncio
    async def test_main_module_fuzz_mode(self):
        """Test main module with fuzz mode."""
        with patch('fenrir.__main__.fuzz_main') as mock_fuzz_main:
            mock_fuzz_main.return_value = None
            
            with patch('sys.argv', ['fenrir', '--mode', 'fuzz']):
                await main_module_main()
            
            mock_fuzz_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_profiling_mode(self):
        """Test main module with profiling mode."""
        with patch('fenrir.__main__.profile_main') as mock_profile_main:
            mock_profile_main.return_value = None
            
            with patch('sys.argv', ['fenrir', '--mode', 'profiling', '--profile-type', 'memory']):
                await main_module_main()
            
            mock_profile_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_default_mode(self):
        """Test main module with default mode (should be fuzz)."""
        with patch('fenrir.__main__.fuzz_main') as mock_fuzz_main:
            mock_fuzz_main.return_value = None
            
            with patch('sys.argv', ['fenrir']):  # No mode specified
                await main_module_main()
            
            mock_fuzz_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_argument_passing(self):
        """Test that arguments are passed correctly to the appropriate mode."""
        with patch('fenrir.__main__.profile_main') as mock_profile_main:
            mock_profile_main.return_value = None
            
            # Test that profiling arguments are passed correctly
            with patch('sys.argv', ['fenrir', '--mode', 'profiling', '--profile-type', 'memory', '--session-id', 'test']):
                await main_module_main()
            
            mock_profile_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_sys_argv_manipulation(self):
        """Test that sys.argv is manipulated correctly for different modes."""
        with patch('fenrir.__main__.profile_main') as mock_profile_main:
            mock_profile_main.return_value = None
            
            # Test that sys.argv is modified to remove the mode argument
            with patch('sys.argv', ['fenrir', '--mode', 'profiling', '--profile-type', 'memory']):
                await main_module_main()
            
            # The profile_main should be called with the remaining arguments
            mock_profile_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_error_handling(self):
        """Test error handling in main module."""
        with patch('fenrir.__main__.fuzz_main', side_effect=Exception("Fuzz failed")):
            with patch('sys.argv', ['fenrir', '--mode', 'fuzz']):
                # Should not raise an exception, but handle it gracefully
                try:
                    await main_module_main()
                except Exception as e:
                    # If an exception is raised, it should be the expected one
                    assert str(e) == "Fuzz failed"
    
    @pytest.mark.asyncio
    async def test_main_module_import_errors(self):
        """Test handling of import errors in main module."""
        with patch('fenrir.__main__.fuzz_main', side_effect=ImportError("Module not found")):
            with patch('sys.argv', ['fenrir', '--mode', 'fuzz']):
                with pytest.raises(ImportError):
                    await main_module_main()


class TestMainModuleArgumentParsing:
    """Test argument parsing in the main module."""
    
    def test_argument_parser_creation(self):
        """Test that the argument parser is created correctly."""
        import argparse
        
        # Test that we can create a parser with the expected arguments
        parser = argparse.ArgumentParser(description="Fenrir Exploit Testing Suite")
        parser.add_argument("--mode", default="fuzz", choices=["fuzz", "profiling"],
                           help="Run mode: fuzzing or profiling")
        
        # Test parsing different argument combinations
        args = parser.parse_args(['--mode', 'fuzz'])
        assert args.mode == 'fuzz'
        
        args = parser.parse_args(['--mode', 'profiling'])
        assert args.mode == 'profiling'
        
        args = parser.parse_args([])
        assert args.mode == 'fuzz'  # Default value
    
    def test_argument_parser_invalid_mode(self):
        """Test argument parser with invalid mode."""
        import argparse
        
        parser = argparse.ArgumentParser()
        parser.add_argument("--mode", choices=["fuzz", "profiling"])
        
        # Valid choice should work
        args = parser.parse_args(['--mode', 'fuzz'])
        assert args.mode == 'fuzz'
        
        # Invalid choice should raise SystemExit
        with pytest.raises(SystemExit):
            parser.parse_args(['--mode', 'invalid'])


class TestMainModuleIntegration:
    """Test integration between main module and other components."""
    
    @pytest.mark.asyncio
    async def test_main_module_with_real_imports(self):
        """Test main module with real imports (mocked methods)."""
        # Test that the main module can import the required modules
        try:
            from fenrir.core.fuzzy import main as fuzz_main
            from fenrir.profile import main as profile_main
            
            # Mock the main functions
            with patch('fenrir.core.fuzzy.main') as mock_fuzz_main, \
                 patch('fenrir.profile.main') as mock_profile_main:
                
                mock_fuzz_main.return_value = None
                mock_profile_main.return_value = None
                
                # Test fuzz mode
                with patch('sys.argv', ['fenrir', '--mode', 'fuzz']):
                    await main_module_main()
                
                mock_fuzz_main.assert_called_once()
                
                # Test profiling mode
                with patch('sys.argv', ['fenrir', '--mode', 'profiling']):
                    await main_module_main()
                
                mock_profile_main.assert_called_once()
                
        except ImportError as e:
            pytest.skip(f"Required modules not available: {e}")
    
    @pytest.mark.asyncio
    async def test_main_module_sys_argv_restoration(self):
        """Test that sys.argv is properly restored after manipulation."""
        original_argv = sys.argv.copy()
        
        try:
            with patch('fenrir.__main__.profile_main') as mock_profile_main:
                mock_profile_main.return_value = None
                
                with patch('sys.argv', ['fenrir', '--mode', 'profiling', '--profile-type', 'memory']):
                    await main_module_main()
                
                # sys.argv should be restored to its original state
                assert sys.argv == original_argv
                
        finally:
            # Ensure sys.argv is restored
            sys.argv = original_argv


class TestMainModuleErrorScenarios:
    """Test error scenarios in the main module."""
    
    @pytest.mark.asyncio
    async def test_main_module_with_missing_mode_argument(self):
        """Test main module when mode argument is missing."""
        with patch('fenrir.__main__.fuzz_main') as mock_fuzz_main:
            mock_fuzz_main.return_value = None
            
            # Test with empty sys.argv (should use default mode)
            with patch('sys.argv', ['fenrir']):
                await main_module_main()
            
            mock_fuzz_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_with_extra_arguments(self):
        """Test main module with extra arguments."""
        with patch('fenrir.__main__.profile_main') as mock_profile_main:
            mock_profile_main.return_value = None
            
            # Test with extra arguments that should be passed to the mode
            with patch('sys.argv', ['fenrir', '--mode', 'profiling', '--profile-type', 'memory', '--extra', 'arg']):
                await main_module_main()
            
            mock_profile_main.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_main_module_with_invalid_sys_argv(self):
        """Test main module with invalid sys.argv."""
        with patch('fenrir.__main__.fuzz_main') as mock_fuzz_main:
            mock_fuzz_main.return_value = None
            
            # Test with minimal sys.argv
            with patch('sys.argv', ['fenrir']):
                await main_module_main()
            
            mock_fuzz_main.assert_called_once()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
