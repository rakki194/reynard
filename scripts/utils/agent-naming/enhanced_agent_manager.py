#!/usr/bin/env python3
"""
Enhanced Agent Manager with Inheritance
=======================================

Extended agent manager that integrates trait inheritance, lineage tracking,
and enhanced name generation. This module provides the main interface for
creating and managing agents with genetic inheritance capabilities.

Follows the 140-line axiom and modular architecture principles.
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Any

from agent_lineage import LineageManager
from agent_traits import AgentTraits
from inherited_name_generator import InheritedNameGenerator

logger = logging.getLogger(__name__)


class EnhancedAgentManager:
    """Enhanced agent manager with inheritance capabilities."""

    def __init__(self, data_dir: Path | None = None) -> None:
        """Initialize enhanced agent manager."""
        self.data_dir = data_dir or Path(__file__).parent
        self.agents_file = self.data_dir / "agent-names.json"

        # Core systems
        self.traits_system = AgentTraits()
        self.lineage_manager = LineageManager(data_dir)
        self.name_generator = InheritedNameGenerator()

        self._load_agents()

    def _load_agents(self) -> None:
        """Load agent data from persistent storage."""
        if self.agents_file.exists():
            try:
                with self.agents_file.open(encoding="utf-8") as f:
                    self.agents = json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                logger.warning("Could not load agent data: %s", e)
                self.agents = {}
        else:
            self.agents = {}

    def _save_agents(self) -> None:
        """Save agent data to persistent storage."""
        try:
            with self.agents_file.open("w", encoding="utf-8") as f:
                json.dump(self.agents, f, indent=2)
        except OSError:
            logger.exception("Could not save agent data")

    def create_agent(
        self,
        agent_id: str,
        spirit: str | None = None,
        style: str | None = None,
        name: str | None = None,
    ) -> dict[str, Any]:
        """Create a new agent with traits and lineage data."""
        # Generate traits
        if spirit:
            traits = self.traits_system.generate_random_traits(spirit)
        else:
            # Random spirit selection
            spirits = ["fox", "wolf", "otter"]
            spirit = spirits[hash(agent_id) % len(spirits)]
            traits = self.traits_system.generate_random_traits(spirit)

        # Generate name if not provided
        if not name:
            name = self._generate_standard_name(spirit, style)

        # Create agent data
        agent_data = {
            "agent_id": agent_id,
            "name": name,
            "generation": 1,
            "traits": traits,
            "lineage": {
                "parents": [],
                "children": [],
                "ancestors": [],
                "descendants": [],
            },
            "assigned_at": asyncio.get_event_loop().time(),
            "created_at": asyncio.get_event_loop().time(),
        }

        # Store agent data
        self.agents[agent_id] = agent_data
        self.lineage_manager.lineage_data[agent_id] = agent_data
        self._save_agents()
        self.lineage_manager._save_lineage()

        logger.info("Created agent %s with name %s", agent_id, name)
        return agent_data

    def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> dict[str, Any]:
        """Create offspring agent with inherited traits and name."""
        # Create offspring through lineage manager
        offspring_data = self.lineage_manager.create_offspring(
            parent1_id, parent2_id, offspring_id
        )

        # Generate inherited name
        parent1_data = self.get_agent_data(parent1_id)
        parent2_data = self.get_agent_data(parent2_id)

        if parent1_data and parent2_data:
            inherited_name = self.name_generator.generate_inherited_name(
                offspring_data["traits"],
                parent1_data["name"],
                parent2_data["name"],
                offspring_data["generation"],
            )
            offspring_data["name"] = inherited_name

        # Store in main agents file
        self.agents[offspring_id] = offspring_data
        self._save_agents()

        logger.info(
            "Created offspring %s with inherited name %s",
            offspring_id,
            offspring_data["name"],
        )
        return offspring_data

    def get_agent_data(self, agent_id: str) -> dict[str, Any] | None:
        """Get complete agent data including traits and lineage."""
        return self.agents.get(agent_id)

    def get_agent_traits(self, agent_id: str) -> dict[str, Any] | None:
        """Get agent traits."""
        agent_data = self.get_agent_data(agent_id)
        return agent_data.get("traits") if agent_data else None

    def get_agent_lineage(self, agent_id: str, depth: int = 3) -> dict[str, Any]:
        """Get agent family tree."""
        return self.lineage_manager.get_family_tree(agent_id, depth)

    def find_compatible_mates(self, agent_id: str, max_results: int = 5) -> list[str]:
        """Find compatible agents for breeding."""
        return self.lineage_manager.find_compatible_mates(agent_id, max_results)

    def analyze_genetic_compatibility(
        self, agent1_id: str, agent2_id: str
    ) -> dict[str, Any]:
        """Analyze genetic compatibility between two agents."""
        agent1_data = self.get_agent_data(agent1_id)
        agent2_data = self.get_agent_data(agent2_id)

        if not agent1_data or not agent2_data:
            return {"compatibility": 0.0, "analysis": "Agents not found"}

        # Calculate compatibility
        compatibility = self.lineage_manager._calculate_compatibility(
            agent1_data["traits"], agent2_data["traits"]
        )

        # Analyze trait combinations
        trait_analysis = self._analyze_trait_combinations(
            agent1_data["traits"], agent2_data["traits"]
        )

        return {
            "compatibility": compatibility,
            "analysis": trait_analysis,
            "recommended": compatibility > 0.7,
        }

    def _generate_standard_name(self, spirit: str, style: str | None = None) -> str:
        """Generate standard name using existing system."""
        # This would integrate with the existing ReynardRobotNamer
        # For now, return a simple generated name
        spirit_names = {
            "fox": ["Vulpine", "Reynard", "Kitsune", "Cunning"],
            "wolf": ["Lupus", "Fenrir", "Alpha", "Brave"],
            "otter": ["Lutra", "Playful", "Joyful", "Splash"],
        }

        base_name = spirit_names.get(spirit, ["Unknown"])[0]
        generation = 1

        return f"{base_name}-Agent-{generation}"

    def _analyze_trait_combinations(
        self, traits1: dict[str, Any], traits2: dict[str, Any]
    ) -> str:
        """Analyze how traits would combine in offspring."""
        personality1 = traits1["personality"]
        personality2 = traits2["personality"]

        # Find complementary traits
        complementary = []
        conflicting = []

        for trait in personality1:
            if trait in personality2:
                diff = abs(personality1[trait] - personality2[trait])
                if 0.3 <= diff <= 0.7:
                    complementary.append(trait)
                elif diff > 0.8:
                    conflicting.append(trait)

        analysis = f"Complementary traits: {', '.join(complementary)}"
        if conflicting:
            analysis += f". Conflicting traits: {', '.join(conflicting)}"

        return analysis

    def list_agents(self) -> dict[str, str]:
        """List all agents and their names."""
        return {agent_id: data["name"] for agent_id, data in self.agents.items()}

    def get_agent_summary(self, agent_id: str) -> str:
        """Get human-readable agent summary."""
        agent_data = self.get_agent_data(agent_id)
        if not agent_data:
            return f"Agent {agent_id} not found"

        traits_summary = self.traits_system.get_trait_summary(agent_data["traits"])
        lineage_info = f"Generation {agent_data['generation']}"

        if agent_data["lineage"]["parents"]:
            lineage_info += f", Parents: {', '.join(agent_data['lineage']['parents'])}"

        return f"{agent_data['name']} - {traits_summary} - {lineage_info}"
