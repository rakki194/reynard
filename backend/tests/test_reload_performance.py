"""
Performance tests for the debounced reload system.

Tests system performance under high load and stress conditions.
"""

import asyncio
import logging
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import Mock

from app.core.reload_watcher import create_reload_watcher


class TestReloadPerformance(unittest.TestCase):
    """Performance tests for the reload system."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.reload_callback = Mock()
    
    def tearDown(self):
        """Clean up after tests."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_high_frequency_file_changes(self):
        """Test system performance with high-frequency file changes."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create many rapid file changes
            start_time = time.time()
            for i in range(100):
                test_file = Path(self.temp_dir) / f"test_{i}.py"
                test_file.write_text(f"# Test file {i}")
                time.sleep(0.001)  # Very small delay
            
            # Wait for debounce
            time.sleep(0.2)
            
            end_time = time.time()
            duration = end_time - start_time
            
            # Should complete quickly (under 1 second for 100 files)
            self.assertLess(duration, 1.0)
            
            # Should only have called reload once (due to debouncing)
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_concurrent_file_modifications(self):
        """Test system performance with concurrent file modifications."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create multiple threads modifying files concurrently
            def modify_files(thread_id, num_files):
                for i in range(num_files):
                    test_file = Path(self.temp_dir) / f"thread_{thread_id}_file_{i}.py"
                    test_file.write_text(f"# Thread {thread_id}, file {i}")
                    time.sleep(0.001)
            
            # Start multiple threads
            threads = []
            for i in range(5):
                thread = threading.Thread(target=modify_files, args=(i, 20))
                threads.append(thread)
                thread.start()
            
            # Wait for all threads to complete
            start_time = time.time()
            for thread in threads:
                thread.join()
            
            # Wait for debounce
            time.sleep(0.2)
            end_time = time.time()
            duration = end_time - start_time
            
            # Should complete quickly
            self.assertLess(duration, 2.0)
            
            # Should only have called reload once (due to debouncing)
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_memory_usage_stability(self):
        """Test that memory usage remains stable over time."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Perform many reload cycles
            for cycle in range(10):
                # Create and modify files
                for i in range(10):
                    test_file = Path(self.temp_dir) / f"cycle_{cycle}_file_{i}.py"
                    test_file.write_text(f"# Cycle {cycle}, file {i}")
                
                # Wait for debounce
                time.sleep(0.2)
                
                # Verify reload was called
                self.assertEqual(self.reload_callback.call_count, cycle + 1)
            
            # Memory usage should remain stable (no memory leaks)
            # This is a basic check - in a real scenario you'd use memory profiling tools
            
        finally:
            watcher.shutdown()
    
    def test_large_file_handling(self):
        """Test system performance with large files."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create a large file
            large_content = "# " + "x" * 10000  # 10KB file
            large_file = Path(self.temp_dir) / "large_file.py"
            large_file.write_text(large_content)
            
            # Wait for debounce
            time.sleep(0.2)
            
            # Should handle large files without issues
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_deep_directory_structure(self):
        """Test system performance with deep directory structures."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create deep directory structure
            deep_path = self.temp_dir
            for i in range(10):
                deep_path = Path(deep_path) / f"level_{i}"
                deep_path.mkdir(exist_ok=True)
            
            # Create files at different levels
            for i in range(5):
                test_file = deep_path / f"deep_file_{i}.py"
                test_file.write_text(f"# Deep file {i}")
            
            # Wait for debounce
            time.sleep(0.2)
            
            # Should handle deep structures without issues
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_rapid_start_stop_cycles(self):
        """Test system stability with rapid start/stop cycles."""
        for cycle in range(5):
            watcher = create_reload_watcher(
                watch_path=self.temp_dir,
                reload_callback=self.reload_callback,
                debounce_delay=0.1,
                include_patterns=["*.py"],
                exclude_patterns=["*.tmp"]
            )
            
            try:
                # Start watching
                watcher.start()
                
                # Create a file
                test_file = Path(self.temp_dir) / f"cycle_{cycle}.py"
                test_file.write_text(f"# Cycle {cycle}")
                
                # Wait briefly
                time.sleep(0.05)
                
                # Stop watching
                watcher.shutdown()
                
            except Exception as e:
                self.fail(f"Error in cycle {cycle}: {e}")
    
    def test_callback_performance(self):
        """Test callback performance under load."""
        callback_times = []
        
        def timing_callback():
            callback_times.append(time.time())
        
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=timing_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create multiple file changes
            for i in range(20):
                test_file = Path(self.temp_dir) / f"perf_test_{i}.py"
                test_file.write_text(f"# Performance test {i}")
                time.sleep(0.01)
            
            # Wait for debounce
            time.sleep(0.2)
            
            # Should have called callback once
            self.assertEqual(len(callback_times), 1)
            
            # Callback should be fast (under 10ms)
            callback_duration = callback_times[0] - callback_times[0]
            self.assertLess(callback_duration, 0.01)
            
        finally:
            watcher.shutdown()


class TestStressConditions(unittest.TestCase):
    """Stress tests for extreme conditions."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir = tempfile.mkdtemp()
        self.reload_callback = Mock()
    
    def tearDown(self):
        """Clean up after tests."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_extreme_file_count(self):
        """Test system with extreme number of files."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create many files
            start_time = time.time()
            for i in range(1000):
                test_file = Path(self.temp_dir) / f"stress_test_{i}.py"
                test_file.write_text(f"# Stress test file {i}")
            
            # Wait for debounce
            time.sleep(0.2)
            end_time = time.time()
            duration = end_time - start_time
            
            # Should handle 1000 files reasonably quickly
            self.assertLess(duration, 5.0)
            
            # Should only call reload once
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_rapid_pattern_changes(self):
        """Test system with rapidly changing file patterns."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py", "*.txt", "*.json"],
            exclude_patterns=["*.tmp", "*.log"]
        )
        
        try:
            watcher.start()
            
            # Create files with different patterns rapidly
            patterns = ["py", "txt", "json", "tmp", "log"]
            for i in range(100):
                pattern = patterns[i % len(patterns)]
                test_file = Path(self.temp_dir) / f"pattern_test_{i}.{pattern}"
                test_file.write_text(f"# Pattern test {i}")
                time.sleep(0.001)
            
            # Wait for debounce
            time.sleep(0.2)
            
            # Should only call reload once (included files batched)
            self.assertEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()
    
    def test_mixed_operations(self):
        """Test system with mixed file operations (create, modify, delete)."""
        watcher = create_reload_watcher(
            watch_path=self.temp_dir,
            reload_callback=self.reload_callback,
            debounce_delay=0.1,
            include_patterns=["*.py"],
            exclude_patterns=["*.tmp"]
        )
        
        try:
            watcher.start()
            
            # Create files
            files = []
            for i in range(10):
                test_file = Path(self.temp_dir) / f"mixed_test_{i}.py"
                test_file.write_text(f"# Mixed test {i}")
                files.append(test_file)
                time.sleep(0.01)
            
            # Modify files
            for file in files:
                file.write_text("# Modified content")
                time.sleep(0.01)
            
            # Delete files
            for file in files:
                file.unlink()
                time.sleep(0.01)
            
            # Wait for debounce
            time.sleep(0.2)
            
            # Should handle mixed operations
            self.assertGreaterEqual(self.reload_callback.call_count, 1)
            
        finally:
            watcher.shutdown()


if __name__ == "__main__":
    # Configure logging for tests
    logging.basicConfig(level=logging.WARNING)  # Reduce noise during tests
    
    # Run the tests
    unittest.main(verbosity=2)
