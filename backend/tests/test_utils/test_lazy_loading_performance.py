"""Tests for the lazy_loading_performance module."""

from types import ModuleType
from unittest.mock import MagicMock, patch

import pytest

from app.utils.lazy_loading_performance import LazyLoadingPerformanceMonitor
from app.utils.lazy_loading_types import ExportPerformanceMonitor


class TestLazyLoadingPerformanceMonitor:
    """Test cases for LazyLoadingPerformanceMonitor class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.monitor = LazyLoadingPerformanceMonitor()

    def test_initialization(self):
        """Test monitor initialization."""
        assert isinstance(self.monitor._performance_monitor, ExportPerformanceMonitor)
        assert self.monitor._performance_monitor.total_loads == 0
        assert self.monitor._performance_monitor.successful_loads == 0
        assert self.monitor._performance_monitor.failed_loads == 0

    def test_record_load_start(self):
        """Test record_load_start returns current time."""
        with patch("time.time") as mock_time:
            mock_time.return_value = 12345.678
            result = self.monitor.record_load_start()
            assert result == 12345.678

    def test_record_load_success_basic(self):
        """Test record_load_success with basic parameters."""
        with patch("time.time") as mock_time:
            mock_time.side_effect = [1000.0, 1000.5]  # 0.5 second load time

            start_time = self.monitor.record_load_start()
            self.monitor.record_load_success(start_time)

            monitor_data = self.monitor.get_performance_monitor()
            assert monitor_data.total_loads == 1
            assert monitor_data.successful_loads == 1
            assert monitor_data.failed_loads == 0
            assert monitor_data.total_load_time == 0.5
            assert monitor_data.average_load_time == 0.5
            assert monitor_data.min_load_time == 0.5
            assert monitor_data.max_load_time == 0.5

    def test_record_load_success_with_module(self):
        """Test record_load_success with module parameter."""
        with patch("time.time") as mock_time:
            with patch.object(self.monitor, "_get_memory_usage") as mock_memory:
                mock_time.side_effect = [1000.0, 1000.5]
                mock_memory.return_value = 1024

                mock_module = MagicMock(spec=ModuleType)
                start_time = self.monitor.record_load_start()
                self.monitor.record_load_success(start_time, mock_module)

                monitor_data = self.monitor.get_performance_monitor()
                assert monitor_data.memory_usage == 1024
                mock_memory.assert_called_once_with(mock_module)

    def test_record_load_success_multiple_loads(self):
        """Test record_load_success with multiple load operations."""
        with patch("time.time") as mock_time:
            # First load: 0.5 seconds
            mock_time.side_effect = [1000.0, 1000.5, 1001.0, 1001.2]

            # First load
            start_time1 = self.monitor.record_load_start()
            self.monitor.record_load_success(start_time1)

            # Second load: 0.2 seconds
            start_time2 = self.monitor.record_load_start()
            self.monitor.record_load_success(start_time2)

            monitor_data = self.monitor.get_performance_monitor()
            assert monitor_data.total_loads == 2
            assert monitor_data.successful_loads == 2
            assert monitor_data.total_load_time == pytest.approx(0.7)  # 0.5 + 0.2
            assert monitor_data.average_load_time == pytest.approx(0.35)  # 0.7 / 2
            assert monitor_data.min_load_time == pytest.approx(0.2)
            assert monitor_data.max_load_time == 0.5

    def test_record_load_failure(self):
        """Test record_load_failure."""
        with patch("time.time") as mock_time:
            mock_time.side_effect = [1000.0, 1000.3]  # 0.3 second load time

            start_time = self.monitor.record_load_start()
            self.monitor.record_load_failure(start_time)

            monitor_data = self.monitor.get_performance_monitor()
            assert monitor_data.total_loads == 1
            assert monitor_data.successful_loads == 0
            assert monitor_data.failed_loads == 1
            assert monitor_data.total_load_time == pytest.approx(0.3)

    def test_record_access(self):
        """Test record_access."""
        self.monitor.record_access()
        self.monitor.record_access()
        self.monitor.record_access()

        monitor_data = self.monitor.get_performance_monitor()
        assert monitor_data.total_accesses == 3

    def test_record_cache_hit(self):
        """Test record_cache_hit."""
        self.monitor.record_cache_hit()
        self.monitor.record_cache_hit()

        monitor_data = self.monitor.get_performance_monitor()
        assert monitor_data.cache_hits == 2

    def test_record_cache_miss(self):
        """Test record_cache_miss."""
        self.monitor.record_cache_miss()
        self.monitor.record_cache_miss()
        self.monitor.record_cache_miss()

        monitor_data = self.monitor.get_performance_monitor()
        assert monitor_data.cache_misses == 3

    def test_record_cleanup(self):
        """Test record_cleanup."""
        with patch("time.time") as mock_time:
            with patch("gc.collect") as mock_gc_collect:
                mock_time.return_value = 12345.678

                self.monitor.record_cleanup()

                monitor_data = self.monitor.get_performance_monitor()
                assert monitor_data.cleanup_count == 1
                assert monitor_data.last_cleanup_time == 12345.678
                mock_gc_collect.assert_called_once()

    def test_record_cleanup_multiple(self):
        """Test record_cleanup with multiple cleanups."""
        with patch("time.time") as mock_time:
            with patch("gc.collect") as mock_gc_collect:
                mock_time.side_effect = [1000.0, 1001.0, 1002.0]

                self.monitor.record_cleanup()
                self.monitor.record_cleanup()
                self.monitor.record_cleanup()

                monitor_data = self.monitor.get_performance_monitor()
                assert monitor_data.cleanup_count == 3
                assert monitor_data.last_cleanup_time == 1002.0
                assert mock_gc_collect.call_count == 3

    def test_get_performance_monitor(self):
        """Test get_performance_monitor returns the monitor data."""
        monitor_data = self.monitor.get_performance_monitor()
        assert isinstance(monitor_data, ExportPerformanceMonitor)
        assert monitor_data is self.monitor._performance_monitor

    def test_get_memory_usage_success(self):
        """Test _get_memory_usage with successful sys.getsizeof."""
        mock_module = MagicMock(spec=ModuleType)

        with patch("sys.getsizeof") as mock_getsizeof:
            mock_getsizeof.return_value = 2048

            result = self.monitor._get_memory_usage(mock_module)

            assert result == 2048
            mock_getsizeof.assert_called_once_with(mock_module)

    def test_get_memory_usage_exception(self):
        """Test _get_memory_usage with exception."""
        mock_module = MagicMock(spec=ModuleType)

        with patch("sys.getsizeof") as mock_getsizeof:
            mock_getsizeof.side_effect = Exception("Test exception")

            result = self.monitor._get_memory_usage(mock_module)

            assert result == 0

    def test_get_memory_usage_import_error(self):
        """Test _get_memory_usage with import error."""
        mock_module = MagicMock(spec=ModuleType)

        with patch("builtins.__import__") as mock_import:
            mock_import.side_effect = ImportError("Test import error")

            result = self.monitor._get_memory_usage(mock_module)

            assert result == 0

    def test_comprehensive_workflow(self):
        """Test a comprehensive workflow with all operations."""
        with patch("time.time") as mock_time:
            with patch("gc.collect") as mock_gc_collect:
                with patch.object(self.monitor, "_get_memory_usage") as mock_memory:
                    # Set up time sequence
                    mock_time.side_effect = [
                        1000.0,
                        1000.5,  # First load success
                        1001.0,
                        1001.2,  # Second load success
                        1002.0,
                        1002.1,  # Third load failure
                        1003.0,
                        1004.0,  # Cleanup
                    ]
                    mock_memory.return_value = 1024

                    # First successful load
                    start1 = self.monitor.record_load_start()
                    mock_module1 = MagicMock(spec=ModuleType)
                    self.monitor.record_load_success(start1, mock_module1)

                    # Second successful load
                    start2 = self.monitor.record_load_start()
                    mock_module2 = MagicMock(spec=ModuleType)
                    self.monitor.record_load_success(start2, mock_module2)

                    # Failed load
                    start3 = self.monitor.record_load_start()
                    self.monitor.record_load_failure(start3)

                    # Some accesses and cache operations
                    self.monitor.record_access()
                    self.monitor.record_access()
                    self.monitor.record_cache_hit()
                    self.monitor.record_cache_miss()
                    self.monitor.record_cache_miss()

                    # Cleanup
                    self.monitor.record_cleanup()

                    # Verify final state
                    monitor_data = self.monitor.get_performance_monitor()
                    assert monitor_data.total_loads == 3
                    assert monitor_data.successful_loads == 2
                    assert monitor_data.failed_loads == 1
                    assert monitor_data.total_load_time == pytest.approx(
                        0.8
                    )  # 0.5 + 0.2 + 0.1
                    # Average is calculated only from successful loads: (0.5 + 0.2) / 2 = 0.35
                    assert monitor_data.average_load_time == pytest.approx(0.35)
                    # min_load_time is only updated for successful loads, so it's 0.2 (second successful load)
                    assert monitor_data.min_load_time == pytest.approx(0.2)
                    assert monitor_data.max_load_time == 0.5
                    assert monitor_data.memory_usage == 2048  # 1024 * 2
                    assert monitor_data.total_accesses == 2
                    assert monitor_data.cache_hits == 1
                    assert monitor_data.cache_misses == 2
                    assert monitor_data.cleanup_count == 1
                    assert monitor_data.last_cleanup_time == 1003.0
                    assert mock_gc_collect.call_count == 1
