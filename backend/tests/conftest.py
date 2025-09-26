#!/usr/bin/env python3
"""Pytest Configuration and Fixtures

Global pytest configuration and shared fixtures for all test modules.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import os
import sys
from pathlib import Path

import pytest
import pytest_asyncio

# Add backend to Python path
backend_root = Path(__file__).parent.parent
sys.path.insert(0, str(backend_root))


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_environment():
    """Set up test environment variables."""
    from tests.utils.env_loader import setup_test_environment

    # Load environment variables from .env file
    env_vars = setup_test_environment()

    # Override with test-specific values
    test_overrides = {
        'ENVIRONMENT': 'test',
        'REDIS_DB': '15',  # Use test database
    }

    # Store original values
    original_env = {}
    for key, value in test_overrides.items():
        original_env[key] = os.environ.get(key)
        os.environ[key] = value

    yield {**env_vars, **test_overrides}

    # Restore original values
    for key, original_value in original_env.items():
        if original_value is not None:
            os.environ[key] = original_value
        elif key in os.environ:
            del os.environ[key]


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    from unittest.mock import AsyncMock, Mock

    mock_client = AsyncMock()
    mock_client.ping.return_value = True
    mock_client.set.return_value = True
    mock_client.get.return_value = b'test_value'
    mock_client.hset.return_value = 1
    mock_client.hget.return_value = b'value1'
    mock_client.lpush.return_value = 1
    mock_client.llen.return_value = 3
    mock_client.delete.return_value = 1
    mock_client.flushdb.return_value = True
    mock_client.aclose.return_value = None

    return mock_client


@pytest.fixture
def mock_database_engine():
    """Mock database engine for testing."""
    from unittest.mock import MagicMock, Mock

    mock_engine = Mock()
    mock_conn = MagicMock()
    mock_engine.connect.return_value.__enter__.return_value = mock_conn
    mock_conn.execute.return_value.fetchone.return_value = [1]
    mock_conn.execute.return_value.fetchall.return_value = [['test']]

    return mock_engine, mock_conn


@pytest.fixture
def temp_config_file():
    """Create a temporary configuration file for testing."""
    import tempfile

    with tempfile.NamedTemporaryFile(mode='w', suffix='.conf', delete=False) as f:
        f.write(
            """
# Test Redis Configuration
bind 127.0.0.1
port 6379
protected-mode yes
requirepass test_password

# TLS Configuration
tls-port 6380
tls-cert-file /tmp/test.crt
tls-key-file /tmp/test.key
"""
        )
        temp_file = f.name

    yield temp_file

    # Cleanup
    os.unlink(temp_file)


@pytest.fixture
def temp_env_file():
    """Create a temporary .env file for testing."""
    import tempfile

    with tempfile.NamedTemporaryFile(mode='w', suffix='.env', delete=False) as f:
        f.write(
            """
# Test Environment Variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=test_password
REDIS_TLS_ENABLED=false
DATABASE_URL=postgresql://test:test@localhost:5432/test_db
JWT_SECRET_KEY=test_jwt_secret_key_32_chars_long
"""
        )
        temp_file = f.name

    yield temp_file

    # Cleanup
    os.unlink(temp_file)


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "redis: mark test as requiring Redis")
    config.addinivalue_line("markers", "postgres: mark test as requiring PostgreSQL")
    config.addinivalue_line("markers", "slow: mark test as slow running")
    config.addinivalue_line("markers", "integration: mark test as integration test")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names."""
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


# Custom pytest markers for different test types
pytest_plugins = []


# Test discovery configuration
def pytest_generate_tests(metafunc):
    """Generate test parameters dynamically."""
    if 'database_url' in metafunc.fixturenames:
        databases = ['reynard', 'reynard_ecs', 'reynard_auth', 'reynard_keys']
        metafunc.parametrize('database_url', databases)


# Async test support
@pytest.fixture
def async_test():
    """Decorator for async tests."""

    def decorator(func):
        return pytest.mark.asyncio(func)

    return decorator


# Skip tests if services are not available
def pytest_runtest_setup(item):
    """Skip tests if required services are not available."""
    if item.get_closest_marker('redis'):
        # Check if Redis is available
        try:
            import redis

            client = redis.Redis(host='localhost', port=6379, db=15)
            client.ping()
            client.close()
        except Exception:
            pytest.skip("Redis not available")

    if item.get_closest_marker('postgres'):
        # Check if PostgreSQL is available
        try:
            from sqlalchemy import create_engine, text
            from tests.utils.env_loader import get_database_urls

            databases = get_database_urls()
            engine = create_engine(databases['keys'])
            with engine.connect() as conn:
                conn.execute(text('SELECT 1'))
        except Exception:
            pytest.skip("PostgreSQL not available")
