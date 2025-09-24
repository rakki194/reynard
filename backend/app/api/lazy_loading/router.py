"""Lazy Loading API router for Reynard Backend.

This module provides the FastAPI router with all lazy loading endpoints
using the service layer for business logic.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from .models import (
    ConfigResponse,
    ConfigUpdateRequest,
    LazyExportRequest,
    LazyExportResponse,
    LazyLoadingStatusResponse,
    PackageInfoResponse,
    PackageLoadRequest,
    PackageLoadResponse,
)
from .service import get_lazy_loading_service

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/lazy-loading", tags=["lazy-loading"])


@router.post("/exports", response_model=LazyExportResponse)
async def create_lazy_export_endpoint(request: LazyExportRequest):
    """Create a new lazy export for a package."""
    try:
        service = get_lazy_loading_service()
        result = service.create_lazy_export(
            request.package_name, request.validation_level,
        )
        return LazyExportResponse(**result)
    except Exception as e:
        logger.error(f"Failed to create lazy export for {request.package_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lazy export: {e!s}",
        )


@router.get("/exports/{package_name}", response_model=LazyExportResponse)
async def get_lazy_export_endpoint(package_name: str):
    """Get an existing lazy export."""
    try:
        service = get_lazy_loading_service()
        result = service.get_lazy_export(package_name)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lazy export for package '{package_name}' not found",
            )

        return LazyExportResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get lazy export for {package_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get lazy export: {e!s}",
        )


@router.post("/packages/load", response_model=PackageLoadResponse)
async def load_package_endpoint(request: PackageLoadRequest):
    """Load a package using its lazy export."""
    try:
        service = get_lazy_loading_service()
        result = service.load_package(request.package_name)
        return PackageLoadResponse(**result)
    except Exception as e:
        logger.error(f"Failed to load package {request.package_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load package: {e!s}",
        )


@router.delete("/packages/{package_name}")
async def unload_package_endpoint(package_name: str):
    """Unload a package by forcing cleanup of its lazy export."""
    try:
        service = get_lazy_loading_service()
        result = service.unload_package(package_name)
        return result
    except Exception as e:
        logger.error(f"Failed to unload package {package_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unload package: {e!s}",
        )


@router.get("/status", response_model=LazyLoadingStatusResponse)
async def get_lazy_loading_status():
    """Get the current status of the lazy loading system."""
    try:
        service = get_lazy_loading_service()
        result = service.get_system_status()
        return LazyLoadingStatusResponse(**result)
    except Exception as e:
        logger.error(f"Failed to get lazy loading status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {e!s}",
        )


@router.get("/packages/{package_name}", response_model=PackageInfoResponse)
async def get_package_info_endpoint(package_name: str):
    """Get detailed information about a specific package."""
    try:
        service = get_lazy_loading_service()
        result = service.get_package_info(package_name)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lazy export for package '{package_name}' not found",
            )

        return PackageInfoResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get package info for {package_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get package info: {e!s}",
        )


@router.get("/packages", response_model=list[PackageInfoResponse])
async def get_all_packages_endpoint():
    """Get information about all registered packages."""
    try:
        service = get_lazy_loading_service()
        results = service.get_all_packages_info()
        return [PackageInfoResponse(**result) for result in results]
    except Exception as e:
        logger.error(f"Failed to get all packages info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get packages info: {e!s}",
        )


@router.get("/config", response_model=ConfigResponse)
async def get_config_endpoint():
    """Get the current lazy loading configuration."""
    try:
        service = get_lazy_loading_service()
        result = service.get_config()
        return ConfigResponse(**result)
    except Exception as e:
        logger.error(f"Failed to get config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get config: {e!s}",
        )


@router.put("/config")
async def update_config_endpoint(request: ConfigUpdateRequest):
    """Update the lazy loading configuration."""
    try:
        service = get_lazy_loading_service()
        config_dict = request.model_dump(exclude_unset=True)
        result = service.update_config(config_dict)
        return result
    except Exception as e:
        logger.error(f"Failed to update config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {e!s}",
        )


@router.delete("/registry")
async def clear_registry_endpoint():
    """Clear the export registry."""
    try:
        service = get_lazy_loading_service()
        result = service.clear_registry()
        return result
    except Exception as e:
        logger.error(f"Failed to clear registry: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear registry: {e!s}",
        )


@router.post("/cleanup")
async def force_cleanup_endpoint(package_name: str | None = None):
    """Force cleanup of packages or all packages."""
    try:
        service = get_lazy_loading_service()
        result = service.force_cleanup(package_name)
        return result
    except Exception as e:
        logger.error(f"Failed to cleanup packages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup packages: {e!s}",
        )
