"""
JWT configuration for Reynard Backend.

This module provides JWT configuration constants for testing.
"""

# JWT configuration constants for testing
SECRET_KEY = "test-secret-key-for-testing-only-not-for-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

