"""
🧪 Test Configuration for Intelligent Reload System

This module provides pytest fixtures and configuration for testing
the intelligent reload system.
"""

import asyncio
import os
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def clean_environment():
    """Clean environment variables for testing."""
    # Store original values
    original_values = {}
    env_vars = ["INTELLIGENT_RELOAD", "ENVIRONMENT", "DEBUG"]

    for var in env_vars:
        if var in os.environ:
            original_values[var] = os.environ[var]
            del os.environ[var]

    yield

    # Restore original values
    for var, value in original_values.items():
        os.environ[var] = value


@pytest.fixture
def mock_fastapi_app():
    """Create a mock FastAPI app for testing."""
    return FastAPI()


@pytest.fixture
def mock_service_registry():
    """Create a mock service registry for testing."""
    registry = MagicMock()
    registry.shutdown_service = MagicMock()
    registry.initialize_service = MagicMock()
    registry.get_service_instance = MagicMock()
    return registry


@pytest.fixture
def mock_reload_manager():
    """Create a mock reload manager for testing."""
    manager = MagicMock()
    manager.get_affected_services = MagicMock()
    manager.reload_services = MagicMock()
    manager.reload_service = MagicMock()
    return manager


@pytest.fixture
def sample_file_paths():
    """Provide sample file paths for testing."""
    return {
        "ecs_files": [
            "app/ecs/world.py",
            "app/ecs/service.py",
            "app/ecs/endpoints/agents.py",
            "app/ecs/database.py",
            "app/ecs/config.json",
            "app/ecs/config.yaml",
        ],
        "gatekeeper_files": [
            "gatekeeper/api/routes.py",
            "app/auth/user_service.py",
            "app/security/input_validator.py",
        ],
        "comfy_files": [
            "app/api/comfy/generate.py",
            "app/services/comfy/comfy_service.py",
        ],
        "core_files": [
            "main.py",
            "app/core/config.py",
            "app/core/app_factory.py",
        ],
        "mixed_files": [
            "app/ecs/world.py",
            "gatekeeper/api/routes.py",
            "app/api/comfy/generate.py",
            "main.py",
        ],
    }


@pytest.fixture
def expected_service_mappings():
    """Provide expected service mappings for testing."""
    return {
        "ecs_world": [
            "app/ecs/**/*.py",
            "app/ecs/**/*.json",
            "app/ecs/**/*.yaml",
            "app/ecs/**/*.yml",
        ],
        "gatekeeper": [
            "gatekeeper/**/*.py",
            "app/auth/**/*.py",
            "app/security/**/*.py",
        ],
        "comfy": [
            "app/api/comfy/**/*.py",
            "app/services/comfy/**/*.py",
        ],
        "nlweb": [
            "app/api/nlweb/**/*.py",
            "app/services/nlweb/**/*.py",
        ],
        "rag": [
            "app/api/rag/**/*.py",
            "app/services/rag/**/*.py",
            "app/services/initial_indexing.py",
            "app/services/continuous_indexing.py",
        ],
        "search": [
            "app/api/search/**/*.py",
            "app/services/search/**/*.py",
        ],
        "ollama": [
            "app/api/ollama/**/*.py",
            "app/services/ollama/**/*.py",
        ],
        "tts": [
            "app/api/tts/**/*.py",
            "app/services/tts/**/*.py",
        ],
        "image_processing": [
            "app/api/image_utils/**/*.py",
            "app/services/image_processing_service.py",
        ],
        "ai_email_response": [
            "app/services/ai_email_response_service.py",
            "app/api/agent_email_routes.py",
        ],
    }


@pytest.fixture
def expected_priority_order():
    """Provide expected service priority order for testing."""
    return [
        "gatekeeper",  # 100
        "ecs_world",  # 90
        "image_processing",  # 75
        "comfy",  # 50
        "nlweb",  # 50
        "rag",  # 25
        "ollama",  # 25
        "search",  # 20
        "ai_email_response",  # 15
        "tts",  # 10
    ]


@pytest.fixture
def async_mock():
    """Create an async mock for testing."""
    return MagicMock()


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "asyncio: mark test as async")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "unit: mark test as unit test")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers."""
    for item in items:
        # Add asyncio marker to async tests
        if asyncio.iscoroutinefunction(item.function):
            item.add_marker(pytest.mark.asyncio)

        # Add unit marker to non-integration tests
        if "integration" not in item.name:
            item.add_marker(pytest.mark.unit)
