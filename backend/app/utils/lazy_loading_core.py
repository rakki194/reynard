"""
Lazy Loading Core for Reynard Backend

Core implementation of the lazy loading system.
"""

import importlib
import logging
import time
import weakref
from types import ModuleType
from typing import Any, List, Optional, TypeVar

from .lazy_loading_types import (
    ExportType,
    ExportValidationLevel,
    ExportMetadata,
    ExportPerformanceMonitor
)
from .lazy_loading_validation import LazyLoadingValidator
from .lazy_loading_performance import LazyLoadingPerformanceMonitor

logger = logging.getLogger("uvicorn")

T = TypeVar('T')


class LazyPackageExport:
    """
    Lazy loading proxy for package exports with validation and performance monitoring.
    """
    
    def __init__(
        self,
        package_name: str,
        import_name: str,
        export_type: ExportType = ExportType.MODULE,
        validation_level: ExportValidationLevel = ExportValidationLevel.BASIC,
        dependencies: Optional[List[str]] = None
    ):
        self._package_name = package_name
        self._import_name = import_name
        self._export_type = export_type
        self._validation_level = validation_level
        self._dependencies = dependencies or []
        
        self._module: Optional[ModuleType] = None
        self._export: Optional[Any] = None
        self._is_loaded = False
        self._load_error: Optional[Exception] = None
        self._metadata = ExportMetadata(
            package_name=package_name,
            export_type=export_type,
            validation_level=validation_level,
            dependencies=self._dependencies
        )
        
        # Performance monitoring
        self._performance_monitor = LazyLoadingPerformanceMonitor()
        
        # Weak reference to prevent circular references
        self._weak_self = weakref.ref(self)
    
    def _load(self) -> Any:
        """Load the package and return the export."""
        if self._is_loaded and self._export is not None:
            self._performance_monitor.record_cache_hit()
            return self._export
        
        if self._load_error is not None:
            raise self._load_error
        
        self._performance_monitor.record_cache_miss()
        start_time = self._performance_monitor.record_load_start()
        
        try:
            # Load dependencies first
            for dep in self._dependencies:
                try:
                    importlib.import_module(dep)
                except ImportError as e:
                    logger.warning(f"Failed to load dependency {dep} for {self._package_name}: {e}")
            
            # Load the main module
            self._module = importlib.import_module(self._import_name)
            
            # Extract the export based on type
            if self._export_type == ExportType.MODULE:
                self._export = self._module
            else:
                # For other types, we'd need to extract specific components
                # This is a simplified implementation
                self._export = self._module
            
            # Validate the export
            LazyLoadingValidator.validate_export(
                self._export, self._package_name, self._export_type, self._validation_level
            )
            
            # Update metadata
            load_time = time.time() - start_time
            self._metadata.load_time = load_time
            self._metadata.last_access_time = time.time()
            self._metadata.memory_usage = self._get_memory_usage()
            
            # Record successful load
            self._performance_monitor.record_load_success(start_time, self._module)
            
            self._is_loaded = True
            logger.info(f"Successfully loaded {self._package_name} in {load_time:.3f}s")
            
            return self._export
            
        except Exception as e:
            self._load_error = e
            self._metadata.error_count += 1
            self._metadata.last_error = str(e)
            
            # Record failed load
            self._performance_monitor.record_load_failure(start_time)
            
            logger.error(f"Failed to load {self._package_name}: {e}")
            raise
    
    def _get_memory_usage(self) -> int:
        """Get approximate memory usage of the loaded module."""
        try:
            import sys
            return sys.getsizeof(self._module) if self._module else 0
        except Exception:
            return 0
    
    def _update_access_stats(self):
        """Update access statistics."""
        self._metadata.access_count += 1
        self._metadata.last_access_time = time.time()
        self._performance_monitor.record_access()
    
    def __getattr__(self, name: str) -> Any:
        """Proxy attribute access to the loaded module."""
        self._update_access_stats()
        export = self._load()
        return getattr(export, name)
    
    def __call__(self, *args, **kwargs) -> Any:
        """Proxy function calls to the loaded module."""
        self._update_access_stats()
        export = self._load()
        return export(*args, **kwargs)
    
    def __repr__(self) -> str:
        """String representation of the lazy export."""
        status = "loaded" if self._is_loaded else "unloaded"
        return f"LazyPackageExport({self._package_name}, {status})"
    
    def get_metadata(self) -> ExportMetadata:
        """Get export metadata."""
        return self._metadata
    
    def get_performance_monitor(self) -> ExportPerformanceMonitor:
        """Get performance monitoring data."""
        return self._performance_monitor.get_performance_monitor()
    
    def unload(self):
        """Unload the module and free memory."""
        if self._is_loaded:
            self._module = None
            self._export = None
            self._is_loaded = False
            self._load_error = None
            
            # Record cleanup
            self._performance_monitor.record_cleanup()
            
            logger.info(f"Unloaded {self._package_name}")
    
    def is_loaded(self) -> bool:
        """Check if the module is loaded."""
        return self._is_loaded
