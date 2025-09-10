"""
Pytest configuration and fixtures for Reynard Backend tests.

This module provides shared fixtures and configuration for all test modules.
"""

import asyncio
import os
import sys
from pathlib import Path
from typing import AsyncGenerator, Dict, Generator
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Add the backend app to the path
sys.path.insert(0, str(Path(__file__).parent.parent / "app"))

from main import create_app

sys.modules['gatekeeper'] = __import__('tests.mocks.gatekeeper', fromlist=[''])
sys.modules['gatekeeper.api'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.api.routes'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.api.dependencies'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.models'] = sys.modules['gatekeeper']
sys.modules['gatekeeper.models.user'] = sys.modules['gatekeeper']


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def test_app() -> FastAPI:
    """Create a test FastAPI application."""
    app = create_app()
    return app


@pytest.fixture(scope="function")
def client(test_app) -> TestClient:
    """Create a test client for the FastAPI application."""
    return TestClient(test_app)


@pytest.fixture(scope="function")
async def async_client(test_app) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI application."""
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_auth_token() -> str:
    """Provide a mock authentication token."""
    return "mock_bearer_token"


@pytest.fixture
def auth_headers(mock_auth_token) -> Dict[str, str]:
    """Provide authentication headers."""
    return {"Authorization": f"Bearer {mock_auth_token}"}


@pytest.fixture
def test_image_data() -> bytes:
    """Provide test image data."""
    # This is a simple 1x1 JPEG image (smaller and more compatible)
    return b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'


@pytest.fixture
def mock_caption_service():
    """Create a mock caption service for testing."""
    mock_service = MagicMock()
    
    # Mock available generators
    mock_service.get_available_generators.return_value = {
        "florence2": {
            "description": "Microsoft Florence2 - General purpose image captioning model",
            "is_available": True,
            "caption_type": "caption",
            "config_schema": {"type": "object", "properties": {}}
        }
    }
    
    # Mock generator info
    mock_service.get_generator_info.return_value = {
        "description": "Microsoft Florence2 - General purpose image captioning model",
        "is_available": True,
        "caption_type": "caption",
        "config_schema": {"type": "object", "properties": {}}
    }
    
    # Mock single caption generation
    mock_service.generate_single_caption.return_value = {
        "success": True,
        "caption": "A test image with various objects",
        "processing_time": 1.5,
        "caption_type": "descriptive",
        "confidence": 0.95
    }
    
    # Mock upload and generate caption
    mock_service.upload_and_generate_caption = AsyncMock(return_value={
        "success": True,
        "image_path": "/tmp/test.jpg",
        "generator_name": "florence2",
        "caption": "A test image with various objects",
        "processing_time": 1.5,
        "caption_type": "descriptive",
        "confidence": 0.95
    })
    
    # Mock batch caption generation
    mock_service.generate_batch_captions.return_value = [
        {
            "success": True,
            "caption": "First image caption",
            "processing_time": 1.0,
            "caption_type": "descriptive"
        },
        {
            "success": True,
            "caption": "Second image caption",
            "processing_time": 1.2,
            "caption_type": "descriptive"
        }
    ]
    
    # Mock model management
    mock_service.load_model.return_value = True
    mock_service.unload_model.return_value = True
    mock_service.get_loaded_models.return_value = ["model1", "model2"]
    
    # Mock monitoring
    mock_service.get_generation_stats.return_value = {
        "total_generations": 100,
        "successful_generations": 95,
        "failed_generations": 5,
        "average_processing_time": 1.5,
        "generators_used": ["generator1", "generator2"]
    }
    
    mock_service.get_generation_history.return_value = [
        {
            "id": "1",
            "timestamp": "2023-01-01T00:00:00Z",
            "generator": "test_generator",
            "success": True,
            "processing_time": 1.5
        },
        {
            "id": "2",
            "timestamp": "2023-01-01T01:00:00Z",
            "generator": "test_generator",
            "success": False,
            "error": "Model not available"
        }
    ]
    
    mock_service.clear_generation_history.return_value = True
    
    return mock_service


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
    os.environ["REFRESH_TOKEN_EXPIRE_DAYS"] = "7"
    os.environ["DEBUG"] = "True"
    os.environ["LOG_LEVEL"] = "debug"
    yield
    # Cleanup environment variables if needed
    pass