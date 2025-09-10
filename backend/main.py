"""
Reynard FastAPI Backend - Production-Ready Service Orchestration Platform

A comprehensive FastAPI application implementing advanced service orchestration
patterns with parallel initialization, priority-based startup sequencing, and
comprehensive health monitoring capabilities.

Architecture Features:
- Service Registry Pattern: Centralized lifecycle management for all backend services
- Priority-Based Initialization: Dependency-aware startup sequencing with parallel execution
- Health Monitoring: Real-time service status tracking and diagnostics
- Graceful Shutdown: Proper resource cleanup with timeout handling
- Security Middleware: CORS, rate limiting, security headers, and trusted host validation
- Authentication Integration: JWT-based authentication via Gatekeeper service
- Modular API Design: Organized router structure for maintainable endpoint management

Service Components:
- Gatekeeper: JWT authentication and user management
- ComfyUI: Image generation and processing integration
- NLWeb: Natural language web processing capabilities
- RAG: Retrieval-Augmented Generation for document processing
- Ollama: Local LLM inference and model management
- TTS: Text-to-Speech synthesis services

This implementation follows modern FastAPI best practices with async/await patterns,
proper error handling, structured logging, and production-ready configuration management.
"""

import logging
import uvicorn

# Core application factory
from app.core.app_factory import create_app
from app.core.api_endpoints import router as core_router
from app.core.config import get_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get configuration
config = get_config()

# 🦊 Create the FastAPI Application using the factory pattern
app = create_app()

# Include core API endpoints
app.include_router(core_router)


# 🐺 Development Server Configuration
if __name__ == "__main__":
    # Enhanced development server with watchfiles support
    reload_config = {
        "reload": config.reload,
        "reload_includes": ["*.py", "*.env", "*.json"] if config.reload else None,
        "reload_excludes": ["*.db", "*.log", "generated/*"] if config.reload else None,
    }
    
    # Filter out None values
    reload_config = {k: v for k, v in reload_config.items() if v is not None}
    
    logger.info(f"🚀 Starting Reynard API in {config.environment} mode")
    logger.info(f"📚 Documentation available at: {config.docs_url}")
    logger.info(f"🔧 Reload enabled: {config.reload}")
    
    uvicorn.run(
        "main:app",
        host=config.host,
        port=config.port,
        log_level="info",
        **reload_config
    )
