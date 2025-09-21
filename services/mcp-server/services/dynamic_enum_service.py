#!/usr/bin/env python3
"""
Dynamic Enum Service
====================

Service that provides dynamic enums based on FastAPI ECS backend data.
Eliminates hardcoded enums and uses PostgreSQL database as single source of truth.
"""

import logging
from enum import Enum
from typing import Any, Dict, List, Optional, Set

from .backend_data_service import backend_data_service

logger = logging.getLogger(__name__)


class DynamicEnumService:
    """Service that provides dynamic enums from FastAPI ECS backend."""

    def __init__(self):
        self._spirits_cache: Optional[Set[str]] = None
        self._styles_cache: Optional[Set[str]] = None
        self._enums_cache: Optional[Dict[str, Any]] = None

    async def get_available_spirits(self) -> Set[str]:
        """Get all available animal spirits from the backend."""
        if self._spirits_cache is None:
            try:
                spirits_data = await backend_data_service.get_naming_spirits()
                # Handle both formats: direct dict or wrapped in "spirits" key
                if isinstance(spirits_data, dict):
                    if "spirits" in spirits_data:
                        # Wrapped format
                        spirits_dict = spirits_data["spirits"]
                    else:
                        # Direct format
                        spirits_dict = spirits_data
                    self._spirits_cache = set(spirits_dict.keys())
                else:
                    self._spirits_cache = set()
                logger.debug(f"Loaded {len(self._spirits_cache)} spirits from backend")
            except Exception as e:
                logger.error(f"Error fetching spirits: {e}")
                # Fallback to basic spirits
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
        """Get all available naming styles from the backend."""
        if self._styles_cache is None:
            try:
                # Try to get styles from the enums endpoint first
                enums_data = await backend_data_service.get_naming_enums()
                if "styles" in enums_data:
                    self._styles_cache = set(enums_data["styles"].keys())
                else:
                    # Fallback to basic styles
                    self._styles_cache = {
                        "foundation",
                        "exo",
                        "hybrid",
                        "cyberpunk",
                        "mythological",
                        "scientific",
                    }
                logger.debug(f"Loaded {len(self._styles_cache)} styles from backend")
            except Exception as e:
                logger.error(f"Error fetching styles: {e}")
                # Fallback to basic styles
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
        """Get all enum data from the backend."""
        if self._enums_cache is None:
            try:
                self._enums_cache = await backend_data_service.get_naming_enums()
                logger.debug(
                    f"Loaded enum data from backend: {list(self._enums_cache.keys())}"
                )
            except Exception as e:
                logger.error(f"Error fetching enums: {e}")
                self._enums_cache = {}

        return self._enums_cache

    def is_valid_spirit(self, spirit: str) -> bool:
        """Check if a spirit is valid (synchronous check using cache)."""
        return self._spirits_cache is not None and spirit in self._spirits_cache

    def is_valid_style(self, style: str) -> bool:
        """Check if a style is valid (synchronous check using cache)."""
        return self._styles_cache is not None and style in self._styles_cache

    async def validate_spirit(self, spirit: str) -> str:
        """Validate and return a spirit, with fallback if invalid."""
        available_spirits = await self.get_available_spirits()
        if spirit in available_spirits:
            return spirit

        logger.warning(f"Invalid spirit '{spirit}', falling back to 'fox'")
        return "fox"

    async def validate_style(self, style: str) -> str:
        """Validate and return a style, with fallback if invalid."""
        available_styles = await self.get_available_styles()
        if style in available_styles:
            return style

        logger.warning(f"Invalid style '{style}', falling back to 'foundation'")
        return "foundation"

    async def get_random_spirit(self, weighted: bool = True) -> str:
        """Get a random spirit from the backend."""
        try:
            spirits_data = await backend_data_service.get_naming_spirits()
            if not spirits_data:
                return "fox"  # Fallback

            if weighted:
                # Use weights from the spirits data
                spirits = []
                weights = []
                for spirit_name, spirit_data in spirits_data.items():
                    spirits.append(spirit_name)
                    weights.append(spirit_data.get("weight", 1.0))

                import random

                return random.choices(spirits, weights=weights)[0]
            else:
                # Equal probability
                import random

                return random.choice(list(spirits_data.keys()))

        except Exception as e:
            logger.error(f"Error getting random spirit: {e}")
            return "fox"  # Fallback

    async def get_spirit_emoji(self, spirit: str) -> str:
        """Get emoji for a spirit from the backend."""
        try:
            spirits_data = await backend_data_service.get_naming_spirits()
            # Handle both formats: direct dict or wrapped in "spirits" key
            if isinstance(spirits_data, dict):
                if "spirits" in spirits_data:
                    # Wrapped format
                    spirits_dict = spirits_data["spirits"]
                else:
                    # Direct format
                    spirits_dict = spirits_data

                spirit_data = spirits_dict.get(spirit, {})
                return spirit_data.get("emoji", "🦊")  # Default fox emoji
            return "🦊"  # Fallback
        except Exception as e:
            logger.error(f"Error getting spirit emoji: {e}")
            return "🦊"  # Fallback

    def clear_cache(self):
        """Clear all cached data to force refresh from backend."""
        self._spirits_cache = None
        self._styles_cache = None
        self._enums_cache = None
        logger.debug("Cleared dynamic enum cache")


# Global instance
dynamic_enum_service = DynamicEnumService()
