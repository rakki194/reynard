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
- Auto-Reload: Built-in uvicorn reload for development

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
from app.core.config import get_config

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get configuration
config = get_config()

# 🦊 Create the FastAPI Application using the factory pattern
app = create_app()


# 🐺 Server Configuration
if __name__ == "__main__":
    logger.info("🚀 Starting Reynard API in %s mode", config.environment)
    logger.info("📚 Documentation available at: %s", config.docs_url)

    if config.reload:
        logger.info("🔧 Auto-reload enabled for development")
        # Development mode with uvicorn's built-in reload
        uvicorn.run(
            "main:app",
            host=config.host,
            port=config.port,
            log_level="info",
            reload=True,
            reload_includes=["*.py", "*.env", "*.json"],
            reload_excludes=[
                "*.db",
                "*.log",
                "generated/*",
                "__pycache__/**/*",
                "__pycache__/*",
                "**/__pycache__/**/*",
                "**/__pycache__/*",
                ".mypy_cache/**/*",
                ".mypy_cache/*",
                "**/.mypy_cache/**/*",
                "**/.mypy_cache/*",
                "**/.mypy_cache/**/*.json",
                "**/.mypy_cache/**/*.data.json",
                "**/.mypy_cache/**/*.meta.json",
                "*.pyc",
                "*.pyo",
                "*.pyd",
                ".pytest_cache/**/*",
                ".pytest_cache/*",
                "**/.pytest_cache/**/*",
                "**/.pytest_cache/*",
                ".coverage",
                "htmlcov/*",
                ".tox/*",
                "venv/*",
                "env/*",
                ".venv/*",
                "node_modules/*",
                ".git/*",
                "*.tmp",
                "*.temp",
                "*.swp",
                "*.swo",
                "*~",
                ".DS_Store",
                "Thumbs.db",
                "@plugins_snapshot.json",
            ],
        )
    else:
        logger.info("🔧 Reload disabled for production")
        # Production mode - simple uvicorn server
        uvicorn.run(
            "main:app",
            host=config.host,
            port=config.port,
            log_level="info",
            reload=False,
        )
