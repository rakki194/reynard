#!/usr/bin/env python3
"""Backend Data Provider Adapter
============================

Adapter that converts the MCP server's backend data service into the
generic EnumDataProvider interface.
"""

import logging
from typing import Any

from enum_provider import EnumDataProvider

logger = logging.getLogger(__name__)


class MCPBackendAdapter(EnumDataProvider):
    """Adapter that converts MCP backend data service to generic enum provider."""

    def __init__(self, backend_data_service):
        """Initialize the adapter.

        Args:
            backend_data_service: The MCP server's backend data service

        """
        self.backend_service = backend_data_service

    async def get_data(self, enum_type: str) -> dict[str, Any]:
        """Get data for a specific enum type from the backend.

        Args:
            enum_type: The type of enum to get data for

        Returns:
            Dictionary of enum data

        """
        try:
            if enum_type == "spirits":
                return await self._get_spirits_data()
            if enum_type == "styles":
                return await self._get_styles_data()
            if enum_type == "personality_traits":
                return await self._get_personality_traits_data()
            if enum_type == "physical_traits":
                return await self._get_physical_traits_data()
            if enum_type == "ability_traits":
                return await self._get_ability_traits_data()
            logger.warning("Unknown enum type: %s", enum_type)
            return {}

        except Exception as e:
            logger.exception("Error getting data for enum type %s: %s", enum_type, e)
            return {}

    async def _get_spirits_data(self) -> dict[str, Any]:
        """Get spirits data from the backend."""
        try:
            spirits_data = await self.backend_service.get_naming_spirits()

            # Handle both formats: direct dict or wrapped in "spirits" key
            if isinstance(spirits_data, dict):
                if "spirits" in spirits_data:
                    # Wrapped format
                    return spirits_data["spirits"]
                # Direct format
                return spirits_data
            return {}

        except Exception as e:
            logger.exception("Error getting spirits data: %s", e)
            return {}

    async def _get_styles_data(self) -> dict[str, Any]:
        """Get styles data from the backend."""
        try:
            enums_data = await self.backend_service.get_naming_enums()
            if "styles" in enums_data:
                return enums_data["styles"]
            return {}

        except Exception as e:
            logger.exception("Error getting styles data: %s", e)
            return {}

    async def _get_personality_traits_data(self) -> dict[str, Any]:
        """Get personality traits data from the backend."""
        try:
            traits_data = await self.backend_service.get_personality_traits()
            if isinstance(traits_data, dict):
                return traits_data
            return {}

        except Exception as e:
            logger.exception("Error getting personality traits data: %s", e)
            return {}

    async def _get_physical_traits_data(self) -> dict[str, Any]:
        """Get physical traits data from the backend."""
        try:
            traits_data = await self.backend_service.get_physical_traits()
            if isinstance(traits_data, dict):
                return traits_data
            return {}

        except Exception as e:
            logger.exception("Error getting physical traits data: %s", e)
            return {}

    async def _get_ability_traits_data(self) -> dict[str, Any]:
        """Get ability traits data from the backend."""
        try:
            traits_data = await self.backend_service.get_ability_traits()
            if isinstance(traits_data, dict):
                return traits_data
            return {}

        except Exception as e:
            logger.exception("Error getting ability traits data: %s", e)
            return {}
