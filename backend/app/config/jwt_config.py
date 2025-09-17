"""
JWT configuration for Reynard Backend.

This module provides JWT configuration constants.
"""

from app.security.jwt_secret_manager import get_jwt_algorithm, get_jwt_secret_key

# JWT configuration constants
SECRET_KEY = get_jwt_secret_key()
ALGORITHM = get_jwt_algorithm()
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
