#!/usr/bin/env python3
"""
Reynard Agent Lineage System
=============================

Manages agent family trees, parent-child relationships, and lineage tracking.
This module provides functionality for creating offspring, tracking ancestry,
and managing genetic inheritance patterns.

Follows the 140-line axiom and modular architecture principles.
"""

import json
import logging
from pathlib import Path
from typing import Any

from agent_traits import AgentTraits

logger = logging.getLogger(__name__)


class LineageManager:
    """Manages agent lineage and family relationships."""

    def __init__(self, data_dir: Path | None = None) -> None:
        """Initialize lineage manager with data directory."""
        self.data_dir = data_dir or Path(__file__).parent
        self.lineage_file = self.data_dir / "agent-lineage.json"
        self.traits_system = AgentTraits()
        self._load_lineage()

    def _load_lineage(self) -> None:
        """Load lineage data from persistent storage."""
        if self.lineage_file.exists():
            try:
                with self.lineage_file.open(encoding="utf-8") as f:
                    self.lineage_data = json.load(f)
            except (OSError, json.JSONDecodeError) as e:
                logger.warning("Could not load lineage data: %s", e)
                self.lineage_data = {}
        else:
            self.lineage_data = {}

    def _save_lineage(self) -> None:
        """Save lineage data to persistent storage."""
        try:
            with self.lineage_file.open("w", encoding="utf-8") as f:
                json.dump(self.lineage_data, f, indent=2)
        except OSError:
            logger.exception("Could not save lineage data")

    def create_offspring(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> dict[str, Any]:
        """Create offspring agent with inherited traits."""
        # Get parent data
        parent1_data = self.get_agent_data(parent1_id)
        parent2_data = self.get_agent_data(parent2_id)

        if not parent1_data or not parent2_data:
            raise ValueError("Parent agents not found")

        # Generate offspring traits through crossover and mutation
        offspring_traits = self.traits_system.crossover_traits(
            parent1_data["traits"], parent2_data["traits"]
        )
        offspring_traits = self.traits_system.apply_mutations(offspring_traits)

        # Calculate generation
        generation = (
            max(parent1_data.get("generation", 1), parent2_data.get("generation", 1))
            + 1
        )

        # Create offspring data
        offspring_data = {
            "agent_id": offspring_id,
            "generation": generation,
            "lineage": {
                "parents": [parent1_id, parent2_id],
                "children": [],
                "ancestors": self._merge_ancestors(parent1_data, parent2_data),
                "descendants": [],
            },
            "traits": offspring_traits,
            "created_at": self._get_current_time(),
        }

        # Update lineage relationships
        self._update_lineage_relationships(parent1_id, parent2_id, offspring_id)

        # Store offspring data
        self.lineage_data[offspring_id] = offspring_data
        self._save_lineage()

        logger.info(
            "Created offspring %s from parents %s and %s",
            offspring_id,
            parent1_id,
            parent2_id,
        )

        return offspring_data

    def get_agent_data(self, agent_id: str) -> dict[str, Any] | None:
        """Get complete agent data including lineage and traits."""
        return self.lineage_data.get(agent_id)

    def get_family_tree(self, agent_id: str, depth: int = 3) -> dict[str, Any]:
        """Generate family tree visualization."""
        agent_data = self.get_agent_data(agent_id)
        if not agent_data:
            return {}

        tree = {
            "agent": agent_data,
            "ancestors": self._get_ancestors_tree(agent_id, depth),
            "descendants": self._get_descendants_tree(agent_id, depth),
        }

        return tree

    def find_compatible_mates(self, agent_id: str, max_results: int = 5) -> list[str]:
        """Find agents with compatible traits for breeding."""
        agent_data = self.get_agent_data(agent_id)
        if not agent_data:
            return []

        compatibilities = []
        for other_id, other_data in self.lineage_data.items():
            if other_id == agent_id:
                continue

            compatibility = self._calculate_compatibility(
                agent_data["traits"], other_data["traits"]
            )
            compatibilities.append((other_id, compatibility))

        # Sort by compatibility and return top matches
        compatibilities.sort(key=lambda x: x[1], reverse=True)
        return [agent_id for agent_id, _ in compatibilities[:max_results]]

    def _merge_ancestors(
        self, parent1_data: dict[str, Any], parent2_data: dict[str, Any]
    ) -> list[str]:
        """Merge ancestor lists from two parents."""
        ancestors = set()

        # Add parents' ancestors
        if "lineage" in parent1_data:
            ancestors.update(parent1_data["lineage"].get("ancestors", []))
        if "lineage" in parent2_data:
            ancestors.update(parent2_data["lineage"].get("ancestors", []))

        # Add parents themselves
        ancestors.add(parent1_data.get("agent_id", ""))
        ancestors.add(parent2_data.get("agent_id", ""))

        return list(ancestors)

    def _update_lineage_relationships(
        self, parent1_id: str, parent2_id: str, offspring_id: str
    ) -> None:
        """Update parent-child relationships in lineage data."""
        # Update parent1
        if parent1_id in self.lineage_data:
            if "lineage" not in self.lineage_data[parent1_id]:
                self.lineage_data[parent1_id]["lineage"] = {
                    "children": [],
                    "descendants": [],
                }
            self.lineage_data[parent1_id]["lineage"]["children"].append(offspring_id)

        # Update parent2
        if parent2_id in self.lineage_data:
            if "lineage" not in self.lineage_data[parent2_id]:
                self.lineage_data[parent2_id]["lineage"] = {
                    "children": [],
                    "descendants": [],
                }
            self.lineage_data[parent2_id]["lineage"]["children"].append(offspring_id)

    def _get_ancestors_tree(self, agent_id: str, depth: int) -> dict[str, Any]:
        """Get ancestors tree up to specified depth."""
        if depth <= 0:
            return {}

        agent_data = self.get_agent_data(agent_id)
        if not agent_data or "lineage" not in agent_data:
            return {}

        ancestors = {}
        for ancestor_id in agent_data["lineage"].get("ancestors", []):
            ancestor_data = self.get_agent_data(ancestor_id)
            if ancestor_data:
                ancestors[ancestor_id] = {
                    "data": ancestor_data,
                    "ancestors": self._get_ancestors_tree(ancestor_id, depth - 1),
                }

        return ancestors

    def _get_descendants_tree(self, agent_id: str, depth: int) -> dict[str, Any]:
        """Get descendants tree down to specified depth."""
        if depth <= 0:
            return {}

        agent_data = self.get_agent_data(agent_id)
        if not agent_data or "lineage" not in agent_data:
            return {}

        descendants = {}
        for child_id in agent_data["lineage"].get("children", []):
            child_data = self.get_agent_data(child_id)
            if child_data:
                descendants[child_id] = {
                    "data": child_data,
                    "descendants": self._get_descendants_tree(child_id, depth - 1),
                }

        return descendants

    def _calculate_compatibility(
        self, traits1: dict[str, Any], traits2: dict[str, Any]
    ) -> float:
        """Calculate genetic compatibility between two agents."""
        # Simple compatibility based on trait similarity and complementarity
        personality1 = traits1["personality"]
        personality2 = traits2["personality"]

        # Calculate trait similarity
        similarity = 0.0
        for trait in personality1:
            if trait in personality2:
                similarity += 1.0 - abs(personality1[trait] - personality2[trait])

        similarity /= len(personality1)

        # Bonus for complementary traits (opposite but balanced)
        complementarity = 0.0
        for trait in personality1:
            if trait in personality2:
                diff = abs(personality1[trait] - personality2[trait])
                if 0.3 <= diff <= 0.7:  # Sweet spot for complementarity
                    complementarity += 0.1

        return min(1.0, similarity + complementarity)

    def _get_current_time(self) -> float:
        """Get current timestamp."""
        import time

        return time.time()
