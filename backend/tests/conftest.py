"""Pytest configuration for testing ecosystem tests.

🦦 *splashes with test configuration enthusiasm* Comprehensive pytest setup
for testing ecosystem with proper fixtures, database setup, and test isolation.

This configuration provides:
- Database session fixtures
- Test data cleanup
- Environment variable setup
- Async test support
- Test isolation and parallel execution

Author: Quality-Otter-15 (Reynard Otter Specialist)
Version: 1.0.0
"""

import asyncio
import os
import pytest
import uuid
from datetime import datetime
from typing import Any, Dict, Generator, List
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.database_manager import get_e2e_session
from app.models.testing_ecosystem import Base, Run


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Setup test environment variables."""
    # Ensure test database URL is set
    os.environ.setdefault("E2E_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_e2e")
    
    # Set test mode
    os.environ["TESTING"] = "true"
    
    yield
    
    # Cleanup
    if "TESTING" in os.environ:
        del os.environ["TESTING"]


@pytest.fixture
def db_session():
    """Provide a database session for tests."""
    with get_e2e_session() as session:
        yield session


@pytest.fixture
def test_run_id():
    """Generate a unique test run ID."""
    return f"test_run_{uuid.uuid4().hex[:8]}"


@pytest.fixture
def sample_test_run_data(test_run_id):
    """Provide sample test run data."""
    return {
        "run_id": test_run_id,
        "test_type": "pytest",
        "test_suite": "unit_tests",
        "environment": "test",
        "branch": "main",
        "commit_hash": "abc123def456",
        "total_tests": 10,
        "passed_tests": 8,
        "failed_tests": 2,
        "skipped_tests": 0,
        "meta_data": {
            "test_framework": "pytest",
            "python_version": "3.9",
            "test_runner": "quality_otter"
        }
    }


@pytest.fixture
def sample_benchmark_data():
    """Provide sample benchmark data."""
    return {
        "benchmark_name": "api_load_test",
        "benchmark_type": "load_test",
        "total_requests": 1000,
        "successful_requests": 950,
        "failed_requests": 50,
        "endpoint": "/api/users",
        "method": "GET",
        "avg_response_time_ms": 120.5,
        "p95_response_time_ms": 250.0,
        "requests_per_second": 50.0,
        "error_rate_percent": 5.0,
        "concurrent_users": 10,
        "duration_seconds": 20.0,
        "peak_memory_mb": 512.0,
        "peak_cpu_percent": 75.0,
        "status_codes": {"200": 950, "500": 50},
        "meta_data": {"load_generator": "locust"}
    }


@pytest.fixture
def sample_coverage_data():
    """Provide sample coverage data."""
    return {
        "file_path": "app/services/user_service.py",
        "lines_total": 100,
        "lines_covered": 85,
        "lines_missing": 15,
        "coverage_percent": 85.0,
        "file_type": "py",
        "branches_total": 20,
        "branches_covered": 18,
        "branches_missing": 2,
        "functions_total": 10,
        "functions_covered": 9,
        "functions_missing": 1,
        "coverage_data": {"detailed_lines": [1, 2, 3]}
    }


@pytest.fixture
def cleanup_test_data():
    """Cleanup test data after each test."""
    yield
    
    # Cleanup any test data
    try:
        with get_e2e_session() as session:
            # Delete test runs and cascade to related data
            test_runs = session.query(Run).filter(
                Run.run_id.like("test_%")
            ).all()
            
            for test_run in test_runs:
                session.delete(test_run)
            
            session.commit()
    except Exception as e:
        print(f"Cleanup error: {e}")


@pytest.fixture
def mock_database_error():
    """Mock database error for testing error handling."""
    from unittest.mock import patch
    
    with patch('app.core.database_manager.get_e2e_session') as mock_session:
        mock_session.side_effect = Exception("Database connection failed")
        yield mock_session


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
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
    """Modify test collection to add markers automatically."""
    for item in items:
        # Add slow marker to tests that take longer than 1 second
        if "test_cleanup_old_data" in item.name or "test_concurrent_operations" in item.name:
            item.add_marker(pytest.mark.slow)
        
        # Add integration marker to database integration tests
        if "TestDatabaseIntegration" in str(item.cls):
            item.add_marker(pytest.mark.integration)
        
        # Add unit marker to service tests
        if "TestEcosystemService" in str(item.cls):
            item.add_marker(pytest.mark.unit)


# =============================================================================
# MEMORY EFFICIENCY TEST FIXTURES
# =============================================================================
# Additional fixtures for memory efficiency testing

@pytest.fixture
def memory_test_config() -> Dict[str, Any]:
    """Configuration optimized for memory testing."""
    return {
        "memory_efficient_batch_size": 2,  # Very small batches for testing
        "max_memory_mb": 200,  # Reasonable memory limit for testing
        "memory_cleanup_threshold": 0.8,  # Less aggressive cleanup
        "gc_frequency": 2,  # Less frequent GC for testing
        "memory_profiler_interval": 0.1,  # Fast profiling for tests
        "rag_chunk_size": 100,  # Small chunks for testing
        "rag_chunk_overlap": 20,
        "rag_indexed_file_types": [".py", ".txt"],
        "rag_watch_root": "/tmp",  # Safe default
    }


@pytest.fixture
def sample_files(tmp_path: Path) -> List[Path]:
    """Create sample files for testing."""
    files = []
    for i in range(10):
        file_path = tmp_path / f"test_file_{i}.py"
        content = f"""
# Test file {i}
def test_function_{i}():
    '''Test function {i}'''
    return "test_{i}"

class TestClass{i}:
    def __init__(self):
        self.value = {i}
    
    def method_{i}(self):
        return self.value * 2
"""
        file_path.write_text(content)
        files.append(file_path)
    return files


@pytest.fixture
def mock_ai_service():
    """Mock AI service for testing."""
    from unittest.mock import AsyncMock
    
    mock_service = AsyncMock()
    mock_service.embed_batch.return_value = [
        [0.1] * 384 for _ in range(10)  # Mock embeddings
    ]
    mock_service.get_best_model.return_value = "test-model"
    return mock_service


@pytest.fixture
def mock_vector_store():
    """Mock vector store service for testing."""
    from unittest.mock import AsyncMock
    
    mock_service = AsyncMock()
    mock_service.add_documents.return_value = True
    mock_service.search.return_value = {"results": [], "total": 0}
    return mock_service


@pytest.fixture
def mock_embedding_service():
    """Mock embedding service for testing."""
    from unittest.mock import AsyncMock
    
    mock_service = AsyncMock()
    mock_service.embed_batch.return_value = [
        [0.1] * 384 for _ in range(3)  # Mock embeddings
    ]
    return mock_service


@pytest.fixture
def mock_indexing_callback():
    """Mock indexing callback for testing."""
    async def callback(file_path: str) -> Dict[str, Any]:
        return {"success": True, "result": "indexed"}
    return callback


# Memory efficiency test markers
def pytest_configure(config):
    """Configure pytest with custom markers."""
    # Call the original configuration first
    config.addinivalue_line("markers", "redis: mark test as requiring Redis")
    config.addinivalue_line("markers", "postgres: mark test as requiring PostgreSQL")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    
    # Add memory efficiency markers
    config.addinivalue_line("markers", "memory_efficiency: mark test as memory efficiency test")
    config.addinivalue_line("markers", "memory_profiler: mark test as memory profiler test")
    config.addinivalue_line("markers", "leak_detection: mark test as memory leak detection test")
    config.addinivalue_line("markers", "performance: mark test as performance test")


# Memory efficiency test collection
def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names."""
    # Call the original collection modification first
    for item in items:
        # Add markers based on test file location
        if 'redis' in str(item.fspath):
            item.add_marker(pytest.mark.redis)
        if 'postgres' in str(item.fspath):
            item.add_marker(pytest.mark.postgres)
        if 'auto_fix' in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        if 'security' in str(item.fspath):
            item.add_marker(pytest.mark.integration)

        # Add slow marker for performance tests
        if 'performance' in item.name or 'perf' in item.name:
            item.add_marker(pytest.mark.slow)
    
    # Add memory efficiency markers
    for item in items:
        if 'memory_efficiency' in str(item.fspath):
            item.add_marker(pytest.mark.memory_efficiency)
        if 'memory_profiler' in item.name:
            item.add_marker(pytest.mark.memory_profiler)
        if 'leak_detection' in item.name:
            item.add_marker(pytest.mark.leak_detection)
        if 'memory' in item.name and 'test' in item.name:
            item.add_marker(pytest.mark.memory_efficiency)