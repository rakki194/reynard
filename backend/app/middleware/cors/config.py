"""CORS configuration management and validation.

This module provides configuration classes and validation for CORS middleware,
ensuring secure and flexible cross-origin resource sharing setup.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Union
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator


class CORSConfig(BaseModel):
    """Configuration for CORS middleware.
    
    Provides comprehensive CORS configuration with security best practices
    and environment-specific settings.
    """
    
    # Origin configuration
    allowed_origins: List[str] = Field(
        default_factory=lambda: [
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
        ],
        description="List of allowed origins for CORS requests"
    )
    
    # Method configuration
    allowed_methods: List[str] = Field(
        default_factory=lambda: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        description="List of allowed HTTP methods"
    )
    
    # Header configuration
    allowed_headers: List[str] = Field(
        default_factory=lambda: [
            "Accept",
            "Accept-Language",
            "Content-Language", 
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ],
        description="List of allowed request headers"
    )
    
    exposed_headers: List[str] = Field(
        default_factory=lambda: ["X-Total-Count"],
        description="List of headers to expose to the client"
    )
    
    # Security settings
    allow_credentials: bool = Field(
        default=True,
        description="Whether to allow credentials in CORS requests"
    )
    
    max_age: int = Field(
        default=3600,
        description="Maximum age for preflight requests in seconds"
    )
    
    # Trusted hosts
    trusted_hosts: List[str] = Field(
        default_factory=lambda: [
            "localhost",
            "127.0.0.1",
            "testserver", 
            "*.yourdomain.com",
        ],
        description="List of trusted hosts"
    )
    
    # Environment-specific settings
    environment: str = Field(
        default="development",
        description="Current environment (development, staging, production)"
    )
    
    # Security features
    strict_origin_validation: bool = Field(
        default=True,
        description="Enable strict origin validation"
    )
    
    wildcard_origins_allowed: bool = Field(
        default=False,
        description="Allow wildcard origins (security risk in production)"
    )
    
    @field_validator('allowed_origins')
    @classmethod
    def validate_origins(cls, v):
        """Validate origin URLs."""
        for origin in v:
            if origin != "*":  # Allow wildcard for development
                try:
                    parsed = urlparse(origin)
                    if not parsed.scheme or not parsed.netloc:
                        raise ValueError(f"Invalid origin URL: {origin}")
                except Exception as e:
                    raise ValueError(f"Invalid origin URL '{origin}': {e}")
        return v
    
    @field_validator('allowed_methods')
    @classmethod
    def validate_methods(cls, v):
        """Validate HTTP methods."""
        valid_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"]
        for method in v:
            if method.upper() not in valid_methods:
                raise ValueError(f"Invalid HTTP method: {method}")
        return [method.upper() for method in v]
    
    @field_validator('max_age')
    @classmethod
    def validate_max_age(cls, v):
        """Validate max age value."""
        if not 0 <= v <= 86400:  # 0 to 24 hours
            raise ValueError("max_age must be between 0 and 86400 seconds")
        return v
    
    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v):
        """Validate environment value."""
        valid_envs = ['development', 'staging', 'production', 'testing']
        if v not in valid_envs:
            raise ValueError(f"Environment must be one of: {valid_envs}")
        return v
    
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"
    
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"
    
    def get_effective_origins(self) -> List[str]:
        """Get effective origins based on environment and security settings.
        
        Returns:
            List of effective allowed origins
        """
        if self.is_development() and not self.strict_origin_validation:
            # In development, allow more permissive origins
            return self.allowed_origins + ["http://localhost:*", "https://localhost:*"]
        
        if self.wildcard_origins_allowed and self.is_development():
            return ["*"]
        
        return self.allowed_origins
    
    def should_allow_origin(self, origin: str) -> bool:
        """Check if an origin should be allowed.
        
        Args:
            origin: The origin to check
            
        Returns:
            True if origin should be allowed
        """
        effective_origins = self.get_effective_origins()
        
        # Check for exact match
        if origin in effective_origins:
            return True
        
        # Check for wildcard
        if "*" in effective_origins:
            return True
        
        # Check for pattern matching (for wildcard domains)
        for allowed_origin in effective_origins:
            if "*" in allowed_origin:
                # Simple wildcard matching (e.g., *.example.com)
                if self._matches_wildcard_pattern(origin, allowed_origin):
                    return True
        
        return False
    
    def _matches_wildcard_pattern(self, origin: str, pattern: str) -> bool:
        """Check if origin matches a wildcard pattern.
        
        Args:
            origin: The origin to check
            pattern: The wildcard pattern
            
        Returns:
            True if origin matches pattern
        """
        if "*" not in pattern:
            return origin == pattern
        
        # Simple wildcard matching for domain patterns
        if pattern.startswith("*."):
            domain = pattern[2:]  # Remove "*."
            return origin.endswith(domain)
        
        return False
    
    def get_cors_headers(self, origin: Optional[str] = None) -> dict[str, str]:
        """Get CORS headers for a response.
        
        Args:
            origin: The requesting origin (optional)
            
        Returns:
            Dictionary of CORS headers
        """
        headers = {}
        
        # Access-Control-Allow-Origin
        if origin and self.should_allow_origin(origin):
            headers["Access-Control-Allow-Origin"] = origin
        elif "*" in self.get_effective_origins():
            headers["Access-Control-Allow-Origin"] = "*"
        
        # Access-Control-Allow-Methods
        headers["Access-Control-Allow-Methods"] = ", ".join(self.allowed_methods)
        
        # Access-Control-Allow-Headers
        headers["Access-Control-Allow-Headers"] = ", ".join(self.allowed_headers)
        
        # Access-Control-Expose-Headers
        if self.exposed_headers:
            headers["Access-Control-Expose-Headers"] = ", ".join(self.exposed_headers)
        
        # Access-Control-Allow-Credentials
        if self.allow_credentials:
            headers["Access-Control-Allow-Credentials"] = "true"
        
        # Access-Control-Max-Age
        headers["Access-Control-Max-Age"] = str(self.max_age)
        
        return headers


class CORSEnvironmentConfig:
    """Environment-specific CORS configuration presets."""
    
    @staticmethod
    def development() -> CORSConfig:
        """Get development CORS configuration.
        
        Returns:
            CORS configuration for development environment
        """
        return CORSConfig(
            environment="development",
            allowed_origins=[
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
            ],
            strict_origin_validation=False,
            wildcard_origins_allowed=True,
        )
    
    @staticmethod
    def staging() -> CORSConfig:
        """Get staging CORS configuration.
        
        Returns:
            CORS configuration for staging environment
        """
        return CORSConfig(
            environment="staging",
            allowed_origins=[
                "https://staging.yourdomain.com",
                "https://staging-app.yourdomain.com",
            ],
            strict_origin_validation=True,
            wildcard_origins_allowed=False,
        )
    
    @staticmethod
    def production() -> CORSConfig:
        """Get production CORS configuration.
        
        Returns:
            CORS configuration for production environment
        """
        return CORSConfig(
            environment="production",
            allowed_origins=[
                "https://yourdomain.com",
                "https://app.yourdomain.com",
            ],
            strict_origin_validation=True,
            wildcard_origins_allowed=False,
            allow_credentials=True,
        )
    
    @staticmethod
    def testing() -> CORSConfig:
        """Get testing CORS configuration.
        
        Returns:
            CORS configuration for testing environment
        """
        return CORSConfig(
            environment="testing",
            allowed_origins=["*"],
            strict_origin_validation=False,
            wildcard_origins_allowed=True,
            allow_credentials=False,
        )
