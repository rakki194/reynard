#!/usr/bin/env python3
"""Reynard Error Demo Backend
FastAPI server with various error endpoints to demonstrate error boundaries
"""

import asyncio
import random
import time
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Global state for demo
demo_state: dict[str, Any] = {
    "error_count": 0,
    "last_error_time": None,
    "recovery_attempts": 0,
    "user_sessions": {},
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    print("🦊 Starting Reynard Error Demo Backend...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")

    yield

    print("🧹 Cleaning up...")
    print("✅ Cleanup completed")


# Create FastAPI app
app = FastAPI(
    title="Reynard Error Demo API",
    description="Error demonstration API for Reynard Error Boundary Demo",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://127.0.0.1:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class ErrorReport(BaseModel):
    error_id: str
    error_type: str
    message: str
    stack_trace: str | None = None
    user_context: dict[str, Any] | None = None
    timestamp: float


class RecoveryRequest(BaseModel):
    strategy: str
    context: dict[str, Any] | None = None


class RecoveryResponse(BaseModel):
    success: bool
    message: str
    data: dict[str, Any] | None = None


# Health check endpoint
@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "reynard-error-demo-backend",
        "error_count": demo_state["error_count"],
        "uptime": time.time(),
    }


# Error simulation endpoints
@app.get("/api/errors/network")
async def simulate_network_error():
    """Simulate a network error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    # Randomly fail or succeed
    if random.random() < 0.7:  # 70% chance of failure
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Network connection failed. Please check your internet connection.",
        )

    return {"message": "Network request successful", "timestamp": time.time()}


@app.get("/api/errors/timeout")
async def simulate_timeout_error():
    """Simulate a timeout error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    # Simulate slow response
    await asyncio.sleep(2)

    if random.random() < 0.8:  # 80% chance of timeout
        raise HTTPException(
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            detail="Request timed out. The server took too long to respond.",
        )

    return {"message": "Request completed successfully", "timestamp": time.time()}


@app.get("/api/errors/validation")
async def simulate_validation_error():
    """Simulate a validation error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.6:  # 60% chance of validation error
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Validation failed. Please check your input data.",
        )

    return {"message": "Validation passed", "timestamp": time.time()}


@app.get("/api/errors/authentication")
async def simulate_auth_error():
    """Simulate an authentication error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.5:  # 50% chance of auth error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please log in again.",
        )

    return {"message": "Authentication successful", "timestamp": time.time()}


@app.get("/api/errors/permission")
async def simulate_permission_error():
    """Simulate a permission error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.4:  # 40% chance of permission error
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You don't have permission to perform this action.",
        )

    return {"message": "Access granted", "timestamp": time.time()}


@app.get("/api/errors/resource")
async def simulate_resource_error():
    """Simulate a resource error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.3:  # 30% chance of resource error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found. The requested item does not exist.",
        )

    return {"message": "Resource found", "timestamp": time.time()}


@app.get("/api/errors/critical")
async def simulate_critical_error():
    """Simulate a critical system error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.2:  # 20% chance of critical error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Critical system error. The application encountered an unexpected error.",
        )

    return {"message": "System operating normally", "timestamp": time.time()}


@app.get("/api/errors/rendering")
async def simulate_rendering_error():
    """Simulate a rendering error"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    if random.random() < 0.5:  # 50% chance of rendering error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Rendering error. Failed to render the requested component.",
        )

    return {"message": "Rendering successful", "timestamp": time.time()}


# Recovery endpoints
@app.post("/api/recovery/retry")
async def retry_operation(request: RecoveryRequest):
    """Retry a failed operation"""
    demo_state["recovery_attempts"] += 1

    # Simulate retry logic
    await asyncio.sleep(0.5)

    if random.random() < 0.7:  # 70% chance of success on retry
        return RecoveryResponse(
            success=True,
            message="Operation retried successfully",
            data={"attempt": demo_state["recovery_attempts"]},
        )
    return RecoveryResponse(
        success=False,
        message="Retry failed. Operation still not working.",
        data={"attempt": demo_state["recovery_attempts"]},
    )


@app.post("/api/recovery/reset")
async def reset_component(request: RecoveryRequest):
    """Reset a component to its initial state"""
    demo_state["recovery_attempts"] += 1

    # Simulate reset logic
    await asyncio.sleep(0.3)

    return RecoveryResponse(
        success=True,
        message="Component reset successfully",
        data={"reset_time": time.time()},
    )


@app.post("/api/recovery/fallback")
async def fallback_ui(request: RecoveryRequest):
    """Switch to fallback UI"""
    demo_state["recovery_attempts"] += 1

    # Simulate fallback UI logic
    await asyncio.sleep(0.2)

    return RecoveryResponse(
        success=True,
        message="Fallback UI activated",
        data={"fallback_mode": True},
    )


@app.post("/api/recovery/redirect")
async def redirect_user(request: RecoveryRequest):
    """Redirect user to a safe page"""
    demo_state["recovery_attempts"] += 1

    # Simulate redirect logic
    await asyncio.sleep(0.1)

    return RecoveryResponse(
        success=True,
        message="Redirecting to safe page",
        data={"redirect_url": "/safe-page"},
    )


@app.post("/api/recovery/reload")
async def reload_application(request: RecoveryRequest):
    """Reload the entire application"""
    demo_state["recovery_attempts"] += 1

    # Simulate reload logic
    await asyncio.sleep(0.5)

    return RecoveryResponse(
        success=True,
        message="Application reloaded",
        data={"reload_time": time.time()},
    )


# Error reporting endpoint
@app.post("/api/reports/error")
async def report_error(report: ErrorReport):
    """Report an error for analytics"""
    demo_state["error_count"] += 1
    demo_state["last_error_time"] = time.time()

    # Simulate error reporting
    await asyncio.sleep(0.1)

    return {
        "success": True,
        "message": "Error reported successfully",
        "report_id": report.error_id,
        "timestamp": time.time(),
    }


# Analytics endpoints
@app.get("/api/analytics/errors")
async def get_error_analytics():
    """Get error analytics"""
    return {
        "total_errors": demo_state["error_count"],
        "last_error_time": demo_state["last_error_time"],
        "recovery_attempts": demo_state["recovery_attempts"],
        "error_rate": demo_state["error_count"]
        / max(1, time.time() - (demo_state["last_error_time"] or time.time())),
        "timestamp": time.time(),
    }


@app.get("/api/analytics/recovery")
async def get_recovery_analytics():
    """Get recovery analytics"""
    return {
        "total_recovery_attempts": demo_state["recovery_attempts"],
        "success_rate": 0.7,  # Simulated success rate
        "average_recovery_time": 0.3,
        "timestamp": time.time(),
    }


# Demo control endpoints
@app.post("/api/demo/reset")
async def reset_demo():
    """Reset demo state"""
    demo_state["error_count"] = 0
    demo_state["last_error_time"] = None
    demo_state["recovery_attempts"] = 0
    demo_state["user_sessions"] = {}

    return {"message": "Demo state reset successfully"}


@app.get("/api/demo/status")
async def get_demo_status():
    """Get current demo status"""
    return {
        "error_count": demo_state["error_count"],
        "recovery_attempts": demo_state["recovery_attempts"],
        "last_error_time": demo_state["last_error_time"],
        "uptime": time.time(),
        "status": "running",
    }


if __name__ == "__main__":
    import uvicorn

    print("🦊 Starting Reynard Error Demo Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
