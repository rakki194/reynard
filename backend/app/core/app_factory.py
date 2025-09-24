"""Application Factory Module for Reynard Backend

This module implements the FastAPI application factory pattern, creating and
configuring the main FastAPI application with all necessary middleware,
routers, and security components.

The application factory follows modern FastAPI best practices:
- Modular router organization
- Comprehensive middleware stack
- Security-first configuration
- Environment-based feature toggles
- Proper dependency injection setup
"""

# API routers
import logging

from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

logger = logging.getLogger(__name__)

from app.api.admin.hot_reload import router as hot_reload_router
from app.api.agent_email_routes import router as agent_email_router
from app.api.caption import router as caption_router
from app.api.comfy import router as comfy_router
from app.api.email_routes import router as email_router
from app.api.executor.executor import router as executor_router
from app.api.gallerydl import router as gallerydl_router
from app.api.hf_cache.hf_cache import router as hf_cache_router
from app.api.image_utils.image_utils import router as image_utils_router
from app.api.imap_routes import router as imap_router
from app.api.lazy_loading import router as lazy_loading_router
from app.api.mcp import endpoints as mcp_endpoints
from app.api.mcp import tool_config_endpoints as mcp_tool_config_endpoints
from app.api.mcp import tools_endpoints as mcp_tools_endpoints
from app.api.nlweb import router as nlweb_router
from app.api.notebooks import endpoints as notebooks_endpoints
from app.api.notes import endpoints as notes_endpoints
from app.api.ollama import router as ollama_router
from app.api.rag import router as rag_router
from app.api.search import router as search_router
from app.api.summarization import router as summarization_router
from app.api.todos import endpoints as todos_endpoints
from app.api.tts import router as tts_router

# Core API endpoints
from app.core.api_endpoints import router as core_router

# Core configuration
from app.core.config import AppConfig, get_config

# Lifespan management
from app.core.lifespan_manager import lifespan
from app.core.penetration_testing import (
    check_penetration_testing_state,
    setup_penetration_testing_middleware,
)
from app.ecs.api.main import router as ecs_router

# ECS World integration
from app.ecs.postgres_service import register_postgres_ecs_service

# Middleware components
from app.middleware.cors_config import setup_cors_middleware
from app.middleware.dev_bypass_middleware import setup_dev_bypass_middleware
from app.middleware.input_validation_middleware import setup_input_validation_middleware
from app.middleware.rate_limiting import setup_rate_limiting
from app.middleware.security_headers import add_security_headers
from app.security.error_handler import setup_error_handlers

# Security components
from app.security.security_middleware import setup_security_middleware

# Authentication
from gatekeeper.api.routes import create_auth_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    This function implements the application factory pattern, creating a fully
    configured FastAPI application with all necessary middleware, routers,
    and security components.

    Returns:
        FastAPI: The configured FastAPI application instance.

    """
    config = get_config()

    # Check for existing penetration testing state on startup
    if check_penetration_testing_state():
        print("🦊 Detected active penetration testing session from previous run")
        print("   Auto-reload will remain disabled until session expires")

    # Create the FastAPI application
    app = FastAPI(
        title=config.title,
        description=config.description,
        version=config.version,
        docs_url=config.docs_url,
        redoc_url=config.redoc_url,
        lifespan=lifespan,
    )

    # Configure error handlers (before middleware wrapping)
    setup_error_handlers(app)

    # Configure routers (before middleware wrapping)
    _setup_routers(app)

    # Register PostgreSQL ECS world service
    register_postgres_ecs_service(app)

    # Configure middleware (last to wrap everything)
    app = _setup_middleware(app, config)

    return app


def _setup_middleware(app: FastAPI, config: AppConfig) -> FastAPI:
    """Configure all middleware for the FastAPI application.

    This function sets up the complete middleware stack including CORS,
    rate limiting, security headers, input validation, and trusted host validation.

    Args:
        app: The FastAPI application instance.
        config: The application configuration object.

    Returns:
        FastAPI: The configured application with all middleware.

    """
    # Penetration testing middleware (first to handle session control)
    setup_penetration_testing_middleware(app)

    # Development bypass middleware (second to set bypass flags)
    setup_dev_bypass_middleware(app)

    # Input validation middleware (third to validate input)
    setup_input_validation_middleware(app)

    # CORS configuration
    setup_cors_middleware(app)

    # Rate limiting
    setup_rate_limiting(app)

    # Security headers middleware
    app.middleware("http")(add_security_headers)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=config.allowed_hosts,
    )

    # Security middleware (last to wrap everything)
    app = setup_security_middleware(app)

    return app


def _setup_routers(app: FastAPI) -> None:
    """Configure all API routers for the FastAPI application.

    This function sets up all API routers with proper prefix configuration
    and organizes them by functional area for maintainable endpoint management.

    Args:
        app: The FastAPI application instance.

    """
    # Core API endpoints (root, health, etc.)
    app.include_router(core_router)

    # Authentication Router (use original for now, secure version will be added after service initialization)
    auth_router = create_auth_router()
    app.include_router(auth_router, prefix="/api")

    # Core API Routers
    app.include_router(caption_router, prefix="/api")
    app.include_router(gallerydl_router, prefix="/api")
    app.include_router(lazy_loading_router)
    app.include_router(hf_cache_router)
    app.include_router(executor_router)
    app.include_router(image_utils_router)
    app.include_router(rag_router)
    app.include_router(search_router)
    app.include_router(tts_router)
    app.include_router(mcp_endpoints.router, prefix="/api")
    app.include_router(mcp_tools_endpoints.router, prefix="/api")
    app.include_router(mcp_tool_config_endpoints.router, prefix="/api")

    # Admin Routers
    app.include_router(hot_reload_router)

    # Ollama Router (use original for now, secure version will be added after service initialization)
    app.include_router(ollama_router)

    app.include_router(comfy_router)

    # Summarization Router (use original for now, secure version will be added after service initialization)
    app.include_router(summarization_router)

    app.include_router(nlweb_router)

    # Notes & Todos API Routers
    app.include_router(notes_endpoints.router)
    app.include_router(notebooks_endpoints.router)
    app.include_router(todos_endpoints.router)

    # ECS World Router
    app.include_router(ecs_router, prefix="/api/ecs")

    # Email Router
    app.include_router(email_router)

    # Agent Email Router
    app.include_router(agent_email_router)

    # IMAP Router
    app.include_router(imap_router)

    # IMAP Router
    app.include_router(imap_router)
