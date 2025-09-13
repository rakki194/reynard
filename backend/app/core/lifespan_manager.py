"""
Lifespan Management Module for Reynard Backend

This module implements sophisticated service lifecycle management with parallel
initialization, priority-based startup sequencing, and comprehensive error handling.

The lifespan manager orchestrates the complete lifecycle of all backend services,
implementing dependency-aware startup sequencing, parallel initialization within
priority groups, and graceful shutdown procedures.

Architecture Features:
- Service Registry Pattern: Centralized lifecycle management
- Priority-Based Initialization: Dependency-aware startup sequencing
- Parallel Execution: Services within same priority group start concurrently
- Comprehensive Error Handling: Graceful failure handling with proper reporting
- Graceful Shutdown: Proper resource cleanup with timeout handling
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI

# Core configuration and service management
from app.core.config import get_config, get_service_configs
from app.core.service_registry import get_service_registry

# Service initializers
from app.core.service_initializers import (
    init_gatekeeper_service,
    init_comfy_service,
    init_nlweb_service,
    init_rag_service,
    init_ollama_service,
    init_tts_service,
)

# Service shutdown functions
from app.core.service_shutdown import (
    shutdown_gatekeeper_service,
    shutdown_comfy_service_func,
    shutdown_nlweb_service_func,
)

# Health check functions
from app.core.health_checks import (
    health_check_gatekeeper,
    health_check_comfy,
    health_check_nlweb,
)

logger = logging.getLogger(__name__)


async def _setup_secure_routers(app: FastAPI, registry) -> None:
    """
    Set up secure routers after services are initialized.
    
    Args:
        app: The FastAPI application instance
        registry: The service registry with initialized services
    """
    try:
        # Set up secure auth router
        try:
            from gatekeeper.api.dependencies import get_auth_manager
            from app.security.secure_auth_routes import create_secure_auth_router
            
            auth_manager = get_auth_manager()
            secure_auth_router = create_secure_auth_router(auth_manager)
            app.include_router(secure_auth_router, prefix="/api/secure")
            logger.info("✅ Secure auth router added successfully")
        except Exception as e:
            logger.warning(f"Failed to add secure auth router: {e}")
        
        # Set up secure ollama router
        try:
            from app.api.ollama.service import get_ollama_service
            from app.security.secure_ollama_routes import create_secure_ollama_router
            
            ollama_service = get_ollama_service()
            secure_ollama_router = create_secure_ollama_router(ollama_service)
            app.include_router(secure_ollama_router, prefix="/api/secure")
            logger.info("✅ Secure ollama router added successfully")
        except Exception as e:
            logger.warning(f"Failed to add secure ollama router: {e}")
        
        # Set up secure summarization router
        try:
            from app.security.secure_summarization_routes import create_secure_summarization_router
            
            secure_summarization_router = create_secure_summarization_router()
            app.include_router(secure_summarization_router, prefix="/api/secure")
            logger.info("✅ Secure summarization router added successfully")
        except Exception as e:
            logger.warning(f"Failed to add secure summarization router: {e}")
            
    except Exception as e:
        logger.error(f"Failed to set up secure routers: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Sophisticated service lifecycle management with parallel initialization.
    
    This context manager orchestrates the complete lifecycle of all backend services,
    implementing priority-based startup sequencing, parallel initialization within
    priority groups, comprehensive error handling, and graceful shutdown procedures.
    
    The initialization process follows a dependency-aware approach:
    1. Register all services with their respective priorities and configurations
    2. Initialize services in parallel within priority groups (highest priority first)
    3. Handle initialization failures gracefully with proper error reporting
    4. Provide the service registry to the FastAPI application
    5. Perform graceful shutdown of all services in reverse order on exit
    
    Args:
        app: The FastAPI application instance requiring service orchestration.
        
    Yields:
        Dict[str, Any]: A dictionary containing the initialized service registry.
        
    Raises:
        RuntimeError: If critical service initialization fails and prevents application startup.
    """
    config = get_config()
    service_configs = get_service_configs()
    registry = get_service_registry()
    
    # Register services with priority-based initialization
    registry.register_service(
        "gatekeeper",
        service_configs["gatekeeper"],
        init_gatekeeper_service,
        shutdown_gatekeeper_service,
        health_check_gatekeeper,
        startup_priority=100  # Highest priority
    )
    
    registry.register_service(
        "comfy",
        service_configs["comfy"],
        init_comfy_service,
        shutdown_comfy_service_func,
        health_check_comfy,
        startup_priority=50
    )
    
    registry.register_service(
        "nlweb",
        service_configs["nlweb"],
        init_nlweb_service,
        shutdown_nlweb_service_func,
        health_check_nlweb,
        startup_priority=50
    )
    
    registry.register_service(
        "rag",
        service_configs["rag"],
        init_rag_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=25
    )
    
    registry.register_service(
        "ollama",
        service_configs["ollama"],
        init_ollama_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=25
    )
    
    registry.register_service(
        "tts",
        service_configs["tts"],
        init_tts_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=10
    )
    
    # Initialize all services
    logger.info("🚀 Starting Reynard API services...")
    start_time = time.time()
    
    try:
        success = await registry.initialize_all(timeout=config.startup_timeout)
        if not success:
            raise RuntimeError("Service initialization failed")
        
        total_time = time.time() - start_time
        logger.info(f"✅ All services initialized successfully in {total_time:.2f}s")
        
        # Set up secure routers now that services are initialized
        await _setup_secure_routers(app, registry)
        
        # FastAPI expects a mapping/dictionary, not a ServiceRegistry object
        yield {"service_registry": registry}
        
    except Exception as e:
        logger.error(f"❌ Service initialization failed: {e}")
        raise
    
    finally:
        # Graceful shutdown
        logger.info("🛑 Shutting down Reynard API services...")
        shutdown_start = time.time()
        
        try:
            await registry.shutdown_all(timeout=config.shutdown_timeout)
            shutdown_time = time.time() - shutdown_start
            logger.info(f"✅ All services shutdown successfully in {shutdown_time:.2f}s")
        except Exception as e:
            logger.error(f"❌ Service shutdown failed: {e}")
