"""
Configuration settings for Reynard Backend.

This module provides centralized configuration management with
environment variable support and secure defaults.
"""

import os
import secrets
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for Reynard Backend."""
    
    def __init__(self):
        self.SECRET_KEY = self._get_persistent_secret_key()
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        self.REFRESH_TOKEN_EXPIRE_DAYS = 7
        
        # Password hashing settings
        self.PASSWORD_SALT_LENGTH = 32
        self.PASSWORD_ITERATIONS = 100000
        
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
    
    def _get_persistent_secret_key(self) -> str:
        """Get persistent JWT secret key with fallback to environment variable."""
        # First try environment variable
        env_secret = os.getenv("SECRET_KEY")
        if env_secret:
            return env_secret
        
        # Create persistent secret file
        secret_file = Path("./secrets/jwt_secret.key")
        secret_file.parent.mkdir(exist_ok=True, mode=0o700)
        
        if secret_file.exists():
            # Load existing secret
            return secret_file.read_text().strip()
        else:
            # Generate new persistent secret
            new_secret = secrets.token_urlsafe(64)  # 64 bytes for strong entropy
            secret_file.write_text(new_secret)
            secret_file.chmod(0o600)  # Secure file permissions
            return new_secret
    
    def _get_cors_origins(self) -> List[str]:
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
