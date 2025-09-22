"""
Example integration of performance monitoring into FastAPI ECS backend.

This example shows how to integrate the performance monitoring system
into your FastAPI application.
"""

import asyncio
import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .endpoints import router as performance_router

# Import performance monitoring components
from .middleware import (
    PerformanceMiddleware,
    memory_profiler,
    track_async_task,
    track_db_query,
)

logger = logging.getLogger(__name__)


def create_app_with_performance_monitoring() -> FastAPI:
    """Create FastAPI app with performance monitoring enabled."""

    app = FastAPI(
        title="ECS Backend with Performance Monitoring",
        description="FastAPI ECS backend with comprehensive performance monitoring",
        version="1.0.0",
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add performance monitoring middleware
    app.add_middleware(PerformanceMiddleware, enable_memory_tracking=True)

    # Include performance monitoring endpoints
    app.include_router(performance_router)

    # Start memory profiler
    memory_profiler.start()

    @app.on_event("startup")
    async def startup_event():
        """Startup event handler."""
        logger.info("🚀 Starting ECS backend with performance monitoring")
        logger.info("📊 Performance endpoints available at /performance/*")
        logger.info("🔍 Memory profiler started")

    @app.on_event("shutdown")
    async def shutdown_event():
        """Shutdown event handler."""
        logger.info("🛑 Shutting down performance monitoring")
        memory_profiler.stop()

    # Example endpoints to demonstrate monitoring
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "ECS Backend with Performance Monitoring",
            "status": "healthy",
        }

    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "timestamp": time.time()}

    @app.get("/slow-endpoint")
    async def slow_endpoint():
        """Example slow endpoint for testing."""
        await asyncio.sleep(1)  # Simulate slow operation
        return {
            "message": "This endpoint is intentionally slow",
            "duration": "1 second",
        }

    @app.get("/memory-intensive")
    async def memory_intensive():
        """Example memory-intensive endpoint."""
        # Simulate memory usage
        data = list(range(100000))
        await asyncio.sleep(0.1)
        return {"message": "Memory intensive operation", "data_size": len(data)}

    @app.get("/error-endpoint")
    async def error_endpoint():
        """Example endpoint that sometimes errors."""
        import random

        ERROR_RATE = 0.3  # 30% chance of error
        if random.random() < ERROR_RATE:
            raise ValueError("Random error for testing")
        return {"message": "Success"}

    @app.get("/async-task-example")
    async def async_task_example():
        """Example endpoint with async task tracking."""
        async with track_async_task("example_async_task"):
            await asyncio.sleep(0.5)
            return {"message": "Async task completed"}

    @app.get("/db-query-example")
    @track_db_query("SELECT * FROM example_table")
    async def db_query_example():
        """Example endpoint with database query tracking."""
        # Simulate database query
        await asyncio.sleep(0.2)
        return {"message": "Database query completed", "rows": 42}

    return app


# Example usage
if __name__ == "__main__":
    import uvicorn

    app = create_app_with_performance_monitoring()

    # Run the application
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
