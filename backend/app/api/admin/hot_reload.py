"""Hot Reload API Endpoints for Service Management

This module provides endpoints for hot-reloading specific services without
restarting the entire server. This is useful for development and debugging.
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import JSONResponse

from app.core.service_registry import get_service_registry

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/hot-reload", tags=["Hot Reload"])


@router.post("/service/{service_name}")
async def reload_service(service_name: str) -> JSONResponse:
    """Hot-reload a specific service without restarting the server.

    This endpoint allows you to reload a single service, which is useful
    for development when you've made changes to a specific service.

    Args:
        service_name: Name of the service to reload

    Returns:
        JSONResponse with reload status and details

    """
    try:
        registry = get_service_registry()

        # Check if service exists
        if service_name not in registry._services:
            available_services = list(registry._services.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service '{service_name}' not found. Available services: {available_services}",
            )

        # Reload the service
        success = await registry.reload_service(service_name)

        if success:
            return JSONResponse(
                {
                    "status": "success",
                    "message": f"Service '{service_name}' reloaded successfully",
                    "service_name": service_name,
                    "timestamp": asyncio.get_event_loop().time(),
                },
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload service '{service_name}'",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to reload service %s", service_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload service: {e!s}",
        )


@router.post("/services")
async def reload_services_by_pattern(
    pattern: str = Query(
        ...,
        description="Pattern to match service names (e.g., 'rag*', '*indexing*')",
    ),
) -> JSONResponse:
    """Hot-reload multiple services matching a pattern.

    This endpoint allows you to reload multiple services at once using
    a pattern match. Useful for reloading related services.

    Args:
        pattern: Pattern to match service names (supports wildcards)

    Returns:
        JSONResponse with reload results for each matching service

    """
    try:
        registry = get_service_registry()

        # Reload services matching the pattern
        results = await registry.reload_services_by_pattern(pattern)

        if not results:
            available_services = list(registry._services.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No services found matching pattern '{pattern}'. Available services: {available_services}",
            )

        successful = [name for name, success in results.items() if success]
        failed = [name for name, success in results.items() if not success]

        return JSONResponse(
            {
                "status": "completed",
                "pattern": pattern,
                "total_services": len(results),
                "successful": successful,
                "failed": failed,
                "results": results,
                "timestamp": asyncio.get_event_loop().time(),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to reload services with pattern %s", pattern)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload services: {e!s}",
        )


@router.get("/services")
async def list_services() -> JSONResponse:
    """List all available services that can be hot-reloaded.

    Returns:
        JSONResponse with list of available services and their status

    """
    try:
        registry = get_service_registry()

        services_info = {}
        for name, service_info in registry._services.items():
            services_info[name] = {
                "name": name,
                "status": service_info.status.value,
                "priority": service_info.priority,
                "dependencies": service_info.dependencies,
                "last_health_check": service_info.last_health_check,
                "error": str(service_info.error) if service_info.error else None,
            }

        return JSONResponse(
            {
                "status": "success",
                "total_services": len(services_info),
                "services": services_info,
                "timestamp": asyncio.get_event_loop().time(),
            },
        )

    except Exception as e:
        logger.exception("Failed to list services")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list services: {e!s}",
        )


@router.get("/service/{service_name}/status")
async def get_service_status(service_name: str) -> JSONResponse:
    """Get the current status of a specific service.

    Args:
        service_name: Name of the service to check

    Returns:
        JSONResponse with service status and details

    """
    try:
        registry = get_service_registry()

        if service_name not in registry._services:
            available_services = list(registry._services.keys())
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Service '{service_name}' not found. Available services: {available_services}",
            )

        service_info = registry._services[service_name]

        return JSONResponse(
            {
                "status": "success",
                "service_name": service_name,
                "service_status": service_info.status.value,
                "priority": service_info.priority,
                "dependencies": service_info.dependencies,
                "last_health_check": service_info.last_health_check,
                "error": str(service_info.error) if service_info.error else None,
                "timestamp": asyncio.get_event_loop().time(),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to get service status for %s", service_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get service status: {e!s}",
        )
