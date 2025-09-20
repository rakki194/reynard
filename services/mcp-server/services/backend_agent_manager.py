#!/usr/bin/env python3
"""
Backend Agent Manager
=====================

Agent manager that uses the FastAPI backend for name generation data.
Replaces the local agent-naming service with centralized backend access.
"""

import json
import logging
import random
from typing import Any, Dict, List, Optional
from pathlib import Path

from .backend_data_service import backend_data_service

logger = logging.getLogger(__name__)


class BackendAgentManager:
    """Agent manager that fetches data from FastAPI backend."""

    def __init__(self, agent_names_file: Optional[str] = None):
        # Agent names are now stored in PostgreSQL ECS database
        # No need for local JSON file storage
        self.agent_names: Dict[str, str] = {}

    # JSON file methods removed - agent names are now stored in PostgreSQL ECS database

    async def generate_name(self, spirit: Optional[str] = None, style: Optional[str] = None) -> str:
        """Generate a new agent name using backend data."""
        try:
            # Get spirit names
            if spirit:
                spirit_names = await backend_data_service.get_animal_spirit_names(spirit)
            else:
                # Get all spirits and pick one randomly
                all_spirits = await backend_data_service.get_animal_spirits()
                if not all_spirits:
                    return "Vulpine"  # Fallback
                spirit = random.choice(list(all_spirits.keys()))
                spirit_names = all_spirits[spirit]

            if not spirit_names:
                return "Vulpine"  # Fallback

            # Get naming components
            components = await backend_data_service.get_naming_components()
            
            # Get generation numbers for the spirit
            generation_numbers = await backend_data_service.get_spirit_generation_numbers(spirit)
            
            # Select components based on style
            if style == "foundation":
                suffixes = components.get("foundation_suffixes", ["Prime", "Sage", "Oracle"])
            elif style == "exo":
                suffixes = components.get("exo_suffixes", ["Strike", "Guard", "Sentinel"])
            elif style == "cyberpunk":
                prefixes = components.get("cyberpunk_prefixes", ["Cyber", "Neo", "Mega"])
                suffixes = components.get("cyberpunk_suffixes", ["Nexus", "Grid", "Web"])
                prefix = random.choice(prefixes)
                spirit_name = random.choice(spirit_names)
                suffix = random.choice(suffixes)
                generation = random.choice(generation_numbers) if generation_numbers else random.randint(1, 100)
                return f"{prefix}-{spirit_name}-{suffix}"
            elif style == "mythological":
                mythological_refs = components.get("mythological_references", ["Atlas", "Prometheus", "Vulcan"])
                mythological_suffixes = components.get("mythological_suffixes", ["Divine", "Sacred", "Holy"])
                myth_ref = random.choice(mythological_refs)
                spirit_name = random.choice(spirit_names)
                suffix = random.choice(mythological_suffixes)
                generation = random.choice(generation_numbers) if generation_numbers else random.randint(1, 100)
                return f"{myth_ref}-{spirit_name}-{suffix}"
            elif style == "scientific":
                scientific_prefixes = components.get("scientific_prefixes", ["Panthera", "Canis", "Felis"])
                scientific_suffixes = components.get("scientific_suffixes", ["Leo", "Tigris", "Pardus"])
                prefix = random.choice(scientific_prefixes)
                spirit_name = random.choice(spirit_names)
                suffix = random.choice(scientific_suffixes)
                generation = random.choice(generation_numbers) if generation_numbers else random.randint(1, 100)
                return f"{prefix}-{spirit_name}-{suffix}"
            elif style == "hybrid":
                hybrid_refs = components.get("hybrid_references", ["Atlas", "Prometheus", "Nexus"])
                special_designations = components.get("special_designations", ["Alpha", "Beta", "Prime"])
                hybrid_ref = random.choice(hybrid_refs)
                spirit_name = random.choice(spirit_names)
                designation = random.choice(special_designations)
                generation = random.choice(generation_numbers) if generation_numbers else random.randint(1, 100)
                return f"{spirit_name}-{hybrid_ref}-{designation}"
            else:
                # Default foundation style
                suffixes = components.get("foundation_suffixes", ["Prime", "Sage", "Oracle"])

            # Generate name in format: {spirit_name}-{suffix}-{generation}
            spirit_name = random.choice(spirit_names)
            suffix = random.choice(suffixes)
            generation = random.choice(generation_numbers) if generation_numbers else random.randint(1, 100)
            
            return f"{spirit_name}-{suffix}-{generation}"

        except Exception as e:
            logger.error(f"Error generating name: {e}")
            return "Vulpine"  # Fallback

    def assign_name(self, agent_id: str, name: str) -> bool:
        """Assign a name to an agent."""
        try:
            self.agent_names[agent_id] = name
            self._save_agent_names()
            return True
        except Exception as e:
            logger.error(f"Error assigning name: {e}")
            return False

    def get_name(self, agent_id: str) -> Optional[str]:
        """Get the name of an agent."""
        return self.agent_names.get(agent_id)

    def list_agents(self) -> Dict[str, str]:
        """List all agents and their names."""
        return self.agent_names.copy()

    async def roll_agent_spirit(self, weighted: bool = True) -> str:
        """Randomly select an animal spirit."""
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
                
                return random.choices(spirits, weights=weights)[0]
            else:
                # Equal probability
                return random.choice(list(spirits_data.keys()))

        except Exception as e:
            logger.error(f"Error rolling agent spirit: {e}")
            return "fox"  # Fallback

    async def get_spirit_emoji(self, spirit: str) -> str:
        """Get emoji for a spirit."""
        try:
            spirits_data = await backend_data_service.get_naming_spirits()
            spirit_data = spirits_data.get(spirit, {})
            return spirit_data.get("emoji", "🦊")  # Default fox emoji
        except Exception as e:
            logger.error(f"Error getting spirit emoji: {e}")
            return "🦊"  # Fallback

    def nudge_time(self, amount: float = 0.05) -> None:
        """Nudge the ECS simulation time forward by the specified amount."""
        # This is a placeholder for ECS time management
        # In a full implementation, this would interact with the ECS world simulation
        logger.debug(f"Nudging ECS time forward by {amount} units")
        # For now, we just log the nudge - actual ECS integration would go here
        pass

    async def close(self):
        """Close the backend data service."""
        await backend_data_service.close()
