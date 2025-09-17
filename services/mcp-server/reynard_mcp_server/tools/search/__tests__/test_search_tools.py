#!/usr/bin/env python3
"""
Tests for Search Tools
=====================

Test the unified search tools with natural language queries and syntax validation.
"""

import pytest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock
from ..search_tools import SearchTools
from ..bm25_search import BM25SearchEngine, ReynardBM25Search
from ..file_search import FileSearchEngine
from ..semantic_search import SemanticSearchEngine
from ..ripgrep_search import RipgrepSearchEngine


class TestSearchTools:
    """Test the unified SearchTools class."""
    
    @pytest.fixture
    def temp_project(self):
        """Create a temporary project structure for testing."""
        temp_dir = tempfile.mkdtemp()
        project_path = Path(temp_dir)
        
        # Create project structure
        (project_path / "src").mkdir()
        (project_path / "tests").mkdir()
        (project_path / "docs").mkdir()
        (project_path / "scripts").mkdir()
        (project_path / "config").mkdir()
        
        # Create some test files
        (project_path / "README.md").write_text("# Test Project\n\nThis is a test project for backend development.")
        (project_path / "requirements.txt").write_text("flask==2.0.1\npytest==6.2.4\n")
        (project_path / "src" / "main.py").write_text("""
from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

@app.route('/api/users', methods=['GET'])
def get_users():
    '''Get all users from the database.'''
    return jsonify({'users': []})

@app.route('/api/users', methods=['POST'])
def create_user():
    '''Create a new user.'''
    data = request.get_json()
    return jsonify({'message': 'User created'})

if __name__ == '__main__':
    app.run(debug=True)
""")
        
        (project_path / "src" / "models.py").write_text("""
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.username}>'
""")
        
        (project_path / "tests" / "test_main.py").write_text("""
import pytest
from src.main import app

def test_get_users():
    '''Test getting all users.'''
    with app.test_client() as client:
        response = client.get('/api/users')
        assert response.status_code == 200
        assert 'users' in response.get_json()

def test_create_user():
    '''Test creating a new user.'''
    with app.test_client() as client:
        response = client.post('/api/users', json={'username': 'test', 'email': 'test@example.com'})
        assert response.status_code == 200
        assert 'message' in response.get_json()
""")
        
        (project_path / "config" / "database.py").write_text("""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///app.db')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    '''Get database session.'''
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
""")
        
        # Create some ignored directories and files
        (project_path / "__pycache__").mkdir()
        (project_path / "__pycache__" / "main.pyc").write_text("compiled python")
        (project_path / ".git").mkdir()
        (project_path / ".git" / "config").write_text("[core]\n\trepositoryformatversion = 0")
        (project_path / "venv").mkdir()
        (project_path / "venv" / "lib").mkdir()
        (project_path / "node_modules").mkdir()
        (project_path / "node_modules" / "package").mkdir()
        (project_path / "node_modules" / "package" / "index.js").write_text("console.log('hello');")
        
        yield project_path
        
        # Cleanup
        shutil.rmtree(temp_dir)
    
    @pytest.fixture
    def search_tools(self, temp_project):
        """Create SearchTools instance with temp project."""
        return SearchTools()
    
    def test_search_enhanced_nlp_query(self, search_tools, temp_project):
        """Test enhanced search with natural language query about backend."""
        # Test with a natural language query about the backend
        result = search_tools.search_enhanced(
            query="What is the backend look like?",
            project_root=str(temp_project),
            top_k=10
        )
        
        assert "results" in result
        assert "query" in result
        assert "total_results" in result
        assert "search_time" in result
        
        # Should find backend-related files
        results = result["results"]
        assert len(results) > 0
        
        # Should find main.py, models.py, database.py
        file_paths = [r.get("file_path", "") for r in results]
        assert any("main.py" in path for path in file_paths)
        assert any("models.py" in path for path in file_paths)
        assert any("database.py" in path for path in file_paths)
    
    def test_search_enhanced_ignores_junk_directories(self, search_tools, temp_project):
        """Test that enhanced search ignores junk directories."""
        result = search_tools.search_enhanced(
            query="python code",
            project_root=str(temp_project),
            top_k=20
        )
        
        results = result["results"]
        file_paths = [r.get("file_path", "") for r in results]
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in path for path in file_paths)
        assert not any(".git" in path for path in file_paths)
        assert not any("venv" in path for path in file_paths)
        assert not any("node_modules" in path for path in file_paths)
    
    def test_search_files_ignores_junk(self, search_tools, temp_project):
        """Test that file search ignores junk directories."""
        result = search_tools.search_files(
            pattern="*.py",
            directory=str(temp_project),
            recursive=True
        )
        
        assert "files" in result
        files = result["files"]
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in file for file in files)
        assert not any(".git" in file for file in files)
        assert not any("venv" in file for file in files)
        assert not any("node_modules" in file for file in files)
        
        # Should find actual Python files
        assert any("main.py" in file for file in files)
        assert any("models.py" in file for file in files)
        assert any("test_main.py" in file for file in files)
        assert any("database.py" in file for file in files)
    
    def test_search_content_ignores_junk(self, search_tools, temp_project):
        """Test that content search ignores junk directories."""
        result = search_tools.search_content(
            query="Flask",
            file_types=[".py"],
            directories=[str(temp_project)]
        )
        
        assert "results" in result
        results = result["results"]
        
        # Should find Flask references in actual code files
        assert len(results) > 0
        file_paths = [r.get("file_path", "") for r in results]
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in path for path in file_paths)
        assert not any(".git" in path for path in file_paths)
        assert not any("venv" in path for path in file_paths)
        assert not any("node_modules" in path for path in file_paths)
        
        # Should find Flask in main.py
        assert any("main.py" in path for path in file_paths)
    
    def test_search_code_patterns_ignores_junk(self, search_tools, temp_project):
        """Test that code pattern search ignores junk directories."""
        result = search_tools.search_code_patterns(
            pattern_type="function",
            language="py",
            directories=[str(temp_project)]
        )
        
        assert "results" in result
        results = result["results"]
        
        # Should find functions in actual code files
        assert len(results) > 0
        file_paths = [r.get("file_path", "") for r in results]
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in path for path in file_paths)
        assert not any(".git" in path for path in file_paths)
        assert not any("venv" in path for path in file_paths)
        assert not any("node_modules" in path for path in file_paths)
        
        # Should find functions in main.py, models.py, etc.
        assert any("main.py" in path for path in file_paths)
        assert any("models.py" in path for path in file_paths)
    
    @patch('subprocess.run')
    def test_ripgrep_syntax_construction(self, mock_subprocess, search_tools, temp_project):
        """Test that ripgrep syntax is constructed correctly."""
        # Mock subprocess to return test results
        mock_subprocess.return_value = Mock(
            returncode=0,
            stdout=b"src/main.py:5:from flask import Flask, request, jsonify\n",
            stderr=b""
        )
        
        result = search_tools.search_content(
            query="Flask",
            file_types=[".py"],
            directories=[str(temp_project)]
        )
        
        # Verify subprocess was called with correct arguments
        mock_subprocess.assert_called_once()
        call_args = mock_subprocess.call_args
        
        # Should include ripgrep command
        assert "rg" in call_args[0][0]
        
        # Should include the query
        assert "Flask" in call_args[0][0]
        
        # Should include file type filter
        assert "--type" in call_args[0][0] or "--glob" in call_args[0][0]
    
    def test_nlp_query_processing(self, search_tools, temp_project):
        """Test processing of natural language queries."""
        nlp_queries = [
            "What is the backend look like?",
            "How does the API work?",
            "Where are the database models?",
            "Show me the test files",
            "What authentication is used?",
            "How is the database configured?",
            "What endpoints are available?",
            "Show me the user model",
            "How are errors handled?",
            "What dependencies are used?",
        ]
        
        for query in nlp_queries:
            result = search_tools.search_enhanced(
                query=query,
                project_root=str(temp_project),
                top_k=5
            )
            
            assert "results" in result
            assert "query" in result
            assert "total_results" in result
            assert "search_time" in result
            
            # Should return some results for each query
            assert result["total_results"] >= 0
    
    def test_query_expansion(self, search_tools, temp_project):
        """Test that query expansion works for related terms."""
        # Test with a query that should be expanded
        result = search_tools.search_enhanced(
            query="database",
            project_root=str(temp_project),
            top_k=10,
            expand_query=True
        )
        
        assert "results" in result
        results = result["results"]
        
        # Should find database-related files
        file_paths = [r.get("file_path", "") for r in results]
        assert any("database.py" in path for path in file_paths)
        assert any("models.py" in path for path in file_paths)
    
    def test_file_type_filtering(self, search_tools, temp_project):
        """Test that file type filtering works correctly."""
        # Search only Python files
        result = search_tools.search_enhanced(
            query="import",
            project_root=str(temp_project),
            top_k=10,
            file_types=[".py"]
        )
        
        assert "results" in result
        results = result["results"]
        
        # All results should be Python files
        for result_item in results:
            file_path = result_item.get("file_path", "")
            if file_path:  # Skip empty paths
                assert file_path.endswith(".py")
    
    def test_directory_filtering(self, search_tools, temp_project):
        """Test that directory filtering works correctly."""
        # Search only in src directory
        result = search_tools.search_enhanced(
            query="class",
            project_root=str(temp_project),
            top_k=10,
            directories=[str(temp_project / "src")]
        )
        
        assert "results" in result
        results = result["results"]
        
        # All results should be in src directory
        for result_item in results:
            file_path = result_item.get("file_path", "")
            if file_path:  # Skip empty paths
                assert "src/" in file_path or file_path.startswith("src/")
    
    def test_search_analytics(self, search_tools):
        """Test that search analytics work correctly."""
        result = search_tools.get_search_analytics()
        
        assert "total_searches" in result
        assert "cache_hit_rate" in result
        assert "average_search_time" in result
        assert "most_common_queries" in result
        assert "search_engines_used" in result
    
    def test_clear_search_cache(self, search_tools):
        """Test that search cache can be cleared."""
        result = search_tools.clear_search_cache()
        
        assert "success" in result
        assert result["success"] is True
        assert "message" in result
    
    def test_reindex_project(self, search_tools, temp_project):
        """Test that project can be reindexed."""
        result = search_tools.reindex_project(project_root=str(temp_project))
        
        assert "success" in result
        assert result["success"] is True
        assert "indexed_files" in result
        assert "indexed_directories" in result
        assert result["indexed_files"] > 0
        assert result["indexed_directories"] > 0


class TestBM25SearchEngine:
    """Test the BM25SearchEngine class."""
    
    @pytest.fixture
    def temp_project(self):
        """Create a temporary project structure for testing."""
        temp_dir = tempfile.mkdtemp()
        project_path = Path(temp_dir)
        
        # Create project structure
        (project_path / "src").mkdir()
        (project_path / "tests").mkdir()
        
        # Create some test files
        (project_path / "README.md").write_text("# Test Project\n\nThis is a test project.")
        (project_path / "src" / "main.py").write_text("""
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()
""")
        
        # Create ignored directories
        (project_path / "__pycache__").mkdir()
        (project_path / "__pycache__" / "main.pyc").write_text("compiled")
        
        yield project_path
        
        # Cleanup
        shutil.rmtree(temp_dir)
    
    def test_bm25_search_ignores_junk(self, temp_project):
        """Test that BM25 search ignores junk directories."""
        engine = BM25SearchEngine()
        engine.index_project(str(temp_project))
        
        results = engine.search("Hello", top_k=10)
        
        # Should find the main.py file
        assert len(results) > 0
        
        # Should not find files in ignored directories
        file_paths = [r[0] for r in results]
        assert not any("__pycache__" in path for path in file_paths)
        
        # Should find the main.py file
        assert any("main.py" in path for path in file_paths)
    
    def test_reynard_bm25_search_ignores_junk(self, temp_project):
        """Test that ReynardBM25Search ignores junk directories."""
        results = ReynardBM25Search.search_needle_in_haystack(
            needle="Hello",
            project_root=str(temp_project),
            top_k=10
        )
        
        # Should find the main.py file
        assert len(results) > 0
        
        # Should not find files in ignored directories
        file_paths = [r.get("file_path", "") for r in results]
        assert not any("__pycache__" in path for path in file_paths)
        
        # Should find the main.py file
        assert any("main.py" in path for path in file_paths)


class TestFileSearchEngine:
    """Test the FileSearchEngine class."""
    
    @pytest.fixture
    def temp_project(self):
        """Create a temporary project structure for testing."""
        temp_dir = tempfile.mkdtemp()
        project_path = Path(temp_dir)
        
        # Create project structure
        (project_path / "src").mkdir()
        (project_path / "tests").mkdir()
        
        # Create some test files
        (project_path / "README.md").write_text("# Test Project")
        (project_path / "src" / "main.py").write_text("print('Hello, World!')")
        (project_path / "tests" / "test_main.py").write_text("def test_main(): pass")
        
        # Create ignored directories
        (project_path / "__pycache__").mkdir()
        (project_path / "__pycache__" / "main.pyc").write_text("compiled")
        
        yield project_path
        
        # Cleanup
        shutil.rmtree(temp_dir)
    
    def test_file_search_ignores_junk(self, temp_project):
        """Test that file search ignores junk directories."""
        engine = FileSearchEngine(str(temp_project))
        
        files = engine.search_files("*.py", recursive=True)
        
        # Should find Python files
        assert len(files) > 0
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in file for file in files)
        
        # Should find the actual Python files
        assert any("main.py" in file for file in files)
        assert any("test_main.py" in file for file in files)
    
    def test_list_files_ignores_junk(self, temp_project):
        """Test that list_files ignores junk directories."""
        engine = FileSearchEngine(str(temp_project))
        
        files = engine.list_files(recursive=True)
        
        # Should find files
        assert len(files) > 0
        
        # Should not find files in ignored directories
        assert not any("__pycache__" in file for file in files)
        
        # Should find the actual files
        assert any("README.md" in file for file in files)
        assert any("main.py" in file for file in files)
        assert any("test_main.py" in file for file in files)


class TestRipgrepSearchEngine:
    """Test the RipgrepSearchEngine class."""
    
    @pytest.fixture
    def temp_project(self):
        """Create a temporary project structure for testing."""
        temp_dir = tempfile.mkdtemp()
        project_path = Path(temp_dir)
        
        # Create project structure
        (project_path / "src").mkdir()
        (project_path / "tests").mkdir()
        
        # Create some test files
        (project_path / "README.md").write_text("# Test Project")
        (project_path / "src" / "main.py").write_text("print('Hello, World!')")
        (project_path / "tests" / "test_main.py").write_text("def test_main(): pass")
        
        # Create ignored directories
        (project_path / "__pycache__").mkdir()
        (project_path / "__pycache__" / "main.pyc").write_text("print('compiled')")
        
        yield project_path
        
        # Cleanup
        shutil.rmtree(temp_dir)
    
    @patch('subprocess.run')
    def test_ripgrep_search_ignores_junk(self, mock_subprocess, temp_project):
        """Test that ripgrep search ignores junk directories."""
        # Mock subprocess to return test results
        mock_subprocess.return_value = Mock(
            returncode=0,
            stdout=b"src/main.py:1:print('Hello, World!')\n",
            stderr=b""
        )
        
        engine = RipgrepSearchEngine()
        
        result = engine.search("print", directories=[str(temp_project)])
        
        # Verify subprocess was called
        mock_subprocess.assert_called_once()
        
        # Should not search in ignored directories
        call_args = mock_subprocess.call_args
        assert "__pycache__" not in str(call_args)
        assert ".git" not in str(call_args)
        assert "venv" not in str(call_args)
        assert "node_modules" not in str(call_args)
    
    @patch('subprocess.run')
    def test_ripgrep_syntax_construction(self, mock_subprocess, temp_project):
        """Test that ripgrep syntax is constructed correctly."""
        # Mock subprocess to return test results
        mock_subprocess.return_value = Mock(
            returncode=0,
            stdout=b"src/main.py:1:print('Hello, World!')\n",
            stderr=b""
        )
        
        engine = RipgrepSearchEngine()
        
        result = engine.search("print", file_types=[".py"], directories=[str(temp_project)])
        
        # Verify subprocess was called with correct arguments
        mock_subprocess.assert_called_once()
        call_args = mock_subprocess.call_args
        
        # Should include ripgrep command
        assert "rg" in call_args[0][0]
        
        # Should include the query
        assert "print" in call_args[0][0]
        
        # Should include file type filter
        assert "--type" in call_args[0][0] or "--glob" in call_args[0][0]
    
    @patch('subprocess.run')
    def test_ripgrep_code_patterns(self, mock_subprocess, temp_project):
        """Test that ripgrep code patterns work correctly."""
        # Mock subprocess to return test results
        mock_subprocess.return_value = Mock(
            returncode=0,
            stdout=b"src/main.py:1:def main():\n",
            stderr=b""
        )
        
        engine = RipgrepSearchEngine()
        
        result = engine.search_code_patterns("function", language="py", directories=[str(temp_project)])
        
        # Verify subprocess was called
        mock_subprocess.assert_called_once()
        
        # Should use correct pattern for functions
        call_args = mock_subprocess.call_args
        assert "def " in str(call_args) or "function" in str(call_args)

