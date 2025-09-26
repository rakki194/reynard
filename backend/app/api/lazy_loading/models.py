"""Pydantic models for Lazy Loading API.

This module defines the request/response models for lazy loading operations
with proper validation and documentation.
"""

from typing import Any

from pydantic import BaseModel, Field


class LazyExportRequest(BaseModel):
    """Request model for creating a lazy export."""

    package_name: str = Field(
        ...,
        description="Name of the package to create lazy export for",
    )
    validation_level: str = Field(
        default="basic",
        description="Validation level for the export",
    )


class LazyExportResponse(BaseModel):
    """Response model for lazy export operations."""

    package_name: str
    is_loaded: bool
    metadata: dict[str, Any]


class PackageLoadRequest(BaseModel):
    """Request model for loading a package."""

    package_name: str = Field(..., description="Name of the package to load")


class PackageLoadResponse(BaseModel):
    """Response model for package loading operations."""

    success: bool
    package_name: str
    load_time: float | None = None
    error: str | None = None


class LazyLoadingStatusResponse(BaseModel):
    """Response model for lazy loading system status."""

    system_status: str
    timestamp: str
    loaded_packages: list[str]
    total_packages: int
    memory_usage: dict[str, Any]
    performance: dict[str, Any]


class PackageInfoResponse(BaseModel):
    """Response model for package information."""

    name: str
    is_loaded: bool
    load_time: float | None = None
    memory_usage: float | None = None
    access_count: int
    last_access: float | None = None
    error_count: int
    dependencies: list[str]


class ConfigResponse(BaseModel):
    """Response model for lazy loading configuration."""

    enable_performance_monitoring: bool
    auto_cleanup: bool
    default_validation_level: str
    max_concurrent_loads: int
    memory_threshold: int


class ConfigUpdateRequest(BaseModel):
    """Request model for updating lazy loading configuration."""

    enable_performance_monitoring: bool | None = None
    auto_cleanup: bool | None = None
    default_validation_level: str | None = None
    max_concurrent_loads: int | None = None
    memory_threshold: int | None = None
