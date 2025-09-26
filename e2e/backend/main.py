#!/usr/bin/env python3
"""E2E Test Backend for Reynard Authentication
Dedicated backend instance for end-to-end testing
"""

import os
import sys
from pathlib import Path

import uvicorn


def main() -> None:
    """Start the e2e test backend server"""
    print("🦦 Starting E2E Test Backend Server...")
    print("📍 Port: 8000")
    print("🔧 Environment: e2e-testing")
    print("🎯 Purpose: End-to-end authentication testing")

    # Set environment variables for e2e testing
    os.environ["ENVIRONMENT"] = "e2e-testing"
    os.environ["DATABASE_URL"] = (
        "postgresql://postgres:password@localhost:5432/reynard_e2e"
    )
    os.environ["ECS_DATABASE_URL"] = (
        "postgresql://postgres:password@localhost:5432/reynard_ecs_e2e"
    )
    os.environ["JWT_SECRET_KEY"] = "e2e-test-secret-key-not-for-production"
    os.environ["CORS_ORIGINS"] = "http://localhost:3001,http://localhost:3000"
    os.environ["PORT"] = "8000"

    # Get the main backend path
    backend_path = Path(__file__).parent.parent.parent / "backend"

    if not backend_path.exists():
        print(f"❌ Backend not found at {backend_path}")
        sys.exit(1)

    # Add backend path and libraries to Python path
    sys.path.insert(0, str(backend_path))
    libraries_path = backend_path.parent / "libraries"
    sys.path.insert(0, str(libraries_path))
    gatekeeper_path = libraries_path / "gatekeeper"
    sys.path.insert(0, str(gatekeeper_path))

    # Change to backend directory
    os.chdir(str(backend_path))
    print(f"🚀 Starting backend from {backend_path}")

    # Import and run the main backend
    try:
        # Import the main backend app (avoiding circular import)
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "backend_main",
            backend_path / "main.py",
        )
        if spec is None or spec.loader is None:
            raise ImportError("Could not load backend main module")

        backend_main = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(backend_main)

        app = backend_main.app
        print("✅ Successfully imported app from main backend")

        # Start uvicorn with the imported app
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            reload=False,  # Disable reload for e2e testing
            access_log=True,
        )
    except ImportError as e:
        print(f"❌ Failed to import app from main backend: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
