#!/usr/bin/env python3
"""
Dynamic Enum Service Compatibility Layer
========================================

This module provides backward compatibility for the old dynamic_enum_service interface
while using the new modular dynamic_enum service implementation.
"""

import logging
from typing import Any, Dict, Optional, Set

logger = logging.getLogger(__name__)

# Try to import the new dynamic enum service
try:
    import sys
    from pathlib import Path

    # Add the dynamic_enum service to the path
    dynamic_enum_path = Path(__file__).parent.parent.parent / "dynamic_enum" / "src"
    if dynamic_enum_path.exists():
        sys.path.insert(0, str(dynamic_enum_path))

    from dynamic_enum_service import get_dynamic_enum_service

    # Get the global service instance
    _service = get_dynamic_enum_service()

    # Create a compatibility class that wraps the new service
    class DynamicEnumService:
        """Compatibility wrapper for the new dynamic enum service."""

        def __init__(self):
            self._service = _service

        async def get_available_spirits(self) -> Set[str]:
            """Get all available animal spirits from the backend."""
            return await self._service.get_available_spirits()

        async def get_available_styles(self) -> Set[str]:
            """Get all available naming styles from the backend."""
            return await self._service.get_available_styles()

        async def get_all_enums(self) -> Dict[str, Any]:
            """Get all enum data from the backend."""
            return await self._service.get_all_enums()

        def is_valid_spirit(self, spirit: str) -> bool:
            """Check if a spirit is valid (synchronous check using cache)."""
            return self._service.is_valid_spirit(spirit)

        def is_valid_style(self, style: str) -> bool:
            """Check if a style is valid (synchronous check using cache)."""
            return self._service.is_valid_style(style)

        async def validate_spirit(self, spirit: str) -> str:
            """Validate and return a spirit, with fallback if invalid."""
            return await self._service.validate_spirit(spirit)

        async def validate_style(self, style: str) -> str:
            """Validate and return a style, with fallback if invalid."""
            return await self._service.validate_style(style)

        async def get_random_spirit(self, weighted: bool = True) -> str:
            """Get a random spirit from the backend."""
            return await self._service.get_random_spirit(weighted)

        async def get_spirit_emoji(self, spirit: str) -> str:
            """Get emoji for a spirit from the backend."""
            return await self._service.get_spirit_emoji(spirit)

        def clear_cache(self) -> None:
            """Clear all cached data to force refresh from backend."""
            self._service.clear_cache()

        # Add new modular methods for full compatibility
        async def get_available_values(self, enum_type: str) -> Set[str]:
            """Get all available values for an enum type."""
            return await self._service.get_available_values(enum_type)

        async def validate_value(self, enum_type: str, value: str) -> str:
            """Validate and return a value for an enum type."""
            return await self._service.validate_value(enum_type, value)

        async def get_random_value(self, enum_type: str, weighted: bool = True) -> str:
            """Get a random value for an enum type."""
            return await self._service.get_random_value(enum_type, weighted)

        async def get_metadata(
            self, enum_type: str, value: str, key: str, default: Any = None
        ) -> Any:
            """Get metadata for a value in an enum type."""
            return await self._service.get_metadata(enum_type, value, key, default)

        async def get_emoji(self, enum_type: str, value: str) -> str:
            """Get emoji for a value in an enum type."""
            return await self._service.get_emoji(enum_type, value)

        async def get_description(self, enum_type: str, value: str) -> str:
            """Get description for a value in an enum type."""
            return await self._service.get_description(enum_type, value)

        def is_valid_value(self, enum_type: str, value: str) -> bool:
            """Check if a value is valid for an enum type."""
            return self._service.is_valid_value(enum_type, value)

        def create_custom_provider(
            self, enum_type: str, fallback_data: dict[str, Any], default_fallback: str
        ):
            """Create and register a custom enum provider."""
            return self._service.create_custom_provider(
                enum_type, fallback_data, default_fallback
            )

        def list_enum_types(self) -> list[str]:
            """List all registered enum types."""
            return self._service.list_enum_types()

    # Create the global instance
    dynamic_enum_service = DynamicEnumService()

    logger.info("Dynamic enum service initialized with new modular implementation")

except ImportError as e:
    logger.warning(f"Could not import new dynamic enum service: {e}")
    logger.warning("Falling back to basic implementation")

    # Fallback implementation if the new service is not available
    class DynamicEnumService:
        """Fallback dynamic enum service implementation."""

        def __init__(self) -> None:
            self._spirits_cache: Optional[Set[str]] = None
            self._styles_cache: Optional[Set[str]] = None
            self._enums_cache: Optional[Dict[str, Any]] = None

        async def get_available_spirits(self) -> Set[str]:
            """Get all available animal spirits (fallback)."""
            if self._spirits_cache is None:
                self._spirits_cache = {
                    "fox",
                    "wolf",
                    "otter",
                    "dragon",
                    "phoenix",
                    "eagle",
                    "lion",
                    "tiger",
                }
            return self._spirits_cache

        async def get_available_styles(self) -> Set[str]:
            """Get all available naming styles (fallback)."""
            if self._styles_cache is None:
                self._styles_cache = {
                    "foundation",
                    "exo",
                    "hybrid",
                    "cyberpunk",
                    "mythological",
                    "scientific",
                }
            return self._styles_cache

        async def get_all_enums(self) -> Dict[str, Any]:
            """Get all enum data (fallback)."""
            return {}

        def is_valid_spirit(self, spirit: str) -> bool:
            """Check if a spirit is valid (fallback)."""
            return spirit in {
                "fox",
                "wolf",
                "otter",
                "dragon",
                "phoenix",
                "eagle",
                "lion",
                "tiger",
            }

        def is_valid_style(self, style: str) -> bool:
            """Check if a style is valid (fallback)."""
            return style in {
                "foundation",
                "exo",
                "hybrid",
                "cyberpunk",
                "mythological",
                "scientific",
            }

        async def validate_spirit(self, spirit: str) -> str:
            """Validate and return a spirit (fallback)."""
            if self.is_valid_spirit(spirit):
                return spirit
            return "fox"

        async def validate_style(self, style: str) -> str:
            """Validate and return a style (fallback)."""
            if self.is_valid_style(style):
                return style
            return "foundation"

        async def get_random_spirit(self, weighted: bool = True) -> str:
            """Get a random spirit (fallback)."""
            import random

            spirits = [
                "fox",
                "wolf",
                "otter",
                "dragon",
                "phoenix",
                "eagle",
                "lion",
                "tiger",
            ]
            return random.choice(spirits)

        async def get_spirit_emoji(self, spirit: str) -> str:
            """Get emoji for a spirit (fallback)."""
            emoji_map = {
                "fox": "🦊",
                "wolf": "🐺",
                "otter": "🦦",
                "dragon": "🐉",
                "phoenix": "🔥",
                "eagle": "🦅",
                "lion": "🦁",
                "tiger": "🐅",
            }
            return emoji_map.get(spirit, "🦊")

        def clear_cache(self) -> None:
            """Clear all cached data (fallback)."""
            self._spirits_cache = None
            self._styles_cache = None
            self._enums_cache = None

    # Create the global instance
    dynamic_enum_service = DynamicEnumService()

    logger.warning("Using fallback dynamic enum service implementation")
