"""
Mock SQLite backend.
"""

from .memory import MockMemoryBackend

# Use memory backend as base for SQLite mock
MockSQLiteBackend = MockMemoryBackend

# Alias for compatibility
SQLiteBackend = MockSQLiteBackend

__all__ = ["MockSQLiteBackend", "SQLiteBackend"]
