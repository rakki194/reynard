"""
Core API Endpoints Module for Reynard Backend

This module contains the core API endpoints for the Reynard backend,
including system information, health checks, and configuration endpoints.

Endpoints:
- Root: System information and API status
- Health: Comprehensive health check for all services
- Detailed Health: In-depth service diagnostics
- Protected: Authentication demonstration endpoint
- Config: Application configuration (development only)

Each endpoint follows FastAPI best practices with proper documentation,
error handling, and response formatting.
"""

from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

# Authentication
from gatekeeper.api.dependencies import require_active_user
from gatekeeper.models.user import User

# Core configuration and service management
from app.core.config import get_config, get_service_configs
from app.core.service_registry import get_service_registry

# Create router for core endpoints
router = APIRouter()


@router.get("/", tags=["Core"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint providing system information and API status.

    This endpoint serves as the primary entry point for the Reynard API,
    providing essential system information including version details,
    environment status, and documentation access points.

    Returns:
        dict: System information containing:
            - message: API status message
            - version: Current API version
            - environment: Deployment environment (development/production)
            - timestamp: Current UTC timestamp
            - docs_url: API documentation URL (if available)
    """
    config = get_config()

    return {
        "message": "🦊 Reynard API is running",
        "version": config.version,
        "environment": config.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "docs_url": config.docs_url,
    }


@router.get("/api/health", tags=["Health"])
async def health_check() -> JSONResponse:
    """
    Comprehensive health check endpoint for system monitoring.

    This endpoint provides real-time health status for all registered services,
    including individual service health checks, overall system status, and
    detailed service information for monitoring and alerting systems.

    Returns:
        JSONResponse: Health status response with:
            - status: Overall system health (healthy/unhealthy)
            - timestamp: Current UTC timestamp
            - environment: Deployment environment
            - version: API version
            - services: Individual service health status and operational state

    Status Codes:
        200: All services are healthy and operational
        503: One or more critical services are unhealthy or unavailable
    """
    config = get_config()
    registry = get_service_registry()

    # Get service statuses
    service_statuses = registry.get_all_status()
    health_checks = await registry.health_check_all()

    # Determine overall health
    is_healthy = registry.is_healthy()
    status_code = 200 if is_healthy else 503

    response_data = {
        "status": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": config.environment,
        "version": config.version,
        "services": {
            name: {
                "status": status.value,
                "healthy": health_checks.get(name, False),
            }
            for name, status in service_statuses.items()
        },
    }

    return JSONResponse(
        content=response_data,
        status_code=status_code
    )


@router.get("/api/health/detailed", tags=["Health"])
async def detailed_health_check() -> Dict[str, Any]:
    """
    Detailed health check endpoint with comprehensive service diagnostics.

    This endpoint provides in-depth health information for all registered services,
    including startup times, last health check timestamps, error details, and
    service-specific operational metrics for advanced monitoring and debugging.

    Returns:
        dict: Detailed health information containing:
            - timestamp: Current UTC timestamp
            - environment: Deployment environment
            - services: Detailed service information including:
                - status: Current service status
                - startup_time: Service initialization duration
                - last_health_check: Timestamp of last health check
                - error: Any error messages or exceptions
    """
    config = get_config()
    registry = get_service_registry()

    detailed_info = {}
    for name in registry._services.keys():
        service_info = registry.get_service_info(name)
        if service_info:
            detailed_info[name] = {
                "status": service_info.status.value,
                "startup_time": service_info.startup_time,
                "last_health_check": service_info.last_health_check,
                "error": str(service_info.error) if service_info.error else None,
            }

    return {
        "timestamp": datetime.now(timezone.utc),
        "environment": config.environment,
        "services": detailed_info,
    }


@router.get("/api/protected", tags=["Auth"])
async def protected_route(current_user: User = Depends(require_active_user())) -> Dict[str, Any]:
    """
    Protected route demonstrating authentication and authorization.

    This endpoint requires valid JWT authentication and demonstrates the
    integration with the Gatekeeper authentication service. It serves as
    a reference implementation for securing API endpoints and accessing
    authenticated user information.

    Args:
        current_user: Authenticated user object provided by the require_active_user dependency.
                     Automatically injected by FastAPI's dependency injection system.

    Returns:
        dict: Authenticated user information containing:
            - message: Personalized greeting message
            - user_id: Unique identifier for the authenticated user
            - timestamp: Current UTC timestamp
            - authenticated: Authentication status confirmation

    Raises:
        HTTPException: 401 Unauthorized if authentication fails or token is invalid.
        HTTPException: 403 Forbidden if user account is inactive or disabled.
    """
    return {
        "message": f"🦊 Hello {current_user.username}!",
        "user_id": current_user.id,
        "timestamp": datetime.now(timezone.utc),
        "authenticated": True,
    }


@router.get("/api/config", tags=["System"])
async def get_configuration() -> Dict[str, Any]:
    """
    Retrieve current application configuration (development environment only).

    This endpoint provides access to the current application configuration
    including environment settings, debug flags, and service-specific
    configurations. Access is restricted to development environments
    for security purposes.

    Returns:
        dict: Application configuration containing:
            - environment: Current deployment environment
            - debug: Debug mode status
            - services: Service-specific configuration details including:
                - enabled: Service activation status
                - timeout: Service timeout configurations

    Raises:
        HTTPException: 404 Not Found if accessed in production environment.
    """
    config = get_config()
    service_configs = get_service_configs()

    if not config.is_development():
        raise HTTPException(status_code=404, detail="Not found")

    return {
        "environment": config.environment,
        "debug": config.debug,
        "services": {
            name: {
                "enabled": service_config.get("enabled", True),
                "timeout": service_config.get("timeout", 30),
            }
            for name, service_config in service_configs.items()
        },
    }
