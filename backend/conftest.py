"""
Pytest configuration for Reynard Backend

🦦 *splashes with database integration enthusiasm* This conftest.py file
registers the database reporter plugin to collect real test results.
"""

import pytest
from pytest_plugins.db_reporter import PytestDBReporter


def pytest_configure(config):
    """Configure pytest with database reporter plugin."""
    # Register the database reporter plugin
    reporter = PytestDBReporter(config)
    config.pluginmanager.register(reporter, 'db_reporter')
    print("🦦 Database reporter plugin registered")


def pytest_addoption(parser):
    """Add command line options for the database reporter."""
    parser.addoption(
        '--db-reporter',
        action='store_true',
        default=True,  # Enable by default
        help='Enable database reporter for storing test results in PostgreSQL'
    )
    parser.addoption(
        '--db-api-url',
        action='store',
        default='http://localhost:8000',
        help='Base URL for the testing ecosystem API'
    )
