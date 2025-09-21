"""
🦊 Reynard Backend Lifespan Management System
=============================================

Sophisticated service lifecycle management system for the Reynard FastAPI backend,
providing comprehensive orchestration of service initialization, health monitoring,
and graceful shutdown procedures. This module implements enterprise-grade lifecycle
management with dependency-aware startup sequencing and parallel execution optimization.

The lifespan manager provides:
- Priority-based service initialization with dependency resolution
- Parallel execution within priority groups for optimal startup performance
- Comprehensive health monitoring and service status tracking
- Graceful shutdown procedures with timeout handling and resource cleanup
- Error handling and recovery mechanisms with detailed logging
- Service registry integration for centralized lifecycle management

Key Features:
- Dependency-Aware Startup: Services start in correct order based on dependencies
- Parallel Initialization: Services within same priority group start concurrently
- Health Monitoring: Continuous health checks and service status tracking
- Graceful Shutdown: Proper resource cleanup with configurable timeouts
- Error Recovery: Comprehensive error handling with service isolation
- Performance Optimization: Startup time optimization through parallel execution

Architecture Components:
- Service Registry: Centralized service lifecycle management
- Priority System: Dependency-based startup sequencing
- Health Monitoring: Continuous service health checks
- Shutdown Orchestration: Graceful resource cleanup
- Error Handling: Comprehensive error recovery and reporting

The lifespan manager ensures reliable service startup and shutdown while
maintaining optimal performance and comprehensive error handling throughout
the service lifecycle.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

# Core configuration and service management
from app.core.config import get_config, get_service_configs

# Health check functions
from app.core.health_checks import (
    health_check_comfy,
    health_check_gatekeeper,
    health_check_nlweb,
)

# Service initializers
from app.core.service_initializers import (
    init_comfy_service,
    init_gatekeeper_service,
    init_nlweb_service,
    init_ollama_service,
    init_rag_service,
    init_search_service,
    shutdown_search_service,
    init_tts_service,
)
from app.core.service_registry import get_service_registry

# Service shutdown functions
from app.core.service_shutdown import (
    shutdown_comfy_service_func,
    shutdown_gatekeeper_service,
    shutdown_nlweb_service_func,
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
            from app.security.secure_auth_routes import create_secure_auth_router
            from gatekeeper.api.dependencies import get_auth_manager

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
            from app.security.secure_summarization_routes import (
                create_secure_summarization_router,
            )

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
    Sophisticated service lifecycle management with parallel initialization and dependency resolution.
    
    This context manager orchestrates the complete lifecycle of all backend services within
    the Reynard ecosystem, implementing enterprise-grade lifecycle management with priority-based
    startup sequencing, parallel initialization optimization, and comprehensive error handling.
    
    The lifespan manager provides:
    - Priority-based service initialization with dependency resolution
    - Parallel execution within priority groups for optimal startup performance
    - Comprehensive health monitoring and service status tracking
    - Graceful shutdown procedures with timeout handling and resource cleanup
    - Error handling and recovery mechanisms with detailed logging
    - Service registry integration for centralized lifecycle management
    
    Initialization Process:
    1. Configuration Loading: Load service configurations and environment settings
    2. Service Registration: Register all services with their priorities and dependencies
    3. Priority-Based Startup: Initialize services in dependency order (highest priority first)
    4. Parallel Execution: Services within same priority group start concurrently
    5. Health Monitoring: Perform health checks and validate service initialization
    6. Router Setup: Configure secure routers and API endpoints
    7. Service Registry: Provide initialized services to the FastAPI application
    
    Shutdown Process:
    1. Graceful Shutdown: Stop services in reverse priority order
    2. Resource Cleanup: Clean up connections, caches, and temporary resources
    3. Timeout Handling: Ensure shutdown completes within configured timeouts
    4. Error Recovery: Handle shutdown failures gracefully with proper logging
    
    Args:
        app (FastAPI): The FastAPI application instance requiring service orchestration.
            The application will receive the initialized service registry and all
            configured services will be available through dependency injection.
    
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
        startup_priority=100,  # Highest priority
    )

    registry.register_service(
        "comfy",
        service_configs["comfy"],
        init_comfy_service,
        shutdown_comfy_service_func,
        health_check_comfy,
        startup_priority=50,
    )

    registry.register_service(
        "nlweb",
        service_configs["nlweb"],
        init_nlweb_service,
        shutdown_nlweb_service_func,
        health_check_nlweb,
        startup_priority=50,
    )

    registry.register_service(
        "rag",
        service_configs["rag"],
        init_rag_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=25,
    )

    registry.register_service(
        "search",
        service_configs.get("search", {"enabled": True}),
        init_search_service,
        shutdown_search_service,  # Proper shutdown with resource cleanup
        _health_check_search_service,
        startup_priority=20,  # Lower priority than RAG (25) to ensure RAG starts first
    )

    registry.register_service(
        "ollama",
        service_configs["ollama"],
        init_ollama_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=25,
    )

    registry.register_service(
        "tts",
        service_configs["tts"],
        init_tts_service,
        None,  # No shutdown function yet
        None,  # No health check yet
        startup_priority=10,
    )

    # Register image processing service
    registry.register_service(
        "image_processing",
        {"enabled": True},  # Simple config for now
        _init_image_processing_service,
        _shutdown_image_processing_service,
        _health_check_image_processing_service,
        startup_priority=75,  # High priority for image support
    )

    # Register ECS world service
    registry.register_service(
        "ecs_world",
        {"enabled": True},  # Simple config for now
        _init_ecs_world_service,
        _shutdown_ecs_world_service,
        _health_check_ecs_world_service,
        startup_priority=90,  # High priority for agent simulation
    )

    # Register AI email response service (after Ollama is initialized)
    registry.register_service(
        "ai_email_response",
        {"enabled": True},  # Simple config for now
        _init_ai_email_response_service,
        _shutdown_ai_email_response_service,
        _health_check_ai_email_response_service,
        startup_priority=15,  # Lower priority than Ollama (25) to ensure Ollama starts first
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
            logger.info(
                f"✅ All services shutdown successfully in {shutdown_time:.2f}s"
            )
        except Exception as e:
            logger.error(f"❌ Service shutdown failed: {e}")


# Image Processing Service Functions
async def _init_image_processing_service(config: dict[str, Any]) -> bool:
    """Initialize the image processing service."""
    try:
        from app.services.image_processing_service import (
            initialize_image_processing_service,
        )

        success = await initialize_image_processing_service()
        if success:
            logger.info("✅ Image processing service initialized successfully")
        else:
            logger.warning("⚠️ Image processing service initialization failed")
        return success
    except Exception as e:
        logger.error(f"❌ Image processing service initialization error: {e}")
        return False


async def _shutdown_image_processing_service() -> None:
    """Shutdown the image processing service."""
    try:
        from app.services.image_processing_service import (
            shutdown_image_processing_service,
        )

        await shutdown_image_processing_service()
        logger.info("✅ Image processing service shutdown successfully")
    except Exception as e:
        logger.error(f"❌ Image processing service shutdown error: {e}")


async def _health_check_image_processing_service() -> bool:
    """Health check for the image processing service."""
    try:
        from app.services.image_processing_service import get_image_processing_service

        service = await get_image_processing_service()
        return await service.health_check()
    except Exception as e:
        logger.error(f"❌ Image processing service health check error: {e}")
        return False


# ECS World Service Functions
async def _init_ecs_world_service(config: dict[str, Any]) -> bool:
    """Initialize the ECS world service."""
    try:
        from app.ecs.service import get_ecs_service

        service = get_ecs_service()
        await service.startup()
        logger.info("✅ ECS world service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"❌ ECS world service initialization error: {e}")
        return False


async def _shutdown_ecs_world_service() -> None:
    """Shutdown the ECS world service."""
    try:
        from app.ecs.service import get_ecs_service

        service = get_ecs_service()
        await service.shutdown()
        logger.info("✅ ECS world service shutdown successfully")
    except Exception as e:
        logger.error(f"❌ ECS world service shutdown error: {e}")


async def _health_check_ecs_world_service() -> bool:
    """Health check for the ECS world service."""
    try:
        from app.ecs.service import get_ecs_service

        service = get_ecs_service()
        # Check if the world is initialized
        try:
            world = service.get_world()
            return world is not None
        except RuntimeError:
            return False
    except Exception as e:
        logger.error(f"❌ ECS world service health check error: {e}")
        return False


async def _health_check_search_service() -> bool:
    """Health check for the search service."""
    try:
        from app.core.service_registry import get_service_registry
        
        registry = get_service_registry()
        search_service = registry.get_service_instance("search")
        
        if search_service is None:
            return False
            
        # Test basic search functionality
        try:
            await search_service.get_search_stats()
            return True
        except Exception:
            return False
    except Exception as e:
        logger.error(f"❌ Search service health check error: {e}")
        return False


# AI Email Response Service Functions
async def _init_ai_email_response_service(config: dict[str, Any]) -> bool:
    """Initialize the AI email response service."""
    try:
        from app.services.ai_email_response_service import initialize_ai_email_response_service

        success = await initialize_ai_email_response_service()
        if success:
            logger.info("✅ AI email response service initialized successfully")
        else:
            logger.warning("⚠️ AI email response service initialization failed")
        return success
    except Exception as e:
        logger.error(f"❌ AI email response service initialization error: {e}")
        return False


async def _shutdown_ai_email_response_service() -> None:
    """Shutdown the AI email response service."""
    try:
        from app.services.ai_email_response_service import shutdown_ai_email_response_service

        await shutdown_ai_email_response_service()
        logger.info("✅ AI email response service shutdown successfully")
    except Exception as e:
        logger.error(f"❌ AI email response service shutdown error: {e}")


async def _health_check_ai_email_response_service() -> bool:
    """Health check for the AI email response service."""
    try:
        from app.services.ai_email_response_service import health_check_ai_email_response_service

        return await health_check_ai_email_response_service()
    except Exception as e:
        logger.error(f"❌ AI email response service health check error: {e}")
        return False
