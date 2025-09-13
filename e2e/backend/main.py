#!/usr/bin/env python3
"""
E2E Test Backend for Reynard Authentication
Dedicated backend instance for end-to-end testing
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Start the e2e test backend server"""
    print("🦦 Starting E2E Test Backend Server...")
    print("📍 Port: 8888")
    print("🔧 Environment: e2e-testing")
    print("🎯 Purpose: End-to-end authentication testing")
    
    # Set environment variables for e2e testing
    env = os.environ.copy()
    env["ENVIRONMENT"] = "e2e-testing"
    env["DATABASE_URL"] = "sqlite:///./e2e-test.db"
    env["JWT_SECRET_KEY"] = "e2e-test-secret-key-not-for-production"
    env["CORS_ORIGINS"] = "http://localhost:3001,http://localhost:3000"
    env["PORT"] = "8888"
    
    # Get the main backend path
    backend_path = Path(__file__).parent.parent.parent / "backend"
    main_py = backend_path / "main.py"
    
    if not main_py.exists():
        print(f"❌ Backend not found at {main_py}")
        sys.exit(1)
    
    # Start the backend with e2e environment
    print(f"🚀 Starting backend from {main_py}")
    subprocess.run([sys.executable, str(main_py)], env=env, cwd=str(backend_path))

if __name__ == "__main__":
    main()
