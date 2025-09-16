"""
Comprehensive tests for the debounced reload system.

Tests cover:
- DebouncedReloadHandler functionality
- DebouncedReloadWatcher integration
- File pattern filtering
- Thread safety
- Timing and debouncing behavior
- Graceful shutdown
"""

import asyncio
import logging
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from queue import Queue

# Import the modules under test
from app.core.reload_watcher import (
    DebouncedReloadHandler,
    DebouncedReloadWatcher,
    create_reload_watcher,
)


class TestDebouncedReloadHandler(unittest.TestCase):
    """Test cases for DebouncedReloadHandler."""

    def setUp(self):
        """Set up test fixtures."""
        self.reload_callback = Mock()
        self.handler = DebouncedReloadHandler(
            reload_callback=self.reload_callback,
            debounce_delay=0.1,  # Short delay for testing
            include_patterns=["*.py", "*.txt"],
            exclude_patterns=["*.tmp", "*.log"],
        )

    def tearDown(self):
        """Clean up after tests."""
        self.handler.shutdown()

    def test_initialization(self):
        """Test handler initialization."""
        self.assertEqual(self.handler.debounce_delay, 0.1)
        self.assertEqual(self.handler.include_patterns, ["*.py", "*.txt"])
        self.assertEqual(self.handler.exclude_patterns, ["*.tmp", "*.log"])
        self.assertIsInstance(self.handler.changed_files, set)
        self.assertIsInstance(self.handler.lock, type(threading.Lock()))

    def test_should_watch_file_include_patterns(self):
        """Test file inclusion based on patterns."""
        # Should watch Python files
        self.assertTrue(self.handler._should_watch_file("test.py"))
        self.assertTrue(self.handler._should_watch_file("app/main.py"))

        # Should watch text files
        self.assertTrue(self.handler._should_watch_file("readme.txt"))
        self.assertTrue(self.handler._should_watch_file("config.txt"))

        # Should not watch other files
        self.assertFalse(self.handler._should_watch_file("test.js"))
        self.assertFalse(self.handler._should_watch_file("image.png"))

    def test_should_watch_file_exclude_patterns(self):
        """Test file exclusion based on patterns."""
        # Should exclude temporary files
        self.assertFalse(self.handler._should_watch_file("test.tmp"))
        self.assertFalse(self.handler._should_watch_file("temp.log"))

        # Should exclude even if they match include patterns
        self.assertFalse(self.handler._should_watch_file("test.py.tmp"))

    def test_should_watch_file_directory_exclusion(self):
        """Test that directories are properly excluded."""
        # Create a mock event for a directory
        mock_event = Mock()
        mock_event.is_directory = True
        mock_event.src_path = "some_directory"

        # Should not process directory events
        self.handler.on_modified(mock_event)
        self.reload_callback.assert_not_called()

    def test_file_modification_tracking(self):
        """Test that file modifications are tracked correctly."""
        # Create a mock event
        mock_event = Mock()
        mock_event.is_directory = False
        mock_event.src_path = "test.py"

        # Process the event
        self.handler.on_modified(mock_event)

        # Check that the file was added to changed_files
        with self.handler.lock:
            self.assertIn("test.py", self.handler.changed_files)

    def test_file_creation_tracking(self):
        """Test that file creation events are tracked."""
        mock_event = Mock()
        mock_event.is_directory = False
        mock_event.src_path = "new_file.py"

        self.handler.on_created(mock_event)

        with self.handler.lock:
            self.assertIn("new_file.py", self.handler.changed_files)

    def test_file_move_tracking(self):
        """Test that file move events are tracked."""
        mock_event = Mock()
        mock_event.is_directory = False
        mock_event.src_path = "old_name.py"
        mock_event.dest_path = "new_name.py"

        self.handler.on_moved(mock_event)

        with self.handler.lock:
            self.assertIn("old_name.py", self.handler.changed_files)
            self.assertIn("new_name.py", self.handler.changed_files)

    def test_debounce_timing(self):
        """Test that debounce timing works correctly."""
        # Create multiple events quickly
        for i in range(5):
            mock_event = Mock()
            mock_event.is_directory = False
            mock_event.src_path = f"test_{i}.py"
            self.handler.on_modified(mock_event)

        # Should not have called reload yet
        self.reload_callback.assert_not_called()

        # Wait for debounce delay
        time.sleep(0.2)

        # Should have called reload once
        self.reload_callback.assert_called_once()

    def test_reload_callback_invocation(self):
        """Test that reload callback is invoked with correct timing."""
        mock_event = Mock()
        mock_event.is_directory = False
        mock_event.src_path = "test.py"

        # Process event
        self.handler.on_modified(mock_event)

        # Wait for debounce
        time.sleep(0.2)

        # Verify callback was called
        self.reload_callback.assert_called_once()

        # Verify changed files were cleared
        with self.handler.lock:
            self.assertEqual(len(self.handler.changed_files), 0)

    def test_multiple_rapid_changes(self):
        """Test that multiple rapid changes only trigger one reload."""
        # Create many rapid changes
        for i in range(10):
            mock_event = Mock()
            mock_event.is_directory = False
            mock_event.src_path = f"test_{i}.py"
            self.handler.on_modified(mock_event)
            time.sleep(0.01)  # Small delay between changes

        # Wait for debounce
        time.sleep(0.2)

        # Should only have called reload once
        self.reload_callback.assert_called_once()

    def test_shutdown(self):
        """Test graceful shutdown."""
        # Start a timer
        mock_event = Mock()
        mock_event.is_directory = False
        mock_event.src_path = "test.py"
        self.handler.on_modified(mock_event)

        # Shutdown immediately
        self.handler.shutdown()

        # Wait a bit to ensure timer was cancelled
        time.sleep(0.2)

        # Should not have called reload after shutdown
        self.reload_callback.assert_not_called()


class TestDebouncedReloadWatcher(unittest.TestCase):
    """Test cases for DebouncedReloadWatcher."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.reload_callback = Mock()
        self.watcher = DebouncedReloadWatcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"],
        )

    def tearDown(self):
        """Clean up after tests."""
        self.watcher.shutdown()
        # Clean up temp directory
        import shutil

        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_initialization(self):
        """Test watcher initialization."""
        self.assertEqual(self.watcher.watch_path, Path(self.temp_dir))
        self.assertEqual(self.watcher.debounce_delay, 0.1)
        self.assertIsNotNone(self.watcher.handler)
        self.assertIsNotNone(self.watcher.observer)

    def test_start_stop(self):
        """Test starting and stopping the watcher."""
        # Start watching
        self.watcher.start()
        self.assertTrue(self.watcher.observer.is_alive())

        # Stop watching
        self.watcher.stop()
        self.assertFalse(self.watcher.observer.is_alive())

    def test_file_watching_integration(self):
        """Test actual file watching functionality."""
        # Start watching
        self.watcher.start()

        try:
            # Create a test file
            test_file = Path(self.temp_dir) / "test.py"
            test_file.write_text("# Test file")

            # Wait for debounce
            time.sleep(0.2)

            # Should have triggered reload
            self.reload_callback.assert_called_once()

        finally:
            self.watcher.stop()

    def test_excluded_file_ignored(self):
        """Test that excluded files are ignored."""
        # Start watching
        self.watcher.start()

        try:
            # Create an excluded file
            excluded_file = Path(self.temp_dir) / "test.tmp"
            excluded_file.write_text("temporary content")

            # Wait for debounce
            time.sleep(0.2)

            # Should not have triggered reload
            self.reload_callback.assert_not_called()

        finally:
            self.watcher.stop()

    def test_shutdown(self):
        """Test graceful shutdown."""
        # Start watching
        self.watcher.start()

        # Shutdown
        self.watcher.shutdown()

        # Observer should be stopped
        self.assertFalse(self.watcher.observer.is_alive())


class TestCreateReloadWatcher(unittest.TestCase):
    """Test cases for the create_reload_watcher factory function."""

    def test_factory_function(self):
        """Test the factory function creates correct watcher."""
        with tempfile.TemporaryDirectory() as temp_dir:
            reload_callback = Mock()

            watcher = create_reload_watcher(
                watch_path=temp_dir,
                reload_callback=reload_callback,
                debounce_delay=0.5,
                include_patterns=["*.py"],
                exclude_patterns=["*.tmp"],
            )

            self.assertIsInstance(watcher, DebouncedReloadWatcher)
            self.assertEqual(watcher.watch_path, Path(temp_dir))
            self.assertEqual(watcher.debounce_delay, 0.5)

            # Cleanup
            watcher.shutdown()


class TestThreadSafety(unittest.TestCase):
    """Test thread safety of the reload system."""

    def test_concurrent_file_changes(self):
        """Test that concurrent file changes are handled safely."""
        with tempfile.TemporaryDirectory() as temp_dir:
            reload_callback = Mock()
            watcher = create_reload_watcher(
                watch_path=temp_dir, reload_callback=reload_callback, debounce_delay=0.1
            )

            try:
                watcher.start()

                # Create multiple threads that modify files
                def modify_files(thread_id):
                    for i in range(5):
                        test_file = Path(temp_dir) / f"test_{thread_id}_{i}.py"
                        test_file.write_text(f"# Thread {thread_id}, file {i}")
                        time.sleep(0.01)

                # Start multiple threads
                threads = []
                for i in range(3):
                    thread = threading.Thread(target=modify_files, args=(i,))
                    threads.append(thread)
                    thread.start()

                # Wait for all threads to complete
                for thread in threads:
                    thread.join()

                # Wait for debounce
                time.sleep(0.2)

                # Should have called reload (exactly once due to debouncing)
                self.assertEqual(reload_callback.call_count, 1)

            finally:
                watcher.shutdown()

    def test_lock_contention(self):
        """Test that locks prevent race conditions."""
        handler = DebouncedReloadHandler(reload_callback=Mock(), debounce_delay=0.1)

        # Create multiple threads accessing shared state
        results = []

        def access_shared_state(thread_id):
            for i in range(10):
                with handler.lock:
                    handler.changed_files.add(f"file_{thread_id}_{i}")
                    results.append(len(handler.changed_files))
                time.sleep(0.001)

        # Start multiple threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=access_shared_state, args=(i,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # All results should be valid (no negative or inconsistent values)
        self.assertTrue(all(result > 0 for result in results))

        # Cleanup
        handler.shutdown()


class TestFilePatternFiltering(unittest.TestCase):
    """Test comprehensive file pattern filtering."""

    def setUp(self):
        """Set up test fixtures."""
        self.handler = DebouncedReloadHandler(
            reload_callback=Mock(),
            include_patterns=["*.py", "*.env", "*.json"],
            exclude_patterns=[
                "*.db",
                "*.log",
                "generated/*",
                "__pycache__/*",
                ".mypy_cache/*",
                "*.pyc",
                "*.pyo",
                "*.pyd",
                ".pytest_cache/*",
                ".coverage",
                "htmlcov/*",
                ".tox/*",
                "venv/*",
                "env/*",
                ".venv/*",
                "node_modules/*",
                ".git/*",
                "*.tmp",
                "*.temp",
                "*.swp",
                "*.swo",
                "*~",
                ".DS_Store",
                "Thumbs.db",
            ],
        )

    def tearDown(self):
        """Clean up after tests."""
        self.handler.shutdown()

    def test_include_patterns(self):
        """Test that include patterns work correctly."""
        # Should include Python files
        self.assertTrue(self.handler._should_watch_file("app.py"))
        self.assertTrue(self.handler._should_watch_file("src/main.py"))
        self.assertTrue(self.handler._should_watch_file("tests/test_file.py"))

        # Should include environment files
        self.assertTrue(self.handler._should_watch_file(".env"))
        self.assertTrue(self.handler._should_watch_file("config.env"))

        # Should include JSON files
        self.assertTrue(self.handler._should_watch_file("package.json"))
        self.assertTrue(self.handler._should_watch_file("config.json"))

    def test_exclude_patterns(self):
        """Test that exclude patterns work correctly."""
        # Should exclude database files
        self.assertFalse(self.handler._should_watch_file("app.db"))
        self.assertFalse(self.handler._should_watch_file("data.sqlite"))

        # Should exclude log files
        self.assertFalse(self.handler._should_watch_file("app.log"))
        self.assertFalse(self.handler._should_watch_file("error.log"))

        # Should exclude cache directories
        self.assertFalse(self.handler._should_watch_file("__pycache__/module.pyc"))
        self.assertFalse(self.handler._should_watch_file(".mypy_cache/type_check.json"))

        # Should exclude virtual environments
        self.assertFalse(self.handler._should_watch_file("venv/bin/python"))
        self.assertFalse(
            self.handler._should_watch_file(".venv/lib/python3.9/site-packages/")
        )

        # Should exclude temporary files
        self.assertFalse(self.handler._should_watch_file("temp.tmp"))
        self.assertFalse(self.handler._should_watch_file("backup.swp"))

        # Should exclude OS-specific files
        self.assertFalse(self.handler._should_watch_file(".DS_Store"))
        self.assertFalse(self.handler._should_watch_file("Thumbs.db"))

    def test_exclude_overrides_include(self):
        """Test that exclude patterns override include patterns."""
        # Python file in excluded directory should be excluded
        self.assertFalse(self.handler._should_watch_file("__pycache__/module.py"))
        self.assertFalse(self.handler._should_watch_file("venv/lib/python.py"))

        # JSON file with excluded extension should be excluded
        self.assertFalse(self.handler._should_watch_file("config.json.tmp"))

    def test_path_matching(self):
        """Test that path matching works with subdirectories."""
        # Should match files in subdirectories
        self.assertTrue(self.handler._should_watch_file("src/app/main.py"))
        self.assertTrue(self.handler._should_watch_file("tests/unit/test_file.py"))

        # Should exclude files in excluded subdirectories
        self.assertFalse(self.handler._should_watch_file("generated/api.py"))
        self.assertFalse(self.handler._should_watch_file("node_modules/package.py"))


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete reload system."""

    def test_end_to_end_reload_cycle(self):
        """Test complete reload cycle from file change to callback."""
        with tempfile.TemporaryDirectory() as temp_dir:
            reload_callback = Mock()
            watcher = create_reload_watcher(
                watch_path=temp_dir,
                reload_callback=reload_callback,
                debounce_delay=0.1,
                include_patterns=["*.py"],
                exclude_patterns=["*.tmp"],
            )

            try:
                # Start watching
                watcher.start()

                # Create a Python file
                test_file = Path(temp_dir) / "test.py"
                test_file.write_text("# Initial content")

                # Wait for debounce
                time.sleep(0.2)

                # Should have triggered reload
                self.assertEqual(reload_callback.call_count, 1)

                # Modify the file
                test_file.write_text("# Modified content")

                # Wait for debounce
                time.sleep(0.2)

                # Should have triggered another reload
                self.assertEqual(reload_callback.call_count, 2)

                # Create an excluded file
                excluded_file = Path(temp_dir) / "temp.tmp"
                excluded_file.write_text("temporary content")

                # Wait for debounce
                time.sleep(0.2)

                # Should not have triggered another reload
                self.assertEqual(reload_callback.call_count, 2)

            finally:
                watcher.shutdown()

    def test_multiple_file_types(self):
        """Test watching multiple file types."""
        with tempfile.TemporaryDirectory() as temp_dir:
            reload_callback = Mock()
            watcher = create_reload_watcher(
                watch_path=temp_dir,
                reload_callback=reload_callback,
                debounce_delay=0.1,
                include_patterns=["*.py", "*.env", "*.json"],
                exclude_patterns=["*.tmp"],
            )

            try:
                watcher.start()

                # Create different file types
                files = ["app.py", "config.env", "package.json"]

                for filename in files:
                    test_file = Path(temp_dir) / filename
                    test_file.write_text(f"# {filename} content")
                    time.sleep(0.05)  # Small delay between files

                # Wait for debounce
                time.sleep(0.2)

                # Should have triggered reload once (all changes batched)
                self.assertEqual(reload_callback.call_count, 1)

            finally:
                watcher.shutdown()


if __name__ == "__main__":
    # Configure logging for tests
    logging.basicConfig(level=logging.WARNING)  # Reduce noise during tests

    # Run the tests
    unittest.main(verbosity=2)
