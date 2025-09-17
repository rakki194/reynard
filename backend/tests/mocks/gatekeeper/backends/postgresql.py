"""
Mock PostgreSQL backend.
"""

from .memory import MockMemoryBackend

# Use memory backend as base for PostgreSQL mock
MockPostgreSQLBackend = MockMemoryBackend

# Alias for compatibility
PostgreSQLBackend = MockPostgreSQLBackend

__all__ = ["MockPostgreSQLBackend", "PostgreSQLBackend"]
