#!/usr/bin/env python3
"""
Quick start example for FastAPI ECS Performance Monitoring.

This script demonstrates how to quickly set up and use the performance
monitoring system in your FastAPI application.
"""

import asyncio
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import performance monitoring components
from .middleware import PerformanceMiddleware, memory_profiler, track_async_task, track_db_query
from .endpoints import router as performance_router


def create_monitored_app() -> FastAPI:
    """Create a FastAPI app with performance monitoring enabled."""
    
    app = FastAPI(
        title="ECS Backend with Performance Monitoring",
        description="Example FastAPI app with comprehensive performance monitoring",
        version="1.0.0"
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
        print("🚀 Starting ECS backend with performance monitoring")
        print("📊 Performance endpoints available at /performance/*")
        print("🔍 Memory profiler started")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Shutdown event handler."""
        print("🛑 Shutting down performance monitoring")
        memory_profiler.stop()
    
    # Example endpoints
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {"message": "ECS Backend with Performance Monitoring", "status": "healthy"}
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "timestamp": time.time()}
    
    @app.get("/slow")
    async def slow_endpoint():
        """Example slow endpoint for testing."""
        await asyncio.sleep(1)  # Simulate slow operation
        return {"message": "This endpoint is intentionally slow", "duration": "1 second"}
    
    @app.get("/memory")
    async def memory_intensive():
        """Example memory-intensive endpoint."""
        # Simulate memory usage
        data = list(range(100000))
        await asyncio.sleep(0.1)
        return {"message": "Memory intensive operation", "data_size": len(data)}
    
    @app.get("/async-task")
    async def async_task_example():
        """Example endpoint with async task tracking."""
        async with track_async_task("example_async_task"):
            await asyncio.sleep(0.5)
            return {"message": "Async task completed"}
    
    @app.get("/db-query")
    @track_db_query("SELECT * FROM example_table")
    async def db_query_example():
        """Example endpoint with database query tracking."""
        # Simulate database query
        await asyncio.sleep(0.2)
        return {"message": "Database query completed", "rows": 42}
    
    return app


async def main():
    """Main function to run the example."""
    print("🐍 Mysterious-Prime-67 FastAPI ECS Performance Monitoring Quick Start")
    print("=" * 70)
    
    # Create the app
    app = create_monitored_app()
    
    print("\n📋 Available endpoints:")
    print("   • GET  /                    - Root endpoint")
    print("   • GET  /health              - Health check")
    print("   • GET  /slow                - Slow endpoint (1s delay)")
    print("   • GET  /memory              - Memory intensive endpoint")
    print("   • GET  /async-task          - Async task tracking example")
    print("   • GET  /db-query            - Database query tracking example")
    print("\n📊 Performance monitoring endpoints:")
    print("   • GET  /performance/metrics - Current performance metrics")
    print("   • GET  /performance/memory  - Memory usage metrics")
    print("   • GET  /performance/bottlenecks - Performance bottlenecks")
    print("   • GET  /performance/health  - Overall system health")
    print("   • GET  /performance/report  - Comprehensive optimization report")
    
    print("\n🚀 To run the server:")
    print("   uvicorn app.ecs.performance.quick_start:app --reload --host 0.0.0.0 --port 8000")
    
    print("\n🧪 To test the endpoints:")
    print("   curl http://localhost:8000/")
    print("   curl http://localhost:8000/slow")
    print("   curl http://localhost:8000/performance/metrics")
    print("   curl http://localhost:8000/performance/bottlenecks")
    
    print("\n📈 To run load tests:")
    print("   python -m app.ecs.performance.benchmark_cli --mode load-test --base-url http://localhost:8000 --endpoints / /health /slow --concurrent-users 10 --duration 30")
    
    print("\n🔍 To profile an endpoint:")
    print("   python -m app.ecs.performance.benchmark_cli --mode profile --base-url http://localhost:8000 --endpoints /slow --iterations 50")
    
    print("\n" + "=" * 70)
    print("🎉 Performance monitoring system is ready!")
    print("💡 Check the README.md for detailed documentation.")


if __name__ == "__main__":
    asyncio.run(main())
