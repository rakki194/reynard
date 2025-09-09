"""
Lazy Loading Performance for Reynard Backend

Performance monitoring and statistics for the lazy loading system.
"""

import gc
import logging
import time
from types import ModuleType
from typing import Any, Optional

from .lazy_loading_types import ExportPerformanceMonitor

logger = logging.getLogger("uvicorn")


class LazyLoadingPerformanceMonitor:
    """Performance monitor for lazy loading operations."""
    
    def __init__(self):
        self._performance_monitor = ExportPerformanceMonitor()
    
    def record_load_start(self) -> float:
        """Record the start of a load operation."""
        return time.time()
    
    def record_load_success(self, start_time: float, module: Optional[ModuleType] = None):
        """Record a successful load operation."""
        load_time = time.time() - start_time
        
        self._performance_monitor.total_loads += 1
        self._performance_monitor.successful_loads += 1
        self._performance_monitor.total_load_time += load_time
        self._performance_monitor.average_load_time = (
            self._performance_monitor.total_load_time / self._performance_monitor.total_loads
        )
        self._performance_monitor.min_load_time = min(
            self._performance_monitor.min_load_time, load_time
        )
        self._performance_monitor.max_load_time = max(
            self._performance_monitor.max_load_time, load_time
        )
        
        if module:
            self._performance_monitor.memory_usage += self._get_memory_usage(module)
        
        logger.debug(f"Load success recorded: {load_time:.3f}s")
    
    def record_load_failure(self, start_time: float):
        """Record a failed load operation."""
        load_time = time.time() - start_time
        
        self._performance_monitor.total_loads += 1
        self._performance_monitor.failed_loads += 1
        self._performance_monitor.total_load_time += load_time
        
        logger.debug(f"Load failure recorded: {load_time:.3f}s")
    
    def record_access(self):
        """Record an access to the export."""
        self._performance_monitor.total_accesses += 1
    
    def record_cache_hit(self):
        """Record a cache hit."""
        self._performance_monitor.cache_hits += 1
    
    def record_cache_miss(self):
        """Record a cache miss."""
        self._performance_monitor.cache_misses += 1
    
    def record_cleanup(self):
        """Record a cleanup operation."""
        self._performance_monitor.cleanup_count += 1
        self._performance_monitor.last_cleanup_time = time.time()
        
        # Force garbage collection
        gc.collect()
        
        logger.debug("Cleanup recorded")
    
    def get_performance_monitor(self) -> ExportPerformanceMonitor:
        """Get the performance monitor data."""
        return self._performance_monitor
    
    def _get_memory_usage(self, module: ModuleType) -> int:
        """Get approximate memory usage of the loaded module."""
        try:
            import sys
            return sys.getsizeof(module)
        except Exception:
            return 0
