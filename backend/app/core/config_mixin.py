"""
Configuration Management Mixin for Reynard Backend Services

This module provides centralized configuration management with
validation, change notifications, and hot-reload capabilities.
"""

import logging
import time
from collections.abc import Callable
from typing import Any

from pydantic import BaseModel, ValidationError

from .error_handler import service_error_handler
from .exceptions import ValidationError as ReynardValidationError

logger = logging.getLogger(__name__)


class ConfigChangeNotification:
    """Configuration change notification."""

    def __init__(
        self,
        config_key: str,
        old_value: Any,
        new_value: Any,
        timestamp: float,
        service_name: str,
    ):
        self.config_key = config_key
        self.old_value = old_value
        self.new_value = new_value
        self.timestamp = timestamp
        self.service_name = service_name


class ConfigEndpointMixin:
    """
    Mixin that provides configuration endpoints and management for services.
    """

    def __init__(self):
        self._config: dict[str, Any] = {}
        self._config_schema: type[BaseModel] | None = None
        self._config_version: int = 1
        self._config_change_listeners: dict[str, Callable] = {}
        self._config_history: list = []
        self._hot_reload_enabled: bool = False

    def setup_config_endpoints(self, config_model: type[BaseModel]) -> None:
        """
        Setup configuration endpoints for the service.

        Args:
            config_model: Pydantic model for configuration validation
        """
        self._config_schema = config_model

        @self.router.get("/config")
        async def get_config():
            """Get current service configuration."""
            try:
                return {
                    "service": self.service_name,
                    "config": self._config,
                    "version": self._config_version,
                    "schema": self._get_config_schema_info(),
                    "timestamp": time.time(),
                }
            except Exception as e:
                logger.error(f"Failed to get config for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="get_config", error=e, service_name=self.service_name
                )

        @self.router.put("/config")
        async def update_config(config_data: dict[str, Any]):
            """Update service configuration."""
            try:
                old_config = self._config.copy()
                new_config = await self._validate_and_update_config(config_data)

                # Notify listeners of changes
                self._notify_config_changes(old_config, new_config)

                return {
                    "success": True,
                    "message": "Configuration updated successfully",
                    "version": self._config_version,
                    "changes": self._get_config_changes(old_config, new_config),
                    "timestamp": time.time(),
                }
            except Exception as e:
                logger.error(f"Failed to update config for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="update_config", error=e, service_name=self.service_name
                )

        @self.router.post("/config/validate")
        async def validate_config(config_data: dict[str, Any]):
            """Validate configuration without applying it."""
            try:
                if self._config_schema:
                    # Validate against schema
                    validated_config = self._config_schema(**config_data)
                    return {
                        "valid": True,
                        "message": "Configuration is valid",
                        "validated_config": validated_config.dict(),
                    }
                return {
                    "valid": True,
                    "message": "No schema defined, basic validation passed",
                }
            except ValidationError as e:
                return {
                    "valid": False,
                    "message": "Configuration validation failed",
                    "errors": e.errors(),
                }
            except Exception as e:
                logger.error(f"Config validation failed for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="validate_config", error=e, service_name=self.service_name
                )

        @self.router.get("/config/history")
        async def get_config_history():
            """Get configuration change history."""
            try:
                return {
                    "service": self.service_name,
                    "history": self._config_history[-50:],  # Last 50 changes
                    "total_changes": len(self._config_history),
                }
            except Exception as e:
                logger.error(
                    f"Failed to get config history for {self.service_name}: {e}"
                )
                return service_error_handler.handle_service_error(
                    operation="get_config_history",
                    error=e,
                    service_name=self.service_name,
                )

        @self.router.post("/config/reset")
        async def reset_config():
            """Reset configuration to defaults."""
            try:
                old_config = self._config.copy()
                self._config = {}
                self._config_version += 1

                # Notify listeners
                self._notify_config_changes(old_config, {})

                return {
                    "success": True,
                    "message": "Configuration reset to defaults",
                    "version": self._config_version,
                }
            except Exception as e:
                logger.error(f"Failed to reset config for {self.service_name}: {e}")
                return service_error_handler.handle_service_error(
                    operation="reset_config", error=e, service_name=self.service_name
                )

        @self.router.post("/config/hot-reload")
        async def toggle_hot_reload():
            """Toggle hot-reload for configuration changes."""
            try:
                self._hot_reload_enabled = not self._hot_reload_enabled
                return {
                    "success": True,
                    "message": f"Hot-reload {'enabled' if self._hot_reload_enabled else 'disabled'}",
                    "hot_reload_enabled": self._hot_reload_enabled,
                }
            except Exception as e:
                logger.error(
                    f"Failed to toggle hot-reload for {self.service_name}: {e}"
                )
                return service_error_handler.handle_service_error(
                    operation="toggle_hot_reload",
                    error=e,
                    service_name=self.service_name,
                )

    def get_config_endpoint(self) -> dict[str, Any]:
        """
        Get current configuration.

        Returns:
            Dict containing current configuration
        """
        return self._config.copy()

    def update_config_endpoint(self, config_data: dict[str, Any]) -> dict[str, Any]:
        """
        Update configuration programmatically.

        Args:
            config_data: New configuration data

        Returns:
            Dict containing updated configuration

        Raises:
            ReynardValidationError: If configuration is invalid
        """
        try:
            old_config = self._config.copy()
            new_config = self._validate_and_update_config(config_data)

            # Notify listeners of changes
            self._notify_config_changes(old_config, new_config)

            return new_config

        except Exception as e:
            if isinstance(e, ReynardValidationError):
                raise
            raise ReynardValidationError(
                message=f"Failed to update configuration: {e!s}",
                details={"error": str(e)},
            )

    def add_config_change_listener(self, key: str, callback: Callable) -> None:
        """
        Add a listener for configuration changes.

        Args:
            key: Configuration key to monitor
            callback: Function to call when configuration changes
        """
        self._config_change_listeners[key] = callback
        logger.info(
            f"Added config change listener for key '{key}' in {self.service_name}"
        )

    def remove_config_change_listener(self, key: str) -> None:
        """
        Remove a configuration change listener.

        Args:
            key: Configuration key to stop monitoring
        """
        if key in self._config_change_listeners:
            del self._config_change_listeners[key]
            logger.info(
                f"Removed config change listener for key '{key}' in {self.service_name}"
            )

    def _validate_and_update_config(
        self, config_data: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Validate and update configuration.

        Args:
            config_data: Configuration data to validate and apply

        Returns:
            Dict containing validated configuration

        Raises:
            ReynardValidationError: If validation fails
        """
        try:
            # Validate against schema if available
            if self._config_schema:
                validated_config = self._config_schema(**config_data)
                validated_dict = validated_config.dict()
            else:
                validated_dict = config_data

            # Update configuration
            self._config.update(validated_dict)
            self._config_version += 1

            # Record in history
            self._config_history.append(
                {
                    "timestamp": time.time(),
                    "version": self._config_version,
                    "changes": config_data,
                    "service": self.service_name,
                }
            )

            # Keep only last 100 history entries
            if len(self._config_history) > 100:
                self._config_history = self._config_history[-100:]

            logger.info(
                f"Configuration updated for {self.service_name}, version: {self._config_version}"
            )

            return self._config.copy()

        except ValidationError as e:
            raise ReynardValidationError(
                message="Configuration validation failed",
                details={"validation_errors": e.errors()},
            )
        except Exception as e:
            raise ReynardValidationError(
                message=f"Failed to update configuration: {e!s}",
                details={"error": str(e)},
            )

    def _notify_config_changes(
        self, old_config: dict[str, Any], new_config: dict[str, Any]
    ) -> None:
        """
        Notify listeners of configuration changes.

        Args:
            old_config: Previous configuration
            new_config: New configuration
        """
        for key, callback in self._config_change_listeners.items():
            try:
                old_value = old_config.get(key)
                new_value = new_config.get(key)

                if old_value != new_value:
                    notification = ConfigChangeNotification(
                        config_key=key,
                        old_value=old_value,
                        new_value=new_value,
                        timestamp=time.time(),
                        service_name=self.service_name,
                    )
                    callback(notification)

            except Exception as e:
                logger.error(
                    f"Failed to notify config change listener for key '{key}': {e}"
                )

    def _get_config_changes(
        self, old_config: dict[str, Any], new_config: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Get configuration changes between old and new configs.

        Args:
            old_config: Previous configuration
            new_config: New configuration

        Returns:
            Dict containing changes
        """
        changes = {}

        # Check for added or modified keys
        for key, value in new_config.items():
            if key not in old_config or old_config[key] != value:
                changes[key] = {
                    "old_value": old_config.get(key),
                    "new_value": value,
                    "change_type": "added" if key not in old_config else "modified",
                }

        # Check for removed keys
        for key in old_config:
            if key not in new_config:
                changes[key] = {
                    "old_value": old_config[key],
                    "new_value": None,
                    "change_type": "removed",
                }

        return changes

    def _get_config_schema_info(self) -> dict[str, Any]:
        """
        Get configuration schema information.

        Returns:
            Dict containing schema information
        """
        if not self._config_schema:
            return {"schema_defined": False}

        try:
            schema = self._config_schema.schema()
            return {
                "schema_defined": True,
                "model_name": self._config_schema.__name__,
                "fields": list(schema.get("properties", {}).keys()),
                "required_fields": schema.get("required", []),
            }
        except Exception as e:
            logger.error(f"Failed to get schema info: {e}")
            return {"schema_defined": True, "error": str(e)}

    def get_config_version(self) -> int:
        """Get current configuration version."""
        return self._config_version

    def is_hot_reload_enabled(self) -> bool:
        """Check if hot-reload is enabled."""
        return self._hot_reload_enabled

    def get_config_history(self, limit: int = 50) -> list:
        """
        Get configuration history.

        Args:
            limit: Maximum number of history entries to return

        Returns:
            List of configuration history entries
        """
        return self._config_history[-limit:] if limit else self._config_history.copy()
