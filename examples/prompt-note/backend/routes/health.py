"""
Health check routes for Reynard Basic Backend
Provides health monitoring and system status endpoints
"""

import os
import time
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from services import BackgroundService, CacheService, DatabaseService

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""

    status: str
    timestamp: float
    uptime: float
    services: Dict[str, Dict[str, Any]]
    environment: Dict[str, str]


class ServiceStatus(BaseModel):
    """Service status model"""

    name: str
    status: str
    details: Dict[str, Any]


# Dependency functions (will be overridden in main.py)
def get_database_service() -> DatabaseService:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database service not available",
    )


def get_cache_service() -> CacheService:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Cache service not available",
    )


def get_background_service() -> BackgroundService:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Background service not available",
    )


@router.get("/health", response_model=HealthResponse)
async def health_check(
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service),
    bg_service: BackgroundService = Depends(get_background_service),
):
    """Comprehensive health check endpoint"""
    start_time = time.time()

    # Check service health
    db_healthy = await db_service.health_check()
    cache_healthy = await cache_service.health_check()
    bg_healthy = await bg_service.health_check()

    # Determine overall status
    all_healthy = db_healthy and cache_healthy and bg_healthy
    overall_status = "healthy" if all_healthy else "unhealthy"

    # Get service details
    services = {
        "database": {
            "status": "healthy" if db_healthy else "unhealthy",
            "details": db_service.get_stats(),
        },
        "cache": {
            "status": "healthy" if cache_healthy else "unhealthy",
            "details": cache_service.get_stats(),
        },
        "background": {
            "status": "healthy" if bg_healthy else "unhealthy",
            "details": bg_service.get_stats(),
        },
    }

    # Environment information
    environment = {
        "python_version": os.sys.version,
        "uvicorn_reload": os.environ.get("UVICORN_RELOAD", "false"),
        "uvicorn_reload_process": os.environ.get("UVICORN_RELOAD_PROCESS", "0"),
        "environment": os.environ.get("ENVIRONMENT", "development"),
    }

    return HealthResponse(
        status=overall_status,
        timestamp=start_time,
        uptime=time.time() - start_time,
        services=services,
        environment=environment,
    )


@router.get("/health/simple")
async def simple_health_check():
    """Simple health check endpoint"""
    return {
        "status": "ok",
        "message": "Reynard Basic Backend is running!",
        "timestamp": time.time(),
    }


@router.get("/health/ready")
async def readiness_check(
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service),
):
    """Readiness check endpoint (for Kubernetes)"""
    try:
        # Check if services are ready
        db_ready = await db_service.health_check()
        cache_ready = await cache_service.health_check()

        if db_ready and cache_ready:
            return {"status": "ready", "timestamp": time.time()}
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Services not ready",
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Readiness check failed: {str(e)}",
        )


@router.get("/health/live")
async def liveness_check():
    """Liveness check endpoint (for Kubernetes)"""
    return {
        "status": "alive",
        "timestamp": time.time(),
        "reload_mode": os.environ.get("UVICORN_RELOAD_PROCESS") == "1",
    }


@router.get("/health/services", response_model=Dict[str, ServiceStatus])
async def services_status(
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service),
    bg_service: BackgroundService = Depends(get_background_service),
):
    """Detailed services status endpoint"""

    services = {}

    # Database service
    try:
        db_healthy = await db_service.health_check()
        services["database"] = ServiceStatus(
            name="database",
            status="healthy" if db_healthy else "unhealthy",
            details=db_service.get_stats(),
        )
    except Exception as e:
        services["database"] = ServiceStatus(
            name="database", status="error", details={"error": str(e)}
        )

    # Cache service
    try:
        cache_healthy = await cache_service.health_check()
        services["cache"] = ServiceStatus(
            name="cache",
            status="healthy" if cache_healthy else "unhealthy",
            details=cache_service.get_stats(),
        )
    except Exception as e:
        services["cache"] = ServiceStatus(
            name="cache", status="error", details={"error": str(e)}
        )

    # Background service
    try:
        bg_healthy = await bg_service.health_check()
        services["background"] = ServiceStatus(
            name="background",
            status="healthy" if bg_healthy else "unhealthy",
            details=bg_service.get_stats(),
        )
    except Exception as e:
        services["background"] = ServiceStatus(
            name="background", status="error", details={"error": str(e)}
        )

    return services


@router.get("/health/metrics")
async def metrics_endpoint(
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service),
    bg_service: BackgroundService = Depends(get_background_service),
):
    """Metrics endpoint for monitoring"""

    # Collect metrics from all services
    metrics = {
        "timestamp": time.time(),
        "services": {
            "database": db_service.get_stats(),
            "cache": cache_service.get_stats(),
            "background": bg_service.get_stats(),
        },
        "system": {
            "reload_mode": os.environ.get("UVICORN_RELOAD_PROCESS") == "1",
            "environment": os.environ.get("ENVIRONMENT", "development"),
        },
    }

    return metrics
