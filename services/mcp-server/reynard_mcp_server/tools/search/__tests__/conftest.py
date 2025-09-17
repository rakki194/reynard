#!/usr/bin/env python3
"""
Pytest Configuration for Search Tools Tests
==========================================

Configuration and fixtures for testing the search tools.
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import Mock, patch


@pytest.fixture(scope="session")
def temp_test_dir():
    """Create a temporary directory for all tests."""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir)


@pytest.fixture
def mock_subprocess():
    """Mock subprocess for testing ripgrep functionality."""
    with patch('subprocess.run') as mock:
        mock.return_value = Mock(
            returncode=0,
            stdout=b"test.py:1:test content\n",
            stderr=b""
        )
        yield mock


@pytest.fixture
def mock_rag_service():
    """Mock RAG service for testing semantic search."""
    with patch('services.semantic_search_service.SemanticSearchService') as mock:
        mock_instance = Mock()
        mock.return_value = mock_instance
        mock_instance.initialize.return_value = True
        mock_instance.search.return_value = {
            "results": [
                {
                    "file_path": "test.py",
                    "content": "test content",
                    "score": 0.9
                }
            ],
            "total_results": 1
        }
        mock_instance.embed_text.return_value = {
            "embedding": [0.1, 0.2, 0.3],
            "model": "test-model"
        }
        mock_instance.index_documents.return_value = {
            "indexed_documents": 1,
            "success": True
        }
        yield mock_instance


@pytest.fixture
def sample_project_structure(temp_test_dir):
    """Create a sample project structure for testing."""
    project_path = temp_test_dir / "sample_project"
    project_path.mkdir()
    
    # Create directories
    (project_path / "src").mkdir()
    (project_path / "tests").mkdir()
    (project_path / "docs").mkdir()
    (project_path / "config").mkdir()
    
    # Create sample files
    (project_path / "README.md").write_text("# Sample Project\n\nThis is a sample project for testing.")
    (project_path / "requirements.txt").write_text("flask==2.0.1\npytest==6.2.4\n")
    
    (project_path / "src" / "main.py").write_text("""
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run()
""")
    
    (project_path / "src" / "utils.py").write_text("""
def helper_function():
    '''Helper function for testing.'''
    return "helper"

class HelperClass:
    '''Helper class for testing.'''
    def __init__(self):
        self.value = "test"
""")
    
    (project_path / "tests" / "test_main.py").write_text("""
import pytest
from src.main import app

def test_hello():
    '''Test hello endpoint.'''
    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200
        assert b'Hello, World!' in response.data
""")
    
    (project_path / "config" / "settings.py").write_text("""
import os

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///app.db')
""")
    
    # Create ignored directories
    (project_path / "__pycache__").mkdir()
    (project_path / "__pycache__" / "main.pyc").write_text("compiled")
    (project_path / ".git").mkdir()
    (project_path / ".git" / "config").write_text("[core]")
    (project_path / "venv").mkdir()
    (project_path / "node_modules").mkdir()
    
    return project_path


@pytest.fixture
def large_project_structure(temp_test_dir):
    """Create a large project structure for performance testing."""
    project_path = temp_test_dir / "large_project"
    project_path.mkdir()
    
    # Create many directories and files
    for i in range(10):
        (project_path / f"module_{i}").mkdir()
        for j in range(10):
            (project_path / f"module_{i}" / f"file_{j}.py").write_text(f"""
def function_{i}_{j}():
    '''Function {i}_{j} for testing.'''
    return {i * j}

class Class{i}_{j}:
    '''Class {i}_{j} for testing.'''
    def __init__(self):
        self.value = {i * j}
""")
    
    # Create ignored directories
    (project_path / "__pycache__").mkdir()
    (project_path / ".git").mkdir()
    (project_path / "venv").mkdir()
    (project_path / "node_modules").mkdir()
    
    return project_path


# Pytest configuration
def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection."""
    for item in items:
        # Mark tests in test_nlp_queries.py as integration tests
        if "test_nlp_queries" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        
        # Mark tests with "performance" in the name as slow
        if "performance" in item.name:
            item.add_marker(pytest.mark.slow)
        
        # Mark tests with "large" in the name as slow
        if "large" in item.name:
            item.add_marker(pytest.mark.slow)

