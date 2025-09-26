"""Configuration Provider Interface: Configuration management interface.

This module defines the interface for configuration services, providing a consistent
API for configuration management, validation, and environment-specific settings.

Author: Reynard Development Team
Version: 1.0.0
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class ServiceConfig:
    """Service configuration container."""

    service_name: str
    enabled: bool
    config: Dict[str, Any]
    environment: str
    version: str
    dependencies: List[str]


class ConfigurationProvider(ABC):
    """Abstract interface for configuration providers.

    This interface defines the contract that all configuration providers must implement,
    ensuring consistency across different configuration management systems and sources.

    Key Features:
    - Configuration loading and validation
    - Environment-specific settings
    - Configuration hot-reloading
    - Secret management
    - Configuration versioning
    - Validation and schema enforcement
    """

    @abstractmethod
    async def load_config(
        self, service_name: str, environment: Optional[str] = None, **kwargs
    ) -> ServiceConfig:
        """Load configuration for a service.

        Args:
            service_name: Name of the service
            environment: Environment name (optional)
            **kwargs: Additional loading parameters

        Returns:
            ServiceConfig: Loaded service configuration

        Raises:
            ValueError: If service name is invalid
            RuntimeError: If configuration loading fails
        """
        pass

    @abstractmethod
    async def validate_config(self, config: ServiceConfig, **kwargs) -> bool:
        """Validate service configuration.

        Args:
            config: Configuration to validate
            **kwargs: Additional validation parameters

        Returns:
            bool: True if configuration is valid

        Raises:
            ValueError: If configuration is invalid
        """
        pass

    @abstractmethod
    async def get_config_value(
        self, service_name: str, key: str, default: Any = None, **kwargs
    ) -> Any:
        """Get a specific configuration value.

        Args:
            service_name: Name of the service
            key: Configuration key
            default: Default value if key not found
            **kwargs: Additional parameters

        Returns:
            Any: Configuration value or default
        """
        pass

    @abstractmethod
    async def set_config_value(
        self, service_name: str, key: str, value: Any, **kwargs
    ) -> bool:
        """Set a configuration value.

        Args:
            service_name: Name of the service
            key: Configuration key
            value: Configuration value
            **kwargs: Additional parameters

        Returns:
            bool: True if value was set successfully
        """
        pass

    @abstractmethod
    async def get_secret(self, secret_name: str, **kwargs) -> str:
        """Get a secret value.

        Args:
            secret_name: Name of the secret
            **kwargs: Additional parameters

        Returns:
            str: Secret value

        Raises:
            ValueError: If secret name is invalid
            RuntimeError: If secret retrieval fails
        """
        pass

    @abstractmethod
    async def set_secret(self, secret_name: str, value: str, **kwargs) -> bool:
        """Set a secret value.

        Args:
            secret_name: Name of the secret
            value: Secret value
            **kwargs: Additional parameters

        Returns:
            bool: True if secret was set successfully
        """
        pass

    @abstractmethod
    async def reload_config(self, service_name: str, **kwargs) -> ServiceConfig:
        """Reload configuration for a service.

        Args:
            service_name: Name of the service
            **kwargs: Additional parameters

        Returns:
            ServiceConfig: Reloaded configuration
        """
        pass

    @abstractmethod
    async def get_available_environments(self) -> List[str]:
        """Get list of available environments.

        Returns:
            List[str]: Available environment names
        """
        pass

    @abstractmethod
    async def get_config_schema(self, service_name: str, **kwargs) -> Dict[str, Any]:
        """Get configuration schema for a service.

        Args:
            service_name: Name of the service
            **kwargs: Additional parameters

        Returns:
            Dict[str, Any]: Configuration schema
        """
        pass

    @abstractmethod
    async def export_config(
        self, service_name: str, format: str = "json", **kwargs
    ) -> str:
        """Export configuration in specified format.

        Args:
            service_name: Name of the service
            format: Export format (json, yaml, etc.)
            **kwargs: Additional parameters

        Returns:
            str: Exported configuration
        """
        pass

    @abstractmethod
    async def import_config(
        self, service_name: str, config_data: str, format: str = "json", **kwargs
    ) -> bool:
        """Import configuration from specified format.

        Args:
            service_name: Name of the service
            config_data: Configuration data
            format: Import format (json, yaml, etc.)
            **kwargs: Additional parameters

        Returns:
            bool: True if import was successful
        """
        pass

    @abstractmethod
    async def get_config_stats(self) -> Dict[str, Any]:
        """Get configuration provider statistics.

        Returns:
            Dict[str, Any]: Statistics including loaded configs, etc.
        """
        pass
