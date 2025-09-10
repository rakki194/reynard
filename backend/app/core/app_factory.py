"""
Application Factory Module for Reynard Backend

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

from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Core configuration
from app.core.config import get_config

# Middleware components
from app.middleware.cors_config import setup_cors_middleware
from app.middleware.rate_limiting import setup_rate_limiting
from app.middleware.security_headers import add_security_headers

# Authentication
from gatekeeper.api.routes import create_auth_router

# API routers
from app.api.caption import router as caption_router
from app.api.lazy_loading import router as lazy_loading_router
from app.api.hf_cache.hf_cache import router as hf_cache_router
from app.api.executor.executor import router as executor_router
from app.api.image_utils.image_utils import router as image_utils_router
from app.api.rag import router as rag_router
from app.api.tts import router as tts_router
from app.api.ollama import router as ollama_router
from app.api.comfy import router as comfy_router
from app.api.summarization import router as summarization_router
from app.api.nlweb import router as nlweb_router

# Lifespan management
from app.core.lifespan_manager import lifespan


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    This function implements the application factory pattern, creating a fully
    configured FastAPI application with all necessary middleware, routers,
    and security components.
    
    Returns:
        FastAPI: The configured FastAPI application instance.
    """
    config = get_config()
    
    # Create the FastAPI application
    app = FastAPI(
        title=config.title,
        description=config.description,
        version=config.version,
        docs_url=config.docs_url,
        redoc_url=config.redoc_url,
        lifespan=lifespan,
    )
    
    # Configure middleware
    _setup_middleware(app, config)
    
    # Configure routers
    _setup_routers(app)
    
    return app


def _setup_middleware(app: FastAPI, config) -> None:
    """
    Configure all middleware for the FastAPI application.
    
    This function sets up the complete middleware stack including CORS,
    rate limiting, security headers, and trusted host validation.
    
    Args:
        app: The FastAPI application instance.
        config: The application configuration object.
    """
    # CORS configuration
    setup_cors_middleware(app)
    
    # Rate limiting
    setup_rate_limiting(app)
    
    # Security middleware
    app.middleware("http")(add_security_headers)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=config.allowed_hosts,
    )


def _setup_routers(app: FastAPI) -> None:
    """
    Configure all API routers for the FastAPI application.
    
    This function sets up all API routers with proper prefix configuration
    and organizes them by functional area for maintainable endpoint management.
    
    Args:
        app: The FastAPI application instance.
    """
    # Authentication Router
    auth_router = create_auth_router()
    app.include_router(auth_router, prefix="/api")
    
    # Core API Routers
    app.include_router(caption_router, prefix="/api")
    app.include_router(lazy_loading_router)
    app.include_router(hf_cache_router)
    app.include_router(executor_router)
    app.include_router(image_utils_router)
    app.include_router(rag_router)
    app.include_router(tts_router)
    app.include_router(ollama_router)
    app.include_router(comfy_router)
    app.include_router(summarization_router)
    app.include_router(nlweb_router)
