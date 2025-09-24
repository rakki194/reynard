"""
Tests for the Codebase Scanner Service

Basic tests to verify service functionality.
"""

import tempfile
from pathlib import Path
from typing import Dict, Any

import pytest

from reynard_codebase_scanner import CodebaseScannerService


def test_service_initialization():
    """Test service initialization."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        assert service.root_path == Path(temp_dir).resolve()
        assert service.is_available is True
        assert service.last_analysis is None
        assert len(service.analysis_cache) == 0


def test_service_info():
    """Test service info retrieval."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        info = service.get_service_info()
        
        assert info['service_name'] == 'Codebase Scanner Service'
        assert info['version'] == '1.0.0'
        assert info['root_path'] == str(Path(temp_dir).resolve())
        assert info['is_available'] is True
        assert 'components' in info


def test_health_check():
    """Test health check functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        health = service.health_check()
        
        assert 'status' in health
        assert 'is_available' in health
        assert 'service_info' in health
        assert health['is_available'] is True


def test_analysis_empty_directory():
    """Test analysis of empty directory."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        results = service.analyze_codebase()
        
        assert 'metadata' in results
        assert 'file_analyses' in results
        assert 'language_statistics' in results
        assert results['metadata']['total_files'] == 0
        assert len(results['file_analyses']) == 0


def test_analysis_with_python_file():
    """Test analysis with a simple Python file."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a simple Python file
        python_file = Path(temp_dir) / "test.py"
        python_file.write_text("""
def hello_world():
    print("Hello, World!")

class TestClass:
    def __init__(self):
        self.value = 42
""")
        
        service = CodebaseScannerService(temp_dir)
        results = service.analyze_codebase()
        
        assert results['metadata']['total_files'] == 1
        assert len(results['file_analyses']) == 1
        
        file_analysis = results['file_analyses'][0]
        assert file_analysis['language'] == 'python'
        assert file_analysis['function_count'] == 1
        assert file_analysis['class_count'] == 1
        assert 'imports' in file_analysis


def test_export_functionality():
    """Test export functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        # Create some test data
        test_data = {
            'test': 'data',
            'nested': {
                'value': 123
            }
        }
        
        # Test JSON export
        export_result = service.export_analysis(
            analysis_data=test_data,
            output_path=str(Path(temp_dir) / "test_export"),
            format="json"
        )
        
        assert export_result['success'] is True
        assert export_result['format'] == 'json'
        assert Path(export_result['output_path']).exists()


def test_cache_functionality():
    """Test cache functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        # Initially empty
        assert len(service.list_cached_analyses()) == 0
        
        # Run analysis to populate cache
        service.analyze_codebase()
        
        # Should have cached analysis
        cached_keys = service.list_cached_analyses()
        assert len(cached_keys) > 0
        
        # Test getting cached analysis
        cached_data = service.get_cached_analysis(cached_keys[0])
        assert cached_data is not None
        
        # Test clearing cache
        service.clear_cache()
        assert len(service.list_cached_analyses()) == 0


def test_monitoring_status():
    """Test monitoring status functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        status = service.get_monitoring_status()
        assert 'is_monitoring' in status
        assert 'watchdog_available' in status
        assert 'root_path' in status
        assert status['is_monitoring'] is False


def test_change_history():
    """Test change history functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        history = service.get_change_history()
        assert isinstance(history, list)
        assert len(history) == 0


def test_analysis_summary():
    """Test analysis summary functionality."""
    with tempfile.TemporaryDirectory() as temp_dir:
        service = CodebaseScannerService(temp_dir)
        
        # No analysis yet
        summary = service.get_analysis_summary()
        assert 'error' in summary
        
        # Run analysis
        service.analyze_codebase()
        
        # Should have summary now
        summary = service.get_analysis_summary()
        assert 'metadata' in summary
        assert 'analysis_timestamp' in summary


if __name__ == "__main__":
    pytest.main([__file__])
