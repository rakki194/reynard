"""
Configuration settings for Reynard Backend.

This module provides centralized configuration management with
environment variable support and secure defaults.
"""

import os

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for Reynard Backend."""

    def __init__(self):

        # CORS settings
        self.CORS_ORIGINS = self._get_cors_origins()
        self.CORS_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        self.CORS_HEADERS = [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ]
        self.CORS_EXPOSE_HEADERS = ["X-Total-Count"]
        self.CORS_MAX_AGE = 3600

        # Security settings
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*.yourdomain.com"]

    def _get_cors_origins(self) -> list[str]:
        """Get CORS allowed origins."""
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:3004",
            "http://localhost:3005",
            "http://localhost:3006",
            "http://localhost:3007",
            "http://localhost:3008",
            "http://localhost:3009",
            "http://localhost:3010",
            "http://localhost:3011",
            "http://localhost:3012",
            "http://localhost:3013",
            "http://localhost:3014",
            "http://localhost:3015",
            "http://localhost:5173",
        ]


# Global config instance
_config: Config = None


def get_config() -> Config:
    """Get the global configuration instance."""
    global _config
    if _config is None:
        _config = Config()
    return _config
