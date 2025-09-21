"""
Agent State Management

Provides comprehensive agent state management capabilities for
the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

from ..utils.data_structures import (
    AgentState,
    PerformanceMetrics,
    StatisticalSignificance,
)
from ..utils.logging import PhoenixLogger


class AgentStateManager:
    """
    Agent state management system.

    Provides comprehensive agent state management, validation,
    and analysis capabilities.
    """

    def __init__(self):
        """Initialize the agent state manager."""
        self.logger = PhoenixLogger("agent_state_manager")
        self.agent_states: Dict[str, AgentState] = {}

        self.logger.info("Agent state manager initialized", "initialization")

    async def register_agent(self, agent_state: AgentState) -> bool:
        """
        Register an agent state.

        Args:
            agent_state: Agent state to register

        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate agent state
            validation = await self.validate_agent_state(agent_state)
            if not validation["is_valid"]:
                self.logger.error(
                    f"Invalid agent state: {validation['errors']}", "registration"
                )
                return False

            # Register agent
            self.agent_states[agent_state.id] = agent_state

            self.logger.success(
                f"Agent {agent_state.name} registered successfully", "registration"
            )
            return True

        except Exception as e:
            self.logger.error(f"Failed to register agent: {e}", "registration")
            return False

    async def get_agent(self, agent_id: str) -> Optional[AgentState]:
        """
        Get an agent state by ID.

        Args:
            agent_id: Agent ID

        Returns:
            Agent state if found, None otherwise
        """
        agent_state = self.agent_states.get(agent_id)
        if agent_state:
            self.logger.debug(f"Retrieved agent {agent_id}", "retrieval")
        else:
            self.logger.warning(f"Agent {agent_id} not found", "retrieval")

        return agent_state

    async def list_agents(self) -> List[str]:
        """
        List all registered agent IDs.

        Returns:
            List of agent IDs
        """
        agent_ids = list(self.agent_states.keys())
        self.logger.info(f"Listed {len(agent_ids)} agents", "listing")
        return agent_ids

    async def update_agent_performance(
        self, agent_id: str, metrics: PerformanceMetrics
    ) -> bool:
        """
        Update agent performance metrics.

        Args:
            agent_id: Agent ID
            metrics: New performance metrics

        Returns:
            True if successful, False otherwise
        """
        agent_state = await self.get_agent(agent_id)
        if not agent_state:
            self.logger.error(f"Agent {agent_id} not found", "performance_update")
            return False

        try:
            # Add new performance metrics
            agent_state.performance_history.append(metrics)
            agent_state.last_updated = datetime.now()

            # Update knowledge base
            if "total_operations" not in agent_state.knowledge_base:
                agent_state.knowledge_base["total_operations"] = 0
            agent_state.knowledge_base["total_operations"] += 1
            agent_state.knowledge_base["last_activity"] = datetime.now().isoformat()

            self.logger.success(
                f"Performance updated for {agent_id} - Fitness: {metrics.fitness:.3f}",
                "performance_update",
            )
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to update performance for {agent_id}: {e}",
                "performance_update",
            )
            return False

    async def validate_agent_state(self, agent_state: AgentState) -> Dict[str, Any]:
        """
        Validate agent state integrity.

        Args:
            agent_state: Agent state to validate

        Returns:
            Validation results
        """
        validation_results = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "checks": {},
        }

        try:
            # Check required fields
            if not agent_state.id:
                validation_results["errors"].append("Missing agent ID")
                validation_results["is_valid"] = False

            if not agent_state.name:
                validation_results["errors"].append("Missing agent name")
                validation_results["is_valid"] = False

            # Check trait ranges
            for trait_name, value in agent_state.personality_traits.items():
                if not 0.0 <= value <= 1.0:
                    validation_results["warnings"].append(
                        f"Personality trait {trait_name} out of range: {value}"
                    )

            for trait_name, value in agent_state.physical_traits.items():
                if not 0.0 <= value <= 1.0:
                    validation_results["warnings"].append(
                        f"Physical trait {trait_name} out of range: {value}"
                    )

            for trait_name, value in agent_state.ability_traits.items():
                if not 0.0 <= value <= 1.0:
                    validation_results["warnings"].append(
                        f"Ability trait {trait_name} out of range: {value}"
                    )

            # Check performance history
            if not agent_state.performance_history:
                validation_results["warnings"].append("No performance history")
            else:
                for i, perf in enumerate(agent_state.performance_history):
                    if not 0.0 <= perf.fitness <= 1.0:
                        validation_results["warnings"].append(
                            f"Performance {i} fitness out of range: {perf.fitness}"
                        )

            # Check knowledge base
            if not agent_state.knowledge_base:
                validation_results["warnings"].append("Empty knowledge base")

            validation_results["checks"] = {
                "has_id": bool(agent_state.id),
                "has_name": bool(agent_state.name),
                "has_traits": bool(
                    agent_state.personality_traits
                    or agent_state.physical_traits
                    or agent_state.ability_traits
                ),
                "has_performance": bool(agent_state.performance_history),
                "has_knowledge": bool(agent_state.knowledge_base),
                "trait_count": (
                    len(agent_state.personality_traits)
                    + len(agent_state.physical_traits)
                    + len(agent_state.ability_traits)
                ),
            }

        except Exception as e:
            validation_results["errors"].append(f"Validation error: {e}")
            validation_results["is_valid"] = False

        return validation_results

    async def get_agent_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about registered agents.

        Returns:
            Agent statistics
        """
        if not self.agent_states:
            return {
                "total_agents": 0,
                "spirits": {},
                "styles": {},
                "generations": {},
                "fitness_stats": {},
            }

        spirits = {}
        styles = {}
        generations = {}
        fitness_scores = []

        for agent_state in self.agent_states.values():
            # Count spirits
            spirit = agent_state.spirit.value
            spirits[spirit] = spirits.get(spirit, 0) + 1

            # Count styles
            style = agent_state.style.value
            styles[style] = styles.get(style, 0) + 1

            # Count generations
            gen = agent_state.generation
            generations[gen] = generations.get(gen, 0) + 1

            # Collect fitness scores
            fitness_scores.append(agent_state.get_fitness_score())

        # Calculate fitness statistics
        fitness_stats = {}
        if fitness_scores:
            fitness_stats = {
                "mean": sum(fitness_scores) / len(fitness_scores),
                "min": min(fitness_scores),
                "max": max(fitness_scores),
                "count": len(fitness_scores),
            }

        return {
            "total_agents": len(self.agent_states),
            "spirits": spirits,
            "styles": styles,
            "generations": generations,
            "fitness_stats": fitness_stats,
        }

    async def get_top_performers(self, count: int = 5) -> List[AgentState]:
        """
        Get top performing agents.

        Args:
            count: Number of top performers to return

        Returns:
            List of top performing agents
        """
        if not self.agent_states:
            return []

        # Sort agents by fitness score
        sorted_agents = sorted(
            self.agent_states.values(),
            key=lambda agent: agent.get_fitness_score(),
            reverse=True,
        )

        top_performers = sorted_agents[:count]

        self.logger.info(
            f"Retrieved top {len(top_performers)} performers", "performance_analysis"
        )
        return top_performers

    async def get_agents_by_spirit(self, spirit: str) -> List[AgentState]:
        """
        Get agents by spirit type.

        Args:
            spirit: Spirit type to filter by

        Returns:
            List of agents with the specified spirit
        """
        matching_agents = [
            agent
            for agent in self.agent_states.values()
            if agent.spirit.value == spirit
        ]

        self.logger.info(
            f"Found {len(matching_agents)} agents with spirit {spirit}", "spirit_filter"
        )
        return matching_agents

    async def get_agents_by_generation(self, generation: int) -> List[AgentState]:
        """
        Get agents by generation.

        Args:
            generation: Generation to filter by

        Returns:
            List of agents in the specified generation
        """
        matching_agents = [
            agent
            for agent in self.agent_states.values()
            if agent.generation == generation
        ]

        self.logger.info(
            f"Found {len(matching_agents)} agents in generation {generation}",
            "generation_filter",
        )
        return matching_agents

    async def remove_agent(self, agent_id: str) -> bool:
        """
        Remove an agent from the manager.

        Args:
            agent_id: Agent ID to remove

        Returns:
            True if successful, False otherwise
        """
        if agent_id not in self.agent_states:
            self.logger.warning(f"Agent {agent_id} not found for removal", "removal")
            return False

        try:
            del self.agent_states[agent_id]
            self.logger.success(f"Agent {agent_id} removed successfully", "removal")
            return True

        except Exception as e:
            self.logger.error(f"Failed to remove agent {agent_id}: {e}", "removal")
            return False

    async def clear_all_agents(self) -> bool:
        """
        Clear all registered agents.

        Returns:
            True if successful, False otherwise
        """
        try:
            agent_count = len(self.agent_states)
            self.agent_states.clear()

            self.logger.success(f"Cleared {agent_count} agents", "clear_all")
            return True

        except Exception as e:
            self.logger.error(f"Failed to clear agents: {e}", "clear_all")
            return False
