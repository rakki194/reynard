"""Lazy Loading Types for Reynard Backend

Type definitions and enums for the lazy loading system.
"""

import time
from dataclasses import dataclass, field
from enum import Enum
from typing import TypeVar

T = TypeVar("T")


class ExportType(Enum):
    """Types of package exports."""

    MODULE = "module"  # Full module export
    COMPONENT = "component"  # Specific component export
    FUNCTION = "function"  # Function export
    CLASS = "class"  # Class export
    CONSTANT = "constant"  # Constant export


class ExportValidationLevel(Enum):
    """Validation levels for exports."""

    NONE = "none"  # No validation
    BASIC = "basic"  # Basic import validation
    STRICT = "strict"  # Strict type checking
    COMPREHENSIVE = "comprehensive"  # Full validation including dependencies


@dataclass
class ExportMetadata:
    """Metadata for package exports."""

    package_name: str
    export_type: ExportType
    validation_level: ExportValidationLevel = ExportValidationLevel.BASIC
    load_time: float | None = None
    access_count: int = 0
    last_access_time: float | None = None
    memory_usage: int | None = None
    dependencies: list[str] = field(default_factory=list)
    error_count: int = 0
    last_error: str | None = None


@dataclass
class ExportPerformanceMonitor:
    """Performance monitoring for exports."""

    total_loads: int = 0
    successful_loads: int = 0
    failed_loads: int = 0
    total_load_time: float = 0.0
    average_load_time: float = 0.0
    min_load_time: float = float("inf")
    max_load_time: float = 0.0
    total_accesses: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    memory_usage: int = 0
    last_cleanup_time: float | None = None
    cleanup_count: int = 0


class ExportValidationError(Exception):
    """Exception raised when export validation fails."""

    def __init__(
        self,
        message: str,
        package_name: str,
        validation_level: ExportValidationLevel,
    ):
        super().__init__(message)
        self.package_name = package_name
        self.validation_level = validation_level
        self.timestamp = time.time()
