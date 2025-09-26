#!/usr/bin/env python3
"""
🦊 Project Root Utility for Reynard Backend
==========================================

Centralized utility for determining the Reynard project root directory
across all backend services and configurations.

Author: Reynard Development Team
Version: 1.0.0
"""

import os
from pathlib import Path
from typing import Optional


def get_project_root() -> Path:
    """
    🦊 Get the Reynard project root directory

    This function determines the project root by:
    1. Looking for environment variable REYNARD_PROJECT_ROOT
    2. Walking up from current file location to find the project root
    3. Falling back to a reasonable default

    Returns:
        Path: The absolute path to the Reynard project root
    """
    # Check environment variable first
    if env_root := os.getenv("REYNARD_PROJECT_ROOT"):
        env_path = Path(env_root)
        if env_path.exists():
            return env_path

    # Walk up from current file location to find project root
    # This file is in backend/app/core/, so we need to go up 3 levels
    current_file = Path(__file__)
    current_dir = current_file.parent

    # Go up from backend/app/core to project root
    # backend/app/core -> backend/app -> backend -> project root
    for _ in range(3):
        current_dir = current_dir.parent

        # Check if this directory contains a pyproject.toml or package.json
        # that indicates it's the project root
        if (current_dir / "pyproject.toml").exists() or (
            current_dir / "package.json"
        ).exists():
            # Also check if there's an e2e directory to confirm this is the project root
            if (current_dir / "e2e").exists() and (current_dir / "backend").exists():
                return current_dir

    # Fallback: assume we're in the project structure and go up 3 levels
    fallback_root = Path(__file__).parent.parent.parent.parent

    if fallback_root.exists():
        return fallback_root

    # Last resort: use current working directory
    return Path.cwd()


def get_project_path(relative_path: str) -> Path:
    """
    🦊 Get a path relative to the project root

    Args:
        relative_path: Path relative to project root

    Returns:
        Path: Absolute path
    """
    return get_project_root() / relative_path


def get_backend_dir() -> Path:
    """
    🦊 Get the backend directory path

    Returns:
        Path: Absolute path to the backend directory
    """
    return get_project_path("backend")


def get_e2e_dir() -> Path:
    """
    🦊 Get the E2E directory path

    Returns:
        Path: Absolute path to the E2E directory
    """
    return get_project_path("e2e")


def get_examples_dir() -> Path:
    """
    🦊 Get the examples directory path

    Returns:
        Path: Absolute path to the examples directory
    """
    return get_project_path("examples")


def get_example_app_path(app_name: str) -> Path:
    """
    🦊 Get a specific example app path

    Args:
        app_name: Name of the example app

    Returns:
        Path: Absolute path to the example app
    """
    return get_project_path(f"examples/{app_name}")


def get_experimental_dir() -> Path:
    """
    🦊 Get the experimental directory path

    Returns:
        Path: Absolute path to the experimental directory
    """
    return get_project_path("experimental")


def get_papers_directory() -> Path:
    """
    🦊 Get the papers directory path for RAG processing

    Returns:
        Path: Absolute path to the papers directory
    """
    return get_backend_dir() / "data" / "papers"


# Export the project root as a constant for convenience
PROJECT_ROOT = get_project_root()
BACKEND_DIR = get_backend_dir()
E2E_DIR = get_e2e_dir()
EXAMPLES_DIR = get_examples_dir()
EXPERIMENTAL_DIR = get_experimental_dir()
PAPERS_DIRECTORY = get_papers_directory()
