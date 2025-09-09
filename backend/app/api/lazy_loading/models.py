"""
Pydantic models for Lazy Loading API.

This module defines the request/response models for lazy loading operations
with proper validation and documentation.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class LazyExportRequest(BaseModel):
    """Request model for creating a lazy export."""
    package_name: str = Field(..., description="Name of the package to create lazy export for")
    validation_level: str = Field(default="basic", description="Validation level for the export")


class LazyExportResponse(BaseModel):
    """Response model for lazy export operations."""
    package_name: str
    is_loaded: bool
    metadata: Dict[str, Any]


class PackageLoadRequest(BaseModel):
    """Request model for loading a package."""
    package_name: str = Field(..., description="Name of the package to load")


class PackageLoadResponse(BaseModel):
    """Response model for package loading operations."""
    success: bool
    package_name: str
    load_time: Optional[float] = None
    error: Optional[str] = None


class LazyLoadingStatusResponse(BaseModel):
    """Response model for lazy loading system status."""
    system_status: str
    timestamp: str
    loaded_packages: List[str]
    total_packages: int
    memory_usage: Dict[str, Any]
    performance: Dict[str, Any]


class PackageInfoResponse(BaseModel):
    """Response model for package information."""
    name: str
    is_loaded: bool
    load_time: Optional[float] = None
    memory_usage: Optional[float] = None
    access_count: int
    last_access: Optional[float] = None
    error_count: int
    dependencies: List[str]


class ConfigResponse(BaseModel):
    """Response model for lazy loading configuration."""
    enable_performance_monitoring: bool
    auto_cleanup: bool
    default_validation_level: str
    max_concurrent_loads: int
    memory_threshold: int


class ConfigUpdateRequest(BaseModel):
    """Request model for updating lazy loading configuration."""
    enable_performance_monitoring: Optional[bool] = None
    auto_cleanup: Optional[bool] = None
    default_validation_level: Optional[str] = None
    max_concurrent_loads: Optional[int] = None
    memory_threshold: Optional[int] = None
