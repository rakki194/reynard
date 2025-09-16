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
- Debounced Reload: Intelligent file watching with configurable grace periods

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

import asyncio
import logging
import signal
import uvicorn
from pathlib import Path
from typing import Any, Optional

# Core application factory
from app.core.app_factory import create_app
from app.core.config import get_config
from app.core.reload_watcher import create_reload_watcher

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get configuration
config = get_config()

# 🦊 Create the FastAPI Application using the factory pattern
app = create_app()


# 🦊 Debounced Reload System
class DebouncedReloadServer:
    """Development server with debounced reload functionality."""

    def __init__(self, config: Any) -> None:
        self.config = config
        self.server_process: Optional[asyncio.Task] = None
        self.reload_watcher: Optional[Any] = None
        self.shutdown_event = asyncio.Event()

    def reload_callback(self) -> None:
        """Callback function to trigger server reload."""
        logger.info("🔄 Reload triggered by file changes")
        if self.server_process:
            self.server_process.cancel()
            self.server_process = None
        # The server will be restarted by the main loop

    async def start_server(self) -> asyncio.Task:
        """Start the uvicorn server process."""
        logger.info("🚀 Starting Reynard API in %s mode", self.config.environment)
        logger.info("📚 Documentation available at: %s", self.config.docs_url)
        logger.info("🔧 Debounced reload enabled: %s", self.config.reload)
        logger.info("⏱️ Reload debounce delay: %ss", self.config.reload_debounce_delay)

        # Start uvicorn server without built-in reload
        server_config = uvicorn.Config(
            "main:app",
            host=self.config.host,
            port=self.config.port,
            log_level="info",
            reload=False,  # We handle reload ourselves
        )

        server = uvicorn.Server(server_config)

        # Run server in a separate task
        self.server_process = asyncio.create_task(server.serve())
        return self.server_process

    async def start_reload_watcher(self) -> None:
        """Start the debounced reload watcher."""
        if not self.config.reload:
            return

        # Get the backend directory path
        backend_path = Path(__file__).parent

        # Create the reload watcher
        self.reload_watcher = create_reload_watcher(
            watch_path=str(backend_path),
            reload_callback=self.reload_callback,
            debounce_delay=self.config.reload_debounce_delay,
            include_patterns=self.config.reload_include_patterns,
            exclude_patterns=self.config.reload_exclude_patterns,
        )

        # Start watching
        self.reload_watcher.start()
        logger.info("👀 Started debounced file watcher for: %s", backend_path)

    async def run(self) -> None:
        """Run the development server with debounced reload."""
        try:
            # Start the reload watcher first
            await self.start_reload_watcher()

            # Main server loop
            while not self.shutdown_event.is_set():
                try:
                    # Start the server
                    server_task = await self.start_server()

                    # Wait for server to complete or shutdown signal
                    _, pending = await asyncio.wait(
                        [server_task, asyncio.create_task(self.shutdown_event.wait())],
                        return_when=asyncio.FIRST_COMPLETED,
                    )

                    # Cancel pending tasks
                    for task in pending:
                        task.cancel()
                        try:
                            await task
                        except asyncio.CancelledError:
                            pass

                    # Check if we should continue (reload) or shutdown
                    if self.shutdown_event.is_set():
                        break

                    # Server completed, wait a moment before restarting
                    await asyncio.sleep(1)

                except Exception as e:
                    logger.error("❌ Server error: %s", e)
                    await asyncio.sleep(5)  # Wait before retrying

        except KeyboardInterrupt:
            logger.info("🛑 Received keyboard interrupt")
        finally:
            await self.shutdown()

    async def shutdown(self) -> None:
        """Gracefully shutdown the server and watcher."""
        logger.info("🛑 Shutting down development server")
        self.shutdown_event.set()
        
        # Stop the reload watcher
        if self.reload_watcher:
            self.reload_watcher.shutdown()
        
        # Stop the server process
        if self.server_process and not self.server_process.done():
            self.server_process.cancel()
            try:
                await self.server_process
            except asyncio.CancelledError:
                pass


# 🐺 Development Server Configuration
if __name__ == "__main__":
    if config.reload:
        # Use debounced reload system for development
        server = DebouncedReloadServer(config)

        # Set up signal handlers for graceful shutdown
        def signal_handler(signum: int, frame: Any) -> None:
            logger.info("🛑 Received signal %s", signum)
            asyncio.create_task(server.shutdown())

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        # Run the debounced reload server
        asyncio.run(server.run())
    else:
        # Production mode - simple uvicorn server
        logger.info("🚀 Starting Reynard API in %s mode", config.environment)
        logger.info("📚 Documentation available at: %s", config.docs_url)
        logger.info("🔧 Reload disabled for production")

        uvicorn.run(
            "main:app",
            host=config.host,
            port=config.port,
            log_level="info",
            reload=False,
        )
