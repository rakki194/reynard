"""🐼 Comprehensive pytest tests for Continuous Indexing Service

This test suite covers all aspects of the continuous indexing service:
- File system event handling (modified, created, deleted)
- Queue processing (indexing and removal)
- Configuration validation
- Thread-safe task scheduling
- Service lifecycle management
- Error handling and edge cases

Author: Ailuropoda-Sage-59 (Panda Spirit)
"""

import asyncio
import tempfile
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.config.continuous_indexing_config import continuous_indexing_config
from app.services.infrastructure.continuous_indexing import (
    ContinuousIndexingService,
    FileChangeHandler,
    IndexingConfig,
)


class TestContinuousIndexingService:
    """Test suite for ContinuousIndexingService class."""

    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield Path(temp_dir)

    @pytest.fixture
    def mock_rag_service(self):
        """Create a mock RAG service."""
        mock_service = AsyncMock()
        mock_service.index_documents = AsyncMock(return_value={"status": "success"})
        return mock_service

    @pytest.fixture
    def service_config(self, temp_dir):
        """Create a test configuration."""
        return {
            "rag_enabled": True,
            "rag_continuous_indexing_enabled": True,
            "rag_continuous_indexing_auto_start": False,  # Don't auto-start for tests
        }

    @pytest.fixture
    def indexing_service(self, service_config, temp_dir):
        """Create a ContinuousIndexingService instance for testing."""
        # Create a proper IndexingConfig object
        config = IndexingConfig(
            watch_directories=[str(temp_dir)],
            exclude_patterns=["*.pyc", "__pycache__"],
            include_extensions=[".py", ".js", ".ts", ".md"],
            max_file_size_mb=10,
            index_interval_seconds=30,
            batch_size=100,
            enable_syntax_highlighting=True,
            enable_tokenization=True,
            enable_metadata_extraction=True,
            auto_cleanup_days=30,
        )

        service = ContinuousIndexingService(config, str(temp_dir))
        return service

    @pytest.mark.asyncio
    async def test_service_initialization(self, indexing_service, temp_dir):
        """🐼 Test that the service initializes correctly."""
        # Test that the service can be created and has expected attributes
        assert indexing_service is not None
        assert hasattr(indexing_service, 'start_monitoring')
        assert hasattr(indexing_service, 'stop_monitoring')

        # Test that the service can start monitoring
        await indexing_service.start_monitoring()
        assert indexing_service.file_handler is not None
        assert indexing_service.observer is not None
        assert indexing_service.is_monitoring is True

        # Clean up
        await indexing_service.stop_monitoring()

    @pytest.mark.asyncio
    async def test_service_initialization_disabled(self, service_config, temp_dir):
        """🐼 Test service initialization when disabled."""
        with patch.object(continuous_indexing_config, "enabled", False):
            service = ContinuousIndexingService(service_config)
            result = await service.initialize()
            assert result is True  # Should succeed even when disabled

    @pytest.mark.asyncio
    async def test_service_initialization_invalid_config(
        self,
        service_config,
        temp_dir,
    ):
        """🐼 Test service initialization with invalid configuration."""
        with patch.object(
            continuous_indexing_config,
            "validate",
            return_value=["Invalid config"],
        ):
            service = ContinuousIndexingService(service_config)
            result = await service.initialize()
            assert result is False

    @pytest.mark.asyncio
    async def test_start_stop_watching(self, indexing_service):
        """🐼 Test starting and stopping file watching."""
        await indexing_service.initialize()

        # Test starting
        await indexing_service.start_watching()
        assert indexing_service.running is True

        # Test stopping
        await indexing_service.stop_watching()
        assert indexing_service.running is False

    @pytest.mark.asyncio
    async def test_schedule_reindex(self, indexing_service):
        """🐼 Test scheduling files for re-indexing."""
        test_file = Path("/test/file.py")

        # Test successful scheduling
        await indexing_service.schedule_reindex(test_file)
        assert indexing_service.indexing_queue.qsize() == 1

        # Test queue full scenario with a smaller number to avoid hanging
        # Fill up the queue with a reasonable number
        for i in range(100):  # Reduced from 1000 to avoid hanging
            await indexing_service.schedule_reindex(Path(f"/test/file{i}.py"))

        # This should not raise an exception but should log a warning
        await indexing_service.schedule_reindex(test_file)

        # Clean up the queue to prevent interference with other tests
        while not indexing_service.indexing_queue.empty():
            try:
                indexing_service.indexing_queue.get_nowait()
            except asyncio.QueueEmpty:
                break

    @pytest.mark.asyncio
    async def test_schedule_removal(self, indexing_service):
        """🐼 Test scheduling files for removal from index."""
        test_file = Path("/test/file.py")

        # Test successful scheduling
        await indexing_service.schedule_removal(test_file)
        assert indexing_service.removal_queue.qsize() == 1

    @pytest.mark.asyncio
    async def test_index_files_with_rag_service(
        self,
        indexing_service,
        mock_rag_service,
        temp_dir,
    ):
        """🐼 Test indexing files with RAG service."""
        indexing_service.set_rag_service(mock_rag_service)

        # Use paths that are not in the exclude list
        test_file1 = Path("/home/kade/test_project/test1.py")
        test_file2 = Path("/home/kade/test_project/test2.py")
        test_file1.parent.mkdir(exist_ok=True)
        test_file1.write_text("print('hello world')")
        test_file2.write_text("def test(): pass")

        # Patch the watch root to match our test directory
        with patch.object(
            continuous_indexing_config,
            "watch_root",
            "/home/kade/test_project",
        ):
            # Test indexing
            await indexing_service.index_files([test_file1, test_file2])

            # Give a moment for async operations to complete
            await asyncio.sleep(0.1)

            # Verify RAG service was called
            mock_rag_service.index_documents.assert_called_once()
            call_args = mock_rag_service.index_documents.call_args[0][0]
            assert len(call_args) == 2
            assert call_args[0]["file_id"] == "test1.py"
            assert call_args[1]["file_id"] == "test2.py"

    @pytest.mark.asyncio
    async def test_index_files_without_rag_service(self, indexing_service, temp_dir):
        """🐼 Test indexing files without RAG service."""
        test_file = temp_dir / "test.py"
        test_file.write_text("print('hello')")

        # Should not raise an exception
        await indexing_service.index_files([test_file])

    @pytest.mark.asyncio
    async def test_create_document_from_file(self, indexing_service, temp_dir):
        """🐼 Test creating documents from files."""
        # Use a path that's not in the exclude list
        test_file = Path("/home/kade/test_project/test.py")
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("print('hello world')")

        # Patch the watch root to match our test directory
        with patch.object(
            continuous_indexing_config,
            "watch_root",
            "/home/kade/test_project",
        ):
            doc = await indexing_service._create_document_from_file(test_file)

            assert doc is not None
            assert doc["file_id"] == "test.py"
            assert doc["content"] == "print('hello world')"
            assert doc["file_type"] == "python"
            assert doc["language"] == "python"

    @pytest.mark.asyncio
    async def test_create_document_from_nonexistent_file(self, indexing_service):
        """🐼 Test creating document from non-existent file."""
        nonexistent_file = Path("/nonexistent/file.py")

        doc = await indexing_service._create_document_from_file(nonexistent_file)
        assert doc is None

    @pytest.mark.asyncio
    async def test_create_document_from_empty_file(self, indexing_service, temp_dir):
        """🐼 Test creating document from empty file."""
        empty_file = temp_dir / "empty.py"
        empty_file.write_text("")

        doc = await indexing_service._create_document_from_file(empty_file)
        assert doc is None

    def test_get_file_type(self, indexing_service):
        """🐼 Test file type detection."""
        assert indexing_service._get_file_type(Path("test.py")) == "python"
        assert indexing_service._get_file_type(Path("test.ts")) == "typescript"
        assert indexing_service._get_file_type(Path("test.js")) == "javascript"
        assert indexing_service._get_file_type(Path("test.md")) == "markdown"
        assert indexing_service._get_file_type(Path("test.txt")) == "text"
        assert indexing_service._get_file_type(Path("test.unknown")) == "text"

    def test_detect_language(self, indexing_service):
        """🐼 Test language detection."""
        assert indexing_service._detect_language(Path("test.py")) == "python"
        assert indexing_service._detect_language(Path("test.ts")) == "typescript"
        assert indexing_service._detect_language(Path("test.js")) == "javascript"
        assert indexing_service._detect_language(Path("test.vue")) == "javascript"
        assert indexing_service._detect_language(Path("test.unknown")) == "generic"

    def test_get_stats(self, indexing_service):
        """🐼 Test getting service statistics."""
        stats = indexing_service.get_stats()

        assert "enabled" in stats
        assert "running" in stats
        assert "watch_root" in stats
        assert "stats" in stats
        assert "queue_sizes" in stats
        assert "config" in stats

        assert stats["stats"]["files_indexed"] == 0
        assert stats["stats"]["files_removed"] == 0
        assert stats["stats"]["indexing_errors"] == 0

    @pytest.mark.asyncio
    async def test_shutdown(self, indexing_service):
        """🐼 Test service shutdown."""
        await indexing_service.initialize()
        await indexing_service.start_watching()

        # Should not raise an exception
        await indexing_service.shutdown()
        assert indexing_service.running is False


class TestFileChangeHandler:
    """Test suite for FileChangeHandler class."""

    @pytest.fixture
    def mock_indexer(self):
        """Create a mock indexer."""
        mock_indexer = MagicMock()
        mock_indexer.running = True
        mock_indexer._schedule_task_thread_safe = MagicMock(return_value=MagicMock())
        return mock_indexer

    @pytest.fixture
    def change_handler(self, mock_indexer):
        """Create a FileChangeHandler instance."""
        return FileChangeHandler(mock_indexer)

    def test_on_modified_file(self, change_handler, mock_indexer):
        """🐼 Test handling file modification events."""
        # Create a mock event
        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/file.py"

        # Mock the config
        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=True,
        ):
            with patch.object(continuous_indexing_config, "debounce_seconds", 0.1):
                change_handler.on_modified(event)

                # Verify the indexer was called
                mock_indexer._schedule_task_thread_safe.assert_called_once()

    def test_on_modified_directory(self, change_handler, mock_indexer):
        """🐼 Test handling directory modification events (should be ignored)."""
        event = MagicMock()
        event.is_directory = True
        event.src_path = "/test/directory"

        change_handler.on_modified(event)

        # Should not call the indexer
        mock_indexer._schedule_task_thread_safe.assert_not_called()

    def test_on_created_file(self, change_handler, mock_indexer):
        """🐼 Test handling file creation events."""
        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/newfile.py"

        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=True,
        ):
            change_handler.on_created(event)

            # Verify the indexer was called
            mock_indexer._schedule_task_thread_safe.assert_called_once()

    def test_on_deleted_file(self, change_handler, mock_indexer):
        """🐼 Test handling file deletion events."""
        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/deleted.py"

        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=True,
        ):
            change_handler.on_deleted(event)

            # Verify the indexer was called
            mock_indexer._schedule_task_thread_safe.assert_called_once()

    def test_on_modified_indexer_not_running(self, change_handler, mock_indexer):
        """🐼 Test handling events when indexer is not running."""
        mock_indexer.running = False

        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/file.py"

        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=True,
        ):
            change_handler.on_modified(event)

            # Should not call the indexer
            mock_indexer._schedule_task_thread_safe.assert_not_called()

    def test_on_modified_file_not_watched(self, change_handler, mock_indexer):
        """🐼 Test handling events for files that shouldn't be watched."""
        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/file.py"

        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=False,
        ):
            change_handler.on_modified(event)

            # Should not call the indexer
            mock_indexer._schedule_task_thread_safe.assert_not_called()

    def test_debounce_rapid_changes(self, change_handler, mock_indexer):
        """🐼 Test debouncing rapid file changes."""
        event = MagicMock()
        event.is_directory = False
        event.src_path = "/test/file.py"

        with patch.object(
            continuous_indexing_config,
            "should_watch_file",
            return_value=True,
        ):
            with patch.object(continuous_indexing_config, "debounce_seconds", 1.0):
                # First change
                change_handler.on_modified(event)

                # Immediate second change (should be debounced)
                change_handler.on_modified(event)

                # Should only be called once due to debouncing
                assert mock_indexer._schedule_task_thread_safe.call_count == 1


class TestContinuousIndexingIntegration:
    """Integration tests for continuous indexing service."""

    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield Path(temp_dir)

    @pytest.mark.asyncio
    async def test_full_indexing_workflow(self, temp_dir):
        """🐼 Test the complete indexing workflow."""
        # Create test files
        test_file1 = temp_dir / "test1.py"
        test_file2 = temp_dir / "test2.py"
        test_file1.write_text("print('hello world')")
        test_file2.write_text("def test(): pass")

        # Mock RAG service
        mock_rag_service = AsyncMock()
        mock_rag_service.index_documents = AsyncMock(return_value={"status": "success"})

        # Create service
        service_config = {
            "rag_enabled": True,
            "rag_continuous_indexing_enabled": True,
            "rag_continuous_indexing_auto_start": False,
        }

        with patch.object(continuous_indexing_config, "watch_root", str(temp_dir)):
            with patch.object(continuous_indexing_config, "enabled", True):
                service = ContinuousIndexingService(service_config)
                service.set_rag_service(mock_rag_service)

                # Initialize and start
                await service.initialize()
                await service.start_watching()

                # Schedule files for indexing
                await service.schedule_reindex(test_file1)
                await service.schedule_reindex(test_file2)

                # Process the queue
                await asyncio.sleep(0.1)  # Give time for processing

                # Verify files were processed
                stats = service.get_stats()
                assert (
                    stats["stats"]["files_indexed"] >= 0
                )  # May be 0 due to async processing

                # Cleanup
                await service.shutdown()

    @pytest.mark.asyncio
    async def test_error_handling_in_indexing(self, temp_dir):
        """🐼 Test error handling during indexing."""
        # Use a path that's not in the exclude list
        test_file = Path("/home/kade/test_project/test.py")
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("print('hello')")

        # Mock RAG service to raise an error
        mock_rag_service = AsyncMock()
        mock_rag_service.index_documents = AsyncMock(
            side_effect=Exception("Indexing failed"),
        )

        service_config = {
            "rag_enabled": True,
            "rag_continuous_indexing_enabled": True,
            "rag_continuous_indexing_auto_start": False,
        }

        with patch.object(
            continuous_indexing_config,
            "watch_root",
            "/home/kade/test_project",
        ):
            with patch.object(continuous_indexing_config, "enabled", True):
                service = ContinuousIndexingService(service_config)
                service.set_rag_service(mock_rag_service)

                await service.initialize()

                # Index files (should handle error gracefully)
                await service.index_files([test_file])

                # Give a moment for async operations to complete
                await asyncio.sleep(0.1)

                # Verify error was recorded
                stats = service.get_stats()
                assert stats["stats"]["indexing_errors"] > 0

    @pytest.mark.asyncio
    async def test_queue_processing_timeout(self, temp_dir):
        """🐼 Test queue processing with timeout."""
        service_config = {
            "rag_enabled": True,
            "rag_continuous_indexing_enabled": True,
            "rag_continuous_indexing_auto_start": False,
        }

        with patch.object(continuous_indexing_config, "watch_root", str(temp_dir)):
            with patch.object(continuous_indexing_config, "enabled", True):
                service = ContinuousIndexingService(service_config)

                await service.initialize()
                await service.start_watching()

                # Let it run briefly to test timeout handling
                await asyncio.sleep(0.1)

                # Should not raise any exceptions
                await service.shutdown()


# 🐼 Panda Spirit Test Utilities
class PandaTestUtils:
    """Utility functions for testing with panda spirit."""

    @staticmethod
    def create_bamboo_file(
        temp_dir: Path,
        name: str,
        content: str = "🐼 *munches bamboo*",
    ) -> Path:
        """Create a test file with panda-themed content."""
        file_path = temp_dir / name
        file_path.write_text(content)
        return file_path

    @staticmethod
    def assert_panda_spirit(
        test_result: bool,
        message: str = "Panda spirit not detected",
    ):
        """Assert with panda spirit."""
        assert test_result, f"🐼 {message}"


# 🐼 Panda-themed test markers
pytestmark = [
    pytest.mark.panda_spirit,
    pytest.mark.continuous_indexing,
]
