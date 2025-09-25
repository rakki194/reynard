#!/usr/bin/env python3
"""
Load Backend Environment Configuration
=====================================

This module loads environment variables from the backend .env file
to ensure consistent configuration between the MCP server and backend.
"""

import os
from pathlib import Path


def load_backend_env():
    """Load environment variables from backend .env file."""
    # Get the path to the backend .env file
    backend_env_path = os.getenv("BACKEND_ENV_PATH")
    if not backend_env_path:
        current_dir = Path(__file__).parent
        backend_env_path = current_dir.parent.parent / "backend" / ".env"
    else:
        backend_env_path = Path(backend_env_path)
    
    if not backend_env_path.exists():
        raise FileNotFoundError(f"Backend .env file not found at {backend_env_path}")
    
    # Load environment variables from the backend .env file
    with open(backend_env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            
            # Parse key=value pairs
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                # Set environment variable if not already set
                if key not in os.environ:
                    os.environ[key] = value


# Load backend environment variables when this module is imported
load_backend_env()
