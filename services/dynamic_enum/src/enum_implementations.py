#!/usr/bin/env python3
"""
Enum Implementations
===================

Specific implementations of enum providers for different data types.
"""

import logging
from typing import Any

from enum_provider import MetadataEnumProvider

logger = logging.getLogger(__name__)


class SpiritEnumProvider(MetadataEnumProvider):
    """Provider for animal spirit enums."""

    def __init__(self, data_provider=None):
        super().__init__("spirits", data_provider)

    async def get_available_values(self) -> set[str]:
        """Get all available animal spirits."""
        data = await self.get_all_data()
        return set(data.keys())

    async def validate_value(self, value: str) -> str:
        """Validate and return a spirit, with fallback if invalid."""
        available_spirits = await self.get_available_values()
        if value in available_spirits:
            return value

        logger.warning("Invalid spirit '%s', falling back to 'fox'", value)
        return "fox"

    def get_fallback_data(self) -> dict[str, Any]:
        """Get fallback spirits data when backend is unavailable."""
        return {
            "fox": {
                "weight": 1.0,
                "emoji": "🦊",
                "description": "Cunning and strategic",
            },
            "wolf": {
                "weight": 1.0,
                "emoji": "🐺",
                "description": "Pack-oriented and loyal",
            },
            "otter": {
                "weight": 1.0,
                "emoji": "🦦",
                "description": "Playful and thorough",
            },
            "dragon": {
                "weight": 1.0,
                "emoji": "🐉",
                "description": "Ancient and powerful",
            },
            "phoenix": {
                "weight": 1.0,
                "emoji": "🔥",
                "description": "Rebirth and renewal",
            },
            "eagle": {
                "weight": 1.0,
                "emoji": "🦅",
                "description": "Visionary and soaring",
            },
            "lion": {"weight": 1.0, "emoji": "🦁", "description": "Bold and regal"},
            "tiger": {
                "weight": 1.0,
                "emoji": "🐅",
                "description": "Stealth and precision",
            },
        }

    def get_default_fallback(self) -> str:
        """Get the default fallback spirit."""
        return "fox"


class StyleEnumProvider(MetadataEnumProvider):
    """Provider for naming style enums."""

    def __init__(self, data_provider=None):
        super().__init__("styles", data_provider)

    async def get_available_values(self) -> set[str]:
        """Get all available naming styles."""
        data = await self.get_all_data()
        return set(data.keys())

    async def validate_value(self, value: str) -> str:
        """Validate and return a style, with fallback if invalid."""
        available_styles = await self.get_available_values()
        if value in available_styles:
            return value

        logger.warning("Invalid style '%s', falling back to 'foundation'", value)
        return "foundation"

    def get_fallback_data(self) -> dict[str, Any]:
        """Get fallback styles data when backend is unavailable."""
        return {
            "foundation": {
                "weight": 1.0,
                "description": "Asimov-inspired strategic names",
            },
            "exo": {"weight": 1.0, "description": "Combat/technical operational names"},
            "hybrid": {
                "weight": 1.0,
                "description": "Mythological/historical references",
            },
            "cyberpunk": {"weight": 1.0, "description": "Tech-prefixed cyber names"},
            "mythological": {
                "weight": 1.0,
                "description": "Divine/mystical references",
            },
            "scientific": {
                "weight": 1.0,
                "description": "Latin scientific classifications",
            },
        }

    def get_default_fallback(self) -> str:
        """Get the default fallback style."""
        return "foundation"


class TraitEnumProvider(MetadataEnumProvider):
    """Provider for personality/ability trait enums."""

    def __init__(self, trait_type: str, data_provider=None):
        """Initialize trait enum provider.

        Args:
            trait_type: Type of trait ('personality', 'physical', 'ability')
            data_provider: Optional backend data provider
        """
        super().__init__(f"{trait_type}_traits", data_provider)
        self.trait_type = trait_type

    async def get_available_values(self) -> set[str]:
        """Get all available traits."""
        data = await self.get_all_data()
        return set(data.keys())

    async def validate_value(self, value: str) -> str:
        """Validate and return a trait, with fallback if invalid."""
        available_traits = await self.get_available_values()
        if value in available_traits:
            return value

        # Get a default fallback based on trait type
        default_trait = self.get_default_fallback()
        logger.warning(
            "Invalid %s trait '%s', falling back to '%s'",
            self.trait_type,
            value,
            default_trait,
        )
        return default_trait

    def get_fallback_data(self) -> dict[str, Any]:
        """Get fallback traits data when backend is unavailable."""
        if self.trait_type == "personality":
            return {
                "dominance": {"weight": 1.0, "description": "Leadership and authority"},
                "independence": {
                    "weight": 1.0,
                    "description": "Self-reliance and autonomy",
                },
                "patience": {
                    "weight": 1.0,
                    "description": "Calm and thoughtful approach",
                },
                "aggression": {"weight": 1.0, "description": "Direct and assertive"},
                "charisma": {"weight": 1.0, "description": "Inspiring and persuasive"},
                "creativity": {"weight": 1.0, "description": "Innovative and artistic"},
                "perfectionism": {"weight": 1.0, "description": "Attention to detail"},
                "adaptability": {
                    "weight": 1.0,
                    "description": "Flexible and versatile",
                },
            }
        elif self.trait_type == "physical":
            return {
                "size": {"weight": 1.0, "description": "Physical dimensions"},
                "strength": {"weight": 1.0, "description": "Physical power"},
                "agility": {"weight": 1.0, "description": "Speed and flexibility"},
                "endurance": {"weight": 1.0, "description": "Stamina and persistence"},
                "appearance": {"weight": 1.0, "description": "Visual attractiveness"},
                "grace": {"weight": 1.0, "description": "Elegant movement"},
            }
        elif self.trait_type == "ability":
            return {
                "strategist": {"weight": 1.0, "description": "Strategic thinking"},
                "hunter": {"weight": 1.0, "description": "Tracking and pursuit"},
                "teacher": {"weight": 1.0, "description": "Education and guidance"},
                "artist": {"weight": 1.0, "description": "Creative expression"},
                "healer": {"weight": 1.0, "description": "Healing and care"},
                "inventor": {"weight": 1.0, "description": "Innovation and creation"},
                "explorer": {"weight": 1.0, "description": "Discovery and adventure"},
                "guardian": {"weight": 1.0, "description": "Protection and defense"},
            }
        else:
            return {}

    def get_default_fallback(self) -> str:
        """Get the default fallback trait."""
        if self.trait_type == "personality":
            return "adaptability"
        elif self.trait_type == "physical":
            return "agility"
        elif self.trait_type == "ability":
            return "strategist"
        else:
            return "unknown"


class CustomEnumProvider(MetadataEnumProvider):
    """Provider for custom enum types."""

    def __init__(
        self,
        enum_type: str,
        fallback_data: dict[str, Any],
        default_fallback: str,
        data_provider=None,
    ):
        """Initialize custom enum provider.

        Args:
            enum_type: The type of enum this provider handles
            fallback_data: Fallback data when backend is unavailable
            default_fallback: Default value when validation fails
            data_provider: Optional backend data provider
        """
        super().__init__(enum_type, data_provider)
        self._custom_fallback_data = fallback_data
        self._custom_default_fallback = default_fallback

    async def get_available_values(self) -> set[str]:
        """Get all available values."""
        data = await self.get_all_data()
        return set(data.keys())

    async def validate_value(self, value: str) -> str:
        """Validate and return a value, with fallback if invalid."""
        available_values = await self.get_available_values()
        if value in available_values:
            return value

        logger.warning(
            "Invalid %s value '%s', falling back to '%s'",
            self.enum_type,
            value,
            self._custom_default_fallback,
        )
        return self._custom_default_fallback

    def get_fallback_data(self) -> dict[str, Any]:
        """Get fallback data when backend is unavailable."""
        return self._custom_fallback_data

    def get_default_fallback(self) -> str:
        """Get the default fallback value."""
        return self._custom_default_fallback
