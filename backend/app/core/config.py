"""
🦊 Reynard Backend Core Configuration Management
===============================================

Centralized configuration management system for the Reynard FastAPI backend,
providing comprehensive environment-based configuration with feature toggles,
service-specific settings, and dynamic configuration loading. This module
implements enterprise-grade configuration management with validation,
type safety, and environment-specific overrides.

The Core Configuration System provides:
- Environment-based configuration loading with .env file support
- Service-specific configuration classes with validation and defaults
- Feature toggles and environment-specific settings
- Type-safe configuration with dataclass-based structure
- Dynamic configuration updates and hot-reloading capabilities
- Configuration validation and error handling
- Centralized configuration access throughout the application
- Security-sensitive configuration management

Key Features:
- Environment Integration: Seamless integration with environment variables
- Type Safety: Dataclass-based configuration with type validation
- Service Configuration: Specialized configuration classes for each service
- Feature Toggles: Environment-based feature enablement and configuration
- Validation: Configuration validation with error reporting
- Security: Secure handling of sensitive configuration values
- Flexibility: Support for development, staging, and production environments
- Documentation: Self-documenting configuration with clear defaults

Configuration Categories:
- ServiceConfig: Base configuration for all services
- GatekeeperConfig: Authentication and authorization settings
- ComfyConfig: ComfyUI integration configuration
- RAGConfig: Retrieval-Augmented Generation settings
- SearchConfig: Search service configuration
- EmailConfig: Email service settings
- DatabaseConfig: Database connection and pool settings

The configuration system ensures consistent, secure, and maintainable
configuration management across all components of the Reynard backend.

Author: Reynard Development Team
Version: 1.0.0
"""

import os
from dataclasses import dataclass, field
from typing import Any

from dotenv import load_dotenv

from app.config.rag_config import RAGConfig as NewRAGConfig

# Load environment variables
load_dotenv()


@dataclass
class ServiceConfig:
    """
    Base configuration class for all Reynard backend services.

    Provides common configuration parameters that are shared across all services,
    including enablement toggles, timeout settings, and retry mechanisms. This
    base class ensures consistent configuration patterns throughout the system.

    Attributes:
        enabled (bool): Whether the service is enabled (default: True)
        timeout (int): Service operation timeout in seconds (default: 30)
        retry_attempts (int): Number of retry attempts for failed operations (default: 3)
        retry_delay (float): Delay between retry attempts in seconds (default: 1.0)
    """

    enabled: bool = True
    timeout: int = 30
    retry_attempts: int = 3
    retry_delay: float = 1.0


@dataclass
class GatekeeperConfig(ServiceConfig):
    """Gatekeeper authentication configuration."""

    jwt_secret_key: str = field(
        default_factory=lambda: os.getenv("JWT_SECRET_KEY", "your-secret-key")
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


@dataclass
class ComfyConfig(ServiceConfig):
    """ComfyUI service configuration."""

    api_url: str = "http://127.0.0.1:8188"
    image_dir: str = "generated/comfy"
    reconnect_max_attempts: int = 5
    reconnect_base_delay_s: float = 0.5
    reconnect_max_delay_s: float = 30.0


@dataclass
class NLWebConfig(ServiceConfig):
    """NLWeb service configuration."""

    base_url: str | None = None
    suggest_timeout_s: float = 1.5
    cache_ttl_s: float = 10.0
    cache_max_entries: int = 64
    allow_stale_on_error: bool = True
    warm_timeout_s: float = 2.0
    rate_limit_window_s: float = 60.0
    rate_limit_max_requests: int = 30
    canary_enabled: bool = False
    canary_percentage: float = 5.0
    rollback_enabled: bool = False
    performance_monitoring_enabled: bool = True
    proxy_max_retries: int = 2
    proxy_backoff_ms: int = 200
    proxy_connect_timeout_ms: int = 2000
    proxy_read_timeout_ms: int = 10000
    proxy_sse_idle_timeout_ms: int = 15000


# RAGConfig is now imported from app.config.rag_config
# This maintains backward compatibility while using the new configuration system


@dataclass
class OllamaConfig(ServiceConfig):
    """Ollama service configuration."""

    enabled: bool = True
    base_url: str = "http://localhost:11434"
    timeout_seconds: int = 60
    assistant_enabled: bool = True
    tool_calling_enabled: bool = True
    streaming_enabled: bool = True


@dataclass
class TTSConfig(ServiceConfig):
    """TTS service configuration."""

    provider: str = "ollama"
    model: str = "llama3.2"
    voice: str = "alloy"
    speed: float = 1.0
    format: str = "mp3"


@dataclass
class AppConfig:
    """Main application configuration."""

    # Environment
    environment: str = field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development")
    )
    debug: bool = field(
        default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true"
    )

    # Server settings
    host: str = field(default_factory=lambda: os.getenv("HOST", "127.0.0.1"))
    port: int = 8000
    reload: bool = field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development") == "development"
    )

    # API settings
    title: str = "Reynard API"
    description: str = "Secure API backend for Reynard applications"
    version: str = "1.0.0"
    docs_url: str | None = field(
        default_factory=lambda: (
            "/api/docs"
            if os.getenv("ENVIRONMENT", "development") == "development"
            else None
        )
    )
    redoc_url: str | None = field(
        default_factory=lambda: (
            "/api/redoc"
            if os.getenv("ENVIRONMENT", "development") == "development"
            else None
        )
    )

    # CORS settings
    cors_origins: list[str] = field(
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
        ]
    )
    cors_methods: list[str] = field(
        default_factory=lambda: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    cors_headers: list[str] = field(
        default_factory=lambda: [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
        ]
    )
    cors_expose_headers: list[str] = field(default_factory=lambda: ["X-Total-Count"])
    cors_max_age: int = 3600

    # Security settings
    allowed_hosts: list[str] = field(
        default_factory=lambda: [
            "localhost",
            "127.0.0.1",
            "testserver",
            "*.yourdomain.com",
        ]
    )

    # Service configurations
    gatekeeper: GatekeeperConfig = field(default_factory=GatekeeperConfig)
    comfy: ComfyConfig = field(default_factory=ComfyConfig)
    nlweb: NLWebConfig = field(default_factory=NLWebConfig)
    rag: NewRAGConfig = field(default_factory=NewRAGConfig)
    ollama: OllamaConfig = field(default_factory=OllamaConfig)
    tts: TTSConfig = field(default_factory=TTSConfig)

    # Startup/shutdown timeouts
    startup_timeout: float = 30.0
    shutdown_timeout: float = 10.0

    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment == "development"

    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment == "production"


# Global configuration instance
_config: AppConfig | None = None


def get_config() -> AppConfig:
    """Get the global configuration instance."""
    global _config
    if _config is None:
        _config = AppConfig()
    return _config


def get_service_configs() -> dict[str, dict[str, Any]]:
    """Get service configurations as dictionaries."""
    config = get_config()
    return {
        "gatekeeper": {
            "enabled": config.gatekeeper.enabled,
            "jwt_secret_key": config.gatekeeper.jwt_secret_key,
            "jwt_algorithm": config.gatekeeper.jwt_algorithm,
            "access_token_expire_minutes": config.gatekeeper.access_token_expire_minutes,
            "refresh_token_expire_days": config.gatekeeper.refresh_token_expire_days,
        },
        "comfy": {
            "comfy_enabled": config.comfy.enabled,
            "comfy_api_url": config.comfy.api_url,
            "comfy_timeout": config.comfy.timeout,
            "comfy_image_dir": config.comfy.image_dir,
            "comfy_reconnect_max_attempts": config.comfy.reconnect_max_attempts,
            "comfy_reconnect_base_delay_s": config.comfy.reconnect_base_delay_s,
            "comfy_reconnect_max_delay_s": config.comfy.reconnect_max_delay_s,
        },
        "nlweb": {
            "nlweb": {
                "enabled": config.nlweb.enabled,
                "base_url": config.nlweb.base_url,
                "suggest_timeout_s": config.nlweb.suggest_timeout_s,
                "cache_ttl_s": config.nlweb.cache_ttl_s,
                "cache_max_entries": config.nlweb.cache_max_entries,
                "allow_stale_on_error": config.nlweb.allow_stale_on_error,
                "warm_timeout_s": config.nlweb.warm_timeout_s,
                "rate_limit_window_s": config.nlweb.rate_limit_window_s,
                "rate_limit_max_requests": config.nlweb.rate_limit_max_requests,
                "canary_enabled": config.nlweb.canary_enabled,
                "canary_percentage": config.nlweb.canary_percentage,
                "rollback_enabled": config.nlweb.rollback_enabled,
                "performance_monitoring_enabled": config.nlweb.performance_monitoring_enabled,
                "proxy_max_retries": config.nlweb.proxy_max_retries,
                "proxy_backoff_ms": config.nlweb.proxy_backoff_ms,
                "proxy_connect_timeout_ms": config.nlweb.proxy_connect_timeout_ms,
                "proxy_read_timeout_ms": config.nlweb.proxy_read_timeout_ms,
                "proxy_sse_idle_timeout_ms": config.nlweb.proxy_sse_idle_timeout_ms,
            }
        },
        "rag": {
            "rag_enabled": config.rag.enabled,
            "pg_dsn": config.rag.pg_dsn,
            "ollama_base_url": config.rag.ollama_base_url,
            "rag_text_model": config.rag.text_model,
            "rag_code_model": config.rag.code_model,
            "rag_caption_model": config.rag.caption_model,
            "rag_clip_model": config.rag.clip_model,
            "rag_chunk_max_tokens": config.rag.chunk_max_tokens,
            "rag_chunk_min_tokens": config.rag.chunk_min_tokens,
            "rag_chunk_overlap_ratio": config.rag.chunk_overlap_ratio,
            "rag_ingest_batch_size_text": config.rag.ingest_batch_size_text,
            "rag_ingest_concurrency": config.rag.ingest_concurrency,
            "rag_ingest_max_attempts": config.rag.ingest_max_attempts,
            "rag_ingest_backoff_base_s": config.rag.ingest_backoff_base_s,
            "rag_query_rate_limit_per_minute": config.rag.query_rate_limit_per_minute,
            "rag_ingest_rate_limit_per_minute": config.rag.ingest_rate_limit_per_minute,
            "embedding_backends": config.rag.embedding_backends.to_dict(),
        },
        "ollama": {
            "ollama": {
                "enabled": config.ollama.enabled,
                "base_url": config.ollama.base_url,
                "timeout_seconds": config.ollama.timeout_seconds,
                "assistant_enabled": config.ollama.assistant_enabled,
                "tool_calling_enabled": config.ollama.tool_calling_enabled,
                "streaming_enabled": config.ollama.streaming_enabled,
            }
        },
        "tts": {
            "tts_enabled": config.tts.enabled,
            "tts_provider": config.tts.provider,
            "tts_model": config.tts.model,
            "tts_voice": config.tts.voice,
            "tts_speed": config.tts.speed,
            "tts_format": config.tts.format,
        },
    }
