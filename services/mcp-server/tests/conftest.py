#!/usr/bin/env python3
"""
Pytest Configuration for ECS Tests
==================================

Configuration and fixtures for ECS automatic breeding tests.
"""

import tempfile
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def test_data_dir():
    """Create a temporary directory for test data."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield Path(tmp_dir)


@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Clean up test files after each test."""
    yield
    # Cleanup happens automatically with tmp_path fixture
