"""Fenrir Test Configuration

🦊 *whiskers twitch with strategic precision* Test configuration and fixtures
for Fenrir profiling and exploit testing system.

This module provides:
- Test environment setup using E2E_DATABASE_URL
- Database fixtures for profiling sessions
- Mock services for testing
- Test data cleanup utilities

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import os
import pytest
from pathlib import Path
from typing import Generator

# Load environment variables from backend/.env
def load_test_environment():
    """Load test environment variables."""
    env_file = Path(__file__).parent.parent.parent / "backend" / ".env"
    if env_file.exists():
        from dotenv import load_dotenv
        load_dotenv(env_file)

    # Ensure E2E_DATABASE_URL is available for Fenrir tests
    if not os.getenv("E2E_DATABASE_URL"):
        raise ValueError(
            "E2E_DATABASE_URL environment variable is required for Fenrir tests. "
            "Please ensure backend/.env is properly configured."
        )

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Set up test environment for all Fenrir tests."""
    load_test_environment()

@pytest.fixture
def fenrir_database_service():
    """Provide Fenrir database service for testing."""
    from fenrir.core.database_service import get_database_service
    return get_database_service()

@pytest.fixture
def test_session_id():
    """Provide a test session ID."""
    import time
    return f"test_session_{int(time.time())}"

@pytest.fixture(autouse=True)
def cleanup_test_data(fenrir_database_service, test_session_id):
    """Clean up test data after each test."""
    yield
    # Cleanup test data
    try:
        with fenrir_database_service.get_session() as session:
            from app.models.fenrir_profiling import ProfilingSession
            session.query(ProfilingSession).filter_by(session_id=test_session_id).delete()
    except Exception as e:
        # Ignore cleanup errors in tests
        pass
