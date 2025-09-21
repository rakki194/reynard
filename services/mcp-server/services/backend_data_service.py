#!/usr/bin/env python3
"""
Backend Data Service
====================

Service to fetch name generation data from the FastAPI backend.
Replaces local data loading with centralized backend data access.
"""

import json
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)


class BackendDataService:
    """Service to fetch name generation data from FastAPI backend."""

    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    async def get_animal_spirits(self) -> Dict[str, List[str]]:
        """Get all animal spirit names organized by spirit type."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/animal-spirits"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching animal spirits: {e}")
            # Fallback to empty data
            return {}

    async def get_animal_spirit_names(self, spirit: str) -> List[str]:
        """Get names for a specific animal spirit."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/animal-spirits/{spirit}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("names", [])
        except Exception as e:
            logger.error(f"Error fetching names for spirit {spirit}: {e}")
            return []

    async def get_naming_components(self) -> Dict[str, List[str]]:
        """Get all naming components (suffixes, prefixes, etc.)."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/components"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching naming components: {e}")
            return {}

    async def get_naming_component_type(self, component_type: str) -> List[str]:
        """Get a specific type of naming component."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/components/{component_type}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("values", [])
        except Exception as e:
            logger.error(f"Error fetching component type {component_type}: {e}")
            return []

    async def get_naming_config(self) -> Dict[str, Any]:
        """Get the complete naming configuration."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/config"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching naming config: {e}")
            return {}

    async def get_naming_schemes(self) -> Dict[str, Any]:
        """Get all available naming schemes."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/config/schemes"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("schemes", {})
        except Exception as e:
            logger.error(f"Error fetching naming schemes: {e}")
            return {}

    async def get_naming_styles(self) -> Dict[str, Any]:
        """Get all available naming styles."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/config/styles"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("styles", {})
        except Exception as e:
            logger.error(f"Error fetching naming styles: {e}")
            return {}

    async def get_naming_spirits(self) -> Dict[str, Any]:
        """Get all available spirits with their configurations."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/config/spirits"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("spirits", {})
        except Exception as e:
            logger.error(f"Error fetching naming spirits: {e}")
            return {}

    async def get_generation_numbers(self) -> Dict[str, List[int]]:
        """Get generation numbers for all spirits."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/generation-numbers"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching generation numbers: {e}")
            return {}

    async def get_spirit_generation_numbers(self, spirit: str) -> List[int]:
        """Get generation numbers for a specific spirit."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/generation-numbers/{spirit}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("numbers", [])
        except Exception as e:
            logger.error(f"Error fetching generation numbers for spirit {spirit}: {e}")
            return []

    async def get_naming_enums(self) -> Dict[str, Any]:
        """Get all naming enums and categories."""
        try:
            response = await self.client.get(f"{self.backend_url}/api/ecs/naming/enums")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching naming enums: {e}")
            return {}

    async def get_characters(self) -> Dict[str, Any]:
        """Get all stored characters."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/characters"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching characters: {e}")
            return {}

    async def get_character(self, character_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific character by ID."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/naming/characters/{character_id}"
            )
            response.raise_for_status()
            data = response.json()
            return data.get("character")
        except Exception as e:
            logger.error(f"Error fetching character {character_id}: {e}")
            return None

    # Trait System Methods
    async def get_personality_traits(
        self, spirit: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get personality trait definitions, optionally for a specific spirit."""
        try:
            if spirit:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/personality/{spirit}"
                )
            else:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/personality"
                )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching personality traits: {e}")
            return {}

    async def get_physical_traits(self, spirit: Optional[str] = None) -> Dict[str, Any]:
        """Get physical trait definitions, optionally for a specific spirit."""
        try:
            if spirit:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/physical/{spirit}"
                )
            else:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/physical"
                )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching physical traits: {e}")
            return {}

    async def get_ability_traits(self, spirit: Optional[str] = None) -> Dict[str, Any]:
        """Get ability trait definitions, optionally for a specific spirit."""
        try:
            if spirit:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/abilities/{spirit}"
                )
            else:
                response = await self.client.get(
                    f"{self.backend_url}/api/ecs/traits/abilities"
                )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching ability traits: {e}")
            return {}

    async def get_trait_config(self) -> Dict[str, Any]:
        """Get the complete trait system configuration."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/traits/config"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching trait config: {e}")
            return {}

    async def get_spirit_trait_profile(self, spirit: str) -> Dict[str, Any]:
        """Get complete trait profile for a specific spirit."""
        try:
            response = await self.client.get(
                f"{self.backend_url}/api/ecs/traits/spirit/{spirit}"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching trait profile for spirit {spirit}: {e}")
            return {}


# Global instance
backend_data_service = BackendDataService()
