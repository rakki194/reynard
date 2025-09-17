"""
Lazy Loading package for Reynard Backend

This package re-exports the lazy loading interfaces from `app.utils`
to provide a stable module location under `app.lazy_loading`.
"""

from app.utils.lazy_loading_core import LazyPackageExport
from app.utils.lazy_loading_registry import (
    LazyLoadingSystem,
    clear_export_registry,
    create_lazy_export,
    get_all_exports,
    get_export_count,
    get_lazy_export,
    get_lazy_loading_system,
    ml_packages,
)
from app.utils.lazy_loading_types import (
    ExportMetadata,
    ExportPerformanceMonitor,
    ExportType,
    ExportValidationError,
    ExportValidationLevel,
)

__all__ = [
    "ExportMetadata",
    "ExportPerformanceMonitor",
    "ExportType",
    "ExportValidationError",
    "ExportValidationLevel",
    "LazyLoadingSystem",
    "LazyPackageExport",
    "clear_export_registry",
    "create_lazy_export",
    "get_all_exports",
    "get_export_count",
    "get_lazy_export",
    "get_lazy_loading_system",
    "ml_packages",
]
