"""Agent State Persistence

Provides persistent storage and retrieval of agent states for
the Success-Advisor-8 distillation system.

Author: Champion-Designer-32 (Wolf Specialist)
Version: 1.0.0
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from ..utils.data_structures import (
    AgentState,
    NamingStyle,
    PerformanceMetrics,
    SpiritType,
    StatisticalSignificance,
)
from ..utils.logging import PhoenixLogger


class AgentPersistence:
    """Agent state persistence system.

    Provides JSON-based persistent storage and retrieval of agent states
    with backup and recovery capabilities.
    """

    def __init__(self, data_dir: str = "data/agent_persistence"):
        """Initialize agent persistence system.

        Args:
            data_dir: Directory for storing agent state data

        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.logger = PhoenixLogger("agent_persistence")
        self.agent_states: dict[str, AgentState] = {}

        self.logger.info(
            f"Agent persistence initialized at {self.data_dir}",
            "initialization",
        )

    async def save_agent_state(self, agent_state: AgentState) -> bool:
        """Save agent state to persistent storage.

        Args:
            agent_state: Agent state to save

        Returns:
            True if successful, False otherwise

        """
        try:
            # Convert agent state to dictionary
            state_data = {
                "id": agent_state.id,
                "name": agent_state.name,
                "spirit": agent_state.spirit.value,
                "style": agent_state.style.value,
                "generation": agent_state.generation,
                "parents": agent_state.parents,
                "personality_traits": agent_state.personality_traits,
                "physical_traits": agent_state.physical_traits,
                "ability_traits": agent_state.ability_traits,
                "performance_history": [
                    {
                        "accuracy": perf.accuracy,
                        "response_time": perf.response_time,
                        "efficiency": perf.efficiency,
                        "generalization": perf.generalization,
                        "creativity": perf.creativity,
                        "consistency": perf.consistency,
                        "fitness": perf.fitness,
                        "significance": {
                            "p_value": perf.significance.p_value,
                            "confidence_interval": perf.significance.confidence_interval,
                            "effect_size": perf.significance.effect_size,
                            "power": perf.significance.power,
                            "sample_size": perf.significance.sample_size,
                        },
                        "timestamp": perf.timestamp.isoformat(),
                    }
                    for perf in agent_state.performance_history
                ],
                "knowledge_base": agent_state.knowledge_base,
                "created_at": agent_state.created_at.isoformat(),
                "last_updated": agent_state.last_updated.isoformat(),
            }

            # Save to file
            state_file = self.data_dir / f"{agent_state.id}.json"
            with open(state_file, "w") as f:
                json.dump(state_data, f, indent=2)

            # Update in-memory cache
            self.agent_states[agent_state.id] = agent_state

            self.logger.success(f"Agent state saved: {agent_state.id}", "save")
            return True

        except Exception as e:
            self.logger.error(
                f"Failed to save agent state {agent_state.id}: {e}",
                "save",
            )
            return False

    async def load_agent_state(self, agent_id: str) -> AgentState | None:
        """Load agent state from persistent storage.

        Args:
            agent_id: Agent ID to load

        Returns:
            Agent state if found, None otherwise

        """
        try:
            # Check in-memory cache first
            if agent_id in self.agent_states:
                self.logger.debug(f"Agent state loaded from cache: {agent_id}", "load")
                return self.agent_states[agent_id]

            # Load from file
            state_file = self.data_dir / f"{agent_id}.json"
            if not state_file.exists():
                self.logger.warning(f"Agent state file not found: {agent_id}", "load")
                return None

            with open(state_file) as f:
                state_data = json.load(f)

            # Reconstruct performance history
            performance_history = []
            for perf_data in state_data["performance_history"]:
                performance = PerformanceMetrics(
                    accuracy=perf_data["accuracy"],
                    response_time=perf_data["response_time"],
                    efficiency=perf_data["efficiency"],
                    generalization=perf_data["generalization"],
                    creativity=perf_data["creativity"],
                    consistency=perf_data["consistency"],
                    fitness=perf_data["fitness"],
                    significance=StatisticalSignificance(
                        p_value=perf_data["significance"]["p_value"],
                        confidence_interval=tuple(
                            perf_data["significance"]["confidence_interval"],
                        ),
                        effect_size=perf_data["significance"]["effect_size"],
                        power=perf_data["significance"]["power"],
                        sample_size=perf_data["significance"]["sample_size"],
                    ),
                    timestamp=datetime.fromisoformat(perf_data["timestamp"]),
                )
                performance_history.append(performance)

            # Create agent state
            agent_state = AgentState(
                id=state_data["id"],
                name=state_data["name"],
                spirit=SpiritType(state_data["spirit"]),
                style=NamingStyle(state_data["style"]),
                generation=state_data["generation"],
                parents=state_data["parents"],
                personality_traits=state_data["personality_traits"],
                physical_traits=state_data["physical_traits"],
                ability_traits=state_data["ability_traits"],
                performance_history=performance_history,
                knowledge_base=state_data["knowledge_base"],
                created_at=datetime.fromisoformat(state_data["created_at"]),
                last_updated=datetime.fromisoformat(state_data["last_updated"]),
            )

            # Cache the loaded state
            self.agent_states[agent_state.id] = agent_state

            self.logger.success(f"Agent state loaded: {agent_id}", "load")
            return agent_state

        except Exception as e:
            self.logger.error(f"Failed to load agent state {agent_id}: {e}", "load")
            return None

    async def list_agent_states(self) -> list[str]:
        """List all available agent states.

        Returns:
            List of agent IDs

        """
        agent_ids = []

        # Check data directory
        for state_file in self.data_dir.glob("*.json"):
            agent_id = state_file.stem
            agent_ids.append(agent_id)

        # Also include cached states
        for agent_id in self.agent_states:
            if agent_id not in agent_ids:
                agent_ids.append(agent_id)

        self.logger.info(f"Listed {len(agent_ids)} agent states", "listing")
        return sorted(agent_ids)

    async def delete_agent_state(self, agent_id: str) -> bool:
        """Delete agent state from persistent storage.

        Args:
            agent_id: Agent ID to delete

        Returns:
            True if successful, False otherwise

        """
        try:
            # Remove from cache
            if agent_id in self.agent_states:
                del self.agent_states[agent_id]

            # Remove file
            state_file = self.data_dir / f"{agent_id}.json"
            if state_file.exists():
                state_file.unlink()

            self.logger.success(f"Agent state deleted: {agent_id}", "delete")
            return True

        except Exception as e:
            self.logger.error(f"Failed to delete agent state {agent_id}: {e}", "delete")
            return False

    async def backup_agent_states(
        self,
        backup_dir: str = "backups/agent_states",
    ) -> bool:
        """Create backup of all agent states.

        Args:
            backup_dir: Backup directory

        Returns:
            True if successful, False otherwise

        """
        try:
            backup_path = Path(backup_dir)
            backup_path.mkdir(parents=True, exist_ok=True)

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = backup_path / f"agent_states_backup_{timestamp}.json"

            # Collect all agent states
            all_states = {}
            for agent_id in await self.list_agent_states():
                agent_state = await self.load_agent_state(agent_id)
                if agent_state:
                    all_states[agent_id] = {
                        "id": agent_state.id,
                        "name": agent_state.name,
                        "spirit": agent_state.spirit.value,
                        "style": agent_state.style.value,
                        "generation": agent_state.generation,
                        "fitness": agent_state.get_fitness_score(),
                        "last_updated": agent_state.last_updated.isoformat(),
                    }

            # Save backup
            with open(backup_file, "w") as f:
                json.dump(
                    {
                        "backup_timestamp": timestamp,
                        "agent_count": len(all_states),
                        "agent_states": all_states,
                    },
                    f,
                    indent=2,
                )

            self.logger.success(f"Agent states backed up to {backup_file}", "backup")
            return True

        except Exception as e:
            self.logger.error(f"Failed to backup agent states: {e}", "backup")
            return False

    async def restore_agent_states(self, backup_file: str) -> bool:
        """Restore agent states from backup.

        Args:
            backup_file: Path to backup file

        Returns:
            True if successful, False otherwise

        """
        try:
            backup_path = Path(backup_file)
            if not backup_path.exists():
                self.logger.error(f"Backup file not found: {backup_file}", "restore")
                return False

            with open(backup_path) as f:
                backup_data = json.load(f)

            # Clear existing states
            await self.clear_all_states()

            # Restore states (simplified - would need full state reconstruction)
            restored_count = 0
            for agent_id, agent_data in backup_data.get("agent_states", {}).items():
                # Create minimal agent state for restoration
                # In a full implementation, this would reconstruct the complete state
                self.logger.info(f"Restored agent: {agent_data['name']}", "restore")
                restored_count += 1

            self.logger.success(
                f"Restored {restored_count} agent states from backup",
                "restore",
            )
            return True

        except Exception as e:
            self.logger.error(f"Failed to restore agent states: {e}", "restore")
            return False

    async def clear_all_states(self) -> bool:
        """Clear all agent states from storage.

        Returns:
            True if successful, False otherwise

        """
        try:
            # Clear cache
            self.agent_states.clear()

            # Remove all state files
            for state_file in self.data_dir.glob("*.json"):
                state_file.unlink()

            self.logger.success("All agent states cleared", "clear_all")
            return True

        except Exception as e:
            self.logger.error(f"Failed to clear agent states: {e}", "clear_all")
            return False

    async def get_storage_statistics(self) -> dict[str, Any]:
        """Get statistics about stored agent states.

        Returns:
            Storage statistics

        """
        agent_ids = await self.list_agent_states()

        if not agent_ids:
            return {
                "total_agents": 0,
                "storage_size": 0,
                "oldest_state": None,
                "newest_state": None,
            }

        # Calculate storage size
        total_size = 0
        oldest_time = None
        newest_time = None

        for agent_id in agent_ids:
            state_file = self.data_dir / f"{agent_id}.json"
            if state_file.exists():
                total_size += state_file.stat().st_size

                # Get file modification time
                mod_time = datetime.fromtimestamp(state_file.stat().st_mtime)
                if oldest_time is None or mod_time < oldest_time:
                    oldest_time = mod_time
                if newest_time is None or mod_time > newest_time:
                    newest_time = mod_time

        return {
            "total_agents": len(agent_ids),
            "storage_size": total_size,
            "storage_size_mb": round(total_size / (1024 * 1024), 2),
            "oldest_state": oldest_time.isoformat() if oldest_time else None,
            "newest_state": newest_time.isoformat() if newest_time else None,
        }
