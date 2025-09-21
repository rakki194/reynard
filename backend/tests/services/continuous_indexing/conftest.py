"""
🐼 Shared pytest fixtures for Continuous Indexing tests

This module provides shared fixtures and utilities for testing the continuous indexing service.
All fixtures are designed with panda spirit and thoroughness in mind.

Author: Ailuropoda-Sage-59 (Panda Spirit)
"""

import asyncio
import tempfile
from pathlib import Path
from typing import Generator
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.services.continuous_indexing import ContinuousIndexingService


@pytest.fixture(scope="session")
def event_loop():
    """🐼 Create an event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_directory() -> Generator[Path, None, None]:
    """🐼 Create a temporary directory for testing file operations."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)


@pytest.fixture
def mock_rag_service():
    """🐼 Create a mock RAG service for testing."""
    mock_service = AsyncMock()
    mock_service.index_documents = AsyncMock(return_value={"status": "success"})
    mock_service.remove_document = AsyncMock(return_value={"status": "success"})
    return mock_service


@pytest.fixture
def mock_rag_service_with_error():
    """🐼 Create a mock RAG service that raises errors for testing error handling."""
    mock_service = AsyncMock()
    mock_service.index_documents = AsyncMock(side_effect=Exception("Indexing failed"))
    mock_service.remove_document = AsyncMock(side_effect=Exception("Removal failed"))
    return mock_service


@pytest.fixture
def service_config():
    """🐼 Create a standard service configuration for testing."""
    return {
        "rag_enabled": True,
        "rag_continuous_indexing_enabled": True,
        "rag_continuous_indexing_auto_start": False,  # Don't auto-start for tests
    }


@pytest.fixture
def indexing_service(service_config, temp_directory):
    """🐼 Create a ContinuousIndexingService instance for testing."""
    from unittest.mock import patch

    from app.config.continuous_indexing_config import continuous_indexing_config

    with patch.object(continuous_indexing_config, "watch_root", str(temp_directory)):
        with patch.object(continuous_indexing_config, "enabled", True):
            service = ContinuousIndexingService(service_config)
            yield service


@pytest.fixture
def initialized_indexing_service(indexing_service):
    """🐼 Create an initialized ContinuousIndexingService for testing."""

    async def _init_service():
        await indexing_service.initialize()
        return indexing_service

    # For async fixtures, we need to handle this differently
    return indexing_service


@pytest.fixture
def test_files(temp_directory) -> list[Path]:
    """🐼 Create a set of test files for indexing tests."""
    files = []

    # Create various types of test files
    test_data = [
        ("test.py", "print('Hello, World!')"),
        ("test.ts", "console.log('Hello, TypeScript!');"),
        ("test.js", "console.log('Hello, JavaScript!');"),
        ("test.md", "# Test Markdown\n\nThis is a test file."),
        ("test.json", '{"message": "Hello, JSON!"}'),
        ("test.yaml", "message: Hello, YAML!"),
        ("test.css", "body { color: red; }"),
        ("test.html", "<html><body>Hello, HTML!</body></html>"),
    ]

    for filename, content in test_data:
        file_path = temp_directory / filename
        file_path.write_text(content)
        files.append(file_path)

    return files


@pytest.fixture
def panda_test_files(temp_directory) -> list[Path]:
    """🐼 Create panda-themed test files for fun testing."""
    files = []

    panda_data = [
        ("bamboo.py", "print('🐼 *munches bamboo*')"),
        (
            "panda_poem.md",
            "# Panda Poetry\n\n🐼 *rolls around playfully*\n\nBamboo is life!",
        ),
        ("panda_config.json", '{"spirit": "panda", "favorite_food": "bamboo"}'),
        ("panda_style.css", ".panda { color: black; background: white; }"),
    ]

    for filename, content in panda_data:
        file_path = temp_directory / filename
        file_path.write_text(content)
        files.append(file_path)

    return files


@pytest.fixture
def excluded_files(temp_directory) -> list[Path]:
    """🐼 Create files that should be excluded from indexing."""
    files = []

    excluded_data = [
        ("test.pyc", "compiled python bytecode"),
        ("test.log", "log file content"),
        ("test.tmp", "temporary file content"),
        ("test.cache", "cache file content"),
        ("package-lock.json", '{"lockfileVersion": 1}'),
        ("test.min.js", "minified javascript"),
    ]

    for filename, content in excluded_data:
        file_path = temp_directory / filename
        file_path.write_text(content)
        files.append(file_path)

    return files


@pytest.fixture
def excluded_directories(temp_directory) -> list[Path]:
    """🐼 Create directories that should be excluded from indexing."""
    dirs = []

    excluded_dir_names = [
        "node_modules",
        "__pycache__",
        ".git",
        ".vscode",
        "dist",
        "build",
        "coverage",
        "venv",
        "logs",
        "tmp",
    ]

    for dir_name in excluded_dir_names:
        dir_path = temp_directory / dir_name
        dir_path.mkdir()

        # Add a file inside to test exclusion
        test_file = dir_path / "test.py"
        test_file.write_text("print('This should be excluded')")

        dirs.append(dir_path)

    return dirs


@pytest.fixture
def large_file(temp_directory) -> Path:
    """🐼 Create a large file that exceeds size limits."""
    large_file_path = temp_directory / "large_file.py"

    # Create a file with content that would exceed 2MB
    content = "print('This is a large file')\n" * 100000  # ~2.5MB
    large_file_path.write_text(content)

    return large_file_path


@pytest.fixture
def empty_file(temp_directory) -> Path:
    """🐼 Create an empty file for testing."""
    empty_file_path = temp_directory / "empty.py"
    empty_file_path.write_text("")
    return empty_file_path


@pytest.fixture
def mock_file_system_event():
    """🐼 Create a mock file system event for testing."""

    def _create_event(src_path: str, is_directory: bool = False):
        event = MagicMock()
        event.src_path = src_path
        event.is_directory = is_directory
        return event

    return _create_event


@pytest.fixture
def mock_observer():
    """🐼 Create a mock observer for testing."""
    mock_observer = MagicMock()
    mock_observer.start = MagicMock()
    mock_observer.stop = MagicMock()
    mock_observer.join = MagicMock()
    mock_observer.schedule = MagicMock()
    return mock_observer


@pytest.fixture
def mock_change_handler():
    """🐼 Create a mock change handler for testing."""
    mock_handler = MagicMock()
    mock_handler.on_modified = MagicMock()
    mock_handler.on_created = MagicMock()
    mock_handler.on_deleted = MagicMock()
    return mock_handler


# 🐼 Panda Spirit Test Utilities
class PandaTestHelpers:
    """Utility class for panda-themed test helpers."""

    @staticmethod
    def create_bamboo_grove(temp_dir: Path, count: int = 5) -> list[Path]:
        """Create a grove of bamboo files (test files) for testing."""
        bamboo_files = []
        for i in range(count):
            bamboo_file = temp_dir / f"bamboo_{i}.py"
            bamboo_file.write_text(f"# Bamboo {i}\nprint('🐼 *munches bamboo {i}*')")
            bamboo_files.append(bamboo_file)
        return bamboo_files

    @staticmethod
    def assert_panda_spirit(
        test_result: bool, message: str = "Panda spirit not detected"
    ):
        """Assert with panda spirit."""
        assert test_result, f"🐼 {message}"

    @staticmethod
    def create_panda_habitat(temp_dir: Path) -> dict[str, Path]:
        """Create a complete panda habitat for testing."""
        habitat = {}

        # Create directories
        habitat["bamboo_forest"] = temp_dir / "bamboo_forest"
        habitat["bamboo_forest"].mkdir()

        habitat["panda_cave"] = temp_dir / "panda_cave"
        habitat["panda_cave"].mkdir()

        # Create files
        habitat["bamboo_shoot.py"] = temp_dir / "bamboo_shoot.py"
        habitat["bamboo_shoot.py"].write_text("print('🌱 Fresh bamboo shoot!')")

        habitat["panda_poem.md"] = temp_dir / "panda_poem.md"
        habitat["panda_poem.md"].write_text(
            "# Panda Life\n\n🐼 *rolls around*\n\nBamboo is everything!"
        )

        habitat["panda_config.json"] = temp_dir / "panda_config.json"
        habitat["panda_config.json"].write_text(
            '{"spirit": "panda", "energy": "high", "bamboo_count": 42}'
        )

        return habitat


# 🐼 Async test utilities
@pytest.fixture
async def async_indexing_service(service_config, temp_directory):
    """🐼 Create and initialize an async indexing service for testing."""
    from unittest.mock import patch

    from app.config.continuous_indexing_config import continuous_indexing_config

    with patch.object(continuous_indexing_config, "watch_root", str(temp_directory)):
        with patch.object(continuous_indexing_config, "enabled", True):
            service = ContinuousIndexingService(service_config)
            await service.initialize()
            yield service
            await service.shutdown()


# 🐼 Test markers for organization
pytestmark = [
    pytest.mark.panda_spirit,
    pytest.mark.continuous_indexing,
]
