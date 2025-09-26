#!/usr/bin/env python3
"""Reynard Basic Backend Example
Modular FastAPI server demonstrating uvicorn reload best practices
"""

import os
import time
from contextlib import asynccontextmanager

from config import UvicornConfig
from database import DatabaseService
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from gatekeeper_config import (
    close_auth_manager,
    initialize_auth_manager,
)
from logging_config import (
    get_app_logger,
    setup_logging,
)
from routes import health, users

from gatekeeper.api.dependencies import set_auth_manager
from gatekeeper.api.routes import create_auth_router
from services import BackgroundService, CacheService

# Setup professional logging first
setup_logging()
logger = get_app_logger()

# Detect reload mode for optimization
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"

# Global services
database_service: DatabaseService | None = None
cache_service: CacheService | None = None
background_service: BackgroundService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with reload optimization"""
    global database_service, cache_service, background_service

    if IS_RELOAD_MODE:
        logger.info("Running in uvicorn reload mode - skipping heavy initialization")
        yield
        return

    # Full initialization for normal startup
    logger.info("Starting Reynard Basic Backend...")
    start_time = time.time()

    try:
        # Initialize services
        logger.info("Initializing database service...")
        database_service = DatabaseService()
        await database_service.initialize()
        logger.info("Database service initialized successfully")

        logger.info("Initializing cache service...")
        cache_service = CacheService()
        await cache_service.initialize()
        logger.info("Cache service initialized successfully")

        logger.info("Starting background service...")
        background_service = BackgroundService()
        await background_service.start()
        logger.info("Background service started successfully")

        # Initialize Gatekeeper authentication
        logger.info("Initializing Gatekeeper authentication...")
        auth_manager = initialize_auth_manager()
        set_auth_manager(auth_manager)
        logger.info("Gatekeeper authentication initialized successfully")

        init_time = time.time() - start_time
        logger.info(f"Backend initialized successfully in {init_time:.2f}s")

    except Exception as e:
        logger.error(f"Failed to initialize backend: {e}", exc_info=True)
        raise

    yield

    # Cleanup
    logger.info("Cleaning up services...")
    cleanup_start = time.time()

    try:
        # Close Gatekeeper authentication
        await close_auth_manager()
        logger.info("Gatekeeper authentication closed")

        if background_service:
            await background_service.stop()
            logger.info("Background service stopped")

        if cache_service:
            await cache_service.close()
            logger.info("Cache service closed")

        if database_service:
            await database_service.close()
            logger.info("Database service closed")

        cleanup_time = time.time() - cleanup_start
        logger.info(f"Cleanup completed in {cleanup_time:.2f}s")

    except Exception as e:
        logger.error(f"Error during cleanup: {e}", exc_info=True)


# Create FastAPI app
app = FastAPI(
    title="Reynard Basic Backend",
    description="Modular FastAPI backend demonstrating uvicorn reload best practices",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(create_auth_router(), prefix="/api", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


# Dependency to get services
def get_database_service() -> DatabaseService:
    if database_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not available",
        )
    return database_service


def get_cache_service() -> CacheService:
    if cache_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache service not available",
        )
    return cache_service


def get_background_service() -> BackgroundService:
    if background_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background service not available",
        )
    return background_service


# Make dependencies available to routers
from routes.health import get_background_service as health_get_bg
from routes.health import get_cache_service as health_get_cache
from routes.health import get_database_service as health_get_db
from routes.users import get_cache_service as users_get_cache
from routes.users import get_database_service as users_get_db

app.dependency_overrides[health_get_db] = get_database_service
app.dependency_overrides[health_get_cache] = get_cache_service
app.dependency_overrides[health_get_bg] = get_background_service
app.dependency_overrides[users_get_db] = get_database_service
app.dependency_overrides[users_get_cache] = get_cache_service


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system information"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to Reynard Basic Backend!",
        "version": "1.0.0",
        "reload_mode": IS_RELOAD_MODE,
        "services": {
            "database": database_service is not None,
            "cache": cache_service is not None,
            "background": background_service is not None,
        },
    }


# System info endpoint
@app.get("/api/system")
async def system_info():
    """Get system information and status"""
    logger.info("System info endpoint accessed")
    return {
        "reload_mode": IS_RELOAD_MODE,
        "services": {
            "database": {
                "available": database_service is not None,
                "status": "connected" if database_service else "not_initialized",
            },
            "cache": {
                "available": cache_service is not None,
                "status": "connected" if cache_service else "not_initialized",
            },
            "background": {
                "available": background_service is not None,
                "status": "running" if background_service else "not_started",
            },
        },
        "environment": {
            "python_version": os.sys.version,
            "uvicorn_reload": os.environ.get("UVICORN_RELOAD", "false"),
            "uvicorn_reload_process": os.environ.get("UVICORN_RELOAD_PROCESS", "0"),
        },
    }


if __name__ == "__main__":
    import uvicorn

    # Load configuration
    config = UvicornConfig()

    logger.info("Starting Reynard Basic Backend Server...")
    logger.info(f"Server will be available at: http://{config.host}:{config.port}")
    logger.info(f"API documentation at: http://{config.host}:{config.port}/docs")
    logger.info(f"Reload mode: {'enabled' if config.reload else 'disabled'}")

    if IS_RELOAD_MODE:
        logger.info("Running in uvicorn reload mode")

    uvicorn.run(
        "main:app",
        host=config.host,
        port=config.port,
        reload=config.reload,
        reload_dirs=config.reload_dirs,
        reload_delay=config.reload_delay,
        log_level=config.log_level,
        access_log=config.access_log,
        use_colors=config.use_colors,
        log_config="log_conf.yaml" if os.path.exists("log_conf.yaml") else None,
    )
