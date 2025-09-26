#!/usr/bin/env python3
"""Dynamic Enum Service
====================

Fully modular service that provides dynamic enums based on FastAPI ECS backend data.
Supports any type of enum through a provider-based architecture.

This service is designed to be completely modular and reusable across different applications.
"""

import logging
from typing import Any

from enum_implementations import (
    CustomEnumProvider,
    SpiritEnumProvider,
    StyleEnumProvider,
    TraitEnumProvider,
)
from enum_provider import EnumDataProvider, EnumProvider

logger = logging.getLogger(__name__)


class DynamicEnumService:
    """Fully modular service that provides dynamic enums from any backend."""

    def __init__(self, data_provider: EnumDataProvider | None = None) -> None:
        """Initialize the dynamic enum service.

        Args:
            data_provider: Optional backend data provider. If None,
                          will use fallback implementations.

        """
        self.data_provider = data_provider
        self._providers: dict[str, EnumProvider] = {}
        self._initialize_default_providers()

    def _initialize_default_providers(self) -> None:
        """Initialize default enum providers."""
        # Initialize built-in providers
        self._providers["spirits"] = SpiritEnumProvider(self.data_provider)
        self._providers["styles"] = StyleEnumProvider(self.data_provider)
        self._providers["personality_traits"] = TraitEnumProvider(
            "personality",
            self.data_provider,
        )
        self._providers["physical_traits"] = TraitEnumProvider(
            "physical",
            self.data_provider,
        )
        self._providers["ability_traits"] = TraitEnumProvider(
            "ability",
            self.data_provider,
        )

    def register_provider(self, enum_type: str, provider: EnumProvider) -> None:
        """Register a custom enum provider.

        Args:
            enum_type: The type of enum this provider handles
            provider: The enum provider instance

        """
        self._providers[enum_type] = provider
        logger.debug("Registered enum provider for type: %s", enum_type)

    def create_custom_provider(
        self,
        enum_type: str,
        fallback_data: dict[str, Any],
        default_fallback: str,
    ) -> CustomEnumProvider:
        """Create and register a custom enum provider.

        Args:
            enum_type: The type of enum this provider handles
            fallback_data: Fallback data when backend is unavailable
            default_fallback: Default value when validation fails

        Returns:
            The created custom provider

        """
        provider = CustomEnumProvider(
            enum_type,
            fallback_data,
            default_fallback,
            self.data_provider,
        )
        self.register_provider(enum_type, provider)
        return provider

    def get_provider(self, enum_type: str) -> EnumProvider | None:
        """Get an enum provider by type.

        Args:
            enum_type: The type of enum provider to get

        Returns:
            The enum provider or None if not found

        """
        return self._providers.get(enum_type)

    async def get_available_values(self, enum_type: str) -> set[str]:
        """Get all available values for an enum type.

        Args:
            enum_type: The type of enum to get values for

        Returns:
            Set of available values

        """
        provider = self.get_provider(enum_type)
        if provider:
            return await provider.get_available_values()

        logger.warning("No provider found for enum type: %s", enum_type)
        return set()

    async def validate_value(self, enum_type: str, value: str) -> str:
        """Validate and return a value for an enum type.

        Args:
            enum_type: The type of enum to validate against
            value: The value to validate

        Returns:
            The validated value or fallback

        """
        provider = self.get_provider(enum_type)
        if provider:
            return await provider.validate_value(value)

        logger.warning("No provider found for enum type: %s", enum_type)
        return value

    async def get_random_value(self, enum_type: str, weighted: bool = True) -> str:
        """Get a random value for an enum type.

        Args:
            enum_type: The type of enum to get random value for
            weighted: Whether to use weighted selection

        Returns:
            A random value from the enum type

        """
        provider = self.get_provider(enum_type)
        if provider:
            return await provider.get_random_value(weighted)

        logger.warning("No provider found for enum type: %s", enum_type)
        return "unknown"

    async def get_metadata(
        self,
        enum_type: str,
        value: str,
        key: str,
        default: Any = None,
    ) -> Any:
        """Get metadata for a value in an enum type.

        Args:
            enum_type: The type of enum
            value: The enum value
            key: The metadata key
            default: Default value if not found

        Returns:
            The metadata value or default

        """
        provider = self.get_provider(enum_type)
        if provider and hasattr(provider, "get_metadata"):
            return await provider.get_metadata(value, key, default)

        logger.warning("No metadata provider found for enum type: %s", enum_type)
        return default

    async def get_emoji(self, enum_type: str, value: str) -> str:
        """Get emoji for a value in an enum type.

        Args:
            enum_type: The type of enum
            value: The enum value

        Returns:
            The emoji for the value

        """
        return await self.get_metadata(enum_type, value, "emoji", "🦊")

    async def get_description(self, enum_type: str, value: str) -> str:
        """Get description for a value in an enum type.

        Args:
            enum_type: The type of enum
            value: The enum value

        Returns:
            The description for the value

        """
        return await self.get_metadata(
            enum_type,
            value,
            "description",
            "No description available",
        )

    def is_valid_value(self, enum_type: str, value: str) -> bool:
        """Check if a value is valid for an enum type (synchronous check using cache).

        Args:
            enum_type: The type of enum to check against
            value: The value to check

        Returns:
            True if the value is valid

        """
        provider = self.get_provider(enum_type)
        if provider:
            return provider.is_valid_value(value)

        return False

    def clear_cache(self, enum_type: str | None = None) -> None:
        """Clear cached data for an enum type or all types.

        Args:
            enum_type: Specific enum type to clear, or None to clear all

        """
        if enum_type:
            provider = self.get_provider(enum_type)
            if provider:
                provider.clear_cache()
        else:
            for provider in self._providers.values():
                provider.clear_cache()
            logger.debug("Cleared all enum caches")

    def list_enum_types(self) -> list[str]:
        """List all registered enum types.

        Returns:
            List of registered enum type names

        """
        return list(self._providers.keys())

    # Convenience methods for backward compatibility
    async def get_available_spirits(self) -> set[str]:
        """Get all available animal spirits (backward compatibility)."""
        return await self.get_available_values("spirits")

    async def get_available_styles(self) -> set[str]:
        """Get all available naming styles (backward compatibility)."""
        return await self.get_available_values("styles")

    async def validate_spirit(self, spirit: str) -> str:
        """Validate and return a spirit (backward compatibility)."""
        return await self.validate_value("spirits", spirit)

    async def validate_style(self, style: str) -> str:
        """Validate and return a style (backward compatibility)."""
        return await self.validate_value("styles", style)

    async def get_random_spirit(self, weighted: bool = True) -> str:
        """Get a random spirit (backward compatibility)."""
        return await self.get_random_value("spirits", weighted)

    async def get_spirit_emoji(self, spirit: str) -> str:
        """Get emoji for a spirit (backward compatibility)."""
        return await self.get_emoji("spirits", spirit)

    def is_valid_spirit(self, spirit: str) -> bool:
        """Check if a spirit is valid (backward compatibility)."""
        return self.is_valid_value("spirits", spirit)

    def is_valid_style(self, style: str) -> bool:
        """Check if a style is valid (backward compatibility)."""
        return self.is_valid_value("styles", style)


# Global instance - will be initialized with backend provider by the MCP server
dynamic_enum_service: DynamicEnumService | None = None


def initialize_dynamic_enum_service(
    data_provider: EnumDataProvider,
) -> DynamicEnumService:
    """Initialize the global dynamic enum service with a data provider.

    Args:
        data_provider: The backend data provider to use.

    Returns:
        The initialized dynamic enum service.

    """
    # Use module-level assignment instead of global statement
    import sys

    current_module = sys.modules[__name__]
    current_module.dynamic_enum_service = DynamicEnumService(data_provider)
    return current_module.dynamic_enum_service


def get_dynamic_enum_service() -> DynamicEnumService:
    """Get the global dynamic enum service instance.

    Returns:
        The global dynamic enum service instance.

    Raises:
        RuntimeError: If the service has not been initialized.

    """
    if dynamic_enum_service is None:
        raise RuntimeError(
            "Dynamic enum service not initialized. Call initialize_dynamic_enum_service() first.",
        )
    return dynamic_enum_service
