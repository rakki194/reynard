"""
🦦 PYTEST CONFIGURATION

*splashes with enthusiasm* Pytest configuration for the fenrir test suite!
"""

import pytest
import asyncio
import sys
import os

# Add the fenrir directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def base_url():
    """Base URL for the backend server"""
    return "http://localhost:8000"

@pytest.fixture
def test_timeout():
    """Timeout for individual tests"""
    return 30.0
