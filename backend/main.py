"""
FastAPI Backend for Reynard - Refactored

This is the main entry point for the Reynard FastAPI backend.
All functionality has been modularized into focused components.
"""

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Import modular components
from app.middleware.cors_config import setup_cors_middleware
from app.middleware.rate_limiting import setup_rate_limiting
from app.middleware.security_headers import add_security_headers
from app.auth.routes import router as auth_router
from app.auth.user_service import get_current_active_user

# Import API routers
from app.api.caption import router as caption_router
from app.api.lazy_loading import router as lazy_loading_router
from app.api.hf_cache.hf_cache import router as hf_cache_router
from app.api.executor.executor import router as executor_router
from app.api.image_utils.image_utils import router as image_utils_router
from app.api.rag import router as rag_router
from app.api.tts import router as tts_router
# from app.api.diffusion import router as diffusion_router
from app.api.ollama import router as ollama_router
from app.api.comfy import router as comfy_router
from app.api.summarization import router as summarization_router
from app.api.nlweb import router as nlweb_router

# Load environment variables
load_dotenv()

# Initialize ComfyUI service
from app.services.comfy import initialize_comfy_service
try:
    # Initialize with default configuration
    comfy_config = {
        "comfy_enabled": True,
        "comfy_api_url": "http://127.0.0.1:8188",
        "comfy_timeout": 60,
        "comfy_image_dir": "generated/comfy",
    }
    initialize_comfy_service(comfy_config)
except Exception as e:
    print(f"Warning: Failed to initialize ComfyUI service: {e}")

# Initialize NLWeb service
from app.services.nlweb.service_initializer import initialize_nlweb_service
try:
    # Initialize with default configuration
    nlweb_config = {
        "nlweb": {
            "enabled": True,
            "base_url": None,  # No external NLWeb service by default
            "suggest_timeout_s": 1.5,
            "cache_ttl_s": 10.0,
            "cache_max_entries": 64,
            "allow_stale_on_error": True,
            "warm_timeout_s": 2.0,
            "rate_limit_window_s": 60.0,
            "rate_limit_max_requests": 30,
            "canary_enabled": False,
            "canary_percentage": 5.0,
            "rollback_enabled": False,
            "performance_monitoring_enabled": True,
            "proxy_max_retries": 2,
            "proxy_backoff_ms": 200,
            "proxy_connect_timeout_ms": 2000,
            "proxy_read_timeout_ms": 10000,
            "proxy_sse_idle_timeout_ms": 15000
        }
    }
    initialize_nlweb_service(nlweb_config)
except Exception as e:
    print(f"Warning: Failed to initialize NLWeb service: {e}")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    app = FastAPI(
        title="Reynard API",
        description="Secure API backend for Reynard applications",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )
    
    # Setup middleware
    setup_cors_middleware(app)
    limiter = setup_rate_limiting(app)
    
    # Add security headers middleware
    app.middleware("http")(add_security_headers)
    
    # Add trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "testserver", "*.yourdomain.com"],
    )
    
    # Include routers
    app.include_router(auth_router)
    app.include_router(caption_router, prefix="/api")
    app.include_router(lazy_loading_router)
    app.include_router(hf_cache_router)
    app.include_router(executor_router)
    app.include_router(image_utils_router)
    app.include_router(rag_router)
    app.include_router(tts_router)
    # app.include_router(diffusion_router)
    app.include_router(ollama_router)
    app.include_router(comfy_router)
    app.include_router(summarization_router)
    app.include_router(nlweb_router)
    
    # Define core routes
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {"message": "Reynard API is running", "version": "1.0.0"}

    @app.get("/api/health")
    async def health_check():
        """Health check endpoint"""
        from datetime import datetime, timezone
        return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

    @app.get("/api/protected")
    async def protected_route(current_user: dict = Depends(get_current_active_user)):
        """Protected route that requires authentication"""
        from datetime import datetime, timezone
        return {
            "message": f"Hello {current_user['username']}!",
            "user_id": current_user["id"],
            "timestamp": datetime.now(timezone.utc),
        }
    
    return app


# Create the app instance
app = create_app()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")