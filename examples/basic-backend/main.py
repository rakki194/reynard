#!/usr/bin/env python3
"""
Reynard Basic Backend Example
Modular FastAPI server demonstrating uvicorn reload best practices
"""

import os
import asyncio
import time
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import UvicornConfig
from services import CacheService, BackgroundService
from database import DatabaseService
from routes import users, health
from gatekeeper_config import initialize_auth_manager, close_auth_manager, get_auth_manager
from gatekeeper.api.dependencies import set_auth_manager
from gatekeeper.api.routes import create_auth_router


# Detect reload mode for optimization
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"

# Global services
database_service: Optional[DatabaseService] = None
cache_service: Optional[CacheService] = None
background_service: Optional[BackgroundService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with reload optimization"""
    global database_service, cache_service, background_service
    
    if IS_RELOAD_MODE:
        print("[INFO] Running in uvicorn reload mode - skipping heavy initialization")
        yield
        return
    
    # Full initialization for normal startup
    print("[INFO] Starting Reynard Basic Backend...")
    start_time = time.time()
    
    try:
        # Initialize services
        print("[INFO] Initializing database service...")
        database_service = DatabaseService()
        await database_service.initialize()
        
        print("[INFO] Initializing cache service...")
        cache_service = CacheService()
        await cache_service.initialize()
        
        print("[INFO] Starting background service...")
        background_service = BackgroundService()
        await background_service.start()
        
        # Initialize Gatekeeper authentication
        print("[INFO] Initializing Gatekeeper authentication...")
        auth_manager = initialize_auth_manager()
        set_auth_manager(auth_manager)
        
        init_time = time.time() - start_time
        print(f"[OK] Backend initialized successfully in {init_time:.2f}s")
        
    except Exception as e:
        print(f"[FAIL] Failed to initialize backend: {e}")
        raise
    
    yield
    
    # Cleanup
    print("[INFO] Cleaning up services...")
    cleanup_start = time.time()
    
    # Close Gatekeeper authentication
    await close_auth_manager()
    
    if background_service:
        await background_service.stop()
    
    if cache_service:
        await cache_service.close()
    
    if database_service:
        await database_service.close()
    
    cleanup_time = time.time() - cleanup_start
    print(f"[OK] Cleanup completed in {cleanup_time:.2f}s")


# Create FastAPI app
app = FastAPI(
    title="Reynard Basic Backend",
    description="Modular FastAPI backend demonstrating uvicorn reload best practices",
    version="1.0.0",
    lifespan=lifespan
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
            detail="Database service not available"
        )
    return database_service


def get_cache_service() -> CacheService:
    if cache_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cache service not available"
        )
    return cache_service


def get_background_service() -> BackgroundService:
    if background_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Background service not available"
        )
    return background_service


# Make dependencies available to routers
from routes.health import get_database_service as health_get_db, get_cache_service as health_get_cache, get_background_service as health_get_bg
from routes.users import get_database_service as users_get_db, get_cache_service as users_get_cache

app.dependency_overrides[health_get_db] = get_database_service
app.dependency_overrides[health_get_cache] = get_cache_service
app.dependency_overrides[health_get_bg] = get_background_service
app.dependency_overrides[users_get_db] = get_database_service
app.dependency_overrides[users_get_cache] = get_cache_service


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with system information"""
    return {
        "message": "Welcome to Reynard Basic Backend!",
        "version": "1.0.0",
        "reload_mode": IS_RELOAD_MODE,
        "services": {
            "database": database_service is not None,
            "cache": cache_service is not None,
            "background": background_service is not None
        }
    }


# System info endpoint
@app.get("/api/system")
async def system_info():
    """Get system information and status"""
    return {
        "reload_mode": IS_RELOAD_MODE,
        "services": {
            "database": {
                "available": database_service is not None,
                "status": "connected" if database_service else "not_initialized"
            },
            "cache": {
                "available": cache_service is not None,
                "status": "connected" if cache_service else "not_initialized"
            },
            "background": {
                "available": background_service is not None,
                "status": "running" if background_service else "not_started"
            }
        },
        "environment": {
            "python_version": os.sys.version,
            "uvicorn_reload": os.environ.get("UVICORN_RELOAD", "false"),
            "uvicorn_reload_process": os.environ.get("UVICORN_RELOAD_PROCESS", "0")
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    # Load configuration
    config = UvicornConfig()
    
    print("[INFO] Starting Reynard Basic Backend Server...")
    print(f"[INFO] Server will be available at: http://{config.host}:{config.port}")
    print(f"[INFO] API documentation at: http://{config.host}:{config.port}/docs")
    print(f"[INFO] Reload mode: {'enabled' if config.reload else 'disabled'}")
    
    if IS_RELOAD_MODE:
        print("[INFO] Running in uvicorn reload mode")
    
    uvicorn.run(
        "main:app",
        host=config.host,
        port=config.port,
        reload=config.reload,
        reload_dirs=config.reload_dirs,
        reload_delay=config.reload_delay,
        log_level=config.log_level,
        access_log=config.access_log,
        use_colors=config.use_colors
    )
