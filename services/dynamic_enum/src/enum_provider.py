#!/usr/bin/env python3
"""Enum Provider Interface
=======================

Core interfaces and base classes for dynamic enum providers.
This module defines the contract that all enum providers must implement.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Protocol

logger = logging.getLogger(__name__)


class EnumDataProvider(Protocol):
    """Protocol for backend data providers that can fetch enum data."""

    async def get_data(self, enum_type: str) -> dict[str, Any]:
        """Get data for a specific enum type from the backend."""
        ...


class EnumProvider(ABC):
    """Abstract base class for enum providers."""

    def __init__(self, enum_type: str, data_provider: EnumDataProvider | None = None):
        """Initialize the enum provider.

        Args:
            enum_type: The type of enum this provider handles (e.g., 'spirits', 'styles')
            data_provider: Optional backend data provider

        """
        self.enum_type = enum_type
        self.data_provider = data_provider
        self._cache: dict[str, Any] | None = None
        self._fallback_data: dict[str, Any] = {}

    @abstractmethod
    async def get_available_values(self) -> set[str]:
        """Get all available values for this enum type."""

    @abstractmethod
    async def validate_value(self, value: str) -> str:
        """Validate and return a value, with fallback if invalid."""

    @abstractmethod
    async def get_random_value(self, weighted: bool = True) -> str:
        """Get a random value from this enum type."""

    @abstractmethod
    def get_fallback_data(self) -> dict[str, Any]:
        """Get fallback data when backend is unavailable."""

    async def get_all_data(self) -> dict[str, Any]:
        """Get all data for this enum type."""
        if self._cache is None:
            try:
                if self.data_provider:
                    self._cache = await self.data_provider.get_data(self.enum_type)
                else:
                    self._cache = self.get_fallback_data()

                logger.debug(f"Loaded {self.enum_type} data: {len(self._cache)} items")
            except Exception:
                logger.exception("Error fetching %s data", self.enum_type)
                self._cache = self.get_fallback_data()

        return self._cache

    def is_valid_value(self, value: str) -> bool:
        """Check if a value is valid (synchronous check using cache)."""
        return self._cache is not None and value in self._cache

    def clear_cache(self) -> None:
        """Clear cached data to force refresh from backend."""
        self._cache = None
        logger.debug("Cleared %s enum cache", self.enum_type)


class WeightedEnumProvider(EnumProvider):
    """Base class for enum providers that support weighted random selection."""

    async def get_random_value(self, weighted: bool = True) -> str:
        """Get a random value with optional weighting."""
        try:
            data = await self.get_all_data()
            if not data:
                return self.get_default_fallback()

            if weighted:
                # Use weights from the data
                values = []
                weights = []
                for value_name, value_data in data.items():
                    values.append(value_name)
                    weights.append(value_data.get("weight", 1.0))

                import random

                return random.choices(values, weights=weights)[0]

            # Equal probability
            import random

            return random.choice(list(data.keys()))

        except Exception as e:
            logger.exception("Error getting random %s: %s", self.enum_type, e)
            return self.get_default_fallback()

    @abstractmethod
    def get_default_fallback(self) -> str:
        """Get the default fallback value for this enum type."""


class MetadataEnumProvider(WeightedEnumProvider):
    """Base class for enum providers that support metadata (like emojis)."""

    async def get_metadata(self, value: str, key: str, default: Any = None) -> Any:
        """Get metadata for a specific value.

        Args:
            value: The enum value
            key: The metadata key (e.g., 'emoji', 'description')
            default: Default value if not found

        Returns:
            The metadata value or default

        """
        try:
            data = await self.get_all_data()
            value_data = data.get(value, {})
            return value_data.get(key, default)
        except Exception as e:
            logger.exception("Error getting %s metadata for %s: %s", key, value, e)
            return default

    async def get_emoji(self, value: str) -> str:
        """Get emoji for a value."""
        return await self.get_metadata(value, "emoji", "🦊")

    async def get_description(self, value: str) -> str:
        """Get description for a value."""
        return await self.get_metadata(value, "description", "No description available")
