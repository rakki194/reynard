"""Service Configuration Management System

This module provides centralized configuration management for all services
in the Reynard backend, including hot-reload capabilities, environment-specific
settings, and configuration validation.
"""

import json
import logging
import os
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field, ValidationError

logger = logging.getLogger(__name__)


class ConfigSource(Enum):
    """Configuration source types."""

    ENVIRONMENT = "environment"
    FILE = "file"
    DATABASE = "database"
    DEFAULT = "default"


class ConfigValidationLevel(Enum):
    """Configuration validation levels."""

    STRICT = "strict"
    WARN = "warn"
    PERMISSIVE = "permissive"


@dataclass
class ConfigMetadata:
    """Configuration metadata."""

    source: ConfigSource
    last_updated: float
    version: str = "1.0.0"
    checksum: str | None = None
    validation_level: ConfigValidationLevel = ConfigValidationLevel.STRICT


@dataclass
class ServiceConfigSchema:
    """Service configuration schema definition."""

    service_name: str
    required_fields: list[str] = field(default_factory=list)
    optional_fields: list[str] = field(default_factory=list)
    field_types: dict[str, type] = field(default_factory=dict)
    field_defaults: dict[str, Any] = field(default_factory=dict)
    validation_rules: dict[str, dict[str, Any]] = field(default_factory=dict)


class ServiceConfigModel(BaseModel):
    """Base configuration model for services."""

    # Common service configuration
    enabled: bool = Field(True, description="Whether the service is enabled")
    debug: bool = Field(False, description="Enable debug mode")
    log_level: str = Field("INFO", description="Logging level")
    timeout: float = Field(30.0, description="Default timeout in seconds")
    retry_attempts: int = Field(3, description="Number of retry attempts")
    retry_delay: float = Field(1.0, description="Delay between retries in seconds")

    # Performance settings
    max_connections: int = Field(100, description="Maximum number of connections")
    connection_timeout: float = Field(10.0, description="Connection timeout in seconds")
    keep_alive: bool = Field(True, description="Enable connection keep-alive")

    # Security settings
    enable_ssl: bool = Field(False, description="Enable SSL/TLS")
    verify_ssl: bool = Field(True, description="Verify SSL certificates")
    api_key: str | None = Field(None, description="API key for authentication")

    # Monitoring settings
    enable_metrics: bool = Field(True, description="Enable metrics collection")
    metrics_interval: float = Field(60.0, description="Metrics collection interval")
    health_check_interval: float = Field(30.0, description="Health check interval")

    class Config:
        extra = "allow"  # Allow additional fields


class ServiceConfigManager:
    """Centralized service configuration management system.

    Provides:
    - Environment-specific configuration loading
    - Hot-reload capabilities
    - Configuration validation and schema enforcement
    - Configuration versioning and rollback
    - Service-specific configuration isolation
    """

    def __init__(self, config_dir: str | None = None):
        self.config_dir = Path(config_dir or os.getenv("CONFIG_DIR", "config"))
        self.config_dir.mkdir(exist_ok=True)

        # Configuration storage
        self._configurations: dict[str, dict[str, Any]] = {}
        self._schemas: dict[str, ServiceConfigSchema] = {}
        self._metadata: dict[str, ConfigMetadata] = {}
        self._watchers: dict[str, list[callable]] = {}

        # Environment detection
        self.environment = os.getenv("ENVIRONMENT", "development").lower()
        self.config_validation_level = ConfigValidationLevel(
            os.getenv("CONFIG_VALIDATION_LEVEL", "strict").lower(),
        )

        # Load default configurations
        self._load_default_configurations()

        logger.info(
            f"ServiceConfigManager initialized for environment: {self.environment}",
        )

    def _load_default_configurations(self) -> None:
        """Load default configurations for all services."""
        default_configs = {
            "gatekeeper": {
                "enabled": True,
                "jwt_secret": os.getenv("JWT_SECRET", "default-secret"),
                "token_expiry": 3600,
                "refresh_token_expiry": 86400,
                "algorithm": "HS256",
            },
            "comfy": {
                "enabled": True,
                "base_url": os.getenv("COMFY_BASE_URL", "http://localhost:8188"),
                "timeout": 30.0,
                "max_retries": 3,
                "image_dir": os.getenv("COMFY_IMAGE_DIR", "/tmp/comfy_images"),
            },
            "nlweb": {
                "enabled": True,
                "base_url": os.getenv("NLWEB_BASE_URL", "http://localhost:8001"),
                "timeout": 30.0,
                "cache_enabled": True,
                "cache_ttl": 3600,
            },
            "rag": {
                "enabled": True,
                "database_url": os.getenv("DATABASE_URL", "sqlite:///rag.db"),
                "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
                "chunk_size": 1000,
                "chunk_overlap": 200,
            },
            "ai_service": {
                "enabled": True,
                "default_provider": os.getenv("AI_DEFAULT_PROVIDER", "ollama"),
                "default_model": os.getenv("AI_DEFAULT_MODEL", "llama3.1:latest"),
                "timeout": 60.0,
                "max_tokens": 2048,
                "temperature": 0.7,
                "streaming": True,
                "providers": {
                    "ollama": {
                        "enabled": True,
                        "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                        "timeout": 30.0,
                    },
                    "vllm": {
                        "enabled": os.getenv("VLLM_ENABLED", "false").lower() == "true",
                        "base_url": os.getenv("VLLM_BASE_URL", "http://localhost:8000"),
                        "timeout": 30.0,
                    },
                    "sglang": {
                        "enabled": os.getenv("SGLANG_ENABLED", "false").lower() == "true",
                        "base_url": os.getenv("SGLANG_BASE_URL", "http://localhost:30000"),
                        "timeout": 30.0,
                    },
                    "llamacpp": {
                        "enabled": os.getenv("LLAMACPP_ENABLED", "false").lower() == "true",
                        "base_url": os.getenv("LLAMACPP_BASE_URL", "http://localhost:8080"),
                        "timeout": 30.0,
                    },
                },
            },
            "tts": {
                "enabled": True,
                "provider": "espeak",
                "voice": "default",
                "speed": 1.0,
                "output_format": "wav",
            },
            "search": {
                "enabled": True,
                "cache_enabled": True,
                "cache_ttl": 300,
                "max_results": 100,
            },
        }

        for service_name, config in default_configs.items():
            self._configurations[service_name] = config
            self._metadata[service_name] = ConfigMetadata(
                source=ConfigSource.DEFAULT,
                last_updated=0.0,
            )

    def register_service_schema(
        self, service_name: str, schema: ServiceConfigSchema,
    ) -> None:
        """Register a configuration schema for a service."""
        self._schemas[service_name] = schema
        logger.info(f"Registered configuration schema for service '{service_name}'")

    def load_service_config(
        self,
        service_name: str,
        config_file: str | None = None,
        environment_overrides: bool = True,
    ) -> dict[str, Any]:
        """Load configuration for a service."""
        config = {}

        # Load from file if specified
        if config_file:
            config.update(self._load_config_from_file(config_file))

        # Load environment-specific config
        env_config_file = self.config_dir / f"{service_name}_{self.environment}.json"
        if env_config_file.exists():
            config.update(self._load_config_from_file(str(env_config_file)))

        # Load default config
        if service_name in self._configurations:
            default_config = self._configurations[service_name].copy()
            default_config.update(config)
            config = default_config

        # Apply environment variable overrides
        if environment_overrides:
            config = self._apply_environment_overrides(service_name, config)

        # Validate configuration
        validated_config = self._validate_configuration(service_name, config)

        # Store configuration
        self._configurations[service_name] = validated_config
        self._metadata[service_name] = ConfigMetadata(
            source=ConfigSource.FILE if config_file else ConfigSource.ENVIRONMENT,
            last_updated=0.0,
        )

        logger.info(f"Loaded configuration for service '{service_name}'")
        return validated_config

    def _load_config_from_file(self, config_file: str) -> dict[str, Any]:
        """Load configuration from a JSON file."""
        try:
            with open(config_file) as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load config from {config_file}: {e}")
            return {}

    def _apply_environment_overrides(
        self, service_name: str, config: dict[str, Any],
    ) -> dict[str, Any]:
        """Apply environment variable overrides to configuration."""
        env_prefix = f"{service_name.upper()}_"

        for key, value in os.environ.items():
            if key.startswith(env_prefix):
                config_key = key[len(env_prefix) :].lower()

                # Convert value to appropriate type
                if isinstance(config.get(config_key), bool):
                    config[config_key] = value.lower() in ("true", "1", "yes", "on")
                elif isinstance(config.get(config_key), int):
                    try:
                        config[config_key] = int(value)
                    except ValueError:
                        logger.warning(f"Invalid integer value for {key}: {value}")
                elif isinstance(config.get(config_key), float):
                    try:
                        config[config_key] = float(value)
                    except ValueError:
                        logger.warning(f"Invalid float value for {key}: {value}")
                else:
                    config[config_key] = value

        return config

    def _validate_configuration(
        self, service_name: str, config: dict[str, Any],
    ) -> dict[str, Any]:
        """Validate configuration against schema."""
        if service_name not in self._schemas:
            return self._validate_with_base_model(service_name, config)

        return self._validate_with_schema(service_name, config)

    def _validate_with_base_model(
        self, service_name: str, config: dict[str, Any],
    ) -> dict[str, Any]:
        """Validate configuration using base model."""
        try:
            validated = ServiceConfigModel(**config)
            return validated.dict()
        except ValidationError as e:
            if self.config_validation_level == ConfigValidationLevel.STRICT:
                raise
            if self.config_validation_level == ConfigValidationLevel.WARN:
                logger.warning(
                    "Configuration validation warning for %s: %s", service_name, e,
                )
            return config

    def _validate_with_schema(
        self, service_name: str, config: dict[str, Any],
    ) -> dict[str, Any]:
        """Validate configuration using service schema."""
        schema = self._schemas[service_name]
        validated_config = {}

        # Validate required fields
        validated_config.update(
            self._validate_required_fields(service_name, config, schema),
        )

        # Validate optional fields
        validated_config.update(
            self._validate_optional_fields(service_name, config, schema),
        )

        return validated_config

    def _validate_required_fields(
        self, service_name: str, config: dict[str, Any], schema: ServiceConfigSchema,
    ) -> dict[str, Any]:
        """Validate required fields."""
        validated = {}
        for field in schema.required_fields:
            if field not in config:
                error_msg = (
                    f"Required field '{field}' missing for service '{service_name}'"
                )
                if self.config_validation_level == ConfigValidationLevel.STRICT:
                    raise ValueError(error_msg)
                if self.config_validation_level == ConfigValidationLevel.WARN:
                    logger.warning(error_msg)
                validated[field] = schema.field_defaults.get(field)
            else:
                validated[field] = self._validate_field(
                    service_name, field, config[field], schema,
                )
        return validated

    def _validate_optional_fields(
        self, service_name: str, config: dict[str, Any], schema: ServiceConfigSchema,
    ) -> dict[str, Any]:
        """Validate optional fields."""
        validated = {}
        for field in schema.optional_fields:
            if field in config:
                validated[field] = self._validate_field(
                    service_name, field, config[field], schema,
                )
            elif field in schema.field_defaults:
                validated[field] = schema.field_defaults[field]
        return validated

    def _validate_field(
        self,
        service_name: str,
        field_name: str,
        value: Any,
        schema: ServiceConfigSchema,
    ) -> Any:
        """Validate a single configuration field."""
        # Type validation
        expected_type = schema.field_types.get(field_name)
        if expected_type and not isinstance(value, expected_type):
            try:
                value = expected_type(value)
            except (ValueError, TypeError) as e:
                error_msg = f"Invalid type for field '{field_name}' in service '{service_name}': {e}"
                if self.config_validation_level == ConfigValidationLevel.STRICT:
                    raise ValueError(error_msg)
                if self.config_validation_level == ConfigValidationLevel.WARN:
                    logger.warning(error_msg)

        # Custom validation rules
        rules = schema.validation_rules.get(field_name, {})
        for rule_name, rule_value in rules.items():
            if not self._apply_validation_rule(
                field_name, value, rule_name, rule_value,
            ):
                error_msg = f"Validation rule '{rule_name}' failed for field '{field_name}' in service '{service_name}'"
                if self.config_validation_level == ConfigValidationLevel.STRICT:
                    raise ValueError(error_msg)
                if self.config_validation_level == ConfigValidationLevel.WARN:
                    logger.warning(error_msg)

        return value

    def _apply_validation_rule(
        self, field_name: str, value: Any, rule_name: str, rule_value: Any,
    ) -> bool:
        """Apply a validation rule to a field value."""
        if rule_name == "min" and isinstance(value, (int, float)):
            return value >= rule_value
        if rule_name == "max" and isinstance(value, (int, float)):
            return value <= rule_value
        if rule_name == "min_length" and isinstance(value, str):
            return len(value) >= rule_value
        if rule_name == "max_length" and isinstance(value, str):
            return len(value) <= rule_value
        if rule_name == "choices" and isinstance(rule_value, list):
            return value in rule_value
        if rule_name == "pattern" and isinstance(value, str):
            import re

            return bool(re.match(rule_value, value))

        return True

    def get_service_config(self, service_name: str) -> dict[str, Any]:
        """Get configuration for a service."""
        return self._configurations.get(service_name, {})

    def update_service_config(
        self, service_name: str, updates: dict[str, Any], validate: bool = True,
    ) -> bool:
        """Update configuration for a service."""
        if service_name not in self._configurations:
            logger.error(f"Service '{service_name}' not found in configuration")
            return False

        try:
            # Merge updates
            current_config = self._configurations[service_name].copy()
            current_config.update(updates)

            # Validate if requested
            if validate:
                current_config = self._validate_configuration(
                    service_name, current_config,
                )

            # Update configuration
            self._configurations[service_name] = current_config
            self._metadata[service_name].last_updated = (
                0.0  # Will be set to current time
            )

            # Notify watchers
            self._notify_config_watchers(service_name, current_config)

            logger.info(f"Updated configuration for service '{service_name}'")
            return True

        except Exception as e:
            logger.error(
                f"Failed to update configuration for service '{service_name}': {e}",
            )
            return False

    def save_service_config(
        self, service_name: str, config_file: str | None = None,
    ) -> bool:
        """Save service configuration to file."""
        if service_name not in self._configurations:
            logger.error(f"Service '{service_name}' not found in configuration")
            return False

        try:
            if not config_file:
                config_file = (
                    self.config_dir / f"{service_name}_{self.environment}.json"
                )

            with open(config_file, "w") as f:
                json.dump(self._configurations[service_name], f, indent=2)

            logger.info(
                f"Saved configuration for service '{service_name}' to {config_file}",
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to save configuration for service '{service_name}': {e}",
            )
            return False

    def add_config_watcher(self, service_name: str, callback: callable) -> None:
        """Add a configuration change watcher for a service."""
        if service_name not in self._watchers:
            self._watchers[service_name] = []
        self._watchers[service_name].append(callback)

    def remove_config_watcher(self, service_name: str, callback: callable) -> None:
        """Remove a configuration change watcher for a service."""
        if service_name in self._watchers:
            try:
                self._watchers[service_name].remove(callback)
            except ValueError:
                pass

    def _notify_config_watchers(
        self, service_name: str, config: dict[str, Any],
    ) -> None:
        """Notify configuration watchers of changes."""
        if service_name in self._watchers:
            for callback in self._watchers[service_name]:
                try:
                    callback(service_name, config)
                except Exception as e:
                    logger.error(
                        f"Error in config watcher for service '{service_name}': {e}",
                    )

    def get_all_configurations(self) -> dict[str, dict[str, Any]]:
        """Get all service configurations."""
        return self._configurations.copy()

    def get_config_metadata(self, service_name: str) -> ConfigMetadata | None:
        """Get configuration metadata for a service."""
        return self._metadata.get(service_name)

    def reload_service_config(self, service_name: str) -> bool:
        """Reload configuration for a service from file."""
        try:
            # Load configuration from file
            config = self.load_service_config(service_name)

            # Notify watchers
            self._notify_config_watchers(service_name, config)

            logger.info(f"Reloaded configuration for service '{service_name}'")
            return True

        except Exception as e:
            logger.error(
                f"Failed to reload configuration for service '{service_name}': {e}",
            )
            return False

    def export_configurations(self, output_file: str) -> bool:
        """Export all configurations to a file."""
        try:
            export_data = {
                "environment": self.environment,
                "timestamp": 0.0,  # Will be set to current time
                "configurations": self._configurations,
                "metadata": {
                    name: {
                        "source": meta.source.value,
                        "last_updated": meta.last_updated,
                        "version": meta.version,
                    }
                    for name, meta in self._metadata.items()
                },
            }

            with open(output_file, "w") as f:
                json.dump(export_data, f, indent=2)

            logger.info(f"Exported all configurations to {output_file}")
            return True

        except Exception as e:
            logger.error(f"Failed to export configurations: {e}")
            return False

    def import_configurations(self, input_file: str) -> bool:
        """Import configurations from a file."""
        try:
            with open(input_file) as f:
                import_data = json.load(f)

            # Validate import data
            if "configurations" not in import_data:
                raise ValueError("Invalid configuration file format")

            # Import configurations
            for service_name, config in import_data["configurations"].items():
                self._configurations[service_name] = config
                self._metadata[service_name] = ConfigMetadata(
                    source=ConfigSource.FILE,
                    last_updated=import_data.get("timestamp", 0.0),
                    version=import_data.get("metadata", {})
                    .get(service_name, {})
                    .get("version", "1.0.0"),
                )

            logger.info(f"Imported configurations from {input_file}")
            return True

        except Exception as e:
            logger.error(f"Failed to import configurations: {e}")
            return False


# Global service configuration manager instance
_service_config_manager: ServiceConfigManager | None = None


def get_service_config_manager() -> ServiceConfigManager:
    """Get the global service configuration manager instance."""
    global _service_config_manager
    if _service_config_manager is None:
        _service_config_manager = ServiceConfigManager()
    return _service_config_manager
