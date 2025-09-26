"""
Configuration management for Customer Modeling Microservice.
"""

import os
from typing import List, Optional

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings."""

    # Application
    APP_NAME: str = "Customer Modeling Microservice"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8001, env="PORT")

    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001"],
        env="ALLOWED_ORIGINS",
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1"], env="ALLOWED_HOSTS"
    )

    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=10, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, env="DATABASE_MAX_OVERFLOW")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")

    # Customer Modeling
    CUSTOMER_MODELING_BATCH_SIZE: int = Field(
        default=1000, env="CUSTOMER_MODELING_BATCH_SIZE"
    )
    CUSTOMER_MODELING_UPDATE_INTERVAL: int = Field(
        default=300, env="CUSTOMER_MODELING_UPDATE_INTERVAL"
    )  # 5 minutes
    CUSTOMER_MODELING_CACHE_TTL: int = Field(
        default=3600, env="CUSTOMER_MODELING_CACHE_TTL"
    )  # 1 hour

    # Analytics
    ANALYTICS_ENABLED: bool = Field(default=True, env="ANALYTICS_ENABLED")
    ANALYTICS_BATCH_SIZE: int = Field(default=500, env="ANALYTICS_BATCH_SIZE")
    ANALYTICS_UPDATE_FREQUENCY: int = Field(
        default=60, env="ANALYTICS_UPDATE_FREQUENCY"
    )  # 1 minute

    # Privacy & Compliance
    PRIVACY_LEVEL: str = Field(
        default="level_2", env="PRIVACY_LEVEL"
    )  # level_1 to level_4
    GDPR_COMPLIANCE: bool = Field(default=True, env="GDPR_COMPLIANCE")
    DATA_RETENTION_DAYS: int = Field(default=365, env="DATA_RETENTION_DAYS")

    # Model Configuration
    MODEL_DRIFT_THRESHOLD: float = Field(default=0.1, env="MODEL_DRIFT_THRESHOLD")
    MODEL_UPDATE_FREQUENCY: int = Field(
        default=86400, env="MODEL_UPDATE_FREQUENCY"
    )  # 24 hours
    MODEL_BACKUP_ENABLED: bool = Field(default=True, env="MODEL_BACKUP_ENABLED")

    # Performance
    MAX_CONCURRENT_REQUESTS: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    REQUEST_TIMEOUT: int = Field(default=30, env="REQUEST_TIMEOUT")
    CACHE_ENABLED: bool = Field(default=True, env="CACHE_ENABLED")

    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings (singleton pattern)."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


def get_database_url() -> str:
    """Get database URL with proper formatting."""
    settings = get_settings()
    return settings.DATABASE_URL


def get_redis_url() -> str:
    """Get Redis URL with proper formatting."""
    settings = get_settings()
    if settings.REDIS_PASSWORD:
        return (
            f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_URL.split('://')[1]}"
        )
    return settings.REDIS_URL
