"""Reynard FastAPI Backend - Production-Ready Service Orchestration Platform

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

import contextlib
import io
import logging
import os
import sys
import warnings

import uvicorn

# Suppress ML library warnings only if services are enabled
os.environ["PYTHONWARNINGS"] = "ignore"  # Suppress all Python warnings

# Only set ML-specific environment variables if services are enabled
if os.getenv("PYTORCH_ENABLED", "false").lower() == "true":
    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "max_split_size_mb:128"
    os.environ["CUDA_LAUNCH_BLOCKING"] = "0"
    warnings.filterwarnings("ignore", category=UserWarning, module="torch")

if os.getenv("TRANSFORMERS_ENABLED", "false").lower() == "true":
    os.environ["TOKENIZERS_PARALLELISM"] = "false"
    warnings.filterwarnings("ignore", category=UserWarning, module="transformers")

if os.getenv("EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED", "false").lower() == "true":
    warnings.filterwarnings("ignore", category=UserWarning, module="sentence_transformers")

# TensorFlow warnings (if used)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

warnings.filterwarnings(
    "ignore",
    message=".*SymmetricMemory.*",
)  # Suppress SymmetricMemory warnings
warnings.filterwarnings(
    "ignore",
    message=".*InitGoogleLogging.*",
)  # Suppress Google Logging warnings

# Suppress Google Logging warnings
logging.getLogger("google").setLevel(logging.ERROR)
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("torch").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)

# Core application factory - import with stderr suppression


# Temporarily redirect stderr during imports to suppress ML library warnings
stderr_buffer = io.StringIO()
with contextlib.redirect_stderr(stderr_buffer):
    from app.core.app_factory import create_app
    from app.core.config import get_config
    from app.core.intelligent_reload import (
        get_reload_excludes,
        should_use_intelligent_reload,
    )


# Configure logging with custom handler to filter warnings
class WarningFilter(logging.Filter):
    """Filter to suppress ML library warnings."""

    def filter(self, record):
        # Suppress specific warning messages
        if record.levelno == logging.WARNING:
            message = record.getMessage()
            if any(
                pattern in message
                for pattern in [
                    "Logging before InitGoogleLogging",
                    "SymmetricMemory",
                    "Destroying Symmetric Memory Allocators",
                ]
            ):
                return False
        return True


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,  # Ensure logs go to stdout, not stderr
)

# Add the warning filter to the root logger
root_logger = logging.getLogger()
root_logger.addFilter(WarningFilter())

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
        if should_use_intelligent_reload():
            logger.info("🧠 Intelligent service reload enabled for development")
            logger.info("🎯 Services will reload individually when their files change")
        else:
            logger.info("🔧 Standard auto-reload enabled for development")

        # Development mode with uvicorn's built-in reload
        uvicorn.run(
            "main:app",
            host=config.host,
            port=config.port,
            log_level="info",
            reload=True,
            reload_includes=["*.py", "*.env", "*.json"],
            reload_excludes=get_reload_excludes(),
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
